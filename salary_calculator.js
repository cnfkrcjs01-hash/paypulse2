// salary_calculator.js - 스마트 인건비 계산기 시스템

// 2025년 기준 상수값들
const SALARY_CONSTANTS = {
    // 2025년 최저임금
    MINIMUM_WAGE_2025: 10030,
    
    // 4대보험료율 (2025년 기준)
    INSURANCE_RATES: {
        nationalPension: { employee: 4.5, employer: 4.5 },
        healthInsurance: { employee: 3.77, employer: 3.77 },
        longTermCare: { employee: 0.4581, employer: 0.4581 }, // 건강보험료의 12.15%
        employmentInsurance: { employee: 0.9, employer: 1.15 },
        workersCompensation: { employee: 0, employer: 0.75 } // 업종평균
    },
    
    // 연장근로 할증률
    OVERTIME_RATES: {
        overtime: 1.5,      // 연장근로 (8시간 초과)
        nightWork: 1.5,     // 야간근로 (22:00~06:00)
        holidayWork: 1.5,   // 휴일근로
        sundayWork: 2.0     // 일요일 근로
    },
    
    // 육아휴직급여 상한액 (2025년 기준)
    PARENTAL_LEAVE_MAX: 1500000,
    
    // 평균임금 계산기간
    AVERAGE_WAGE_PERIOD: 90
};

// 계산기 초기화
function initializeSalaryCalculator() {
    console.log('스마트 인건비 계산기 초기화');
    
    // 탭 이벤트 리스너 설정
    setupCalculatorTabs();
    
    // 기본 탭 (직원급여) 로드
    loadCalculatorTab('salary');
}

// 탭 시스템 설정
function setupCalculatorTabs() {
    const tabs = document.querySelectorAll('.calc-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.color = '#374151';
                t.style.borderBottomColor = 'transparent';
            });
            
            // 선택된 탭 활성화
            tab.classList.add('active');
            tab.style.color = '#3B82F6';
            tab.style.borderBottomColor = '#3B82F6';
            
            // 해당 계산기 로드
            const tabType = tab.getAttribute('data-tab');
            loadCalculatorTab(tabType);
        });
    });
}

// 계산기 탭 로드
function loadCalculatorTab(tabType) {
    const content = document.getElementById('calculator-content');
    const results = document.getElementById('calculation-results');
    results.style.display = 'none';
    
    switch(tabType) {
        case 'salary':
            content.innerHTML = getSalaryCalculator();
            break;
        case 'annual-leave':
            content.innerHTML = getAnnualLeaveCalculator();
            break;
        case 'overtime':
            content.innerHTML = getOvertimeCalculator();
            break;
        case 'parental-leave':
            content.innerHTML = getParentalLeaveCalculator();
            break;
        case 'reduced-hours':
            content.innerHTML = getReducedHoursCalculator();
            break;
        case 'holiday-work':
            content.innerHTML = getHolidayWorkCalculator();
            break;
        case 'retirement':
            content.innerHTML = getRetirementCalculator();
            break;
        case 'insurance':
            content.innerHTML = getInsuranceCalculator();
            break;
        case 'minimum-wage':
            content.innerHTML = getMinimumWageCalculator();
            break;
        default:
            content.innerHTML = '<p>준비 중인 계산기입니다.</p>';
    }
}

// 0. 직원 급여 계산기 (네오모피즘 스타일)
function getSalaryCalculator() {
    return `
        <div style="background: #e0e7ff; border-radius: 20px; padding: 2.5rem; box-shadow: 20px 20px 40px #c7d2fe, -20px -20px 40px #f9fafb;">
            <h3 style="color: #374151; margin-bottom: 1.5rem; font-weight: 700; font-size: 1.5rem;">
                <i class="fas fa-wallet" style="color: #6366f1; margin-right: 0.5rem;"></i>직원 급여 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem; font-weight: 400;">기본급, 수당, 공제액을 포함한 실수령액을 계산합니다.</p>
            
            <!-- 기본 정보 -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">📝 기본 정보</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기본급 (원)</label>
                        <input type="number" id="basic-salary" placeholder="2500000" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">직책수당 (원)</label>
                        <input type="number" id="position-allowance" placeholder="300000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">식대 (원)</label>
                        <input type="number" id="meal-allowance" placeholder="200000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">교통비 (원)</label>
                        <input type="number" id="transport-allowance" placeholder="150000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                </div>
            </div>

            <!-- 추가 수당 -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">💰 추가 수당</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">연장근로수당 (원)</label>
                        <input type="number" id="overtime-allowance" placeholder="300000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">야간근로수당 (원)</label>
                        <input type="number" id="night-allowance" placeholder="100000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">휴일근로수당 (원)</label>
                        <input type="number" id="holiday-allowance" placeholder="200000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기타수당 (원)</label>
                        <input type="number" id="other-allowance" placeholder="50000" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                </div>
            </div>

            <!-- 개인 정보 -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #374151; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">👤 개인 정보</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">연령</label>
                        <input type="number" id="employee-age" placeholder="35" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">부양가족 수</label>
                        <input type="number" id="dependents" placeholder="2" value="0" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">소득세 간이세액표</label>
                        <select id="tax-table" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                            <option value="80">80% (기본)</option>
                            <option value="100">100%</option>
                            <option value="120">120%</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">비과세 한도 적용</label>
                        <select id="tax-free" style="width: 100%; padding: 1rem; border: none; border-radius: 12px; font-size: 1rem; background: #e0e7ff; color: #374151; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                            <option value="yes">적용</option>
                            <option value="no">미적용</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 2rem; text-align: center;">
                <button onclick="calculateSalary()" style="background: #e0e7ff; color: #6366f1; border: none; padding: 1rem 2rem; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1rem; box-shadow: 8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb; transition: all 0.3s ease; min-width: 200px;" 
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='12px 12px 20px #c7d2fe, -12px -12px 20px #f9fafb';"
                    onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb';"
                    onmousedown="this.style.boxShadow='inset 6px 6px 12px #c7d2fe, inset -6px -6px 12px #f9fafb';"
                    onmouseup="this.style.boxShadow='8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb';">
                    <i class="fas fa-calculator" style="margin-right: 0.5rem;"></i>급여 계산하기
                </button>
            </div>
            
            <div style="margin-top: 2rem; padding: 1.5rem; background: #e0e7ff; border-radius: 12px; font-size: 0.9rem; color: #6366f1; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb;">
                <strong><i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>포함 항목:</strong> 기본급, 각종 수당, 4대보험, 소득세, 지방소득세 자동 계산
            </div>
        </div>
    `;
}

