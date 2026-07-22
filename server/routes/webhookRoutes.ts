import { Router, Request, Response } from "express";
import { TwilioService } from "../services/twilio.service";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// POST /webhooks/twilio/status
router.post("/twilio/status", async (req: Request, res: Response): Promise<any> => {
  try {
    const statusData = req.body;
    await TwilioService.statusCallback(statusData);

    const callSid = statusData.CallSid;
    const callStatus = statusData.CallStatus; // 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer'

    // Map Twilio status to our DB status
    let mappedStatus = callStatus;
    if (callStatus === "completed") mappedStatus = "Completed";
    if (callStatus === "no-answer") mappedStatus = "No Answer";
    if (callStatus === "failed") mappedStatus = "Failed";

    if (callSid) {
      await supabase
        .from("call_logs")
        .update({ status: mappedStatus })
        .eq("call_sid", callSid);
    }

    if (callStatus === "completed") {
      await TwilioService.callCompleted(callSid);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("[Webhook] Twilio status error:", error);
    return res.status(500).send("Error processing webhook");
  }
});

// POST /webhooks/twilio/twiml/:bookingId
// Twilio calls this when the call connects to get the TwiML instructions
router.post("/twilio/twiml/:bookingId", (req: Request, res: Response) => {
  // In a real scenario, this TwiML might connect the call to an ElevenLabs WebSocket stream via <Connect><Stream>
  const twiml = `
    <Response>
      <Say>Hello, this is the AI assistant for Ashok Inn. How can I help you with your check-in today?</Say>
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
});

// POST /webhooks/elevenlabs/event
router.post("/elevenlabs/event", async (req: Request, res: Response): Promise<any> => {
  try {
    // Process ElevenLabs events (e.g., conversation ended, transcript available)
    console.log("[Webhook] ElevenLabs event received", req.body);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("[Webhook] ElevenLabs event error:", error);
    return res.status(500).send("Error");
  }
});

export default router;
