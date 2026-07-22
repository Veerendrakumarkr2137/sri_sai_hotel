export interface StartCallRequest {
  bookingId: string;
  guestName: string;
  phone: string;
}

export interface StartCallResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface UpdateArrivalRequest {
  bookingId: string;
  arrivalTime: string;
  aiSummary: string;
  language: string;
}

export interface SaveCallLogRequest {
  bookingId: string;
  transcript: string;
  duration: number;
  status: string;
}

export interface DashboardResponse {
  success: boolean;
  data?: {
    todayBookings: number;
    pendingCalls: number;
    completedCalls: number;
    cancelledCalls: number;
    averageArrivalTime: string;
  };
  error?: string;
}
