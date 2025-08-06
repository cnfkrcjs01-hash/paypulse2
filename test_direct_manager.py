from direct_labor_cost_manager import DirectLaborCostManager

# 직접인건비 전문 관리자
direct_manager = DirectLaborCostManager("direct_labor.db")

# 데이터 로드 및 분석
direct_manager.load_from_excel("2025_급여대장_더미.xlsx")

# 연장근무 트렌드 분석
overtime_trend = direct_manager.get_overtime_trend()
print("=== 연장근무 트렌드 분석 ===")
print(overtime_trend)

# 직접인건비 상세 보고서
direct_manager.generate_detailed_report("직접인건비_상세보고서.xlsx")

print("\n✅ 직접 인건비 분석 완료!")
print("📁 생성된 파일:")
print("   - direct_labor.db (직접인건비 전용 데이터베이스)")
print("   - 직접인건비_상세보고서.xlsx (8개 시트 상세 분석)")