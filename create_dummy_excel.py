"""
PayPulse용 더미 급여대장 Excel 파일 생성
"""

import pandas as pd
import random
from datetime import datetime

def create_dummy_payroll_excel():
    """2025년 급여대장 더미 데이터 생성"""
    
    # 부서 및 직급 정보
    departments = ['개발팀', '마케팅팀', '인사팀', '영업팀', '기획팀', '디자인팀', '회계팀']
    positions = ['사원', '주임', '대리', '과장', '차장', '부장', '팀장']
    
    # 더미 데이터 생성
    employees = []
    employee_id = 1001
    
    for dept in departments:
        # 부서별 5-8명
        dept_size = random.randint(5, 8)
        
        for i in range(dept_size):
            position = random.choice(positions)
            
            # 직급별 기본급 설정
            base_salary_ranges = {
                '사원': (2500000, 3000000),
                '주임': (3000000, 3500000),
                '대리': (3500000, 4200000),
                '과장': (4200000, 5000000),
                '차장': (5000000, 6000000),
                '부장': (6000000, 7500000),
                '팀장': (7000000, 8500000)
            }
            
            base_salary = random.randint(*base_salary_ranges.get(position, (2500000, 3000000)))
            overtime_pay = random.randint(100000, 500000)
            allowances = random.randint(50000, 300000)
            bonuses = random.randint(200000, 1000000)
            deductions = int((base_salary + overtime_pay + allowances + bonuses) * random.uniform(0.08, 0.15))
            
            employees.append({
                '사번': f'E{employee_id:04d}',
                '성명': f'직원{employee_id-1000:02d}',
                '부서': dept,
                '직급': position,
                '기본급': base_salary,
                '연장근무수당': overtime_pay,
                '제수당': allowances,
                '상여금': bonuses,
                '공제액': deductions,
                '실지급액': base_salary + overtime_pay + allowances + bonuses - deductions,
                '년도': 2025,
                '월': 1,
                '지급일': '2025-01-25'
            })
            
            employee_id += 1
    
    # DataFrame 생성
    df = pd.DataFrame(employees)
    
    # Excel 파일로 저장
    df.to_excel('2025_급여대장_더미.xlsx', index=False, sheet_name='급여대장')
    print(f"✅ 더미 급여대장 파일 생성 완료: 2025_급여대장_더미.xlsx")
    print(f"📊 총 {len(df)}명의 직원 데이터 생성")
    print(f"💰 총 급여 지출: {df['실지급액'].sum():,}원")
    
    return df

if __name__ == "__main__":
    create_dummy_payroll_excel()