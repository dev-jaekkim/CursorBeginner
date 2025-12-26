#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 파일의 헤더를 Supabase 테이블 컬럼 순서에 맞게 재정렬하는 스크립트
"""

import csv
import sys

# Supabase 테이블 컬럼 순서 (id, created_at, updated_at 제외 - 자동 생성)
TABLE_COLUMN_ORDER = [
    "parking_code",
    "name",
    "address",
    "parking_type",
    "parking_type_name",
    "operation_type",
    "operation_type_name",
    "phone",
    "parking_status_provided",
    "parking_status_provided_name",
    "total_parking_spaces",
    "paid_free_type",
    "paid_free_type_name",
    "night_free_open",
    "night_free_open_name",
    "weekday_start_time",
    "weekday_end_time",
    "weekend_start_time",
    "weekend_end_time",
    "holiday_start_time",
    "holiday_end_time",
    "monthly_pass_fee",
    "basic_parking_fee",
    "basic_parking_time",
    "additional_unit_fee",
    "additional_unit_time",
    "bus_basic_fee",
    "bus_basic_time",
    "bus_additional_time",
    "bus_additional_fee",
    "daily_max_fee",
    "latitude",
    "longitude",
    "last_sync_time",
    "saturday_paid_free",
    "saturday_paid_free_name",
    "holiday_paid_free",
    "holiday_paid_free_name",
    "on_street_management_group",
]

input_file = "서울시 공영주차장 안내 정보_utf8_en.csv"
output_file = "서울시 공영주차장 안내 정보_final.csv"

try:
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        # 헤더 확인
        original_headers = reader.fieldnames
        print(f"원본 헤더 개수: {len(original_headers)}")
        print(f"원본 헤더: {original_headers}")
        
        # 데이터 읽기
        rows = []
        for row in reader:
            rows.append(row)
        
        print(f"총 {len(rows)}개의 행 읽음")
    
    # 새 파일에 쓰기 (테이블 컬럼 순서대로)
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=TABLE_COLUMN_ORDER, extrasaction='ignore')
        writer.writeheader()
        
        # 데이터 쓰기 (컬럼 순서대로)
        for row in rows:
            ordered_row = {}
            for col in TABLE_COLUMN_ORDER:
                ordered_row[col] = row.get(col, '')
            writer.writerow(ordered_row)
    
    print(f"\n✅ 변환 완료: {output_file}")
    print(f"   총 {len(rows)}개의 행이 변환되었습니다.")
    print(f"   컬럼 순서: {TABLE_COLUMN_ORDER}")
    
except Exception as e:
    print(f"❌ 에러 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

