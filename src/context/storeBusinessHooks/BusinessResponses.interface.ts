import { DashboardPackageResponse, DashboardVisitorChancea } from "./StoreBusinessInterface"

  // Interface for the day data
interface DayData {
  reservations: any[]; // Replace 'any' with specific reservation type when known
  dayName: string;
  count: number;
}

// Interface for the weekly data (using an index signature for dynamic day names)
interface WeeklyData {
  [dayName: string]: DayData;
}

// Interface for the dashboard data
interface DashboardBusiness {
  countReservationCompleted: number;
  countReservationCancelled: number;
  countReservationConfirmed: number;
  countReservationYesterday: number;
  countTotalReservation: number;
  countReservationTomorrow: number;
  countReservationToday: number;
  packages: DashboardPackageResponse[]
  visitorsChancea: DashboardVisitorChancea[]
}

// Main response interface
export interface DashboardBusinessResponse {
  weeklyData: WeeklyData;
  code: string;
  dashboardData: DashboardBusiness;
  message: string;
}