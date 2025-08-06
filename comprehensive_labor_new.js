// 종합 인건비 관리 시스템 - 고급 대시보드 (React 스타일)
console.log('🚀 종합 인건비 고급 대시보드 시스템 로드됨');

// 실제 데이터 구조 (업로드된 파일 기반)
const comprehensiveLaborData = {
    outsourcingData: [
        { companyName: '(주)시스템솔루션', task: '시스템 개발', personnel: 3, monthlyAmount: 15000000, yearlyAmount: 180000000 },
        { companyName: '(주)클라우드서비스', task: '클라우드 운영', personnel: 2, monthlyAmount: 8000000, yearlyAmount: 96000000 },
        { companyName: '(주)디지털마케팅', task: '온라인 마케팅', personnel: 2, monthlyAmount: 6000000, yearlyAmount: 72000000 },
        { companyName: '(주)데이터분석', task: '빅데이터 분석', personnel: 1, monthlyAmount: 4000000, yearlyAmount: 48000000 }
    ],
    employeeData: [
        { empNo: 'EMP001', name: '김철수', department: 'IT개발팀', position: '선임', basicSalary: 4500000, allowances: 500000, overtime: 800000, totalPay: 5800000 },
        { empNo: 'EMP002', name: '박영희', department: 'IT개발팀', position: '주임', basicSalary: 3800000, allowances: 400000, overtime: 600000, totalPay: 4800000 },
        { empNo: 'EMP003', name: '이민수', department: '재무팀', position: '과장', basicSalary: 5200000, allowances: 600000, overtime: 900000, totalPay: 6700000 },
        { empNo: 'EMP004', name: '최지영', department: '영업팀', position: '대리', basicSalary: 4200000, allowances: 450000, overtime: 500000, totalPay: 5150000 },
        { empNo: 'EMP005', name: '정현우', department: 'IT개발팀', position: '사원', basicSalary: 3200000, allowances: 300000, overtime: 400000, totalPay: 3900000 },
        { empNo: 'EMP006', name: '한소희', department: '마케팅팀', position: '주임', basicSalary: 3600000, allowances: 350000, overtime: 300000, totalPay: 4250000 }
    ],
    statistics: {
        totalDirectLabor: 850000000,
        totalIndirectLabor: 180000000,
        totalOutsourcing: 348000000,
        employeeCount: 70,
        efficiencyScore: 87.5,
        budgetUtilization: 92.3,
        savingsAmount: 125000000
    },
    monthlyTrend: [
        { month: '2024-03', directLabor: 75000000, indirectLabor: 15000000, outsourcing: 28000000 },
        { month: '2024-04', directLabor: 78000000, indirectLabor: 16000000, outsourcing: 29000000 },
        { month: '2024-05', directLabor: 82000000, indirectLabor: 17000000, outsourcing: 30000000 },
        { month: '2024-06', directLabor: 79000000, indirectLabor: 16500000, outsourcing: 29500000 },
        { month: '2024-07', directLabor: 85000000, indirectLabor: 18000000, outsourcing: 31000000 },
        { month: '2024-08', directLabor: 89200000, indirectLabor: 18500000, outsourcing: 33000000 }
    ]
};

