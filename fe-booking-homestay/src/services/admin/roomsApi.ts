import api from "../api";
import {
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

export async function getRoomById(id: number): Promise<Room> {
  try {
    const res = await api.get(`/room/${id}`);

    return res.data.data;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function getBookingsByRoomId(id: number): Promise<any> {
  try {
    const res = await api.get(`/bookings/rooms/${id}`);
    console.log(res.data.data);
    return res.data.data.items;
  } catch (error) {
    console.error("Get room by id error:", error);
    throw error;
  }
}

export async function getReviewsByRoomId(id: number): Promise<any> {
  try {
    const res = await api.get(`/review/rooms/${id}`);
    console.log(res.data.data);

    return res.data.data.items;
  } catch (error) {
    console.error("Get room by id error:", error);
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

export async function deleteRoom(id: number): Promise<Room> {
  try {
    const res = await api.delete(`/room/admin/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Delete room error:", error);
    throw error;
  }
}

export async function setRoomAmenities(id: number, dto: SetRoomAmenitiesDto) {
  try {
    const res = await api.post(`/room/${id}/amenities`, dto);
    return res.data.data;
  } catch (error) {
    console.error("Set amenity error:", error);
    throw error;
  }
}

export async function setRoomBeds(roomId: number, dto: SetRoomBedsDto) {
  try {
    const res = await api.post(`/room/${roomId}/beds`, dto);
    return res.data.data;
  } catch (error) {
    console.error("Set bed error:", error);
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

export async function deleteRoomImage(roomId: number) {
  try {
    const res = await api.delete(`/room/${roomId}/images`);
    return res.data.data;
  } catch (error) {
    console.error("Delete room image error:", error);
    throw error;
  }
}