// 1. 연차수당 계산기
function getAnnualLeaveCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-calendar-alt"></i> 연차수당 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">근로기준법에 따른 연차수당을 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월 급여액 (원)</label>
                    <input type="number" id="annual-monthly-salary" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">연차 사용일수 (일)</label>
                    <input type="number" id="annual-days-used" placeholder="5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월 근무일수 (일)</label>
                    <input type="number" id="annual-working-days" placeholder="22" value="22" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateAnnualLeave()" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 연차수당 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f3f4f6; border-radius: 8px; font-size: 0.9rem; color: #6b7280;">
                <strong>계산 방법:</strong> 일급 = 월급여 ÷ 월근무일수 / 연차수당 = 일급 × 연차사용일수
            </div>
        </div>
    `;
}

// 2. 연장근로수당 계산기
function getOvertimeCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-clock"></i> 연장근로수당 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">연장근로, 야간근로, 휴일근로 수당을 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">시급 (원)</label>
                    <input type="number" id="overtime-hourly-wage" placeholder="13636" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">연장근로 시간</label>
                    <input type="number" id="overtime-hours" placeholder="2" step="0.5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">야간근로 시간</label>
                    <input type="number" id="night-hours" placeholder="1" step="0.5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">휴일근로 시간</label>
                    <input type="number" id="holiday-hours" placeholder="4" step="0.5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateOvertime()" style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 연장근로수당 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #fef2f2; border-radius: 8px; font-size: 0.9rem; color: #dc2626;">
                <strong>할증률:</strong> 연장근로 150% / 야간근로 150% / 휴일근로 150% (8시간 초과시 200%)
            </div>
        </div>
    `;
}

// 3. 육아휴직급여 계산기
function getParentalLeaveCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-baby"></i> 육아휴직급여 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">고용보험법에 따른 육아휴직급여를 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">휴직 전 평균임금 (월)</label>
                    <input type="number" id="parental-average-wage" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">육아휴직 개월수</label>
                    <input type="number" id="parental-months" placeholder="12" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">자녀 출생 순서</label>
                    <select id="parental-child-order" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                        <option value="first">첫째</option>
                        <option value="second">둘째</option>
                        <option value="third">셋째 이상</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateParentalLeave()" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 육아휴직급여 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #fef3c7; border-radius: 8px; font-size: 0.9rem; color: #92400e;">
                <strong>급여율:</strong> 통상임금의 80% (상한액: 월 150만원, 하한액: 월 70만원)
            </div>
        </div>
    `;
}

// 4. 단축근로급여 계산기
function getReducedHoursCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-user-clock"></i> 단축근로급여 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">근로시간 단축에 따른 급여 조정액을 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기존 월급여 (원)</label>
                    <input type="number" id="reduced-original-salary" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기존 주당 근로시간</label>
                    <input type="number" id="reduced-original-hours" placeholder="40" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">단축 후 주당 근로시간</label>
                    <input type="number" id="reduced-new-hours" placeholder="30" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">단축근로 개월수</label>
                    <input type="number" id="reduced-months" placeholder="6" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateReducedHours()" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 단축근로급여 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f3e8ff; border-radius: 8px; font-size: 0.9rem; color: #7c3aed;">
                <strong>계산방법:</strong> 시급 유지 원칙으로 근로시간 비율에 따라 급여 조정
            </div>
        </div>
    `;
}

// 5. 휴일근로수당 계산기
function getHolidayWorkCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-calendar-check"></i> 휴일근로수당 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">주휴일, 법정공휴일 근로수당을 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">시급 (원)</label>
                    <input type="number" id="holiday-hourly-wage" placeholder="13636" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">주휴일 근로시간</label>
                    <input type="number" id="sunday-hours" placeholder="8" step="0.5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">법정공휴일 근로시간</label>
                    <input type="number" id="legal-holiday-hours" placeholder="4" step="0.5" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">근로 날짜</label>
                    <input type="date" id="holiday-work-date" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateHolidayWork()" style="background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 휴일근로수당 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #ecfdf5; border-radius: 8px; font-size: 0.9rem; color: #059669;">
                <strong>할증률:</strong> 주휴일 200% / 법정공휴일 150% (8시간 초과 시 추가 50% 가산)
            </div>
        </div>
    `;
}

// 6. 퇴직금/퇴직연금 계산기 (DB/DC)
function getRetirementCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-piggy-bank"></i> 퇴직금/퇴직연금 계산기 (DB/DC)
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">확정급여형(DB)과 확정기여형(DC) 퇴직급여를 계산합니다.</p>
            
            <!-- 퇴직급여 유형 선택 -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.1rem;">💼 퇴직급여 유형</h4>
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; flex: 1; transition: all 0.3s;">
                        <input type="radio" name="retirement-type" value="DB" checked onchange="toggleRetirementType()" style="margin-right: 0.5rem;">
                        <div>
                            <strong style="color: #1f2937;">DB (확정급여형)</strong><br>
                            <small style="color: #6b7280;">근로기준법 퇴직금</small>
                        </div>
                    </label>
                    <label style="display: flex; align-items: center; cursor: pointer; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; flex: 1; transition: all 0.3s;">
                        <input type="radio" name="retirement-type" value="DC" onchange="toggleRetirementType()" style="margin-right: 0.5rem;">
                        <div>
                            <strong style="color: #1f2937;">DC (확정기여형)</strong><br>
                            <small style="color: #6b7280;">퇴직연금 적립</small>
                        </div>
                    </label>
                </div>
            </div>

            <!-- 공통 정보 -->
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.1rem;">📅 근무 정보</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">입사일</label>
                        <input type="date" id="retirement-start-date" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">퇴사일</label>
                        <input type="date" id="retirement-end-date" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                </div>
            </div>

            <!-- DB 전용 필드 -->
            <div id="db-fields" style="margin-bottom: 2rem;">
                <h4 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.1rem;">💰 DB - 퇴직금 정보</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">최근 3개월 평균임금 (원)</label>
                        <input type="number" id="retirement-average-wage" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">퇴직사유</label>
                        <select id="retirement-reason" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                            <option value="normal">일반퇴직</option>
                            <option value="dismissal">해고</option>
                            <option value="contract-end">계약만료</option>
                            <option value="retirement">정년퇴직</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- DC 전용 필드 -->
            <div id="dc-fields" style="margin-bottom: 2rem; display: none;">
                <h4 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.1rem;">📊 DC - 퇴직연금 정보</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기준소득월액 (원)</label>
                        <input type="number" id="dc-monthly-income" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월 적립률 (%)</label>
                        <input type="number" id="dc-contribution-rate" placeholder="8.3" value="8.3" min="8.3" step="0.1" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">예상 연간 수익률 (%)</label>
                        <input type="number" id="dc-return-rate" placeholder="3.0" value="3.0" step="0.1" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">기존 적립금 (원)</label>
                        <input type="number" id="dc-existing-amount" placeholder="0" value="0" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateRetirement()" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 퇴직급여 계산하기
                </button>
            </div>
            
            <div id="retirement-info" style="margin-top: 1.5rem; padding: 1rem; background: #fef3c7; border-radius: 8px; font-size: 0.9rem; color: #92400e;">
                <strong>DB 계산법:</strong> 평균임금 × 근속년수 × 30일 (1년 미만은 비례계산)<br>
                <strong>DC 계산법:</strong> 매월 적립금 × 근속개월수 + 운용수익 (최소 8.3% 적립)
            </div>
        </div>
    `;
}

