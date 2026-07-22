import { supabase } from "../lib/supabaseClient";
import { TwilioService } from "../services/twilio.service";
import { ElevenLabsService } from "../services/elevenlabs.service";
import { StartCallRequest, UpdateArrivalRequest, SaveCallLogRequest } from "./automation.types";

export class AutomationService {
  /**
   * Returns:
   * - Today's check-ins
   * - Guest Name
   * - Phone
   * - Booking ID
   * - Booking Reference
   * - Room
   * - Check-in Date
   */
  async getTodayBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_ref,
        name,
        phone,
        check_in_date,
        rooms:room_id (title)
      `)
      .gte("check_in_date", today.toISOString())
      .lt("check_in_date", tomorrow.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch today's bookings: ${error.message}`);
    }

    return bookings.map(b => ({
      bookingId: b.id,
      bookingRef: b.booking_ref,
      guestName: b.name,
      phone: b.phone,
      checkInDate: b.check_in_date,
      room: b.rooms
    }));
  }

  async startCall({ bookingId, guestName, phone }: StartCallRequest) {
    // 1. Update status to pending
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ call_status: "Pending", last_called_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking call status: ${updateError.message}`);
    }

    // 2. Initiate Call (Mocked via TwilioService for now until configured)
    const sessionId = await TwilioService.createOutboundCall(phone, bookingId);

    // Create initial call log
    await supabase.from("call_logs").insert({
      booking_id: bookingId,
      call_sid: sessionId,
      guest_name: guestName,
      phone: phone,
      status: "Pending"
    });

    return { sessionId };
  }

  async updateArrival({ bookingId, arrivalTime, aiSummary, language }: UpdateArrivalRequest) {
    const { error } = await supabase
      .from("bookings")
      .update({
        arrival_time: arrivalTime,
        ai_summary: aiSummary,
        language: language
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(`Failed to update arrival: ${error.message}`);
    }
  }

  async saveCallLog({ bookingId, transcript, duration, status }: SaveCallLogRequest) {
    const { error } = await supabase
      .from("call_logs")
      .insert({
        booking_id: bookingId,
        transcript,
        duration,
        status
      });

    if (error) {
      throw new Error(`Failed to save call log: ${error.message}`);
    }

    // Also update the latest status on the booking itself
    await supabase
      .from("bookings")
      .update({ call_status: status })
      .eq("id", bookingId);
  }

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, call_status, arrival_time")
      .gte("check_in_date", today.toISOString());

    if (bookingsError) {
      throw new Error(`Dashboard fetch error: ${bookingsError.message}`);
    }

    let pendingCalls = 0;
    let completedCalls = 0;
    let cancelledCalls = 0;
    let validArrivalTimes: string[] = [];

    bookings.forEach(b => {
      if (b.call_status === "Pending") pendingCalls++;
      else if (b.call_status === "Completed") completedCalls++;
      else if (b.call_status === "Cancelled" || b.call_status === "No Answer") cancelledCalls++;
      
      if (b.arrival_time) {
        validArrivalTimes.push(b.arrival_time);
      }
    });

    return {
      todayBookings: bookings.length,
      pendingCalls,
      completedCalls,
      cancelledCalls,
      averageArrivalTime: validArrivalTimes.length > 0 ? "Calculated from valid arrays" : "N/A"
    };
  }
}
