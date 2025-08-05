// insurance_rates.js - 4대보험 요율 차트 시스템

// 2020~2025년 4대보험 요율 데이터 (실제 데이터 기반)
const insuranceRatesData = {
    // 국민연금 요율 (근로자 + 사업주 각각)
    nationalPension: [
        { year: '2020', rate: 4.5, employee: 4.5, employer: 4.5 },
        { year: '2021', rate: 4.5, employee: 4.5, employer: 4.5 },
        { year: '2022', rate: 4.5, employee: 4.5, employer: 4.5 },
        { year: '2023', rate: 4.5, employee: 4.5, employer: 4.5 },
        { year: '2024', rate: 4.5, employee: 4.5, employer: 4.5 },
        { year: '2025', rate: 4.5, employee: 4.5, employer: 4.5 }
    ],
    
    // 건강보험 요율 (근로자 + 사업주 각각)
    healthInsurance: [
        { year: '2020', rate: 3.335, employee: 3.335, employer: 3.335 },
        { year: '2021', rate: 3.43, employee: 3.43, employer: 3.43 },
        { year: '2022', rate: 3.46, employee: 3.46, employer: 3.46 },
        { year: '2023', rate: 3.495, employee: 3.495, employer: 3.495 },
        { year: '2024', rate: 3.545, employee: 3.545, employer: 3.545 },
        { year: '2025', rate: 3.77, employee: 3.77, employer: 3.77 }
    ],
    
    // 고용보험 요율 (근로자)
    employmentInsurance: [
        { year: '2020', rate: 0.8, employee: 0.8, employer: 1.05 },
        { year: '2021', rate: 0.8, employee: 0.8, employer: 1.05 },
        { year: '2022', rate: 0.8, employee: 0.8, employer: 1.05 },
        { year: '2023', rate: 0.9, employee: 0.9, employer: 1.15 },
        { year: '2024', rate: 0.9, employee: 0.9, employer: 1.15 },
        { year: '2025', rate: 0.9, employee: 0.9, employer: 1.15 }
    ],
    
    // 산재보험 요율 (사업주만 부담, 업종별 평균)
    industrialAccident: [
        { year: '2020', rate: 0.65, employee: 0, employer: 0.65 },
        { year: '2021', rate: 0.67, employee: 0, employer: 0.67 },
        { year: '2022', rate: 0.68, employee: 0, employer: 0.68 },
        { year: '2023', rate: 0.7, employee: 0, employer: 0.7 },
        { year: '2024', rate: 0.72, employee: 0, employer: 0.72 },
        { year: '2025', rate: 0.75, employee: 0, employer: 0.75 }
    ]
};

