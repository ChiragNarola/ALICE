export interface LoginFormInputs {
    username: string;
    password: string;
}

export interface SignupFormInputs {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    location?: string;
    contact_number?: string;
    // country?: string;
    // postalCode?: string;
    role: string[];// ['Parent', 'Staff']
    confirmPassword: string;

    country?: string;
};

