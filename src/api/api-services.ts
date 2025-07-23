import axiosInstance from './axios-instance-creator';

interface RegisterUserInput {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    location: string;
    contact_number: string;
    role: string[];
}


export const loginUser = async (formData: FormData) => {
    const urlEncoded = new URLSearchParams();
    formData.forEach((value, key) => {
        urlEncoded.append(key, value.toString());
    });

    try {
        const response = await axiosInstance.post('/users/login', urlEncoded.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Login failed' };
    }
};

export const registerUser = async (data: RegisterUserInput) => {
    try {
        const response = await axiosInstance.post('/users/registration', data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Registration failed' };
    }
};
