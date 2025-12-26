#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
같은 주차장 코드의 중복 데이터 처리
- 같은 parking_code는 같은 주차장
- 하지만 위도/경도가 약간 다를 수 있음 (GPS 측정 오차)
- 가장 최신 데이터 또는 위도/경도가 있는 데이터를 우선 선택
"""

import csv
import sys
from datetime import datetime

input_file = "서울시 공영주차장 안내 정보_final.csv"
output_file = "서울시 공영주차장 안내 정보_deduplicated.csv"

def parse_datetime(date_str):
    """날짜 문자열을 파싱"""
    try:
        if date_str and date_str.strip():
            return datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M:%S")
    except:
        pass
    return None

def has_valid_location(row):
    """위도/경도가 유효한지 확인"""
    lat = row.get('latitude', '').strip()
    lng = row.get('longitude', '').strip()
    return lat and lng and lat != '' and lng != ''

def choose_best_row(rows):
    """여러 행 중 가장 좋은 행 선택"""
    # 1순위: 위도/경도가 있고 가장 최신인 것
    # 2순위: 위도/경도가 있는 것
    # 3순위: 가장 최신인 것
    # 4순위: 첫 번째 것
    
    rows_with_location = [r for r in rows if has_valid_location(r)]
    rows_without_location = [r for r in rows if not has_valid_location(r)]
    
    if rows_with_location:
        # 위도/경도가 있는 것 중에서
        rows_with_date = []
        rows_without_date = []
        
        for row in rows_with_location:
            sync_time = parse_datetime(row.get('last_sync_time', ''))
            if sync_time:
                rows_with_date.append((sync_time, row))
            else:
                rows_without_date.append(row)
        
        if rows_with_date:
            # 가장 최신 데이터 선택
            rows_with_date.sort(key=lambda x: x[0], reverse=True)
            return rows_with_date[0][1]
        elif rows_without_date:
            # 날짜가 없으면 첫 번째 것
            return rows_without_date[0]
        else:
            return rows_with_location[0]
    elif rows_without_location:
        # 위도/경도가 없는 것 중에서
        rows_with_date = []
        rows_without_date = []
        
        for row in rows_without_location:
            sync_time = parse_datetime(row.get('last_sync_time', ''))
            if sync_time:
                rows_with_date.append((sync_time, row))
            else:
                rows_without_date.append(row)
        
        if rows_with_date:
            # 가장 최신 데이터 선택
            rows_with_date.sort(key=lambda x: x[0], reverse=True)
            return rows_with_date[0][1]
        else:
            return rows_without_location[0]
    else:
        # 모두 없으면 첫 번째 것
        return rows[0]

seen_codes = {}
duplicates = []
rows_to_keep = []

try:
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        # 모든 행을 parking_code별로 그룹화
        for row in reader:
            parking_code = row.get('parking_code', '').strip()
            
            if not parking_code:
                # parking_code가 없는 행은 건너뜀
                continue
            
            if parking_code not in seen_codes:
                seen_codes[parking_code] = []
            seen_codes[parking_code].append(row)
    
    # 각 parking_code별로 가장 좋은 행 선택
    for parking_code, rows in seen_codes.items():
        if len(rows) > 1:
            # 중복 발견
            duplicates.append((parking_code, len(rows)))
            best_row = choose_best_row(rows)
            rows_to_keep.append(best_row)
            print(f"⚠️ 중복 발견: {parking_code} ({len(rows)}개) → 1개 선택")
        else:
            # 중복 없음
            rows_to_keep.append(rows[0])
    
    # 중복 제거된 데이터 저장
    if rows_to_keep:
        fieldnames = rows_to_keep[0].keys()
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows_to_keep)
    
    print(f"\n✅ 중복 제거 완료")
    print(f"   원본 행 수: {sum(len(rows) for rows in seen_codes.values())}")
    print(f"   중복된 parking_code 수: {len(duplicates)}")
    print(f"   최종 행 수: {len(rows_to_keep)}")
    print(f"   저장된 파일: {output_file}")
    
    if duplicates:
        print(f"\n중복된 parking_code 목록 (상위 10개):")
        duplicates.sort(key=lambda x: x[1], reverse=True)
        for code, count in duplicates[:10]:
            print(f"  - {code}: {count}개")
    
except Exception as e:
    print(f"❌ 에러 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

