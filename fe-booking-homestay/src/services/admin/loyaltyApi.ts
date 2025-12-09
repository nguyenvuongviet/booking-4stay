import api from "../api";

export interface LoyaltyLevel {
  id: number;
  name: string;
  minPoints: number;
  description: string;
  isActive: boolean;
}

export interface LoyaltyUserProgram {
  id: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    country: string;
    roles: string[];
    avatar: string;
  };
  level: string;
  points: number;
  totalBookings: number;
  totalNights: number;
  lastUpgradeDate: string;
}

export async function getLoyaltyLevels(): Promise<LoyaltyLevel[]> {
  try {
    const res = await api.get("/loyalty/levels");
    return res.data?.data ?? [];
  } catch (error) {
    console.error("API Error: getLoyaltyLevels", error);
    throw error;
  }
}

export async function createLoyaltyLevel(payload: Partial<LoyaltyLevel>) {
  try {
    const res = await api.post("/loyalty/levels", payload);
    return res.data?.data;
  } catch (error) {
    console.error("API Error: createLoyaltyLevel", error);
    throw error;
  }
}

export async function updateLoyaltyLevel(
  id: number,
  payload: Partial<LoyaltyLevel>
) {
  try {
    const res = await api.patch(`/loyalty/levels/${id}`, payload);
    return res.data?.data;
  } catch (error) {
    console.error("API Error: updateLoyaltyLevel", error);
    throw error;
  }
}

export async function toggleLevelActive(id: number) {
  try {
    const res = await api.patch(`/loyalty/levels/${id}/toggle-active`);
    return res.data?.data;
  } catch (error) {
    console.error("API Error: toggleLevelActive", error);
    throw error;
  }
}

export async function recomputeAllUserLevels() {
  try {
    const res = await api.post("/loyalty/recompute");
    return res.data?.data;
  } catch (error) {
    console.error("API Error: recomputeAllUserLevels", error);
    throw error;
  }
}

export async function getAllUserLoyalty(): Promise<LoyaltyUserProgram[]> {
  try {
    const res = await api.get("/loyalty/users/all");
    console.log(res.data);

    return res.data?.data ?? [];
  } catch (error) {
    console.error("API Error: getAllUserLoyalty", error);
    throw error;
  }
}

// export async function getUserLoyalty(
//   userId: number
// ): Promise<LoyaltyUserProgram> {
//   try {
//     const res = await api.get(`/loyalty/users/${userId}`);
//     return res.data?.data;
//   } catch (error) {
//     console.error("API Error: getUserLoyalty", error);
//     throw error;
//   }
// }

// export interface UpdateUserLoyaltyPayload {
//   levelId?: number;
//   points?: number;
//   totalBookings?: number;
//   totalNights?: number;
// }

// export async function updateUserLoyalty(
//   userId: number,
//   payload: UpdateUserLoyaltyPayload
// ) {
//   try {
//     const res = await api.patch(`/loyalty/users/${userId}`, payload);
//     return res.data?.data;
//   } catch (error) {
//     console.error("API Error: updateUserLoyalty", error);
//     throw error;
//   }
// }
