#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 파일에서 중복된 parking_code 제거
"""

import csv
import sys

input_file = "서울시 공영주차장 안내 정보_final.csv"
output_file = "서울시 공영주차장 안내 정보_final_no_duplicates.csv"

seen_codes = set()
duplicates = []
rows_to_keep = []

try:
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        for row in reader:
            parking_code = row.get('parking_code', '').strip()
            
            if not parking_code:
                # parking_code가 없는 행은 건너뜀
                continue
            
            if parking_code in seen_codes:
                # 중복 발견
                duplicates.append(parking_code)
                print(f"⚠️ 중복 발견: {parking_code}")
            else:
                # 첫 번째 발견
                seen_codes.add(parking_code)
                rows_to_keep.append(row)
    
    # 중복 제거된 데이터 저장
    if rows_to_keep:
        fieldnames = rows_to_keep[0].keys()
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows_to_keep)
    
    print(f"\n✅ 중복 제거 완료")
    print(f"   원본 행 수: {len(rows_to_keep) + len(duplicates)}")
    print(f"   중복 행 수: {len(duplicates)}")
    print(f"   최종 행 수: {len(rows_to_keep)}")
    print(f"   저장된 파일: {output_file}")
    
    if duplicates:
        print(f"\n중복된 parking_code 목록:")
        for code in set(duplicates):
            print(f"  - {code}")
    
except Exception as e:
    print(f"❌ 에러 발생: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

