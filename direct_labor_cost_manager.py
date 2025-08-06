"""
PayPulse 직접 인건비 전문 관리 시스템
DirectLaborCostManager - 직접 인건비 분석 및 관리 특화
"""

import pandas as pd
import sqlite3
import numpy as np
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional, Tuple
import logging
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib import font_manager
import warnings

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False
warnings.filterwarnings('ignore')

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DirectLaborCostManager:
    """직접 인건비 전문 관리 시스템"""
    
    def __init__(self, db_path: str = "direct_labor.db"):
        """
        DirectLaborCostManager 초기화
        
        Args:
            db_path (str): SQLite 데이터베이스 파일 경로
        """
        self.db_path = db_path
        self.connection = None
        self._initialize_database()
        logger.info(f"DirectLaborCostManager 초기화 완료: {db_path}")
    
    def _initialize_database(self):
        """데이터베이스 초기화 및 테이블 생성"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            cursor = self.connection.cursor()
            
            # 직접 인건비 테이블 생성
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS direct_labor (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    employee_name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    position TEXT,
                    work_type TEXT DEFAULT '정규직',
                    base_salary INTEGER,
                    overtime_pay INTEGER DEFAULT 0,
                    night_shift_pay INTEGER DEFAULT 0,
                    holiday_pay INTEGER DEFAULT 0,
                    skill_allowance INTEGER DEFAULT 0,
                    direct_total INTEGER,
                    work_hours REAL DEFAULT 40.0,
                    overtime_hours REAL DEFAULT 0.0,
                    hourly_rate REAL,
                    overtime_rate REAL,
                    productivity_score REAL DEFAULT 100.0,
                    cost_center TEXT,
                    project_code TEXT,
                    payment_date DATE,
                    year INTEGER,
                    month INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 연장근무 상세 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS overtime_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    overtime_date DATE,
                    overtime_hours REAL,
                    overtime_type TEXT,
                    overtime_rate REAL,
                    overtime_amount INTEGER,
                    approval_status TEXT DEFAULT '승인',
                    department TEXT,
                    year INTEGER,
                    month INTEGER,
                    FOREIGN KEY (employee_id) REFERENCES direct_labor(employee_id)
                )
            """)
            
            # 생산성 지표 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS productivity_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    metric_date DATE,
                    hours_worked REAL,
                    output_units INTEGER,
                    quality_score REAL,
                    efficiency_rating REAL,
                    cost_per_unit REAL,
                    department TEXT,
                    year INTEGER,
                    month INTEGER
                )
            """)
            
            # 인덱스 생성
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_direct_labor_dept_date ON direct_labor(department, year, month)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_overtime_employee_date ON overtime_details(employee_id, overtime_date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_productivity_date ON productivity_metrics(metric_date)")
            
            self.connection.commit()
            logger.info("직접 인건비 데이터베이스 테이블 초기화 완료")
            
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")
            raise
    
    def load_from_excel(self, excel_path: str) -> bool:
        """
        Excel 급여대장 파일에서 직접 인건비 데이터 로드
        
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
                '야근수당': 'night_shift_pay',
                '휴일근무수당': 'holiday_pay',
                '기술수당': 'skill_allowance',
                '제수당': 'allowances',
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
            
            # 직접 인건비 데이터 정제
            df = self._clean_direct_labor_data(df)
            
            # 데이터베이스에 저장
            return self._save_direct_labor_to_database(df)
            
        except Exception as e:
            logger.error(f"Excel 파일 로드 오류: {e}")
            return False
    
    def _clean_direct_labor_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """직접 인건비 데이터 정제"""
        try:
            # 숫자 컬럼 처리
            numeric_columns = ['base_salary', 'overtime_pay', 'night_shift_pay', 'holiday_pay', 'skill_allowance']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
                else:
                    df[col] = 0
            
            # 직접 인건비 총액 계산
            df['direct_total'] = (df['base_salary'] + df['overtime_pay'] + 
                                df['night_shift_pay'] + df['holiday_pay'] + df['skill_allowance'])
            
            # 시간당 임금 계산 (기본 주 40시간 기준)
            df['work_hours'] = 40.0  # 기본 근무시간
            df['hourly_rate'] = df['base_salary'] / (df['work_hours'] * 4.33)  # 월 평균 근무시간
            
            # 연장근무 시간 추정 (연장근무수당을 시간당 임금의 1.5배로 가정)
            df['overtime_rate'] = df['hourly_rate'] * 1.5
            df['overtime_hours'] = np.where(df['overtime_rate'] > 0, 
                                          df['overtime_pay'] / df['overtime_rate'], 0)
            
            # 생산성 점수 (기본 100점으로 설정)
            df['productivity_score'] = 100.0
            
            # 년월 정보 처리
            current_date = datetime.now()
            if 'year' not in df.columns:
                df['year'] = current_date.year
            if 'month' not in df.columns:
                df['month'] = current_date.month
            
            # 지급일 처리
            if 'payment_date' not in df.columns:
                df['payment_date'] = f"{df['year'].iloc[0]}-{df['month'].iloc[0]:02d}-25"
            
            # 빈 값 처리
            df['position'] = df['position'].fillna('일반')
            df['department'] = df['department'].fillna('미분류')
            df['work_type'] = '정규직'
            df['cost_center'] = df['department']
            df['project_code'] = 'DEFAULT'
            
            logger.info(f"직접 인건비 데이터 정제 완료: {len(df)}행")
            return df
            
        except Exception as e:
            logger.error(f"데이터 정제 오류: {e}")
            raise
    
    def _save_direct_labor_to_database(self, df: pd.DataFrame) -> bool:
        """정제된 직접 인건비 데이터를 데이터베이스에 저장"""
        try:
            cursor = self.connection.cursor()
            
            # 기존 데이터 삭제 (같은 년월)
            if not df.empty:
                year = df['year'].iloc[0]
                month = df['month'].iloc[0]
                cursor.execute("DELETE FROM direct_labor WHERE year = ? AND month = ?", (year, month))
            
            # 새 데이터 삽입
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT INTO direct_labor (
                        employee_id, employee_name, department, position, work_type,
                        base_salary, overtime_pay, night_shift_pay, holiday_pay, skill_allowance,
                        direct_total, work_hours, overtime_hours, hourly_rate, overtime_rate,
                        productivity_score, cost_center, project_code, payment_date, year, month
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['employee_id'], row['employee_name'], row['department'], 
                    row['position'], row['work_type'],
                    row['base_salary'], row['overtime_pay'], row['night_shift_pay'],
                    row['holiday_pay'], row['skill_allowance'], row['direct_total'],
                    row['work_hours'], row['overtime_hours'], row['hourly_rate'],
                    row['overtime_rate'], row['productivity_score'],
                    row['cost_center'], row['project_code'], row['payment_date'],
                    row['year'], row['month']
                ))
            
            self.connection.commit()
            logger.info(f"직접 인건비 데이터베이스 저장 완료: {len(df)}행")
            return True
            
        except Exception as e:
            logger.error(f"데이터베이스 저장 오류: {e}")
            self.connection.rollback()
            return False
    
    def get_overtime_trend(self, months: int = 12) -> pd.DataFrame:
        """
        연장근무 트렌드 분석
        
        Args:
            months (int): 분석할 개월 수
            
        Returns:
            pd.DataFrame: 연장근무 트렌드 데이터
        """
        try:
            query = """
                SELECT 
                    year,
                    month,
                    department,
                    COUNT(*) as employee_count,
                    SUM(overtime_hours) as total_overtime_hours,
                    AVG(overtime_hours) as avg_overtime_hours,
                    SUM(overtime_pay) as total_overtime_pay,
                    AVG(overtime_pay) as avg_overtime_pay,
                    MAX(overtime_hours) as max_overtime_hours,
                    (SUM(overtime_pay) * 100.0 / SUM(direct_total)) as overtime_ratio
                FROM direct_labor 
                WHERE overtime_hours > 0
                GROUP BY year, month, department
                ORDER BY year DESC, month DESC, department
                LIMIT ?
            """
            
            df = pd.read_sql_query(query, self.connection, params=[months * 10])
            
            # 연장근무 증가율 계산
            df = df.sort_values(['department', 'year', 'month'])
            df['overtime_growth'] = df.groupby('department')['total_overtime_hours'].pct_change() * 100
            
            logger.info(f"연장근무 트렌드 분석 완료: {len(df)}건")
            return df
            
        except Exception as e:
            logger.error(f"연장근무 트렌드 분석 오류: {e}")
            return pd.DataFrame()
    
    def get_direct_labor_analysis(self) -> Dict:
        """직접 인건비 종합 분석"""
        try:
            analysis = {}
            
            # 1. 부서별 직접 인건비 분석
            dept_query = """
                SELECT 
                    department,
                    COUNT(*) as employee_count,
                    SUM(direct_total) as total_direct_cost,
                    AVG(direct_total) as avg_direct_cost,
                    SUM(base_salary) as total_base_salary,
                    SUM(overtime_pay) as total_overtime,
                    AVG(hourly_rate) as avg_hourly_rate,
                    AVG(productivity_score) as avg_productivity
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                GROUP BY department
                ORDER BY total_direct_cost DESC
            """
            
            analysis['department_analysis'] = pd.read_sql_query(dept_query, self.connection)
            
            # 2. 직급별 분석
            position_query = """
                SELECT 
                    position,
                    COUNT(*) as employee_count,
                    AVG(base_salary) as avg_base_salary,
                    AVG(overtime_pay) as avg_overtime_pay,
                    AVG(hourly_rate) as avg_hourly_rate,
                    AVG(overtime_hours) as avg_overtime_hours
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                GROUP BY position
                ORDER BY avg_base_salary DESC
            """
            
            analysis['position_analysis'] = pd.read_sql_query(position_query, self.connection)
            
            # 3. 시간당 비용 효율성 분석
            efficiency_query = """
                SELECT 
                    employee_id,
                    employee_name,
                    department,
                    position,
                    hourly_rate,
                    productivity_score,
                    (direct_total / (work_hours + overtime_hours)) as cost_per_hour,
                    (productivity_score / hourly_rate * 100) as efficiency_index
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                ORDER BY efficiency_index DESC
            """
            
            analysis['efficiency_analysis'] = pd.read_sql_query(efficiency_query, self.connection)
            
            # 4. 연장근무 패턴 분석
            overtime_pattern_query = """
                SELECT 
                    department,
                    CASE 
                        WHEN overtime_hours = 0 THEN '연장근무 없음'
                        WHEN overtime_hours <= 10 THEN '연장근무 적음 (≤10h)'
                        WHEN overtime_hours <= 20 THEN '연장근무 보통 (11-20h)'
                        ELSE '연장근무 많음 (>20h)'
                    END as overtime_category,
                    COUNT(*) as employee_count,
                    AVG(overtime_pay) as avg_overtime_pay
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                GROUP BY department, overtime_category
                ORDER BY department, overtime_category
            """
            
            analysis['overtime_pattern'] = pd.read_sql_query(overtime_pattern_query, self.connection)
            
            logger.info("직접 인건비 종합 분석 완료")
            return analysis
            
        except Exception as e:
            logger.error(f"직접 인건비 분석 오류: {e}")
            return {}
    
    def generate_detailed_report(self, output_path: str = "직접인건비_상세보고서.xlsx") -> bool:
        """
        직접 인건비 상세 Excel 보고서 생성
        
        Args:
            output_path (str): 출력 파일 경로
            
        Returns:
            bool: 생성 성공 여부
        """
        try:
            # 분석 데이터 수집
            analysis = self.get_direct_labor_analysis()
            overtime_trend = self.get_overtime_trend()
            
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                
                # 1. 부서별 직접 인건비 분석
                if 'department_analysis' in analysis and not analysis['department_analysis'].empty:
                    analysis['department_analysis'].to_excel(writer, sheet_name='부서별분석', index=False)
                
                # 2. 직급별 분석
                if 'position_analysis' in analysis and not analysis['position_analysis'].empty:
                    analysis['position_analysis'].to_excel(writer, sheet_name='직급별분석', index=False)
                
                # 3. 효율성 분석
                if 'efficiency_analysis' in analysis and not analysis['efficiency_analysis'].empty:
                    analysis['efficiency_analysis'].to_excel(writer, sheet_name='효율성분석', index=False)
                
                # 4. 연장근무 패턴
                if 'overtime_pattern' in analysis and not analysis['overtime_pattern'].empty:
                    analysis['overtime_pattern'].to_excel(writer, sheet_name='연장근무패턴', index=False)
                
                # 5. 연장근무 트렌드
                if not overtime_trend.empty:
                    overtime_trend.to_excel(writer, sheet_name='연장근무트렌드', index=False)
                
                # 6. 시간당 비용 분석
                hourly_cost_analysis = self._get_hourly_cost_analysis()
                if not hourly_cost_analysis.empty:
                    hourly_cost_analysis.to_excel(writer, sheet_name='시간당비용분석', index=False)
                
                # 7. 직접 인건비 상세 데이터
                detailed_data = self._get_detailed_direct_labor()
                if not detailed_data.empty:
                    detailed_data.to_excel(writer, sheet_name='직접인건비상세', index=False)
                
                # 8. 대시보드 요약
                dashboard_summary = self._create_dashboard_summary()
                if not dashboard_summary.empty:
                    dashboard_summary.to_excel(writer, sheet_name='대시보드요약', index=False)
            
            logger.info(f"직접 인건비 상세 보고서 생성 완료: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"상세 보고서 생성 오류: {e}")
            return False
    
    def _get_hourly_cost_analysis(self) -> pd.DataFrame:
        """시간당 비용 분석"""
        try:
            query = """
                SELECT 
                    department,
                    position,
                    employee_name,
                    hourly_rate,
                    overtime_rate,
                    (work_hours + overtime_hours) as total_hours,
                    direct_total,
                    (direct_total / (work_hours + overtime_hours)) as actual_hourly_cost,
                    productivity_score,
                    (productivity_score / (direct_total / (work_hours + overtime_hours)) * 100) as cost_efficiency
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                AND (work_hours + overtime_hours) > 0
                ORDER BY cost_efficiency DESC
            """
            
            return pd.read_sql_query(query, self.connection)
            
        except Exception as e:
            logger.error(f"시간당 비용 분석 오류: {e}")
            return pd.DataFrame()
    
    def _get_detailed_direct_labor(self) -> pd.DataFrame:
        """직접 인건비 상세 데이터"""
        try:
            query = """
                SELECT 
                    employee_id,
                    employee_name,
                    department,
                    position,
                    work_type,
                    base_salary,
                    overtime_pay,
                    night_shift_pay,
                    holiday_pay,
                    skill_allowance,
                    direct_total,
                    work_hours,
                    overtime_hours,
                    hourly_rate,
                    overtime_rate,
                    productivity_score,
                    cost_center,
                    year,
                    month
                FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
                ORDER BY department, direct_total DESC
            """
            
            return pd.read_sql_query(query, self.connection)
            
        except Exception as e:
            logger.error(f"상세 데이터 조회 오류: {e}")
            return pd.DataFrame()
    
    def _create_dashboard_summary(self) -> pd.DataFrame:
        """대시보드 요약 생성"""
        try:
            summary_data = []
            
            # 총 직접 인건비
            total_cost = pd.read_sql_query("""
                SELECT SUM(direct_total) as value FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
            """, self.connection)['value'].iloc[0]
            
            summary_data.append(['총 직접 인건비', f"{total_cost:,}원", '월간 직접 인건비 총액'])
            
            # 평균 시간당 임금
            avg_hourly = pd.read_sql_query("""
                SELECT AVG(hourly_rate) as value FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
            """, self.connection)['value'].iloc[0]
            
            summary_data.append(['평균 시간당 임금', f"{avg_hourly:,.0f}원", '전체 직원 평균'])
            
            # 총 연장근무 시간
            total_overtime = pd.read_sql_query("""
                SELECT SUM(overtime_hours) as value FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
            """, self.connection)['value'].iloc[0]
            
            summary_data.append(['총 연장근무 시간', f"{total_overtime:,.1f}시간", '월간 총 연장근무'])
            
            # 연장근무 비율
            overtime_ratio = pd.read_sql_query("""
                SELECT (SUM(overtime_pay) * 100.0 / SUM(direct_total)) as value FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
            """, self.connection)['value'].iloc[0]
            
            summary_data.append(['연장근무비 비율', f"{overtime_ratio:.1f}%", '직접인건비 대비'])
            
            # 평균 생산성 점수
            avg_productivity = pd.read_sql_query("""
                SELECT AVG(productivity_score) as value FROM direct_labor 
                WHERE (year, month) = (SELECT year, month FROM direct_labor ORDER BY year DESC, month DESC LIMIT 1)
            """, self.connection)['value'].iloc[0]
            
            summary_data.append(['평균 생산성 점수', f"{avg_productivity:.1f}점", '100점 만점'])
            
            return pd.DataFrame(summary_data, columns=['지표', '값', '설명'])
            
        except Exception as e:
            logger.error(f"대시보드 요약 생성 오류: {e}")
            return pd.DataFrame()
    
    def close(self):
        """데이터베이스 연결 종료"""
        if self.connection:
            self.connection.close()
            logger.info("직접 인건비 데이터베이스 연결 종료")

    def __del__(self):
        """소멸자"""
        self.close()


# 사용 예제
if __name__ == "__main__":
    # 직접인건비 전문 관리자
    direct_manager = DirectLaborCostManager("direct_labor.db")
    
    try:
        print("=== 직접 인건비 관리 시스템 테스트 ===")
        
        # 테스트용 더미 데이터 생성
        test_data = {
            'employee_id': ['E001', 'E002', 'E003', 'E004', 'E005'],
            'employee_name': ['김철수', '이영희', '박민수', '최지영', '정현우'],
            'department': ['생산팀', '생산팀', '기술팀', '품질팀', '기술팀'],
            'position': ['팀장', '선임', '주임', '대리', '사원'],
            'base_salary': [5000000, 4000000, 3500000, 3000000, 2500000],
            'overtime_pay': [800000, 600000, 400000, 300000, 200000],
            'night_shift_pay': [200000, 150000, 100000, 50000, 0],
            'holiday_pay': [300000, 200000, 150000, 100000, 50000],
            'skill_allowance': [500000, 300000, 200000, 100000, 50000],
            'year': [2025] * 5,
            'month': [1] * 5
        }
        
        df = pd.DataFrame(test_data)
        
        # 테스트 데이터 저장
        cleaned_df = direct_manager._clean_direct_labor_data(df)
        direct_manager._save_direct_labor_to_database(cleaned_df)
        
        # 연장근무 트렌드 분석
        overtime_trend = direct_manager.get_overtime_trend()
        print("\n=== 연장근무 트렌드 ===")
        print(overtime_trend)
        
        # 직접인건비 상세 보고서 생성
        if direct_manager.generate_detailed_report("test_직접인건비_상세보고서.xlsx"):
            print("\n✅ 직접인건비 상세 보고서 생성 완료!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    
    finally:
        direct_manager.close()