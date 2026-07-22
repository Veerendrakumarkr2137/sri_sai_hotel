import twilio from "twilio";

// These should be configured in your .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC_mock_sid";
const authToken = process.env.TWILIO_AUTH_TOKEN || "mock_token";
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

const client = twilio(accountSid, authToken);

export class TwilioService {
  /**
   * Creates an outbound call to the guest.
   * If credentials aren't set, it returns a mock session ID.
   */
  static async createOutboundCall(toPhone: string, bookingId: string): Promise<string> {
    if (accountSid === "AC_mock_sid") {
      console.warn("[TwilioService] Using mock credentials. Call will not actually be placed.");
      return `mock_call_${Date.now()}`;
    }

    try {
      const call = await client.calls.create({
        url: `${process.env.VITE_API_BASE_URL}/webhooks/twilio/twiml/${bookingId}`,
        to: toPhone,
        from: twilioNumber,
        statusCallback: `${process.env.VITE_API_BASE_URL}/webhooks/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });

      return call.sid;
    } catch (error: any) {
      console.error("[TwilioService] createOutboundCall error:", error);
      throw new Error(`Twilio call failed: ${error.message}`);
    }
  }

  static async statusCallback(statusData: any) {
    console.log("[TwilioService] Call status update:", statusData.CallStatus);
    return statusData;
  }

  static async callCompleted(callSid: string) {
    console.log(`[TwilioService] Call completed for SID: ${callSid}`);
  }
}
