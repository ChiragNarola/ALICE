import type { SignupFormInputs } from '../routes/models/request/Auth';
import type { ChatInputProps } from '../routes/models/request/Chat';
import type { APIResponse, LoginResponseDTO, StaffDetails } from '../routes/models/response/Auth';
import type { AreaOfInterestDTO, ConcernDTO, UserDTO } from '../routes/models/response/Response';
import axiosInstance from './axios-instance-creator';
import axios from 'axios';

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

export const area_of_interests = async () => {
    try {
        const res = await axiosInstance.get("admin/area_of_interests");
        const interestData = res.data.Data;
        if (!interestData) throw new Error("Invalid interestData data structure");
        const interestDataList: string[] = [];
        interestData.forEach((data: any) => {
            interestDataList.push(data.interest);
        });
        return interestDataList;
    } catch (err) {
        console.error("Failed to fetch area of interests:", err);
        return [];
    }
};

export const area_of_concerns = async () => {
    try {
        const res = await axiosInstance.get("admin/concern");
        const concernData = res.data.Data;
        if (!concernData) throw new Error("Invalid concernData data structure");
        const concernDataList: string[] = [];
        concernData.forEach((data: any) => {
            concernDataList.push(data.concern);
        });
        return concernDataList;
    } catch (err) {
        console.error("Failed to fetch area of concerns:", err);
        return [];
    }
};

export const submitStaffDetails = async (
    formData: FormData
): Promise<APIResponse<StaffDetails>> => {
    try {
        const urlEncoded = new URLSearchParams();
        formData.forEach((value, key) => {
            urlEncoded.append(key, value.toString());
        });

        const response = await axiosInstance.post<APIResponse<StaffDetails>>(
            "/users/staff_details",
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
            Message: "Staff details submission failed",
        };
    }
};

export const getUserList = async (
    formData: FormData
): Promise<APIResponse<UserDTO[]>> => {
    try {
        const urlEncoded = new URLSearchParams();
        formData.forEach((value, key) => {
            urlEncoded.append(key, value.toString());
        });

        const res = await axiosInstance.get("users/list");

        // console.log(res);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching user list failed",
            }
        );
    }
};

export const getConcernsList = async (
    formData: FormData
): Promise<APIResponse<ConcernDTO[]>> => {
    try {
        const urlEncoded = new URLSearchParams();
        formData.forEach((value, key) => {
            urlEncoded.append(key, value.toString());
        });
        const res = await axiosInstance.get("admin/concern");
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching user list failed",
            }
        );
    }
};

export const deleteConcern = async (id: number): Promise<APIResponse<any>> => {
    try {
        const response = await axiosInstance.delete(`/admin/concern/${id}`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Delete failed' };
    }
};

export const createConcern = async (formData: FormData): Promise<APIResponse<any>> => {
    const urlEncoded = new URLSearchParams();
    formData.forEach((value, key) => {
        urlEncoded.append(key, value.toString());
    });
    try {
        const response = await axiosInstance.post<APIResponse<LoginResponseDTO>>(
            "/admin/concern",
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
            Message: "Failed to create concern",
        };
    }
};

export const getAreasOfInterestList = async (
    formData: FormData
): Promise<APIResponse<AreaOfInterestDTO[]>> => {
    try {
        const urlEncoded = new URLSearchParams();
        formData.forEach((value, key) => {
            urlEncoded.append(key, value.toString());
        });
        const res = await axiosInstance.get("admin/area_of_interests");
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching area_of_interest list failed",
            }
        );
    }
};

export const deleteAreaOfInterest = async (id: number): Promise<APIResponse<any>> => {
    try {
        const response = await axiosInstance.delete(`/admin/area_of_interest/${id}`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Delete failed' };
    }
};

export const createAreaOfInterest = async (formData: FormData): Promise<APIResponse<any>> => {
    const urlEncoded = new URLSearchParams();
    formData.forEach((value, key) => {
        urlEncoded.append(key, value.toString());
    });
    try {
        const response = await axiosInstance.post<APIResponse<LoginResponseDTO>>(
            "/admin/area_of_interest",
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
            Message: "Failed to create concern",
        };
    }
};

export const chatAPI = async (requestdata: ChatInputProps): Promise<any> => {
    try {
        const response = await axios.post(
            "https://bc3a4ccbc64c.ngrok-free.app/chat",
            requestdata,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error: any) {
        throw error?.response?.data ?? {
            IsSuccess: false,
            Data: null,
            Message: "Failed to get chat result",
        };
    }
};