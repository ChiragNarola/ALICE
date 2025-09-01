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