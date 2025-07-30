import type { SignupFormInputs } from '../routes/models/request/Auth';
import type { APIResponse, LoginResponseDTO } from '../routes/models/response/Auth';
import axiosInstance from './axios-instance-creator';

export const loginUser = async (formData: FormData): Promise<APIResponse<LoginResponseDTO>> => {
    const urlEncoded = new URLSearchParams();
    formData.forEach((value, key) => {
        urlEncoded.append(key, value.toString());
    });

    try {
        const response = await axiosInstance.post<APIResponse<LoginResponseDTO>>(
            "/users/login",
            urlEncoded.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        return response.data;
    } catch (error: any) {
        throw error?.response?.data ?? {
            IsSuccess: false,
            Data: null,
            Message: "Login failed",
        };
    }
};

export const registerUser = async (data: SignupFormInputs) => {
    try {
        const response = await axiosInstance.post('/users/registration', data);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Registration failed' };
    }
};


export const fetchCountries = async () => {
    try {
        const res = await axiosInstance.get("https://api.worldbank.org/v2/country?format=json");

        const countryArray = res.data?.[1]; // data[1] contains the country list

        if (!countryArray) throw new Error("Invalid country data structure");

        const countryList = countryArray
            .map((country: any) => ({
                name: country.name,
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));


        return countryList;
    } catch (err) {
        console.error("Failed to fetch countries:", err);
        return [];
    }
};
