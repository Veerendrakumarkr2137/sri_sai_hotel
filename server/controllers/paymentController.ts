import axios from "axios";
import crypto from "crypto";
import { Response } from "express";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  BookingValidationError,
  ensureRoomAvailability,
  validateBookingInput,
} from "../lib/bookingValidation";
import { getFrontendUrl, getHotelContactDetails, getHotelUpiDetails } from "../lib/runtimeConfig";

const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PHONEPE_PAY_PATH = "/pg/v1/pay";

type PaymentBookingData = {
  roomId: string;
  name: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice?: number;
};

type PhonePeConfig = {
  merchantId: string;
  saltKey: string;
  saltIndex: string;
};

function getMissingPhonePeConfigKeys() {
  const requiredKeys = ["MERCHANT_ID", "SALT_KEY", "SALT_INDEX"] as const;

  return requiredKeys.filter((key) => !process.env[key]?.trim());
}

function getPhonePeConfig(): PhonePeConfig | null {
  const merchantId = process.env.MERCHANT_ID?.trim();
  const saltKey = process.env.SALT_KEY?.trim();
  const saltIndex = process.env.SALT_INDEX?.trim();

  if (!merchantId || !saltKey || !saltIndex) {
    return null;
  }

  return {
    merchantId,
    saltKey,
    saltIndex,
  };
}

function buildChecksum(value: string, saltKey: string, saltIndex: string) {
  const checksum = crypto.createHash("sha256").update(value + saltKey).digest("hex");
  return `${checksum}###${saltIndex}`;
}

function getServerBaseUrl(request: AuthenticatedRequest) {
  const forwardedProtoHeader = request.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const protocol = forwardedProto?.split(",")[0]?.trim() || request.protocol || "http";
  const host = request.get("host");
  return host ? `${protocol}://${host}` : getFrontendUrl();
}

function getPhonePeStatusPath(merchantId: string, transactionId: string) {
  return `/pg/v1/status/${merchantId}/${transactionId}`;
}

function isValidBookingData(bookingData?: Partial<PaymentBookingData>): bookingData is PaymentBookingData {
  if (!bookingData) {
    return false;
  }

  return Boolean(
    bookingData.roomId &&
      bookingData.name &&
      bookingData.email &&
      bookingData.phone &&
      bookingData.checkInDate &&
      bookingData.checkOutDate &&
      Number(bookingData.guests) > 0,
  );
}

function getRedirectUrl(paymentResponse: any) {
  return (
    paymentResponse?.data?.instrumentResponse?.redirectInfo?.url ||
    paymentResponse?.data?.instrumentResponse?.intentUrl ||
    paymentResponse?.data?.redirectInfo?.url ||
    paymentResponse?.data?.intentUrl ||
    ""
  );
}

function getGatewayTransactionId(statusResponse: any) {
  return (
    statusResponse?.data?.transactionId ||
    statusResponse?.data?.paymentInstrument?.transactionId ||
    statusResponse?.paymentDetails?.[0]?.transactionId ||
    statusResponse?.transactionId ||
    ""
  );
}

function evaluateStatus(statusResponse: any, expectedAmount: number, expectedTransactionId: string) {
  const responseData = statusResponse?.data || statusResponse || {};
  const rawState = String(
    responseData?.state ||
      responseData?.responseCode ||
      statusResponse?.code ||
      statusResponse?.state ||
      "",
  ).toUpperCase();
  const rawCode = String(
    statusResponse?.code ||
      responseData?.responseCode ||
      responseData?.state ||
      "",
  ).toUpperCase();
  const amount = Number(responseData?.amount ?? statusResponse?.amount ?? 0);
  const responseTransactionId = String(
    responseData?.merchantTransactionId ||
      responseData?.transactionId ||
      statusResponse?.merchantTransactionId ||
      "",
  ).trim();
  const isAmountValid = amount > 0 ? amount === expectedAmount : true;
  const isTransactionValid = responseTransactionId ? responseTransactionId === expectedTransactionId : true;
  const successStates = new Set(["COMPLETED", "PAYMENT_SUCCESS", "SUCCESS"]);
  const failureStates = new Set(["FAILED", "FAILURE", "PAYMENT_ERROR", "BAD_REQUEST", "DECLINED", "EXPIRED", "CANCELLED"]);
  const isSuccess =
    statusResponse?.success === true &&
    (successStates.has(rawState) || successStates.has(rawCode) || rawCode === "SUCCESS");
  const isFailure =
    statusResponse?.success === false ||
    failureStates.has(rawState) ||
    failureStates.has(rawCode);

  if (!isAmountValid || !isTransactionValid) {
    return "failed" as const;
  }

  if (isSuccess) {
    return "paid" as const;
  }

  if (isFailure) {
    return "failed" as const;
  }

  return "pending" as const;
}

