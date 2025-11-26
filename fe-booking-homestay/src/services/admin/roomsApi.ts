import api from "../api";
import {
  Amenity,
  CreateRoomDto,
  PaginatedRooms,
  Room,
  SetRoomAmenitiesDto,
  SetRoomBedsDto,
  UpdateRoomDto,
} from "@/types/room";

export async function getAllRooms(): Promise<PaginatedRooms> {
  try {
    const res = await api.get("/room/all");
    const data = res.data?.data;

    return data as PaginatedRooms;
  } catch (error) {
    console.error("Get list rooms error:", error);
    throw error;
  }
}

export async function createRoom(dto: CreateRoomDto): Promise<Room> {
  try {
    const res = await api.post("/room/admin", dto);
    return res.data.data;
  } catch (error) {
    console.error("Create room error:", error);
    throw error;
  }
}

export async function deleteRoom(id: number): Promise<Room> {
  try {
    const res = await api.delete(`/room/admin/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Delete room error:", error);
    throw error;
  }
}

export async function getRoomById(id: number): Promise<Room> {
  try {
    const res = await api.get(`/room/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function updateRoom(
  id: number,
  dto: UpdateRoomDto
): Promise<Room> {
  try {
    const res = await api.patch(`/room/admin/${id}`, dto);
    return res.data.data;
  } catch (error) {
    console.error("Update room error:", error);
    throw error;
  }
}

export async function getAllAmenities(): Promise<Amenity[]> {
  try {
    const res = await api.get("/amenity");
    return res.data.data;
  } catch (error) {
    console.error("Get list amenities error:", error);
    throw error;
  }
}

export async function setRoomAmenities(id: number, dto: SetRoomAmenitiesDto) {
  try {
    const res = await api.put(`/room/${id}/amenities`, dto);
    return res.data.data;
  } catch (error) {
    console.error("Set amenity error:", error);
    throw error;
  }
}

export async function setRoomBeds(roomId: number, dto: SetRoomBedsDto) {
  try {
    const res = await api.put(`/room/${roomId}/beds`, dto);
    return res.data.data;
  } catch (error) {
    console.error("Set bed error:", error);
    throw error;
  }
}

export async function getBookingsByRoomId(id: number): Promise<any> {
  try {
    const res = await api.get(`/bookings/rooms/${id}`);
    return res.data.data.items;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function getReviewsByRoomId(id: number): Promise<any> {
  try {
    const res = await api.get(`/review/rooms/${id}`);
    return res.data.data.items;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function uploadRoomImage(id: number, data: FormData) {
  try {
    const res = await api.post(`/room/${id}/images`, data);
    return res.data.data;
  } catch (error) {
    console.error("Upload room image error:", error);
    throw error;
  }
}

export async function deleteRoomImages(id: number, imageIds: number[]) {
  try {
    const res = await api.delete(`/room/${id}/images`, {
      data: { imageIds },
    });
    return res.data.data;
  } catch (error) {
    console.error("Delete room image error:", error);
    throw error;
  }
}

// export async function getRoomImages(id: number) {
//   try {
//     const res = await api.get(`/room/${id}/images`);
//     return res.data.data;
//   } catch (error) {
//     console.error("Get room images error:", error);
//     throw error;
//   }
// }

export async function setMainImage(id: number, imageId: number) {
  try {
    const res = await api.patch(`/room/${id}/images/main`, { imageId });
    return res.data.data;
  } catch (error) {
    console.error("Set main image error:", error);
    throw error;
  }
}

export async function updateOrder(id: number, order: number[]) {
  try {
    const res = await api.patch(`/room/${id}/images/order`, { order });
    return res.data.data;
  } catch (error) {
    console.error("Set main image error:", error);
    throw error;
  }
}
