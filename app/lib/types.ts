// 주차장 정보 타입 정의
export interface ParkingLot {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  operating_hours?: string;
  fee_info?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

