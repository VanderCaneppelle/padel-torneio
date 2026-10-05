export type Category = "6a" | "5a" | "4a";

export type Tournament = {
  id: string;
  name: string;
  event_date: string;
  status: "open" | "closed";
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

export function isTournamentOpen(t: Tournament): boolean {
  if (t.status === "closed") return false;
  if (t.scheduled_close_at && new Date(t.scheduled_close_at) <= new Date()) return false;
  return true;
}
