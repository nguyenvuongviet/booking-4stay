import api from "./api";

export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  try {
    const response = await api.post("/auth/register", data);

    return response.data;
  } catch (error) {
    console.error("Register error: ", error);
    throw error;
  }
};

export const active_account = async (data: { email: string; otp: string }) => {
  try {
    const resp = await api.post("/auth/activate-account", data);
    return resp.data;
  } catch (error) {
    console.error("Active account error: ", error);
    throw error;
  }
};

export const verify_otp = async (data: { email: string; otp: string }) => {
  try {
    const resp = await api.post("/auth/verify-otp", data);
    return resp.data;
  } catch (error) {
    console.error("Verify otp error: ", error);
    throw error;
  }
};

export const forgot_password = async (data: { email: string }) => {
  try {
    const resp = await api.post("auth/forgot-password", data);
    return resp.data;
  } catch (error) {
    console.error("Forgot password error: ", error);
    throw error;
  }
};

export const reset_password = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  try {
    const resp = await api.post("auth/reset-password", data);
    return resp.data;
  } catch (error) {
    console.error("Forgot password error: ", error);
    throw error;
  }
};

export const update_profile = async (data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: string;
}) => {
  try {
    const resp = await api.patch("user/update", data);
    return resp.data;
  } catch (error) {
    console.error("Update profile error: ", error);
    throw error;
  }
};

export const upload_file = async (data: FormData) => {
  try {
    const resp = await api.post(`user/avatar-cloudinary`, data);
    return resp.data;
  } catch (error) {
    console.error("Update profile error: ", error);
    throw error;
  }
};

export const googleLogin = async (token: string) => {
  try {
    const resp = await api.post("/auth/google-login", { token });
    return resp.data;
  } catch (error) {
    console.error("Google login error: ", error);
    throw error;
  }
};