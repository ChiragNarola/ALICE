
// src/routes/models/response/Auth.ts

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  token?: string;
  tokenType?: string;
  isChildrenAdded: boolean;
  isStaffDetailAdded: boolean;

  // Optional raw values (sometimes API gives snake_case)
  first_name?: string;
  last_name?: string;
}

export interface StaffDetails {
  age_group: string;
  role_in_organisation: string;
  qualification: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (
    formData: FormData,
    rememberMe?: boolean
  ) => Promise<APIResponse<LoginResponseDTO> | null>;
  logout: () => void;
  isLoading: boolean;
}

export interface APIResponse<T> {
  status: string;
  totalCost?: number;
  models?: never[];
  IsSuccess: boolean;
  Data: T;
  Message?: string | null;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    roles: string[];
  };
  is_children_added: boolean;
  is_staff_detail_added: boolean;
}
