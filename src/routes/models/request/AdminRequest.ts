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

export interface WaitlistAnalyticsDTO {
  current_waitlist_size: number;
  avg_approval_time_hours: number;
  daily_approvals: {
    date: string;
    approvals: number;
  }[];
}

export interface TokenUsageAnalyticsDTO {
  by_model: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    requests: number;
  }[];
  top_users: {
    user_id: number;
    name: string;
    email: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  }[];
}

export interface UserRetentionDTO {
  summary: {
    new_users: number;
    returning_users: number;
    total_active_users: number;
    retention_rate_percent: number;
    avg_sessions_per_user: number;
  };
  daily_active_users: {
    date: string;
    active_users: number;
  }[];
}