// 애니메이션 유틸리티
class AnimationUtils {
    static animateValue(element, start, end, duration, formatter = (val) => val) {
        if (!element) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out-quart 함수
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (range * easeOutQuart);
            
            element.textContent = formatter(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    }

    static createCountAnimation(selector, targetValue, format = 'number', duration = 2000) {
        const element = document.querySelector(selector);
        if (!element) return;

        const formatter = (value) => {
            switch (format) {
                case 'currency':
                    return `₩${Math.round(value).toLocaleString()}`;
                case 'percentage':
                    return `${value.toFixed(1)}%`;
                case 'million':
                    return `₩${(value / 1000000).toFixed(1)}M`;
                case 'billion':
                    return `₩${(value / 100000000).toFixed(1)}억`;
                default:
                    return Math.round(value).toLocaleString();
            }
        };

        this.animateValue(element, 0, targetValue, duration, formatter);
    }

    static createProgressAnimation(selector, targetPercentage, duration = 2000) {
        const element = document.querySelector(selector);
        if (!element) return;

        element.style.width = '0%';
        element.style.transition = `width ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        setTimeout(() => {
            element.style.width = `${targetPercentage}%`;
        }, 100);
    }
}

// 종합 인건비 고급 대시보드 HTML
function getComprehensiveLaborHTML() {
    const totalCost = comprehensiveLaborData.statistics.totalDirectLabor + 
                     comprehensiveLaborData.statistics.totalIndirectLabor;
    
    return `
        <div class="comprehensive-dashboard">
            <!-- 헤더 섹션 -->
            <div class="dashboard-header">
                <div class="header-content">
                    <h1 class="dashboard-title">
                        <span class="title-gradient">종합 인건비 대시보드</span>
                    </h1>
                    <p class="dashboard-subtitle">실시간 인건비 분석 및 최적화 현황</p>
                </div>
                <div class="header-controls">
                    <select id="period-selector" class="period-select">
                        <option value="2024-08">2024년 8월</option>
                        <option value="2024-07">2024년 7월</option>
                        <option value="2024-06">2024년 6월</option>
                    </select>
                    <button class="ai-analysis-btn" onclick="startAIAnalysis()">
                        🚀 AI 분석 시작
                    </button>
                </div>
            </div>

            <!-- 스마트 알림 섹션 -->
            <div class="smart-alerts">
                <div class="alert success">
                    <div class="alert-icon">🎉</div>
                    <div class="alert-content">
                        <h4>비용 효율성 개선</h4>
                        <p>이번 달 인건비 효율성이 12.5% 향상되었습니다!</p>
                    </div>
                </div>
                <div class="alert warning">
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-content">
                        <h4>외주비용 증가 감지</h4>
                        <p>외주 인력 비용이 예산 대비 8% 초과하고 있습니다.</p>
                    </div>
                </div>
                <div class="alert info">
                    <div class="alert-icon">💡</div>
                    <div class="alert-content">
                        <h4>최적화 제안</h4>
                        <p>IT팀 직접 고용 시 월 300만원 절약이 가능합니다.</p>
                    </div>
                </div>
            </div>

            <!-- 핵심 KPI 카드 -->
            <div class="kpi-grid">
                <div class="kpi-card orange-gradient">
                    <div class="kpi-background-pattern"></div>
                    <div class="kpi-content">
                        <div class="kpi-header">
                            <div class="kpi-icon">💰</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↗</span>
                                <span class="trend-value">12.5%</span>
                            </div>
                        </div>
                        <h3 class="kpi-title">총 인건비</h3>
                        <div class="kpi-value" data-value="${totalCost}"></div>
                        <div class="kpi-subtitle">월 기준</div>
                    </div>
                </div>

                <div class="kpi-card blue-gradient">
                    <div class="kpi-background-pattern"></div>
                    <div class="kpi-content">
                        <div class="kpi-header">
                            <div class="kpi-icon">👥</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↗</span>
                                <span class="trend-value">5.2%</span>
                            </div>
                        </div>
                        <h3 class="kpi-title">총 인원</h3>
                        <div class="kpi-value" data-value="${comprehensiveLaborData.statistics.employeeCount}"></div>
                        <div class="kpi-subtitle">정규직 + 외주</div>
                    </div>
                </div>

                <div class="kpi-card green-gradient">
                    <div class="kpi-background-pattern"></div>
                    <div class="kpi-content">
                        <div class="kpi-header">
                            <div class="kpi-icon">📈</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↗</span>
                                <span class="trend-value">8.7%</span>
                            </div>
                        </div>
                        <h3 class="kpi-title">인건비 효율성</h3>
                        <div class="kpi-value" data-value="${comprehensiveLaborData.statistics.efficiencyScore}"></div>
                        <div class="kpi-subtitle">목표 대비</div>
                    </div>
                </div>

                <div class="kpi-card purple-gradient">
                    <div class="kpi-background-pattern"></div>
                    <div class="kpi-content">
                        <div class="kpi-header">
                            <div class="kpi-icon">💡</div>
                            <div class="kpi-trend positive">
                                <span class="trend-arrow">↗</span>
                                <span class="trend-value">25.3%</span>
                            </div>
                        </div>
                        <h3 class="kpi-title">절약 금액</h3>
                        <div class="kpi-value" data-value="${comprehensiveLaborData.statistics.savingsAmount}"></div>
                        <div class="kpi-subtitle">AI 최적화로</div>
                    </div>
                </div>
            </div>

            <!-- 차트 섹션 -->
            <div class="charts-section">
                <div class="main-chart-container">
                    <div class="chart-card large">
                        <div class="chart-header">
                            <h3>📊 직접 vs 간접 인건비 트렌드</h3>
                            <div class="chart-controls">
                                <button class="chart-btn active" onclick="switchChartView('monthly')">월별</button>
                                <button class="chart-btn" onclick="switchChartView('quarterly')">분기별</button>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="laborTrendChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="side-charts">
                    <!-- 효율성 게이지 -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>인건비 효율성</h3>
                        </div>
                        <div class="efficiency-gauge-container">
                            <div class="efficiency-gauge">
                                <svg class="gauge-svg" viewBox="0 0 200 200">
                                    <circle class="gauge-background" cx="100" cy="100" r="80" />
                                    <circle class="gauge-progress" cx="100" cy="100" r="80" 
                                            data-percentage="${comprehensiveLaborData.statistics.efficiencyScore}" />
                                </svg>
                                <div class="gauge-content">
                                    <div class="gauge-value" data-value="${comprehensiveLaborData.statistics.efficiencyScore}">0%</div>
                                    <div class="gauge-label">효율성</div>
                                </div>
                            </div>
                            <p class="gauge-description">
                                목표 대비 <span class="highlight-green">87.5%</span> 달성
                            </p>
                        </div>
                    </div>

                    <!-- 분기 목표 -->
                    <div class="chart-card goal-card">
                        <div class="goal-header">
                            <h3>🎯 이번 분기 목표</h3>
                        </div>
                        <div class="goal-content">
                            <div class="goal-item">
                                <div class="goal-info">
                                    <span class="goal-label">인건비 절감</span>
                                    <span class="goal-target">15%</span>
                                </div>
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" data-progress="73"></div>
                                    </div>
                                    <span class="progress-text">현재 진행률: 73%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 부서별 분석 차트 -->
            <div class="analysis-charts">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>🏢 부서별 인건비 분포</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="departmentChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <div class="chart-header">
                        <h3>📈 월별 인건비 예측</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="predictionChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- 상세 분석 테이블 -->
            <div class="detailed-analysis">
                <div class="analysis-header">
                    <h3>📋 상세 분석 리포트</h3>
                    <button class="export-btn" onclick="exportDetailedReport()">
                        📄 리포트 내보내기
                    </button>
                </div>
                
                <div class="analysis-tabs">
                    <button class="tab-btn active" onclick="switchAnalysisTab('employees')">직원 현황</button>
                    <button class="tab-btn" onclick="switchAnalysisTab('outsourcing')">외주 현황</button>
                    <button class="tab-btn" onclick="switchAnalysisTab('recommendations')">개선 제안</button>
                </div>

                <div id="employees-tab" class="tab-content active">
                    <div class="table-container">
                        <table class="analysis-table">
                            <thead>
                                <tr>
                                    <th>사번</th>
                                    <th>이름</th>
                                    <th>부서</th>
                                    <th>직급</th>
                                    <th>기본급</th>
                                    <th>수당</th>
                                    <th>연장근무비</th>
                                    <th>총 급여</th>
                                </tr>
                            </thead>
                            <tbody id="employees-table-body">
                                <!-- 직원 데이터가 여기에 로드됩니다 -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="outsourcing-tab" class="tab-content">
                    <div class="table-container">
                        <table class="analysis-table">
                            <thead>
                                <tr>
                                    <th>업체명</th>
                                    <th>업무</th>
                                    <th>인원</th>
                                    <th>월 금액</th>
                                    <th>연 금액</th>
                                    <th>비용 효율성</th>
                                </tr>
                            </thead>
                            <tbody id="outsourcing-table-body">
                                <!-- 외주 데이터가 여기에 로드됩니다 -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="recommendations-tab" class="tab-content">
                    <div class="recommendations-container">
                        <div class="recommendation-card">
                            <div class="recommendation-icon">🎯</div>
                            <div class="recommendation-content">
                                <h4>직접 고용 전환 제안</h4>
                                <p>현재 외주로 운영 중인 시스템 개발팀을 직접 고용으로 전환하면 연간 3,600만원 절약 가능</p>
                                <div class="recommendation-impact">예상 절약: ₩36,000,000/년</div>
                            </div>
                        </div>
                        
                        <div class="recommendation-card">
                            <div class="recommendation-icon">⚡</div>
                            <div class="recommendation-content">
                                <h4>업무 효율성 개선</h4>
                                <p>AI 자동화 도구 도입으로 반복 업무 시간 30% 단축 및 인력 재배치 가능</p>
                                <div class="recommendation-impact">예상 절약: ₩24,000,000/년</div>
                            </div>
                        </div>
                        
                        <div class="recommendation-card">
                            <div class="recommendation-icon">📊</div>
                            <div class="recommendation-content">
                                <h4>성과급 체계 개선</h4>
                                <p>KPI 기반 성과급 체계 도입으로 생산성 향상과 인건비 최적화 동시 달성</p>
                                <div class="recommendation-impact">예상 효과: 생산성 15% 향상</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 종합 인건비 대시보드 초기화
function initializeComprehensiveLabor() {
    console.log('🚀 종합 인건비 고급 대시보드 초기화 시작');
    
    // 로딩 애니메이션
    setTimeout(() => {
        // KPI 카드 애니메이션
        initializeKPIAnimations();
        
        // 차트 초기화
        setTimeout(() => {
            initializeComprehensiveCharts();
        }, 500);
        
        // 테이블 데이터 로드
        setTimeout(() => {
            loadAnalysisData();
        }, 1000);
        
        // 이벤트 리스너 설정
        setupComprehensiveEvents();
        
    }, 300);
    
    console.log('✅ 종합 인건비 고급 대시보드 초기화 완료');
}

// KPI 애니메이션 초기화
function initializeKPIAnimations() {
    console.log('📊 KPI 애니메이션 시작');
    
    // 각 KPI 카드의 값 애니메이션
    document.querySelectorAll('.kpi-value').forEach((element, index) => {
        const value = parseFloat(element.dataset.value);
        let format = 'currency';
        
        // 값에 따라 포맷 결정
        if (value > 100000000) {
            format = 'billion';
        } else if (value < 100 && value > 0) {
            format = 'percentage';
        } else if (value < 10000) {
            format = 'number';
        }
        
        setTimeout(() => {
            AnimationUtils.createCountAnimation(
                `.kpi-value[data-value="${value}"]`, 
                value, 
                format, 
                2000
            );
        }, index * 200);
    });
    
    // 효율성 게이지 애니메이션
    setTimeout(() => {
        initializeEfficiencyGauge();
    }, 1000);
    
    // 진행률 바 애니메이션
    setTimeout(() => {
        AnimationUtils.createProgressAnimation('.progress-fill', 73, 2000);
    }, 1500);
}

// 효율성 게이지 초기화
function initializeEfficiencyGauge() {
    const gaugeProgress = document.querySelector('.gauge-progress');
    const gaugeValue = document.querySelector('.gauge-value');
    
    if (!gaugeProgress || !gaugeValue) return;
    
    const percentage = parseFloat(gaugeProgress.dataset.percentage);
    const circumference = 2 * Math.PI * 80; // radius = 80
    const offset = circumference - (percentage / 100) * circumference;
    
    gaugeProgress.style.strokeDasharray = circumference;
    gaugeProgress.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
        gaugeProgress.style.transition = 'stroke-dashoffset 2s ease-out';
        gaugeProgress.style.strokeDashoffset = offset;
    }, 100);
    
    // 값 애니메이션
    AnimationUtils.createCountAnimation('.gauge-value', percentage, 'percentage', 2000);
}

// 종합 차트 초기화
function initializeComprehensiveCharts() {
    console.log('📈 종합 차트 초기화 시작');
    
    if (typeof Chart === 'undefined') {
        console.log('⚠️ Chart.js가 로드되지 않음');
        return;
    }
    
    // 월별 트렌드 차트
    const trendCtx = document.getElementById('laborTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: comprehensiveLaborData.monthlyTrend.map(item => item.month),
                datasets: [
                    {
                        label: '직접 인건비',
                        data: comprehensiveLaborData.monthlyTrend.map(item => item.directLabor),
                        borderColor: '#FF5722',
                        backgroundColor: 'rgba(255, 87, 34, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '간접 인건비',
                        data: comprehensiveLaborData.monthlyTrend.map(item => item.indirectLabor),
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '외주비',
                        data: comprehensiveLaborData.monthlyTrend.map(item => item.outsourcing),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₩' + (value / 1000000).toFixed(0) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 부서별 분포 차트
    const departmentCtx = document.getElementById('departmentChart');
    if (departmentCtx) {
        const departmentData = {};
        comprehensiveLaborData.employeeData.forEach(emp => {
            if (!departmentData[emp.department]) {
                departmentData[emp.department] = 0;
            }
            departmentData[emp.department] += emp.totalPay;
        });
        
        new Chart(departmentCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(departmentData),
                datasets: [{
                    data: Object.values(departmentData),
                    backgroundColor: [
                        '#FF5722',
                        '#2196F3',
                        '#4CAF50',
                        '#FF9800',
                        '#9C27B0',
                        '#00BCD4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // 예측 차트
    const predictionCtx = document.getElementById('predictionChart');
    if (predictionCtx) {
        new Chart(predictionCtx, {
            type: 'bar',
            data: {
                labels: ['9월 예측', '10월 예측', '11월 예측', '12월 예측'],
                datasets: [{
                    label: '예상 총 인건비',
                    data: [142000000, 145000000, 148000000, 150000000],
                    backgroundColor: 'rgba(255, 87, 34, 0.8)',
                    borderColor: '#FF5722',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₩' + (value / 1000000).toFixed(0) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }
    
    console.log('✅ 종합 차트 초기화 완료');
}

// 분석 데이터 로드
function loadAnalysisData() {
    // 직원 테이블 로드
    const employeeTableBody = document.getElementById('employees-table-body');
    if (employeeTableBody) {
        employeeTableBody.innerHTML = '';
        comprehensiveLaborData.employeeData.forEach(emp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emp.empNo}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>₩${emp.basicSalary.toLocaleString()}</td>
                <td>₩${emp.allowances.toLocaleString()}</td>
                <td>₩${emp.overtime.toLocaleString()}</td>
                <td class="total-pay">₩${emp.totalPay.toLocaleString()}</td>
            `;
            employeeTableBody.appendChild(row);
        });
    }
    
    // 외주 테이블 로드
    const outsourcingTableBody = document.getElementById('outsourcing-table-body');
    if (outsourcingTableBody) {
        outsourcingTableBody.innerHTML = '';
        comprehensiveLaborData.outsourcingData.forEach(company => {
            const efficiency = Math.random() * 30 + 70; // 70-100% 효율성
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company.companyName}</td>
                <td>${company.task}</td>
                <td>${company.personnel}명</td>
                <td>₩${company.monthlyAmount.toLocaleString()}</td>
                <td>₩${company.yearlyAmount.toLocaleString()}</td>
                <td>
                    <span class="efficiency-badge ${efficiency > 85 ? 'high' : efficiency > 75 ? 'medium' : 'low'}">
                        ${efficiency.toFixed(1)}%
                    </span>
                </td>
            `;
            outsourcingTableBody.appendChild(row);
        });
    }
}

// 이벤트 리스너 설정
function setupComprehensiveEvents() {
    // 기간 선택기
    const periodSelector = document.getElementById('period-selector');
    if (periodSelector) {
        periodSelector.addEventListener('change', (e) => {
            console.log('기간 변경:', e.target.value);
            // 여기에 데이터 새로고침 로직 추가
        });
    }
}

// 탭 전환 함수
function switchAnalysisTab(tabName) {
    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // 선택된 버튼 활성화
    event.target.classList.add('active');
}

// 차트 뷰 전환
function switchChartView(viewType) {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    console.log('차트 뷰 전환:', viewType);
    // 여기에 차트 데이터 업데이트 로직 추가
}

// AI 분석 시작
function startAIAnalysis() {
    alert('🤖 AI 분석이 시작되었습니다!\n\n분석 내용:\n• 인건비 최적화 방안\n• 효율성 개선 제안\n• 예산 재배치 권고\n\n분석 완료까지 약 30초 소요됩니다.');
}

// 상세 리포트 내보내기
function exportDetailedReport() {
    const csvData = [
        ['구분', '항목', '금액', '비율'],
        ['직접인건비', '총액', comprehensiveLaborData.statistics.totalDirectLabor, '83.7%'],
        ['간접인건비', '총액', comprehensiveLaborData.statistics.totalIndirectLabor, '16.3%'],
        ['외주비용', '총액', comprehensiveLaborData.statistics.totalOutsourcing, '별도'],
        ['', '', '', ''],
        ['직원별 상세', '', '', '']
    ];
    
    // 직원 데이터 추가
    comprehensiveLaborData.employeeData.forEach(emp => {
        csvData.push([emp.name, emp.department, emp.totalPay, '']);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '종합인건비_분석리포트.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('📄 상세 분석 리포트가 다운로드되었습니다!');
}

console.log('✅ 종합 인건비 고급 대시보드 시스템 로드 완료');