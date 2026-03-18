export interface UserDTO {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    name?: string;
    roles: string[];
    created_at: string;
    last_login: string;
}

export interface DisplayUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    createdAt: string;
    lastLogin: string;
}

export interface ConcernDTO {
    isOther: any;
    id: number;
    concern: string;
}

export interface AreaOfInterestDTO {
    id: number;
    interest: string;
}

export interface ChildInputDTO {
    id: number;
    name: string;
    date_of_birth: string;
    gender: string;
    things_to_keep_in_mind: string;
    area_of_interest: number[];
    concerns: number[];
    is_deleted?: boolean;
    user_id?: number;
}

export interface staffDTO {
    age_group: string;
    qualification: string;
    role_in_organisation: string;
    nursery_ids:number[];
    nursery_names: string[];
    nursery_status: string[];
}

export interface HolidayItem {
  id: number;
  title: string;
  holiday_date: string;
  end_date: string | null;
}

export interface CreateNurseryDTO{
    nursery_name: string;
    description: string;
}

export interface NurseryDTO{
    id: number;
    nursery_name: string;
    description: string;
}

export interface NurseryItem {
  id: number;
  name?: string;
}

export interface FAQItem{
    id: number;
    question: string;
    AI_answer: string;
    human_answer: string;
}

export interface UpdateFAQ{
    id: number;
    alice_answer:String;
}

export interface UpdateNursery{
    nursery_id:number;
    nursery_name:string;
    description:string;
}

export interface StaffNurseryAssignmentDTO {
  nursery_id: number;
  nursery_name: string;
  status: string | null;
  user_id: number;
}

// Whole staff record with nested nurseries
export interface StaffNurseryStatusDTO {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];

  age_group?: string | null;
  role_in_organisation?: string | null;
  qualification?: string | null;

  nurseries: StaffNurseryAssignmentDTO[];
  created_at: string;
}