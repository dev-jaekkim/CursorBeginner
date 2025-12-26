// 주차장 정보 타입 정의 (CSV 스키마에 맞게 업데이트)
export interface ParkingLot {
  id: number;
  parking_code?: string;
  name: string;
  address?: string;
  parking_type?: string;
  parking_type_name?: string;
  operation_type?: string;
  operation_type_name?: string;
  phone?: string;
  parking_status_provided?: string;
  parking_status_provided_name?: string;
  total_parking_spaces?: number;
  paid_free_type?: string;
  paid_free_type_name?: string;
  night_free_open?: string;
  night_free_open_name?: string;
  weekday_start_time?: string;
  weekday_end_time?: string;
  weekend_start_time?: string;
  weekend_end_time?: string;
  holiday_start_time?: string;
  holiday_end_time?: string;
  monthly_pass_fee?: number;
  basic_parking_fee?: number;
  basic_parking_time?: number;
  additional_unit_fee?: number;
  additional_unit_time?: number;
  bus_basic_fee?: number;
  bus_basic_time?: number;
  bus_additional_time?: number;
  bus_additional_fee?: number;
  daily_max_fee?: number;
  latitude?: number;
  longitude?: number;
  last_sync_time?: string;
  saturday_paid_free?: string;
  saturday_paid_free_name?: string;
  holiday_paid_free?: string;
  holiday_paid_free_name?: string;
  on_street_management_group?: string;
  created_at?: string;
  updated_at?: string;
  
  // 계산된 필드 (클라이언트 측)
  distance?: number; // 현재 위치로부터의 거리 (km)
  oneHourFee?: number; // 1시간 주차 요금
  isAvailable?: boolean; // 현재 주차 가능 여부
}

// 정렬 옵션 타입
export type SortOption = 
  | 'distance'      // 거리순 (가까운 순)
  | 'fee'           // 요금순 (1시간 기준, 낮은 순)
  | 'available'     // 주차 가능 자리순 (많은 순)
  | 'name';         // 이름순

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

