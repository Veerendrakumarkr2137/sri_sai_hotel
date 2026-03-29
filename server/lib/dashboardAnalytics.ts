export function getDayRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function calculateOccupancyRate(inHouseGuests: number, totalInventory: number) {
  if (totalInventory <= 0) {
    return 0;
  }

  return Number(((inHouseGuests / totalInventory) * 100).toFixed(1));
}

type DashboardStatsInput = {
  totalUsers: number;
  adminCount: number;
  totalBookings: number;
  totalRooms: number;
  totalInventory: number;
  revenue: number;
  pendingPayments: number;
  manualReviewBookings: number;
  todayArrivals: number;
  todayDepartures: number;
  overdueArrivals: number;
  inHouseGuests: number;
  completedStays: number;
};

export function buildDashboardStats(input: DashboardStatsInput) {
  const guestCount = Math.max(input.totalUsers - input.adminCount, 0);

  return {
    ...input,
    guestCount,
    occupancyRate: calculateOccupancyRate(input.inHouseGuests, input.totalInventory),
  };
}
