export interface UserDTO {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    name?: string;
    roles: string[];
}

export interface DisplayUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

export interface ConcernDTO {
    id: number;
    concern: string;
}

export interface AreaOfInterestDTO {
    id: number;
    interest: string;
}