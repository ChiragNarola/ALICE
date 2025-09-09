export interface DateParams {
    start_date: string;
    end_date: string;
}

export interface FeedbackRatingDTO {
    label: "GREEN" | "RED" | "AMBER";
    count: number;
}

export interface CostEstimateDTO {
    modelName: string;
    totalTokens: number;
    cost: number; // in euros
}
export interface DailyRegistrationDTO  {
  date: string;
  new_registrations: number;
};

export interface UserRolesDTO  {
  all_user: any;
  parent: number;
  staff: number;
  admin: number;
};

export interface TopCategoryDTO  {
  percentage: number;
  category: string;
  count: number;
};

export interface HourlyTrendDTO  {
  time_label: string;
  message_count: number;
};