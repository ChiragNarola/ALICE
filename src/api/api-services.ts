import type { SignupFormInputs } from '../routes/models/request/Auth';
import type { ConversationDTO } from '../routes/models/request/Chat';
import type { ChatInputRM } from '../routes/models/request/Child';
import type { APIResponse, AuthUser, LoginResponseDTO, StaffDetails } from '../routes/models/response/Auth';
import type { AreaOfInterestDTO, ChildInputDTO, ConcernDTO, staffDTO, UserDTO } from '../routes/models/response/Response';
import axiosInstance from './axios-instance-creator';
// import axios from 'axios';

//Auth
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

export const registerUser = async (
    data: SignupFormInputs
): Promise<APIResponse<AuthUser>> => {
    try {
        const response = await axiosInstance.post<APIResponse<AuthUser>>(
            "/users/registration",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error: any) {
        const apiError: APIResponse<AuthUser> = error?.response?.data ?? {
            IsSuccess: false,
            Data: null,
            Message: "Registration failed",
        };

        console.error("Registration error:", apiError);
        return apiError;
    }
};

//Master
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


//Staff details APIs

export const staffJobRole = async (): Promise<APIResponse<ConcernDTO[]>> => {
    try {
        const res = await axiosInstance.get<APIResponse<ConcernDTO[]>>("users/organization_roles");

        // Validate
        if (!res.data?.Data) {
            throw new Error("Invalid concernData data structure");
        }

        return res.data;
    } catch (err) {
        console.error("Failed to fetch area of concerns:", err);

        // Return fallback response in consistent shape
        return {
            IsSuccess: false,
            Data: [],
            Message: "Failed to fetch area of concerns",
        };
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


export const getStaffDetailsForLoginUser = async (): Promise<APIResponse<staffDTO>> => {
    try {
        const res = await axiosInstance.get(`users/staff_details`);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching staff details failed",
            }
        );
    }
};

export const updatestaffDetails = async (
    formData: FormData
): Promise<APIResponse<StaffDetails>> => {
    try {
        const urlEncoded = new URLSearchParams();
        formData.forEach((value, key) => {
            urlEncoded.append(key, value.toString());
        });

        const response = await axiosInstance.put<APIResponse<StaffDetails>>(
            `/users/staff_details`,
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

//Child APIs
export const insertChildDetails = async (
    formData: ChatInputRM[]
): Promise<APIResponse<ChatInputRM>> => {
    try {
        const response = await axiosInstance.post<APIResponse<ChatInputRM>>(
            "/children/create",
            formData,
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
            Message: "Children details submission failed",
        };
    }
};

export const updateChildDetails = async (
    formData: ChatInputRM[]
): Promise<APIResponse<ChatInputRM>> => {
    try {
        const response = await axiosInstance.put<APIResponse<ChatInputRM>>(
            `/children/update_children`,
            formData,
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
            Message: "Children details update failed",
        };
    }
};

export const getChildDetailsForLoginUser = async (): Promise<APIResponse<ChildInputDTO[]>> => {
    try {
        const res = await axiosInstance.get(`children/getChild`);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching children details failed",
            }
        );
    }
};

export const deleteChildApi = async (id: number): Promise<APIResponse<any>> => {
    try {
        const response = await axiosInstance.delete(`/children/delete?id=${id}`);
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || { message: 'Delete failed' };
    }
};

//Get User API 
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

//Concerns API
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

export const area_of_concerns = async (): Promise<APIResponse<ConcernDTO[]>> => {
    try {
        const res = await axiosInstance.get<APIResponse<ConcernDTO[]>>("admin/concern");

        // Validate
        if (!res.data?.Data) {
            throw new Error("Invalid concernData data structure");
        }

        return res.data;
    } catch (err) {
        console.error("Failed to fetch area of concerns:", err);

        // Return fallback response in consistent shape
        return {
            IsSuccess: false,
            Data: [],
            Message: "Failed to fetch area of concerns",
        };
    }
};

//AreasOfInterest
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

export const area_of_interests = async (): Promise<APIResponse<AreaOfInterestDTO[]>> => {
    try {
        const res = await axiosInstance.get<APIResponse<AreaOfInterestDTO[]>>("admin/area_of_interests");

        // Validate
        if (!res.data?.Data) {
            throw new Error("Invalid area_of_interests response structure");
        }

        return res.data;
    } catch (err) {
        console.error("Failed to fetch area of interests:", err);

        // Return fallback response in consistent shape
        return {
            IsSuccess: false,
            Data: [],
            Message: "Failed to fetch area of interests",
        };
    }
};

//Chat API
// export const chatAPI = async (requestdata: ChatInputProps): Promise<any> => {
//     try {
//         const response = await axios.post(
//             import.meta.env.VITE_API_CHAT_API_URL,
//             requestdata,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         return response;
//     } catch (error: any) {
//         throw error?.response?.data ?? {
//             IsSuccess: false,
//             Data: null,
//             Message: "Failed to get chat result",
//         };
//     }
// };



//Conversation APIs
export const getConversationList = async (): Promise<APIResponse<ConversationDTO[]>> => {
    try {
        const res = await axiosInstance.get("conversation/getConversationList");
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching Conversation list failed",
            }
        );
    }
};

