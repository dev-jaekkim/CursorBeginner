# Scripts

이 폴더에는 데이터 처리용 Python 스크립트들이 있습니다.

## 파일 설명

- `fix_csv_header.py`: CSV 파일의 헤더를 한글에서 영문으로 변환
- `fix_csv_header_order.py`: CSV 파일의 헤더를 Supabase 테이블 컬럼 순서에 맞게 재정렬
- `remove_duplicates.py`: CSV 파일에서 중복된 parking_code 제거 (사용 안 함)
- `remove_duplicate_parking.py`: 같은 parking_code의 중복 데이터 처리 (사용 안 함)

## 사용 방법

```bash
# CSV 헤더 변환
python3 scripts/fix_csv_header.py

# CSV 헤더 순서 재정렬
python3 scripts/fix_csv_header_order.py
```

## 참고

현재는 Supabase에 데이터가 이미 업로드되어 있어서 이 스크립트들은 더 이상 사용하지 않습니다.
필요시 참고용으로 보관합니다.

