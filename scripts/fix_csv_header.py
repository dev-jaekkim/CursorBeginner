#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 파일의 헤더를 영문으로 변경하는 스크립트
"""

import csv
import sys

# 한글 컬럼명 → 영문 컬럼명 매핑
COLUMN_MAPPING = {
    "주차장코드": "parking_code",
    "주차장명": "name",
    "주소": "address",
    "주차장 종류": "parking_type",
    "주차장 종류명": "parking_type_name",
    "운영구분": "operation_type",
    "운영구분명": "operation_type_name",
    "전화번호": "phone",
    "주차현황 정보 제공여부": "parking_status_provided",
    "주차현황 정보 제공여부명": "parking_status_provided_name",
    "총 주차면": "total_parking_spaces",
    "유무료구분": "paid_free_type",
    "유무료구분명": "paid_free_type_name",
    "야간무료개방여부": "night_free_open",
    "야간무료개방여부명": "night_free_open_name",
    "평일 운영 시작시각(HHMM)": "weekday_start_time",
    "평일 운영 종료시각(HHMM)": "weekday_end_time",
    "주말 운영 시작시각(HHMM)": "weekend_start_time",
    "주말 운영 종료시각(HHMM)": "weekend_end_time",
    "공휴일 운영 시작시각(HHMM)": "holiday_start_time",
    "공휴일 운영 종료시각(HHMM)": "holiday_end_time",
    "최종데이터 동기화 시간": "last_sync_time",
    "토요일 유,무료 구분": "saturday_paid_free",
    "토요일 유,무료 구분명": "saturday_paid_free_name",
    "공휴일 유,무료 구분": "holiday_paid_free",
    "공휴일 유,무료 구분명": "holiday_paid_free_name",
    "월 정기권 금액": "monthly_pass_fee",
    "노상 주차장 관리그룹번호": "on_street_management_group",
    "기본 주차 요금": "basic_parking_fee",
    "기본 주차 시간(분 단위)": "basic_parking_time",
    "추가 단위 요금": "additional_unit_fee",
    "추가 단위 시간(분 단위)": "additional_unit_time",
    "버스 기본 주차 요금": "bus_basic_fee",
    "버스 기본 주차 시간(분 단위)": "bus_basic_time",
    "버스 추가 단위 시간(분 단위)": "bus_additional_time",
    "버스 추가 단위 요금": "bus_additional_fee",
    "일 최대 요금": "daily_max_fee",
    "위도": "latitude",
    "경도": "longitude",
}

input_file = "서울시 공영주차장 안내 정보_utf8.csv"
output_file = "서울시 공영주차장 안내 정보_utf8_en.csv"

try:
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        header = next(reader)
        
        # 헤더를 영문으로 변환
        new_header = []
        for col in header:
            # 따옴표 제거
            col = col.strip('"')
            new_header.append(COLUMN_MAPPING.get(col, col))
        
        # 데이터 읽기
        rows = [row for row in reader]
    
    # 새 파일에 쓰기
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(new_header)
        writer.writerows(rows)
    
    print(f"✅ 변환 완료: {output_file}")
    print(f"   총 {len(rows)}개의 행이 변환되었습니다.")
    
except Exception as e:
    print(f"❌ 에러 발생: {e}")
    sys.exit(1)