export const getConversationMessageById = async (id: number): Promise<APIResponse<ConversationDTO[]>> => {
    try {
        const res = await axiosInstance.get(`conversation/getConversation/${id}`);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching Conversation failed",
            }
        );
    }
};

export const archiveConversationById = async (id: number): Promise<APIResponse<ConversationDTO[]>> => {
    try {
        const res = await axiosInstance.patch(`conversation/archiveConversation/${id}`);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching Conversation failed",
            }
        );
    }
};

export const updateConversationtitleById = async (id: number, formData: FormData): Promise<APIResponse<ConversationDTO[]>> => {
    const urlEncoded = new URLSearchParams();
    formData.forEach((value, key) => {
        urlEncoded.append(key, value.toString());
    });
    try {
        const response = await axiosInstance.patch(
            `conversation/updateConversationTitle/${id}`,
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

export const updateConversationReactionById = async (conversation_uuid: string, message_id: number, reaction: number | null): Promise<APIResponse<ConversationDTO[]>> => {
    try {
        const response = await axiosInstance.post(
            `conversation/${conversation_uuid}/messages/${message_id}/feedback?reaction=${reaction}`
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

export const getConversationMessageByUUId = async (UUID: string | undefined): Promise<APIResponse<ConversationDTO[]>> => {
    try {
        const res = await axiosInstance.get(`conversation/conversations/${UUID}/messages`);
        return res.data;
    } catch (error: any) {
        throw (
            error?.response?.data ?? {
                IsSuccess: false,
                Data: null,
                Message: "Fetching Conversation failed",
            }
        );
    }
};

//Admin Dashboard Page:- 

interface DateParams {
  start_date: string; 
  end_date: string;  
}
export const getNewSignUps = async (
  params: DateParams
): Promise<APIResponse<UserDTO[]>> => {
  try {
    const response = await axiosInstance.post(
      `admin/newSignUps`,
      null, 
      {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch new signups",
    };
  }
};


export const getTotalChats = async (
  params: DateParams
): Promise<APIResponse<{ totalChats: number }>> => {
  try {
    const response = await axiosInstance.post(
      `admin/totalChats`,
      null,
      {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch total chats",
    };
  }
};

interface FeedbackRatingDTO {
  label: "GREEN" | "RED" | "AMBER";
  count: number;
}

export const getFeedbackRatings = async (
  params: DateParams
): Promise<APIResponse<FeedbackRatingDTO[]>> => {
  try {
    const response = await axiosInstance.post(
      `admin/feedbackRatings`,
      null, 
      {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch feedback ratings",
    };
  }
};


interface CostEstimateDTO {
  modelName: string;
  totalTokens: number;
  cost: number; 
}

export const getCostEstimate = async (
  params: DateParams
): Promise<APIResponse<CostEstimateDTO[]>> => {
  try {
    const response = await axiosInstance.get(
      `admin/costEstimate`,
      {
        params: {
          start_date: params.start_date,
          end_date: params.end_date,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch cost estimate",
    };
  }
};

export const getHourlyActivityTrend = async (
  params: DateParams
): Promise<APIResponse<any>> => {
  try {
    const response = await axiosInstance.get(`admin/activityTrend`, {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch hourly activity trend",
    };
  }
};


export const getAverageSessionLength = async (): Promise< APIResponse<any> >=> {
  try {
    const response = await axiosInstance.get(`admin/averageSessionLength`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch average session length",
    };
  }
};


export const getDailyUserRegistration = async (
  params: DateParams
): Promise<APIResponse<any>> => {
  try {
    const response = await axiosInstance.get(`admin/daily_user_registration`, {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });

    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch daily user registration",
    };
  }
};


export const getUserRolesCount = async (): Promise<
APIResponse<any>
> => {
  try {
    const response = await axiosInstance.get(`admin/user_roles_count`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch user roles count",
    };
  }
};

export const getTopCategories = async (): Promise<
APIResponse<any>
> => {
  try {
    const response = await axiosInstance.get(`admin/topCategories`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to fetch user roles count",
    };
  }
};
export const uploadDocuments = async (files: File[]): Promise<APIResponse<any>> => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file); 
    });
    const response = await axiosInstance.post(`/api/v1/upload/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data ?? {
      IsSuccess: false,
      Data: null,
      Message: "Failed to upload documents",
    };
  }
};
