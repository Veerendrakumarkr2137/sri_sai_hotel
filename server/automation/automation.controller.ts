import { Request, Response } from "express";
import { AutomationService } from "./automation.service";
import { StartCallRequest, UpdateArrivalRequest, SaveCallLogRequest } from "./automation.types";

const automationService = new AutomationService();

export class AutomationController {
  
  static async getTodayBookings(req: Request, res: Response): Promise<any> {
    try {
      const data = await automationService.getTodayBookings();
      return res.json(data); // Return array directly as per n8n friendly
    } catch (error: any) {
      console.error("[AutomationController] getTodayBookings error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async startCall(req: Request, res: Response): Promise<any> {
    try {
      const { bookingId, guestName, phone } = req.body as StartCallRequest;
      
      if (!bookingId || !guestName || !phone) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      const { sessionId } = await automationService.startCall({ bookingId, guestName, phone });
      
      return res.json({ success: true, sessionId });
    } catch (error: any) {
      console.error("[AutomationController] startCall error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateArrival(req: Request, res: Response): Promise<any> {
    try {
      const payload = req.body as UpdateArrivalRequest;
      
      if (!payload.bookingId || !payload.arrivalTime) {
        return res.status(400).json({ success: false, error: "bookingId and arrivalTime are required" });
      }

      await automationService.updateArrival(payload);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[AutomationController] updateArrival error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async saveCallLog(req: Request, res: Response): Promise<any> {
    try {
      const payload = req.body as SaveCallLogRequest;
      
      if (!payload.bookingId) {
        return res.status(400).json({ success: false, error: "bookingId is required" });
      }

      await automationService.saveCallLog(payload);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("[AutomationController] saveCallLog error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDashboard(req: Request, res: Response): Promise<any> {
    try {
      const data = await automationService.getDashboard();
      return res.json(data); // Clean JSON array/object structure
    } catch (error: any) {
      console.error("[AutomationController] getDashboard error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
