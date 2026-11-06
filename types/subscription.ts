export interface Subscription {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  cycle: "Monthly" | "Yearly";
  nextDate: string;
  type: string;
  status: "Active" | "Trial" | "Expiring" | "Inactive";
  billingDay: number;
  category: string;
  notes?: string;
  logo?: string;
  history?: number[];
  plan?: string;
  isShared?: boolean;
  myShare?: number;
  reminderEnabled?: boolean;
  startDate?: string;
  trialEndDate?: string;
  nickname?: string;
}
