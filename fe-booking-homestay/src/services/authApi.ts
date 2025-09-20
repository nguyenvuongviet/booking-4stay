import api from "./api";

export const login = async (data: { email: string; password: string }) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
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
  }
};

export const active_account = async (data: { email: string, otp: string}) => {
  try {
    const resp = await api.post("/auth/activate-account", data);
    return resp.data;
  } catch (error) {
    console.error("Active account error: ", error)
  }
}

export const verify_otp = async (data: {email: string, otp: string}) => {
  try {
    const resp = await api.post("/auth/verify-otp", data);
    return resp.data;
  } catch (error) {
    console.error("Verify otp error: ", error)
  }
}

export const forgot_password = async (data: {email: string}) => {
  try {
    const resp = await api.post("auth/forgot-password",data);
    return resp.data;
  } catch (error) {
    console.error("Forgot password error: ", error);
  }
}

export const reset_password = async (data: { email: string, otp: string, newPassword: string}) => {
  try {
    const resp = await api.post("auth/reset-password",data);
    return resp.data;
  } catch (error) {
    console.error("Forgot password error: ", error);
  }
}