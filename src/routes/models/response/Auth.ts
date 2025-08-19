export interface AuthUser {
  id: number;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  roles: string[];
  token?: string;
  tokenType?: string;
  isChildrenAdded: boolean;
  isStaffDetailAdded: boolean;
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
  login: (formData: FormData) => Promise<APIResponse<LoginResponseDTO> | null>;
  logout: () => void;
  isLoading: boolean;
}

export interface APIResponse<T> {
  IsSuccess: boolean;
  Data: T;
  Message?: string | null;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  user: AuthUser;
  is_children_added: boolean;
  is_staff_detail_added: boolean;
}