// 4대보험 요율 페이지 HTML
function getInsuranceRatesHTML() {
    return `
        <div class="insurance-rates-page">
            <div class="page-header">
                <h2><i class="fas fa-shield-alt"></i> 4대 보험 요율</h2>
                <p>2020년부터 2025년까지의 4대 보험 요율 변화를 한눈에 확인하세요</p>
            </div>

            <!-- 요약 카드 섹션 -->
            <div class="insurance-summary-cards">
                <div class="summary-card national-pension">
                    <div class="card-icon">
                        <i class="fas fa-piggy-bank"></i>
                    </div>
                    <div class="card-content">
                        <h3>국민연금</h3>
                        <div class="current-rate">4.5%</div>
                        <div class="rate-description">근로자 + 사업주 각각</div>
                        <div class="rate-status stable">변동없음</div>
                    </div>
                </div>

                <div class="summary-card health-insurance">
                    <div class="card-icon">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <div class="card-content">
                        <h3>건강보험</h3>
                        <div class="current-rate">3.77%</div>
                        <div class="rate-description">근로자 + 사업주 각각 (2025년)</div>
                        <div class="rate-status increase">↗ 상승추세</div>
                    </div>
                </div>

                <div class="summary-card employment-insurance">
                    <div class="card-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="card-content">
                        <h3>고용보험</h3>
                        <div class="current-rate">0.9%</div>
                        <div class="rate-description">근로자 (2023년부터)</div>
                        <div class="rate-status increase">↗ 상승</div>
                    </div>
                </div>

                <div class="summary-card industrial-accident">
                    <div class="card-icon">
                        <i class="fas fa-hard-hat"></i>
                    </div>
                    <div class="card-content">
                        <h3>산재보험</h3>
                        <div class="current-rate">0.75%</div>
                        <div class="rate-description">사업주만 부담 (업종별 평균)</div>
                        <div class="rate-status increase">↗ 점진적 상승</div>
                    </div>
                </div>
            </div>

            <!-- 차트 섹션 -->
            <div class="insurance-charts-container">
                <!-- 전체 요율 변화 차트 -->
                <div class="chart-section full-width">
                    <div class="chart-header">
                        <h3>📊 4대보험 요율 변화 추이 (2020~2025)</h3>
                        <div class="chart-controls">
                            <button class="chart-control-btn active" data-view="all">전체보기</button>
                            <button class="chart-control-btn" data-view="employee">근로자부담</button>
                            <button class="chart-control-btn" data-view="employer">사업주부담</button>
                            <button class="chart-control-btn" data-view="changes">요율변화</button>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="insuranceRatesChart"></canvas>
                    </div>
                </div>


            </div>

            <!-- 상세 정보 테이블 -->
            <div class="insurance-details-table">
                <h3>📋 연도별 4대보험 요율 상세표</h3>
                <div class="table-responsive">
                    <table class="rates-table">
                        <thead>
                            <tr>
                                <th>연도</th>
                                <th colspan="2">국민연금</th>
                                <th colspan="2">건강보험</th>
                                <th colspan="2">고용보험</th>
                                <th>산재보험</th>
                            </tr>
                            <tr class="sub-header">
                                <th></th>
                                <th>근로자</th>
                                <th>사업주</th>
                                <th>근로자</th>
                                <th>사업주</th>
                                <th>근로자</th>
                                <th>사업주</th>
                                <th>사업주</th>
                            </tr>
                        </thead>
                        <tbody id="ratesTableBody">
                            <!-- 테이블 데이터가 동적으로 생성됩니다 -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 주요 변화 요약 -->
            <div class="insurance-changes-summary">
                <h3>🔍 주요 변화 요약</h3>
                <div class="changes-grid">
                    <div class="change-item">
                        <div class="change-icon">📈</div>
                        <div class="change-content">
                            <h4>건강보험 요율 상승</h4>
                            <p>2020년 3.335%에서 2025년 3.77%로 지속적 상승 (6년간 0.435%p 증가)</p>
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-icon">⬆️</div>
                        <div class="change-content">
                            <h4>고용보험 요율 인상</h4>
                            <p>2023년부터 근로자 0.8% → 0.9%로 인상, 사업주 1.05% → 1.15%</p>
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-icon">📊</div>
                        <div class="change-content">
                            <h4>산재보험 점진적 상승</h4>
                            <p>업종별 차이가 있으나 전반적으로 0.65%에서 0.75%로 상승 추세</p>
                        </div>
                    </div>
                    <div class="change-item">
                        <div class="change-icon">🔒</div>
                        <div class="change-content">
                            <h4>국민연금 요율 안정</h4>
                            <p>2020년부터 2025년까지 4.5%로 동일하게 유지</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 4대보험 요율 차트 생성
function createInsuranceRatesChart() {
    const canvas = document.getElementById('insuranceRatesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (window.insuranceRatesChartInstance) {
        window.insuranceRatesChartInstance.destroy();
    }

    const years = insuranceRatesData.nationalPension.map(item => item.year);

    window.insuranceRatesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: '국민연금',
                    data: insuranceRatesData.nationalPension.map(item => item.rate),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '건강보험',
                    data: insuranceRatesData.healthInsurance.map(item => item.rate),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '고용보험',
                    data: insuranceRatesData.employmentInsurance.map(item => item.rate),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '산재보험',
                    data: insuranceRatesData.industrialAccident.map(item => item.rate),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#F59E0B',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 5,
                    title: {
                        display: true,
                        text: '요율 (%)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '연도',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}



// 요율 테이블 생성
function createRatesTable() {
    const tbody = document.getElementById('ratesTableBody');
    if (!tbody) return;

    const years = insuranceRatesData.nationalPension.map(item => item.year);
    
    tbody.innerHTML = years.map(year => {
        const npData = insuranceRatesData.nationalPension.find(item => item.year === year);
        const hiData = insuranceRatesData.healthInsurance.find(item => item.year === year);
        const eiData = insuranceRatesData.employmentInsurance.find(item => item.year === year);
        const iaData = insuranceRatesData.industrialAccident.find(item => item.year === year);
        
        return `
            <tr>
                <td class="year-cell">${year}</td>
                <td>${npData.employee}%</td>
                <td>${npData.employer}%</td>
                <td>${hiData.employee}%</td>
                <td>${hiData.employer}%</td>
                <td>${eiData.employee}%</td>
                <td>${eiData.employer}%</td>
                <td>${iaData.employer}%</td>
            </tr>
        `;
    }).join('');
}

// 요율 변화율 계산 함수
function calculateRateChanges() {
    const insuranceTypes = ['nationalPension', 'healthInsurance', 'employmentInsurance', 'industrialAccident'];
    const changes = {};
    
    insuranceTypes.forEach(type => {
        const data = insuranceRatesData[type];
        changes[type] = data.map((item, index) => {
            if (index === 0) {
                return { year: item.year, change: 0 }; // 첫 해는 변화율 0
            }
            const prevRate = data[index - 1].rate;
            const currentRate = item.rate;
            const change = ((currentRate - prevRate) / prevRate * 100).toFixed(2);
            return { year: item.year, change: parseFloat(change) };
        });
    });
    
    return changes;
}

// 차트 컨트롤 이벤트 설정
function setupChartControls() {
    const controlButtons = document.querySelectorAll('.chart-control-btn');
    
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            controlButtons.forEach(btn => btn.classList.remove('active'));
            // 현재 버튼에 active 클래스 추가
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            updateMainChart(view);
        });
    });
}

// 메인 차트 업데이트
function updateMainChart(view) {
    const canvas = document.getElementById('insuranceRatesChart');
    if (!canvas) return;
    
    // 기존 차트 제거
    if (window.insuranceRatesChartInstance) {
        window.insuranceRatesChartInstance.destroy();
    }
    
    switch(view) {
        case 'all':
            createInsuranceRatesChart();
            break;
        case 'employee':
            createEmployeeRatesChart();
            break;
        case 'employer':
            createEmployerRatesChart();
            break;
        case 'changes':
            createRateChangesChart();
            break;
        default:
            createInsuranceRatesChart();
    }
}

// 근로자 부담 전용 차트
function createEmployeeRatesChart() {
    const canvas = document.getElementById('insuranceRatesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const years = insuranceRatesData.nationalPension.map(item => item.year);

    window.insuranceRatesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: '국민연금 (근로자)',
                    data: insuranceRatesData.nationalPension.map(item => item.employee),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '건강보험 (근로자)',
                    data: insuranceRatesData.healthInsurance.map(item => item.employee),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '고용보험 (근로자)',
                    data: insuranceRatesData.employmentInsurance.map(item => item.employee),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }
            ]
        },
        options: getChartOptions('근로자 부담 요율 (%)')
    });
}

// 사업주 부담 전용 차트
function createEmployerRatesChart() {
    const canvas = document.getElementById('insuranceRatesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const years = insuranceRatesData.nationalPension.map(item => item.year);

    window.insuranceRatesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: '국민연금 (사업주)',
                    data: insuranceRatesData.nationalPension.map(item => item.employer),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '건강보험 (사업주)',
                    data: insuranceRatesData.healthInsurance.map(item => item.employer),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#EF4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '고용보험 (사업주)',
                    data: insuranceRatesData.employmentInsurance.map(item => item.employer),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: '산재보험 (사업주)',
                    data: insuranceRatesData.industrialAccident.map(item => item.employer),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointBackgroundColor: '#F59E0B',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }
            ]
        },
        options: getChartOptions('사업주 부담 요율 (%)')
    });
}

// 요율변화 차트 (전년 대비 변화율)
function createRateChangesChart() {
    const canvas = document.getElementById('insuranceRatesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const changes = calculateRateChanges();
    const years = changes.nationalPension.map(item => item.year);

    window.insuranceRatesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: '국민연금 변화율',
                    data: changes.nationalPension.map(item => item.change),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3B82F6',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: '건강보험 변화율',
                    data: changes.healthInsurance.map(item => item.change),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#EF4444',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: '고용보험 변화율',
                    data: changes.employmentInsurance.map(item => item.change),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10B981',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: '산재보험 변화율',
                    data: changes.industrialAccident.map(item => item.change),
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#F59E0B',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const sign = value >= 0 ? '+' : '';
                            return `${context.dataset.label}: ${sign}${value}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '전년 대비 변화율 (%)',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            const sign = value >= 0 ? '+' : '';
                            return `${sign}${value}%`;
                        }
                    },
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.3)'; // 0선을 강조
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            if (context.tick.value === 0) {
                                return 2; // 0선을 두껍게
                            }
                            return 1;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '연도',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// 공통 차트 옵션
