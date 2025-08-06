"""
PayPulse 종합 인건비 관리 시스템
TotalLaborCostManager - 급여대장 데이터 처리 및 분석
"""

import pandas as pd
import sqlite3
import numpy as np
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional, Tuple
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TotalLaborCostManager:
    """종합 인건비 관리 시스템"""
    
    def __init__(self, db_path: str = "labor_costs.db"):
        """
        TotalLaborCostManager 초기화
        
        Args:
            db_path (str): SQLite 데이터베이스 파일 경로
        """
        self.db_path = db_path
        self.connection = None
        self._initialize_database()
        logger.info(f"TotalLaborCostManager 초기화 완료: {db_path}")
    
    def _initialize_database(self):
        """데이터베이스 초기화 및 테이블 생성"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            cursor = self.connection.cursor()
            
            # 급여대장 테이블 생성
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS payroll (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    employee_name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    position TEXT,
                    base_salary INTEGER,
                    overtime_pay INTEGER DEFAULT 0,
                    allowances INTEGER DEFAULT 0,
                    bonuses INTEGER DEFAULT 0,
                    deductions INTEGER DEFAULT 0,
                    net_salary INTEGER,
                    payment_date DATE,
                    year INTEGER,
                    month INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 부서 정보 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS departments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    dept_code TEXT UNIQUE NOT NULL,
                    dept_name TEXT NOT NULL,
                    budget_limit INTEGER,
                    manager_name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 인덱스 생성
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_payroll_dept_date ON payroll(department, year, month)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id)")
            
            self.connection.commit()
            logger.info("데이터베이스 테이블 초기화 완료")
            
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")
            raise
    
    def load_from_excel(self, excel_path: str) -> bool:
        """
        Excel 급여대장 파일에서 데이터 로드
        
        Args:
            excel_path (str): Excel 파일 경로
            
        Returns:
            bool: 로드 성공 여부
        """
        try:
            if not os.path.exists(excel_path):
                logger.error(f"파일을 찾을 수 없습니다: {excel_path}")
                return False
            
            # Excel 파일 읽기
            df = pd.read_excel(excel_path)
            logger.info(f"Excel 파일 로드 완료: {len(df)}행")
            
            # 컬럼명 표준화
            column_mapping = {
                '사번': 'employee_id',
                '성명': 'employee_name', 
                '이름': 'employee_name',
                '부서': 'department',
                '직급': 'position',
                '직책': 'position',
                '기본급': 'base_salary',
                '연장근무수당': 'overtime_pay',
                '제수당': 'allowances',
                '상여금': 'bonuses',
                '공제액': 'deductions',
                '실지급액': 'net_salary',
                '지급일': 'payment_date',
                '년도': 'year',
                '월': 'month'
            }
            
            # 컬럼명 변경
            df = df.rename(columns=column_mapping)
            
            # 필수 컬럼 확인
            required_columns = ['employee_id', 'employee_name', 'department', 'base_salary']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                logger.error(f"필수 컬럼이 없습니다: {missing_columns}")
                return False
            
            # 데이터 정제
            df = self._clean_payroll_data(df)
            
            # 데이터베이스에 저장
            return self._save_to_database(df)
            
        except Exception as e:
            logger.error(f"Excel 파일 로드 오류: {e}")
            return False
    
    def _clean_payroll_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """급여 데이터 정제"""
        try:
            # 숫자 컬럼 처리
            numeric_columns = ['base_salary', 'overtime_pay', 'allowances', 'bonuses', 'deductions', 'net_salary']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
            
            # 년월 정보 처리
            current_date = datetime.now()
            if 'year' not in df.columns:
                df['year'] = current_date.year
            if 'month' not in df.columns:
                df['month'] = current_date.month
            
            # 지급일 처리
            if 'payment_date' not in df.columns:
                df['payment_date'] = f"{df['year'].iloc[0]}-{df['month'].iloc[0]:02d}-25"
            
            # 실지급액 계산 (없는 경우)
            if 'net_salary' not in df.columns or df['net_salary'].sum() == 0:
                df['net_salary'] = (df['base_salary'] + df['overtime_pay'] + 
                                  df['allowances'] + df['bonuses'] - df['deductions'])
            
            # 빈 값 처리
            df['position'] = df['position'].fillna('일반')
            df['department'] = df['department'].fillna('미분류')
            
            logger.info(f"데이터 정제 완료: {len(df)}행")
            return df
            
        except Exception as e:
            logger.error(f"데이터 정제 오류: {e}")
            raise
    
    def _save_to_database(self, df: pd.DataFrame) -> bool:
        """정제된 데이터를 데이터베이스에 저장"""
        try:
            cursor = self.connection.cursor()
            
            # 기존 데이터 삭제 (같은 년월)
            if not df.empty:
                year = df['year'].iloc[0]
                month = df['month'].iloc[0]
                cursor.execute("DELETE FROM payroll WHERE year = ? AND month = ?", (year, month))
            
            # 새 데이터 삽입
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT INTO payroll (
                        employee_id, employee_name, department, position,
                        base_salary, overtime_pay, allowances, bonuses, deductions,
                        net_salary, payment_date, year, month
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['employee_id'], row['employee_name'], row['department'], 
                    row.get('position', '일반'),
                    row['base_salary'], row.get('overtime_pay', 0), 
                    row.get('allowances', 0), row.get('bonuses', 0), 
                    row.get('deductions', 0), row['net_salary'],
                    row.get('payment_date', ''), row['year'], row['month']
                ))
            
            self.connection.commit()
            logger.info(f"데이터베이스 저장 완료: {len(df)}행")
            return True
            
        except Exception as e:
            logger.error(f"데이터베이스 저장 오류: {e}")
            self.connection.rollback()
            return False
    
    def get_department_summary(self, year: Optional[int] = None, month: Optional[int] = None) -> pd.DataFrame:
        """
        부서별 인건비 요약
        
        Args:
            year (Optional[int]): 조회할 년도 (None이면 최신)
            month (Optional[int]): 조회할 월 (None이면 최신)
            
        Returns:
            pd.DataFrame: 부서별 요약 데이터
        """
        try:
            query = """
                SELECT 
                    department,
                    COUNT(*) as employee_count,
                    SUM(base_salary) as total_base_salary,
                    SUM(overtime_pay) as total_overtime,
                    SUM(allowances) as total_allowances,
                    SUM(bonuses) as total_bonuses,
                    SUM(deductions) as total_deductions,
                    SUM(net_salary) as total_net_salary,
                    AVG(net_salary) as avg_salary,
                    MAX(net_salary) as max_salary,
                    MIN(net_salary) as min_salary,
                    year,
                    month
                FROM payroll 
            """
            
            params = []
            if year and month:
                query += " WHERE year = ? AND month = ?"
                params = [year, month]
            elif year:
                query += " WHERE year = ?"
                params = [year]
            else:
                # 최신 데이터 조회
                query += " WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)"
            
            query += " GROUP BY department, year, month ORDER BY total_net_salary DESC"
            
            df = pd.read_sql_query(query, self.connection, params=params)
            
            # 비율 계산
            total_cost = df['total_net_salary'].sum()
            if total_cost > 0:
                df['cost_ratio'] = (df['total_net_salary'] / total_cost * 100).round(2)
            else:
                df['cost_ratio'] = 0
            
            logger.info(f"부서별 요약 조회 완료: {len(df)}개 부서")
            return df
            
        except Exception as e:
            logger.error(f"부서별 요약 조회 오류: {e}")
            return pd.DataFrame()
    
    def get_monthly_trend(self, months: int = 12) -> pd.DataFrame:
        """월별 인건비 추이 분석"""
        try:
            query = """
                SELECT 
                    year,
                    month,
                    COUNT(*) as employee_count,
                    SUM(net_salary) as total_cost,
                    AVG(net_salary) as avg_salary
                FROM payroll 
                WHERE (year, month) >= (
                    SELECT year, month 
                    FROM payroll 
                    ORDER BY year DESC, month DESC 
                    LIMIT 1 OFFSET ?
                )
                GROUP BY year, month 
                ORDER BY year, month
            """
            
            df = pd.read_sql_query(query, self.connection, params=[months-1])
            
            # 월별 증감률 계산
            df['cost_change'] = df['total_cost'].pct_change() * 100
            df['employee_change'] = df['employee_count'].pct_change() * 100
            
            logger.info(f"월별 추이 분석 완료: {len(df)}개월")
            return df
            
        except Exception as e:
            logger.error(f"월별 추이 분석 오류: {e}")
            return pd.DataFrame()
    
    def generate_report(self, output_path: str = "인건비_종합보고서.xlsx") -> bool:
        """
        Excel 종합 보고서 생성
        
        Args:
            output_path (str): 출력 파일 경로
            
        Returns:
            bool: 생성 성공 여부
        """
        try:
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                
                # 1. 부서별 요약
                dept_summary = self.get_department_summary()
                if not dept_summary.empty:
                    dept_summary.to_excel(writer, sheet_name='부서별요약', index=False)
                
                # 2. 월별 추이
                monthly_trend = self.get_monthly_trend()
                if not monthly_trend.empty:
                    monthly_trend.to_excel(writer, sheet_name='월별추이', index=False)
                
                # 3. 직급별 분석
                position_analysis = self._get_position_analysis()
                if not position_analysis.empty:
                    position_analysis.to_excel(writer, sheet_name='직급별분석', index=False)
                
                # 4. 상세 급여 데이터
                detailed_data = self._get_detailed_payroll()
                if not detailed_data.empty:
                    detailed_data.to_excel(writer, sheet_name='상세데이터', index=False)
                
                # 5. 요약 통계
                summary_stats = self._get_summary_statistics()
                if not summary_stats.empty:
                    summary_stats.to_excel(writer, sheet_name='요약통계', index=False)
            
            logger.info(f"Excel 보고서 생성 완료: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Excel 보고서 생성 오류: {e}")
            return False
    
    def _get_position_analysis(self) -> pd.DataFrame:
        """직급별 분석"""
        try:
            query = """
                SELECT 
                    position,
                    COUNT(*) as employee_count,
                    AVG(net_salary) as avg_salary,
                    SUM(net_salary) as total_salary,
                    MAX(net_salary) as max_salary,
                    MIN(net_salary) as min_salary
                FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
                GROUP BY position 
                ORDER BY avg_salary DESC
            """
            
            return pd.read_sql_query(query, self.connection)
            
        except Exception as e:
            logger.error(f"직급별 분석 오류: {e}")
            return pd.DataFrame()
    
    def _get_detailed_payroll(self) -> pd.DataFrame:
        """상세 급여 데이터"""
        try:
            query = """
                SELECT * FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
                ORDER BY department, net_salary DESC
            """
            
            return pd.read_sql_query(query, self.connection)
            
        except Exception as e:
            logger.error(f"상세 데이터 조회 오류: {e}")
            return pd.DataFrame()
    
    def _get_summary_statistics(self) -> pd.DataFrame:
        """요약 통계"""
        try:
            query = """
                SELECT 
                    '전체 직원 수' as metric,
                    COUNT(*) as value,
                    '' as unit
                FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
                
                UNION ALL
                
                SELECT 
                    '총 인건비' as metric,
                    SUM(net_salary) as value,
                    '원' as unit
                FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
                
                UNION ALL
                
                SELECT 
                    '평균 급여' as metric,
                    AVG(net_salary) as value,
                    '원' as unit
                FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
                
                UNION ALL
                
                SELECT 
                    '부서 수' as metric,
                    COUNT(DISTINCT department) as value,
                    '개' as unit
                FROM payroll 
                WHERE (year, month) = (SELECT year, month FROM payroll ORDER BY year DESC, month DESC LIMIT 1)
            """
            
            return pd.read_sql_query(query, self.connection)
            
        except Exception as e:
            logger.error(f"요약 통계 조회 오류: {e}")
            return pd.DataFrame()
    
    def close(self):
        """데이터베이스 연결 종료"""
        if self.connection:
            self.connection.close()
            logger.info("데이터베이스 연결 종료")

    def __del__(self):
        """소멸자"""
        self.close()


# 사용 예제
if __name__ == "__main__":
    # 매니저 초기화
    manager = TotalLaborCostManager("labor_costs.db")
    
    try:
        # 테스트용 더미 데이터 생성
        test_data = {
            'employee_id': ['E001', 'E002', 'E003', 'E004', 'E005'],
            'employee_name': ['김철수', '이영희', '박민수', '최지영', '정현우'],
            'department': ['개발팀', '개발팀', '마케팅팀', '인사팀', '영업팀'],
            'position': ['팀장', '선임', '주임', '대리', '사원'],
            'base_salary': [5000000, 4000000, 3500000, 3000000, 2500000],
            'overtime_pay': [500000, 300000, 200000, 150000, 100000],
            'allowances': [300000, 200000, 150000, 100000, 50000],
            'bonuses': [1000000, 800000, 600000, 400000, 200000],
            'deductions': [600000, 480000, 420000, 360000, 300000],
            'year': [2025] * 5,
            'month': [1] * 5
        }
        
        df = pd.DataFrame(test_data)
        df['net_salary'] = df['base_salary'] + df['overtime_pay'] + df['allowances'] + df['bonuses'] - df['deductions']
        
        # 테스트 데이터 저장
        manager._save_to_database(df)
        
        # 부서별 요약
        summary = manager.get_department_summary()
        print("=== 부서별 인건비 요약 ===")
        print(summary)
        
        # Excel 보고서 생성
        if manager.generate_report("test_report.xlsx"):
            print("\n✅ Excel 보고서 생성 완료: test_report.xlsx")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    
    finally:
        manager.close()