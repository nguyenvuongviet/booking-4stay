import api from "./api";

export interface CreateContactParams {
  fullName: string;
  email: string;
  message: string;
}

export const submitSupportRequest = async (data: CreateContactParams) => {
  try {
    const res = await api.post("/contacts", data);
    return res.data;
  } catch (error) {
    console.error("API Error: submitSupportRequest", error);
    throw error;
  }
};
