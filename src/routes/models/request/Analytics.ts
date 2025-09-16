
export interface TrackEventParams {
  session_id: string;
  page_screen: string;
  event_type?: string;
  time_spent?: number | null;
  interaction_data?: string | null;
}
