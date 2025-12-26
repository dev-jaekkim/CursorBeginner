#!/usr/bin/env python3
"""
CSV 파일에서 위도/경도가 없는 주차장들의 좌표를 Geocoding API로 채우는 스크립트
"""

import csv
import os
import sys
import time
import requests
from typing import Optional, Tuple

# 환경 변수에서 REST API 키 가져오기
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY')

if not KAKAO_REST_API_KEY:
    print("❌ KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.")
    print("다음 명령어로 환경 변수를 설정하세요:")
    print("export KAKAO_REST_API_KEY=your_rest_api_key")
    sys.exit(1)


def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    주소를 좌표로 변환 (카카오맵 Geocoding API)
    """
    if not address or not address.strip():
        return None

    try:
        url = f"https://dapi.kakao.com/v2/local/search/address.json"
        headers = {
            "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
        }
        params = {
            "query": address
        }

        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data.get('documents') and len(data['documents']) > 0:
                first_result = data['documents'][0]
                latitude = float(first_result['y'])
                longitude = float(first_result['x'])
                return (latitude, longitude)
        else:
            print(f"⚠️  Geocoding API 오류 ({response.status_code}): {address}")
            return None

    except Exception as e:
        print(f"⚠️  Geocoding 실패: {address} - {str(e)}")
        return None


def process_csv(input_file: str, output_file: str):
    """
    CSV 파일을 읽어서 위도/경도가 없는 항목들을 Geocoding으로 채움
    """
    if not os.path.exists(input_file):
        print(f"❌ 파일을 찾을 수 없습니다: {input_file}")
        sys.exit(1)

    # CSV 파일 읽기
    rows = []
    header = None
    lat_index = None
    lng_index = None
    address_index = None

    print(f"📖 CSV 파일 읽는 중: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        # 컬럼 인덱스 찾기
        try:
            lat_index = header.index('latitude')
            lng_index = header.index('longitude')
            address_index = header.index('address')
        except ValueError as e:
            print(f"❌ 필수 컬럼을 찾을 수 없습니다: {e}")
            sys.exit(1)

        rows = list(reader)

    print(f"✅ 총 {len(rows)}개 행 읽음")

    # 위도/경도가 없는 행 찾기 (기존 좌표는 유지)
    missing_coords = []
    existing_coords_count = 0
    for i, row in enumerate(rows):
        lat = row[lat_index].strip() if lat_index < len(row) else ''
        lng = row[lng_index].strip() if lng_index < len(row) else ''
        address = row[address_index].strip() if address_index < len(row) else ''

        # 기존 좌표가 있는 경우 유지
        if lat and lng and lat != '' and lng != '':
            existing_coords_count += 1
        # 좌표가 없고 주소가 있는 경우만 Geocoding 대상
        elif (not lat or not lng or lat == '' or lng == '') and address:
            missing_coords.append((i, address))

    print(f"📍 위도/경도가 없는 항목: {len(missing_coords)}개")

    if len(missing_coords) == 0:
        print("✅ 모든 항목에 좌표가 있습니다. 처리할 항목이 없습니다.")
        return

    # Geocoding 처리
    updated_count = 0
    failed_count = 0

    for idx, (row_index, address) in enumerate(missing_coords, 1):
        print(f"[{idx}/{len(missing_coords)}] 처리 중: {address[:50]}...")

        coords = geocode_address(address)

        if coords:
            lat, lng = coords
            rows[row_index][lat_index] = str(lat)
            rows[row_index][lng_index] = str(lng)
            updated_count += 1
            print(f"  ✅ 좌표 추가: ({lat}, {lng})")
        else:
            failed_count += 1
            print(f"  ❌ 좌표를 찾을 수 없음")

        # API 제한을 고려한 딜레이 (200ms)
        time.sleep(0.2)

    # 결과 저장
    print(f"\n💾 결과 저장 중: {output_file}")
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    print(f"\n✅ 완료!")
    print(f"  - 기존 좌표 유지: {existing_coords_count}개")
    print(f"  - Geocoding 처리: {len(missing_coords)}개")
    print(f"  - 성공: {updated_count}개")
    print(f"  - 실패: {failed_count}개")
    print(f"  - 출력 파일: {output_file}")
    print(f"  - 총 주차장: {len(rows)}개")


if __name__ == '__main__':
    input_file = 'data/서울시 공영주차장 안내 정보_final.csv'
    output_file = 'data/서울시 공영주차장 안내 정보_geocoded.csv'

    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    print("=" * 60)
    print("CSV Geocoding 스크립트")
    print("=" * 60)
    print(f"입력 파일: {input_file}")
    print(f"출력 파일: {output_file}")
    print(f"REST API 키: {KAKAO_REST_API_KEY[:10]}...")
    print("=" * 60)
    print()

    process_csv(input_file, output_file)

