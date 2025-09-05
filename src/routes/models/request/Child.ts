export interface ChildInfo {
  id?: number,
  topics: number[];
  concerns: number[];
  firstName: string;
  middleName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  // years: string;
  // months: string;
  dob: string;
  things_to_keep_in_mind?:string;
}

export interface ChatInputRM {
  id?: number;
  name: string;
  date_of_birth: string;
  gender: string;
  things_to_keep_in_mind: string;
  area_of_interest: number[];
  concerns: number[];
}