async function prepareBookingForPayment(
  request: AuthenticatedRequest,
  transactionId: string,
  bookingData?: PaymentBookingData,
  bookingId?: string,
) {
  const userId = request.auth?.userId;

  if (!userId) {
    return { error: "Authentication required", status: 401 as const };
  }

  if (bookingId) {
    const existingBooking = await Booking.findOne({ _id: bookingId, userId }).populate("roomId");

    if (!existingBooking) {
      return { error: "Booking not found", status: 404 as const };
    }

    if (["cancelled", "completed"].includes(existingBooking.bookingStatus)) {
      return { error: "This booking can no longer be paid online", status: 400 as const };
    }

    if (existingBooking.paymentStatus === "paid") {
      return { error: "This booking is already paid", status: 400 as const };
    }

    existingBooking.transactionId = transactionId;
    existingBooking.orderId = transactionId;
    existingBooking.paymentId = null;
    existingBooking.signature = null;
    existingBooking.paymentStatus = "pending";
    existingBooking.bookingStatus = "pending_payment";
    existingBooking.paymentMethod = "PhonePe";
    await existingBooking.save();

    return { booking: existingBooking };
  }

  if (!isValidBookingData(bookingData)) {
    return { error: "Invalid booking details", status: 400 as const };
  }

  const room = await Room.findById(bookingData.roomId);

  if (!room) {
    return { error: "Room not found", status: 404 as const };
  }

  const validatedBooking = await validateBookingInput(room, bookingData);
  await ensureRoomAvailability(
    room._id,
    validatedBooking.checkInDate,
    validatedBooking.checkOutDate,
    room.availableRooms,
  );

  const bookingRef = `HSI-${Date.now()}`;
  const booking = await Booking.create({
    bookingRef,
    userId,
    roomId: bookingData.roomId,
    name: validatedBooking.name,
    email: validatedBooking.email,
    phone: validatedBooking.phone,
    checkInDate: validatedBooking.checkInDate,
    checkOutDate: validatedBooking.checkOutDate,
    guests: validatedBooking.guests,
    totalPrice: validatedBooking.totalPrice,
    paymentStatus: "pending",
    bookingStatus: "pending_payment",
    paymentMethod: "PhonePe",
    transactionId,
    orderId: transactionId,
    paymentId: null,
    signature: null,
  });

  const populatedBooking = await Booking.findById(booking._id).populate("roomId");

  return { booking: populatedBooking || booking };
}

async function fetchPhonePeStatus(transactionId: string, config: PhonePeConfig) {
  const statusPath = getPhonePeStatusPath(config.merchantId, transactionId);
  const checksum = buildChecksum(statusPath, config.saltKey, config.saltIndex);
  const url = `${PHONEPE_BASE_URL}${statusPath}`;
  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": config.merchantId,
    },
  });

  return response.data;
}

async function syncPhonePeBooking(transactionId: string) {
  const config = getPhonePeConfig();

  if (!config) {
    throw new Error(`PhonePe configuration is missing: ${getMissingPhonePeConfigKeys().join(", ")}`);
  }

  const booking = await Booking.findOne({ transactionId }).populate("roomId");

  if (!booking) {
    throw new Error("Booking not found");
  }

  const statusResponse = await fetchPhonePeStatus(transactionId, config);
  const paymentStatus = evaluateStatus(statusResponse, Math.round(booking.totalPrice * 100), transactionId);

  booking.paymentMethod = "PhonePe";

  if (paymentStatus === "paid") {
    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.paymentId = getGatewayTransactionId(statusResponse) || booking.paymentId;
  } else if (paymentStatus === "failed") {
    booking.paymentStatus = "failed";
    booking.bookingStatus = "pending_payment";
  } else {
    booking.paymentStatus = "pending";
    booking.bookingStatus = "pending_payment";
  }

  await booking.save();

  return {
    booking,
    statusResponse,
    paymentStatus,
  };
}

