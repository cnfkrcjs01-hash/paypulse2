from total_labor_cost_manager import TotalLaborCostManager

# 매니저 초기화
manager = TotalLaborCostManager("labor_costs.db")

# 급여대장 데이터 로드
manager.load_from_excel("2025_급여대장_더미.xlsx")

# 부서별 인건비 요약
summary = manager.get_department_summary()
print("=== 부서별 인건비 요약 ===")
print(summary)

# Excel 보고서 생성
manager.generate_report("인건비_종합보고서.xlsx")

print("\n✅ 모든 작업 완료!")
print("📁 생성된 파일:")
print("   - labor_costs.db (SQLite 데이터베이스)")
print("   - 인건비_종합보고서.xlsx (Excel 보고서)")