export interface Person {
  id: string;
  name: string;
  initialBalance: number;
}

export interface Meal {
  cost: number;
  attendees: string[]; // Array of person IDs
}

export interface DayData {
  breakfast: Meal;
  lunch: Meal;
}

export type DailySchedule = {
  [day: string]: DayData;
};

export interface UserData {
  title: string;
  people: Person[];
  schedule: DailySchedule;
  lastReset: string; // ISO string to track the last weekly reset
}

export interface CalculatedBalance extends Person {
    totalDeductions: number;
    finalBalance: number;
}