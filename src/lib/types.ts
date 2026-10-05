export type Category = "6a" | "5a" | "4a";

export type Tournament = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  status: "open" | "closed";
  registration_opens_at: string | null;
  scheduled_close_at: string | null;
  created_at: string;
};

export type TournamentCategory = {
  id: string;
  tournament_id: string;
  category: Category;
  slots_limit: number;
  created_at: string;
};

export type CategorySlotCount = {
  tournament_category_id: string;
  tournament_id: string;
  category: Category;
  slots_limit: number;
  confirmed_count: number;
  waitlist_count: number;
};

export type Registration = {
  id: string;
  tournament_id: string;
  tournament_category_id: string;
  user_id: string;
  player1_name: string;
  player2_name: string;
  status: "confirmed" | "waitlist";
  created_at: string;
};

export const CATEGORIES: Category[] = ["6a", "5a", "4a"];

export type TournamentPhase = "scheduled" | "open" | "closed";

export function getTournamentPhase(t: Tournament): TournamentPhase {
  if (t.status === "closed") return "closed";
  if (t.scheduled_close_at && new Date(t.scheduled_close_at) <= new Date()) return "closed";
  if (t.registration_opens_at && new Date(t.registration_opens_at) > new Date()) return "scheduled";
  return "open";
}

export function isTournamentOpen(t: Tournament): boolean {
  return getTournamentPhase(t) === "open";
}