export async function createPhonePePayment(request: AuthenticatedRequest, response: Response): Promise<any> {
  let activeBooking: any = null;

  try {
    const config = getPhonePeConfig();

    if (!config) {
      return response.status(500).json({
        success: false,
        error: `PhonePe configuration is missing: ${getMissingPhonePeConfigKeys().join(", ")}`,
      });
    }

    const { bookingData, bookingId } = request.body as {
      bookingData?: PaymentBookingData;
      bookingId?: string;
    };
    const transactionId = `TXN${Date.now()}`;
    const preparedBooking = await prepareBookingForPayment(request, transactionId, bookingData, bookingId);

    if ("error" in preparedBooking) {
      return response.status(preparedBooking.status).json({ success: false, error: preparedBooking.error });
    }

    activeBooking = preparedBooking.booking;
    const serverBaseUrl = getServerBaseUrl(request);
    const redirectUrl = `${getFrontendUrl()}/booking-confirmation/${activeBooking._id}?transactionId=${transactionId}`;
    const callbackUrl = `${serverBaseUrl}/api/payment/phonepe/callback/${transactionId}`;
    const payload = {
      merchantId: config.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: request.auth?.userId,
      amount: Math.round(Number(activeBooking.totalPrice) * 100),
      redirectUrl,
      redirectMode: "REDIRECT",
      callbackUrl,
      mobileNumber: activeBooking.phone,
      paymentInstrument: {
        type: "UPI_INTENT",
      },
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const checksum = buildChecksum(encodedPayload + PHONEPE_PAY_PATH, config.saltKey, config.saltIndex);
    const paymentResponse = await axios.post(
      `${PHONEPE_BASE_URL}${PHONEPE_PAY_PATH}`,
      { request: encodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": config.merchantId,
        },
      },
    );
    const phonePeRedirectUrl = getRedirectUrl(paymentResponse.data);

    if (!phonePeRedirectUrl) {
      activeBooking.paymentStatus = "failed";
      await activeBooking.save();
      return response.status(502).json({
        success: false,
        error: "PhonePe did not return a redirect URL",
        bookingId: activeBooking._id,
      });
    }

    return response.json({
      success: true,
      bookingId: activeBooking._id,
      transactionId,
      redirectUrl: phonePeRedirectUrl,
    });
  } catch (error: any) {
    if (activeBooking) {
      activeBooking.paymentStatus = "failed";
      await activeBooking.save();
    }

    if (error instanceof BookingValidationError) {
      return response.status(error.status).json({
        success: false,
        error: error.message,
        bookingId: activeBooking?._id,
      });
    }

    const bookingId = error?.response?.data?.bookingId || activeBooking?._id;
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to initiate PhonePe payment";

    return response.status(500).json({
      success: false,
      error: errorMessage,
      bookingId,
    });
  }
}

export async function getPaymentConfig(_request: AuthenticatedRequest, response: Response): Promise<any> {
  const hotelUpiDetails = getHotelUpiDetails();
  const hotelContactDetails = getHotelContactDetails();

  return response.json({
    success: true,
    payment: {
      phonePeEnabled: Boolean(getPhonePeConfig()),
      manualUpiEnabled: Boolean(hotelUpiDetails.upiId),
      payAtHotelEnabled: true,
      ...hotelUpiDetails,
      ...hotelContactDetails,
    },
  });
}

export async function getPhonePePaymentStatus(request: AuthenticatedRequest, response: Response): Promise<any> {
  try {
    const transactionId = request.params.transactionId;
    const booking = await Booking.findOne({ transactionId }).populate("roomId");

    if (!booking) {
      return response.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.userId.toString() !== request.auth?.userId) {
      return response.status(403).json({ success: false, error: "Access denied" });
    }

    const syncedBooking = await syncPhonePeBooking(transactionId);

    return response.json({
      success: true,
      paymentStatus: syncedBooking.paymentStatus,
      booking: syncedBooking.booking,
      phonePe: syncedBooking.statusResponse,
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to fetch payment status";

    return response.status(500).json({ success: false, error: message });
  }
}

export async function handlePhonePeCallback(request: AuthenticatedRequest, response: Response): Promise<any> {
  try {
    await syncPhonePeBooking(request.params.transactionId);
  } catch (error) {
    console.error("PhonePe callback sync failed:", error);
  }

  return response.json({ success: true });
}