function getChartOptions(yAxisTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                max: 5,
                title: {
                    display: true,
                    text: yAxisTitle,
                    font: {
                        size: 14,
                        weight: '600'
                    }
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: '연도',
                    font: {
                        size: 14,
                        weight: '600'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        }
    };
}

// 4대보험 요율 페이지 초기화
function initializeInsuranceRates() {
    console.log('4대보험 요율 페이지 초기화');
    
    // 차트 생성
    setTimeout(() => {
        createInsuranceRatesChart();
        createRatesTable();
        setupChartControls();
    }, 100);
}

// 기존 getPageContent 함수 확장
if (typeof window.originalGetPageContent === 'undefined') {
    window.originalGetPageContent = window.getPageContent || function() { return ''; };
    
    window.getPageContent = function(pageName) {
        if (pageName === 'insurance') {
            return getInsuranceRatesHTML();
        }
        return window.originalGetPageContent(pageName);
    };
}

// 기존 initializePage 함수 확장
if (typeof window.originalInitializePage === 'undefined') {
    window.originalInitializePage = window.initializePage || function() {};
    
    window.initializePage = function(pageName) {
        if (pageName === 'insurance') {
            initializeInsuranceRates();
        } else {
            window.originalInitializePage(pageName);
        }
    };
}

console.log('✅ 4대보험 요율 차트 모듈 로드 완료');