// 7. 4대보험료 계산기
function getInsuranceCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-shield-alt"></i> 4대보험료 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">2025년 기준 4대보험료를 계산합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월급여 (원)</label>
                    <input type="number" id="insurance-monthly-salary" placeholder="3000000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">연령</label>
                    <input type="number" id="insurance-age" placeholder="35" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">업종</label>
                    <select id="insurance-industry" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                        <option value="office">사무직</option>
                        <option value="manufacturing">제조업</option>
                        <option value="construction">건설업</option>
                        <option value="service">서비스업</option>
                        <option value="other">기타</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateInsurance()" style="background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 4대보험료 계산하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #dbeafe; border-radius: 8px; font-size: 0.9rem; color: #1e40af;">
                <strong>2025년 요율:</strong> 국민연금 4.5% / 건강보험 3.77% / 고용보험 0.9% / 산재보험 0.75%
            </div>
        </div>
    `;
}

// 8. 최저임금 검증 계산기
function getMinimumWageCalculator() {
    return `
        <div style="background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color: #1f2937; margin-bottom: 1.5rem;">
                <i class="fas fa-balance-scale"></i> 최저임금 검증 계산기
            </h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">2025년 최저임금(시급 10,030원) 기준으로 검증합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월급여 (원)</label>
                    <input type="number" id="minimum-monthly-salary" placeholder="2100000" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">월 근로시간</label>
                    <input type="number" id="minimum-monthly-hours" placeholder="209" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">주휴수당 포함여부</label>
                    <select id="minimum-include-weekly" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                        <option value="yes">포함</option>
                        <option value="no">미포함</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">계산 기준년도</label>
                    <select id="minimum-year" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                        <option value="2025">2025년</option>
                        <option value="2024">2024년</option>
                        <option value="2023">2023년</option>
                    </select>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="calculateMinimumWage()" style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                    <i class="fas fa-calculator"></i> 최저임금 검증하기
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: #fef2f2; border-radius: 8px; font-size: 0.9rem; color: #dc2626;">
                <strong>2025년 최저임금:</strong> 시급 10,030원 (월급 209시간 기준 2,096,270원)
            </div>
        </div>
    `;
}

// 계산 함수들
function calculateSalary() {
    // 기본 정보
    const basicSalary = parseFloat(document.getElementById('basic-salary').value) || 0;
    const positionAllowance = parseFloat(document.getElementById('position-allowance').value) || 0;
    const mealAllowance = parseFloat(document.getElementById('meal-allowance').value) || 0;
    const transportAllowance = parseFloat(document.getElementById('transport-allowance').value) || 0;
    
    // 추가 수당
    const overtimeAllowance = parseFloat(document.getElementById('overtime-allowance').value) || 0;
    const nightAllowance = parseFloat(document.getElementById('night-allowance').value) || 0;
    const holidayAllowance = parseFloat(document.getElementById('holiday-allowance').value) || 0;
    const otherAllowance = parseFloat(document.getElementById('other-allowance').value) || 0;
    
    // 개인 정보
    const age = parseFloat(document.getElementById('employee-age').value) || 0;
    const dependents = parseFloat(document.getElementById('dependents').value) || 0;
    const taxTable = parseFloat(document.getElementById('tax-table').value) || 80;
    const taxFree = document.getElementById('tax-free').value === 'yes';
    
    if (basicSalary === 0 || age === 0) {
        alert('기본급과 연령을 입력해주세요.');
        return;
    }
    
    // 비과세 한도 적용 (식대 월 20만원, 교통비 월 20만원)
    const taxFreeMeal = taxFree ? Math.min(mealAllowance, 200000) : 0;
    const taxFreeTransport = taxFree ? Math.min(transportAllowance, 200000) : 0;
    const taxFreeTotal = taxFreeMeal + taxFreeTransport;
    
    // 총 급여액 (과세 + 비과세)
    const totalGrossSalary = basicSalary + positionAllowance + mealAllowance + transportAllowance + 
                            overtimeAllowance + nightAllowance + holidayAllowance + otherAllowance;
    
    // 과세 급여액 (비과세 제외)
    const taxableIncome = totalGrossSalary - taxFreeTotal;
    
    // 4대보험료 계산
    const rates = SALARY_CONSTANTS.INSURANCE_RATES;
    
    // 국민연금 (만 18~59세, 과세소득 기준)
    const nationalPensionBase = Math.min(taxableIncome, 5530000); // 2025년 상한액
    const nationalPension = (age >= 18 && age <= 59) ? 
        nationalPensionBase * (rates.nationalPension.employee / 100) : 0;
    
    // 건강보험 (과세소득 기준)
    const healthInsurance = taxableIncome * (rates.healthInsurance.employee / 100);
    
    // 장기요양보험 (40세 이상, 건강보험료의 12.15%)
    const longTermCare = (age >= 40) ? 
        healthInsurance * (rates.longTermCare.employee / 100) : 0;
    
    // 고용보험 (과세소득 기준)
    const employmentInsurance = taxableIncome * (rates.employmentInsurance.employee / 100);
    
    const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;
    
    // 소득세 계산 (간이세액표 기준, 간략화된 계산)
    let incomeTax = 0;
    if (taxableIncome > 0) {
        // 소득세 = (과세소득 - 4대보험료) × 세율 × 간이세액표 비율
        const taxableForIncomeTax = Math.max(taxableIncome - totalInsurance, 0);
        
        // 간략화된 소득세율 적용 (실제로는 더 복잡함)
        if (taxableForIncomeTax <= 1200000) {
            incomeTax = taxableForIncomeTax * 0.06;
        } else if (taxableForIncomeTax <= 4600000) {
            incomeTax = 72000 + (taxableForIncomeTax - 1200000) * 0.15;
        } else if (taxableForIncomeTax <= 8800000) {
            incomeTax = 582000 + (taxableForIncomeTax - 4600000) * 0.24;
        } else {
            incomeTax = 1590000 + (taxableForIncomeTax - 8800000) * 0.35;
        }
        
        // 간이세액표 비율 적용
        incomeTax = incomeTax * (taxTable / 100);
        
        // 부양가족 공제 (간략화)
        incomeTax = Math.max(incomeTax - (dependents * 12500), 0);
    }
    
    // 지방소득세 (소득세의 10%)
    const localIncomeTax = incomeTax * 0.1;
    
    // 총 공제액
    const totalDeductions = totalInsurance + incomeTax + localIncomeTax;
    
    // 실수령액
    const netSalary = totalGrossSalary - totalDeductions;
    
    // 결과 표시
    showCalculationResult('직원 급여 계산 결과', [
        { label: '총 급여액', value: `${totalGrossSalary.toLocaleString()}원` },
        { label: '과세 급여액', value: `${taxableIncome.toLocaleString()}원` },
        { label: '비과세 급여액', value: `${taxFreeTotal.toLocaleString()}원` },
        { label: '국민연금', value: `${Math.floor(nationalPension).toLocaleString()}원` },
        { label: '건강보험', value: `${Math.floor(healthInsurance).toLocaleString()}원` },
        { label: '장기요양보험', value: `${Math.floor(longTermCare).toLocaleString()}원` },
        { label: '고용보험', value: `${Math.floor(employmentInsurance).toLocaleString()}원` },
        { label: '소득세', value: `${Math.floor(incomeTax).toLocaleString()}원` },
        { label: '지방소득세', value: `${Math.floor(localIncomeTax).toLocaleString()}원` },
        { label: '총 공제액', value: `${Math.floor(totalDeductions).toLocaleString()}원` },
        { label: '실수령액', value: `${Math.floor(netSalary).toLocaleString()}원`, highlight: true }
    ]);
}

function calculateAnnualLeave() {
    const monthlySalary = parseFloat(document.getElementById('annual-monthly-salary').value) || 0;
    const daysUsed = parseFloat(document.getElementById('annual-days-used').value) || 0;
    const workingDays = parseFloat(document.getElementById('annual-working-days').value) || 22;
    
    if (monthlySalary === 0 || daysUsed === 0) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    const dailyWage = monthlySalary / workingDays;
    const annualLeaveAllowance = dailyWage * daysUsed;
    
    showCalculationResult('연차수당 계산 결과', [
        { label: '일급', value: `${dailyWage.toLocaleString()}원` },
        { label: '연차 사용일수', value: `${daysUsed}일` },
        { label: '연차수당 총액', value: `${annualLeaveAllowance.toLocaleString()}원`, highlight: true }
    ]);
}

function calculateOvertime() {
    const hourlyWage = parseFloat(document.getElementById('overtime-hourly-wage').value) || 0;
    const overtimeHours = parseFloat(document.getElementById('overtime-hours').value) || 0;
    const nightHours = parseFloat(document.getElementById('night-hours').value) || 0;
    const holidayHours = parseFloat(document.getElementById('holiday-hours').value) || 0;
    
    if (hourlyWage === 0) {
        alert('시급을 입력해주세요.');
        return;
    }
    
    // 2025년 최저임금 검증
    if (hourlyWage < SALARY_CONSTANTS.MINIMUM_WAGE_2025) {
        alert(`최저임금(${SALARY_CONSTANTS.MINIMUM_WAGE_2025.toLocaleString()}원) 미만입니다.`);
        return;
    }
    
    // 연장근로수당 = 통상임금 × 연장근로시간 × 1.5
    const overtimePay = hourlyWage * overtimeHours * SALARY_CONSTANTS.OVERTIME_RATES.overtime;
    
    // 야간근로수당 = 통상임금 × 야간근로시간 × 0.5 (추가)
    const nightPay = hourlyWage * nightHours * 0.5; // 야간근로는 50% 추가
    
    // 휴일근로수당 = 통상임금 × 휴일근로시간 × 1.5
    const holidayPay = hourlyWage * holidayHours * SALARY_CONSTANTS.OVERTIME_RATES.holidayWork;
    
    const totalPay = overtimePay + nightPay + holidayPay;
    
    showCalculationResult('연장근로수당 계산 결과', [
        { label: '기준 시급', value: `${hourlyWage.toLocaleString()}원` },
        { label: '연장근로수당 (150%)', value: `${Math.floor(overtimePay).toLocaleString()}원` },
        { label: '야간근로수당 (+50%)', value: `${Math.floor(nightPay).toLocaleString()}원` },
        { label: '휴일근로수당 (150%)', value: `${Math.floor(holidayPay).toLocaleString()}원` },
        { label: '총 수당', value: `${Math.floor(totalPay).toLocaleString()}원`, highlight: true }
    ]);
}

function calculateParentalLeave() {
    const averageWage = parseFloat(document.getElementById('parental-average-wage').value) || 0;
    const months = parseFloat(document.getElementById('parental-months').value) || 0;
    const childOrder = document.getElementById('parental-child-order').value;
    
    if (averageWage === 0 || months === 0) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (months > 12) {
        alert('육아휴직급여는 최대 12개월까지만 지급됩니다.');
        return;
    }
    
    // 2025년 기준
    const upperLimit = 1500000; // 상한액
    const lowerLimit = 700000;  // 하한액
    
    // 통상임금의 80% (첫 3개월), 50% (4~12개월)
    let totalBenefit = 0;
    let monthlyDetails = [];
    
    for (let month = 1; month <= months; month++) {
        let rate = 0.8; // 기본 80%
        
        // 첫 3개월은 80%, 이후는 50%
        if (month > 3) {
            rate = 0.5;
        }
        
        // 자녀 출생 순서별 추가 지원 (가정)
        let bonus = 0;
        if (childOrder === 'second' && month <= 6) {
            bonus = 100000; // 둘째 자녀 추가 지원
        } else if (childOrder === 'third' && month <= 12) {
            bonus = 200000; // 셋째 이상 추가 지원
        }
        
        let monthlyAmount = averageWage * rate + bonus;
        
        // 상하한액 적용
        monthlyAmount = Math.min(Math.max(monthlyAmount, lowerLimit), upperLimit);
        
        totalBenefit += monthlyAmount;
        
        if (month <= 3) {
            monthlyDetails.push(`${month}개월: ${Math.floor(monthlyAmount).toLocaleString()}원 (80%)`);
        } else if (month === 4) {
            monthlyDetails.push(`4~${months}개월: ${Math.floor(monthlyAmount).toLocaleString()}원 (50%)`);
            break;
        }
    }
    
    const averageMonthlyBenefit = totalBenefit / months;
    
    showCalculationResult('육아휴직급여 계산 결과', [
        { label: '휴직 전 평균임금', value: `${averageWage.toLocaleString()}원` },
        { label: '휴직 기간', value: `${months}개월` },
        { label: '자녀 순서', value: childOrder === 'first' ? '첫째' : childOrder === 'second' ? '둘째' : '셋째 이상' },
        { label: '월평균 급여액', value: `${Math.floor(averageMonthlyBenefit).toLocaleString()}원` },
        { label: '상한액/하한액', value: `${upperLimit.toLocaleString()}원 / ${lowerLimit.toLocaleString()}원` },
        { label: '총 수령액', value: `${Math.floor(totalBenefit).toLocaleString()}원`, highlight: true }
    ]);
}

function calculateReducedHours() {
    const originalSalary = parseFloat(document.getElementById('reduced-original-salary').value) || 0;
    const originalHours = parseFloat(document.getElementById('reduced-original-hours').value) || 40;
    const newHours = parseFloat(document.getElementById('reduced-new-hours').value) || 0;
    const months = parseFloat(document.getElementById('reduced-months').value) || 0;
    
    if (originalSalary === 0 || newHours === 0 || months === 0) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (newHours >= originalHours) {
        alert('단축 후 근로시간이 기존보다 같거나 많습니다.');
        return;
    }
    
    if (originalHours > 40) {
        alert('법정근로시간은 주 40시간입니다.');
        return;
    }
    
    // 주당 기준으로 계산 (월 평균 4.33주)
    const weeklyOriginalHours = originalHours;
    const weeklyNewHours = newHours;
    const monthlyWeeks = 4.33;
    
    // 월 근로시간 계산
    const monthlyOriginalHours = weeklyOriginalHours * monthlyWeeks;
    const monthlyNewHours = weeklyNewHours * monthlyWeeks;
    
    // 시급 계산 (기존 월급여 ÷ 기존 월근로시간)
    const hourlyRate = originalSalary / monthlyOriginalHours;
    
    // 단축 후 월급여
    const newMonthlySalary = hourlyRate * monthlyNewHours;
    
    // 인건비 절감
    const monthlySavings = originalSalary - newMonthlySalary;
    const totalSavings = monthlySavings * months;
    
    // 근로시간 단축률
    const reductionRate = ((originalHours - newHours) / originalHours) * 100;
    
    showCalculationResult('단축근로급여 계산 결과', [
        { label: '기존 주당 근로시간', value: `${originalHours}시간` },
        { label: '단축 후 주당 근로시간', value: `${newHours}시간` },
        { label: '근로시간 단축률', value: `${reductionRate.toFixed(1)}%` },
        { label: '계산된 시급', value: `${Math.floor(hourlyRate).toLocaleString()}원` },
        { label: '단축 후 월급여', value: `${Math.floor(newMonthlySalary).toLocaleString()}원` },
        { label: '월 인건비 절감액', value: `${Math.floor(monthlySavings).toLocaleString()}원` },
        { label: '총 인건비 절감액', value: `${Math.floor(totalSavings).toLocaleString()}원`, highlight: true }
    ]);
}

function calculateHolidayWork() {
    const hourlyWage = parseFloat(document.getElementById('holiday-hourly-wage').value) || 0;
    const sundayHours = parseFloat(document.getElementById('sunday-hours').value) || 0;
    const legalHolidayHours = parseFloat(document.getElementById('legal-holiday-hours').value) || 0;
    
    if (hourlyWage === 0) {
        alert('시급을 입력해주세요.');
        return;
    }
    
    // 2025년 최저임금 검증
    if (hourlyWage < SALARY_CONSTANTS.MINIMUM_WAGE_2025) {
        alert(`최저임금(${SALARY_CONSTANTS.MINIMUM_WAGE_2025.toLocaleString()}원) 미만입니다.`);
        return;
    }
    
    // 주휴일(일요일) 근로수당 계산
    // - 8시간 이하: 통상임금 × 1.5 (150%)
    // - 8시간 초과: 8시간까지는 150%, 초과분은 200%
    let sundayPay = 0;
    if (sundayHours > 0) {
        if (sundayHours <= 8) {
            sundayPay = hourlyWage * sundayHours * 1.5;
        } else {
            sundayPay = (hourlyWage * 8 * 1.5) + (hourlyWage * (sundayHours - 8) * 2.0);
        }
    }
    
    // 법정공휴일 근로수당 계산
    // - 8시간 이하: 통상임금 × 1.5 (150%)
    // - 8시간 초과: 8시간까지는 150%, 초과분은 200%
    let legalHolidayPay = 0;
    if (legalHolidayHours > 0) {
        if (legalHolidayHours <= 8) {
            legalHolidayPay = hourlyWage * legalHolidayHours * 1.5;
        } else {
            legalHolidayPay = (hourlyWage * 8 * 1.5) + (hourlyWage * (legalHolidayHours - 8) * 2.0);
        }
    }
    
    const totalPay = sundayPay + legalHolidayPay;
    
    // 세부 계산내역 생성
    let details = [
        { label: '기준 시급', value: `${hourlyWage.toLocaleString()}원` }
    ];
    
    if (sundayHours > 0) {
        if (sundayHours <= 8) {
            details.push({ label: `주휴일 근로 (${sundayHours}h × 150%)`, value: `${Math.floor(sundayPay).toLocaleString()}원` });
        } else {
            const regular = hourlyWage * 8 * 1.5;
            const overtime = hourlyWage * (sundayHours - 8) * 2.0;
            details.push({ label: `주휴일 근로 (8h × 150%)`, value: `${Math.floor(regular).toLocaleString()}원` });
            details.push({ label: `주휴일 초과 (${sundayHours-8}h × 200%)`, value: `${Math.floor(overtime).toLocaleString()}원` });
        }
    }
    
    if (legalHolidayHours > 0) {
        if (legalHolidayHours <= 8) {
            details.push({ label: `법정공휴일 근로 (${legalHolidayHours}h × 150%)`, value: `${Math.floor(legalHolidayPay).toLocaleString()}원` });
        } else {
            const regular = hourlyWage * 8 * 1.5;
            const overtime = hourlyWage * (legalHolidayHours - 8) * 2.0;
            details.push({ label: `법정공휴일 근로 (8h × 150%)`, value: `${Math.floor(regular).toLocaleString()}원` });
            details.push({ label: `법정공휴일 초과 (${legalHolidayHours-8}h × 200%)`, value: `${Math.floor(overtime).toLocaleString()}원` });
        }
    }
    
    details.push({ label: '총 휴일근로수당', value: `${Math.floor(totalPay).toLocaleString()}원`, highlight: true });
    
    showCalculationResult('휴일근로수당 계산 결과', details);
}

// DB/DC 유형 전환
function toggleRetirementType() {
    const dbFields = document.getElementById('db-fields');
    const dcFields = document.getElementById('dc-fields');
    const retirementType = document.querySelector('input[name="retirement-type"]:checked').value;
    
    if (retirementType === 'DB') {
        dbFields.style.display = 'block';
        dcFields.style.display = 'none';
    } else {
        dbFields.style.display = 'none';
        dcFields.style.display = 'block';
    }
}

function calculateRetirement() {
    const startDate = new Date(document.getElementById('retirement-start-date').value);
    const endDate = new Date(document.getElementById('retirement-end-date').value);
    const retirementType = document.querySelector('input[name="retirement-type"]:checked').value;
    
    if (!startDate || !endDate) {
        alert('입사일과 퇴사일을 입력해주세요.');
        return;
    }
    
    if (endDate <= startDate) {
        alert('퇴사일이 입사일보다 이후여야 합니다.');
        return;
    }
    
    // 근속기간 계산
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalMonths = Math.floor(totalDays / 30.44); // 평균 월 일수
    const years = totalDays / 365.25; // 윤년 고려
    
    if (retirementType === 'DB') {
        calculateDBRetirement(totalDays, years);
    } else {
        calculateDCRetirement(totalMonths, years);
    }
}

// DB (확정급여형) 퇴직금 계산
function calculateDBRetirement(totalDays, years) {
    const averageWage = parseFloat(document.getElementById('retirement-average-wage').value) || 0;
    
    if (averageWage === 0) {
        alert('평균임금을 입력해주세요.');
        return;
    }
    
    // 1년 미만 근무자는 퇴직금 지급 안함 (근로기준법)
    if (totalDays < 365) {
        showCalculationResult('DB 퇴직금 계산 결과', [
            { label: '근속기간', value: `${totalDays}일 (${years.toFixed(2)}년)` },
            { label: '평균임금', value: `${averageWage.toLocaleString()}원` },
            { label: '퇴직금', value: '0원 (1년 미만 근무)', highlight: true, color: '#dc2626' }
        ]);
        return;
    }
    
    // 퇴직금 = 평균임금 × 근속년수 × 30일
    const retirementPay = averageWage * years * 30;
    
    // 일할계산 (1년 미만 단위는 비례계산)
    const dailyWage = averageWage / 30;
    const exactRetirementPay = dailyWage * totalDays;
    
    showCalculationResult('DB 퇴직금 계산 결과', [
        { label: '근속기간', value: `${totalDays}일 (${years.toFixed(2)}년)` },
        { label: '평균임금', value: `${averageWage.toLocaleString()}원/월` },
        { label: '일평균임금', value: `${Math.floor(dailyWage).toLocaleString()}원/일` },
        { label: '연차기준 퇴직금', value: `${Math.floor(retirementPay).toLocaleString()}원` },
        { label: '일할계산 퇴직금', value: `${Math.floor(exactRetirementPay).toLocaleString()}원`, highlight: true }
    ]);
}

// DC (확정기여형) 퇴직연금 계산
function calculateDCRetirement(totalMonths, years) {
    const monthlyIncome = parseFloat(document.getElementById('dc-monthly-income').value) || 0;
    const contributionRate = parseFloat(document.getElementById('dc-contribution-rate').value) || 8.3;
    const returnRate = parseFloat(document.getElementById('dc-return-rate').value) || 3.0;
    const existingAmount = parseFloat(document.getElementById('dc-existing-amount').value) || 0;
    
    if (monthlyIncome === 0) {
        alert('기준소득월액을 입력해주세요.');
        return;
    }
    
    if (contributionRate < 8.3) {
        alert('법정 최소 적립률은 8.3%입니다.');
        return;
    }
    
    // 매월 적립금
    const monthlyContribution = monthlyIncome * (contributionRate / 100);
    
    // 총 적립원금
    const totalContributions = monthlyContribution * totalMonths;
    
    // 복리 계산 (연 단위)
    const monthlyReturnRate = (returnRate / 100) / 12;
    let finalAmount = existingAmount;
    
    // 매월 적립금에 대한 복리 계산
    for (let month = 0; month < totalMonths; month++) {
        finalAmount = finalAmount * (1 + monthlyReturnRate) + monthlyContribution;
    }
    
    const totalReturn = finalAmount - existingAmount - totalContributions;
    
    showCalculationResult('DC 퇴직연금 계산 결과', [
        { label: '근속기간', value: `${totalMonths}개월 (${years.toFixed(2)}년)` },
        { label: '기준소득월액', value: `${monthlyIncome.toLocaleString()}원` },
        { label: '월 적립률', value: `${contributionRate}%` },
        { label: '월 적립금', value: `${Math.floor(monthlyContribution).toLocaleString()}원` },
        { label: '총 적립원금', value: `${Math.floor(totalContributions).toLocaleString()}원` },
        { label: '기존 적립금', value: `${existingAmount.toLocaleString()}원` },
        { label: '운용수익', value: `${Math.floor(totalReturn).toLocaleString()}원` },
        { label: '최종 수령액', value: `${Math.floor(finalAmount).toLocaleString()}원`, highlight: true }
    ]);
}

function calculateInsurance() {
    const monthlySalary = parseFloat(document.getElementById('insurance-monthly-salary').value) || 0;
    const age = parseFloat(document.getElementById('insurance-age').value) || 0;
    const industry = document.getElementById('insurance-industry').value;
    
    if (monthlySalary === 0 || age === 0) {
        alert('월급여와 연령을 입력해주세요.');
        return;
    }
    
    if (age < 15 || age > 70) {
        alert('적정한 연령을 입력해주세요 (15~70세).');
        return;
    }
    
    const rates = SALARY_CONSTANTS.INSURANCE_RATES;
    
    // 국민연금 (만 18~59세, 상한액 적용)
    const pensionBase = Math.min(monthlySalary, 5530000); // 2025년 상한액
    const nationalPension = (age >= 18 && age <= 59) ? 
        pensionBase * (rates.nationalPension.employee / 100) : 0;
    
    // 건강보험 (상한액 적용)
    const healthBase = Math.min(monthlySalary, 10680000); // 2025년 건강보험 상한액
    const healthInsurance = healthBase * (rates.healthInsurance.employee / 100);
    
    // 장기요양보험 (40세 이상, 건강보험료 × 12.15%)
    const longTermCare = (age >= 40) ? 
        healthInsurance * (rates.longTermCare.employee / 100) : 0;
    
    // 고용보험 (상한액 적용)
    const employmentBase = Math.min(monthlySalary, 6360000); // 고용보험 상한액
    const employmentInsurance = employmentBase * (rates.employmentInsurance.employee / 100);
    
    const totalEmployee = nationalPension + healthInsurance + longTermCare + employmentInsurance;
    
    // 사업주 부담 계산
    const employerPension = (age >= 18 && age <= 59) ? 
        pensionBase * (rates.nationalPension.employer / 100) : 0;
    const employerHealth = healthBase * (rates.healthInsurance.employer / 100);
    const employerLongTerm = (age >= 40) ? 
        employerHealth * (rates.longTermCare.employer / 100) : 0;
    const employerEmployment = employmentBase * (rates.employmentInsurance.employer / 100);
    
    // 산재보험 (사업주만 부담, 업종별)
    const industrialRates = {
        'office': 0.45,      // 사무직
        'manufacturing': 0.75, // 제조업
        'construction': 1.2,   // 건설업
        'service': 0.65,       // 서비스업
        'other': 0.75          // 기타
    };
    const industrialAccident = monthlySalary * (industrialRates[industry] / 100);
    
    const totalEmployer = employerPension + employerHealth + employerLongTerm + 
                         employerEmployment + industrialAccident;
    
    const grandTotal = totalEmployee + totalEmployer;
    
    showCalculationResult('4대보험료 계산 결과', [
        { label: '연령/업종', value: `${age}세 / ${getIndustryName(industry)}` },
        { label: '국민연금 (근로자)', value: `${Math.floor(nationalPension).toLocaleString()}원` },
        { label: '건강보험 (근로자)', value: `${Math.floor(healthInsurance).toLocaleString()}원` },
        { label: '장기요양보험 (근로자)', value: `${Math.floor(longTermCare).toLocaleString()}원` },
        { label: '고용보험 (근로자)', value: `${Math.floor(employmentInsurance).toLocaleString()}원` },
        { label: '근로자 부담 소계', value: `${Math.floor(totalEmployee).toLocaleString()}원`, highlight: true, color: '#3B82F6' },
        { label: '국민연금 (사업주)', value: `${Math.floor(employerPension).toLocaleString()}원` },
        { label: '건강보험 (사업주)', value: `${Math.floor(employerHealth).toLocaleString()}원` },
        { label: '장기요양보험 (사업주)', value: `${Math.floor(employerLongTerm).toLocaleString()}원` },
        { label: '고용보험 (사업주)', value: `${Math.floor(employerEmployment).toLocaleString()}원` },
        { label: '산재보험 (사업주)', value: `${Math.floor(industrialAccident).toLocaleString()}원` },
        { label: '사업주 부담 소계', value: `${Math.floor(totalEmployer).toLocaleString()}원`, highlight: true, color: '#EF4444' },
        { label: '4대보험료 총액', value: `${Math.floor(grandTotal).toLocaleString()}원`, highlight: true }
    ]);
}

function getIndustryName(industry) {
    const names = {
        'office': '사무직',
        'manufacturing': '제조업',
        'construction': '건설업',
        'service': '서비스업',
        'other': '기타'
    };
    return names[industry] || '기타';
}

function calculateMinimumWage() {
    const monthlySalary = parseFloat(document.getElementById('minimum-monthly-salary').value) || 0;
    const monthlyHours = parseFloat(document.getElementById('minimum-monthly-hours').value) || 209;
    const includeWeekly = document.getElementById('minimum-include-weekly').value === 'yes';
    const year = document.getElementById('minimum-year').value;
    
    if (monthlySalary === 0) {
        alert('월급여를 입력해주세요.');
        return;
    }
    
    if (monthlyHours <= 0 || monthlyHours > 250) {
        alert('적정한 월 근로시간을 입력해주세요 (1~250시간).');
        return;
    }
    
    // 연도별 최저임금
    const minimumWages = {
        '2025': 10030,
        '2024': 9860,
        '2023': 9620
    };
    
    const minimumHourlyWage = minimumWages[year];
    
    // 주휴수당 고려 계산
    let effectiveMonthlyHours = monthlyHours;
    if (includeWeekly && monthlyHours >= 173.3) { // 주 15시간 이상 근무시 주휴수당 발생
        // 주휴수당: 1주 근무시간/5 * 주수
        const weeklyHours = monthlyHours / 4.33;
        const weeklyRestHours = weeklyHours / 5;
        const monthlyRestHours = weeklyRestHours * 4.33;
        effectiveMonthlyHours = monthlyHours + monthlyRestHours;
    }
    
    const minimumMonthlySalary = minimumHourlyWage * effectiveMonthlyHours;
    const actualHourlyWage = monthlySalary / effectiveMonthlyHours;
    
    const isCompliant = monthlySalary >= minimumMonthlySalary;
    const difference = monthlySalary - minimumMonthlySalary;
    const violationAmount = isCompliant ? 0 : Math.abs(difference);
    
    const complianceStatus = isCompliant ? '✅ 적법' : '❌ 위반';
    const complianceColor = isCompliant ? '#059669' : '#dc2626';
    
    let results = [
        { label: `${year}년 최저시급`, value: `${minimumHourlyWage.toLocaleString()}원` },
        { label: '월 근로시간', value: `${monthlyHours}시간` }
    ];
    
    if (includeWeekly && monthlyHours >= 173.3) {
        const weeklyRestHours = (monthlyHours / 4.33) / 5 * 4.33;
        results.push({ label: '주휴수당 시간', value: `${weeklyRestHours.toFixed(1)}시간` });
        results.push({ label: '총 인정시간', value: `${effectiveMonthlyHours.toFixed(1)}시간` });
    }
    
    results.push(
        { label: '최저 월급여', value: `${Math.floor(minimumMonthlySalary).toLocaleString()}원` },
        { label: '실제 월급여', value: `${monthlySalary.toLocaleString()}원` },
        { label: '급여 차액', value: `${difference >= 0 ? '+' : ''}${Math.floor(difference).toLocaleString()}원` }
    );
    
    if (!isCompliant) {
        results.push({ label: '위반 금액', value: `${Math.floor(violationAmount).toLocaleString()}원`, color: '#dc2626' });
    }
    
    results.push({ label: '검증 결과', value: complianceStatus, highlight: true, color: complianceColor });
    
    showCalculationResult('최저임금 검증 결과', results);
}

// 계산 결과 표시 (네오모피즘 스타일)
function showCalculationResult(title, results) {
    const resultContainer = document.getElementById('calculation-results');
    const resultContent = document.getElementById('result-content');
    
    let resultHTML = `<h4 style="color: #374151; margin-bottom: 1.5rem; font-weight: 700; font-size: 1.3rem;">
        <i class="fas fa-chart-line" style="color: #6366f1; margin-right: 0.5rem;"></i>${title}
    </h4>`;
    resultHTML += '<div style="display: grid; gap: 0.75rem;">';
    
    results.forEach((result, index) => {
        const color = result.color || '#374151';
        const fontWeight = result.highlight ? '700' : '500';
        const isHighlight = result.highlight;
        
        // 하이라이트 항목은 돌출된 효과, 일반 항목은 들어간 효과
        const boxShadow = isHighlight 
            ? '8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb' 
            : 'inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb';
        
        const textColor = isHighlight ? '#6366f1' : color;
        const fontSize = isHighlight ? '1.2rem' : '1rem';
        const padding = isHighlight ? '1.25rem' : '1rem';
        
        resultHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: ${padding}; background: #e0e7ff; border-radius: 12px; box-shadow: ${boxShadow}; transition: all 0.3s ease;">
                <span style="color: ${textColor}; font-weight: ${fontWeight}; font-size: ${fontSize};">${result.label}</span>
                <span style="color: ${textColor}; font-weight: ${fontWeight}; font-size: ${fontSize};">${result.value}</span>
            </div>
        `;
    });
    
    resultHTML += '</div>';
    resultContent.innerHTML = resultHTML;
    resultContainer.style.display = 'block';
    
    // 결과 영역으로 스크롤
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// 계산 결과 내보내기
function exportCalculationResult() {
    // 간단한 텍스트 형태로 결과 복사
    const resultContent = document.getElementById('result-content').innerText;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(resultContent).then(() => {
            alert('계산 결과가 클립보드에 복사되었습니다.');
        });
    } else {
        // 클립보드 API를 지원하지 않는 브라우저
        alert('브라우저가 클립보드 복사를 지원하지 않습니다.');
    }
}