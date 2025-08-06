// expert_analysis.js - 전문가 분석&예측 기능

// 전문가 분석 데이터
const expertAnalysisData = {
    departmentCosts: [
        { name: '개발팀', cost: 450000000, headcount: 45, productivity: 95 },
        { name: '마케팅팀', cost: 280000000, headcount: 28, productivity: 88 },
        { name: '영업팀', cost: 320000000, headcount: 32, productivity: 92 },
        { name: '인사팀', cost: 180000000, headcount: 18, productivity: 85 },
        { name: '재무팀', cost: 150000000, headcount: 15, productivity: 90 }
    ],
    monthlyTrend: [
        { month: '1월', cost: 1200000000, revenue: 1800000000, roi: 150 },
        { month: '2월', cost: 1250000000, revenue: 1950000000, roi: 156 },
        { month: '3월', cost: 1180000000, revenue: 2100000000, roi: 178 },
        { month: '4월', cost: 1300000000, revenue: 2200000000, roi: 169 },
        { month: '5월', cost: 1280000000, revenue: 2350000000, roi: 184 },
        { month: '6월', cost: 1350000000, revenue: 2500000000, roi: 185 }
    ]
};

// 전문가 분석 페이지 HTML
function getExpertAnalysisHTML() {
    return `
        <div class="expert-analysis">
            <div class="header">
                <h1>🎯 전문가 분석&예측</h1>
                <p class="subtitle">AI 기반 인건비 최적화 및 HC ROI 전략 플랫폼</p>
            </div>

            <div class="tab-navigation">
                <button class="tab-btn active" onclick="switchAnalysisTab('dashboard')">
                    📊 임원 대시보드
                </button>
                <button class="tab-btn" onclick="switchAnalysisTab('analysis')">
                    🔍 AI 분석
                </button>
                <button class="tab-btn" onclick="switchAnalysisTab('hcroi')">
                    💎 HC ROI
                </button>
            </div>

            <!-- 임원 대시보드 -->
            <div id="dashboard-tab" class="tab-content dashboard-section">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h3>총 인건비</h3>
                        <div class="metric-value">₩13.8억</div>
                        <div class="metric-change positive">+5.2% vs 전월</div>
                    </div>
                    <div class="metric-card">
                        <h3>총 인원수</h3>
                        <div class="metric-value">138명</div>
                        <div class="metric-change positive">+3명 vs 전월</div>
                    </div>
                    <div class="metric-card">
                        <h3>평균 생산성</h3>
                        <div class="metric-value">90.2%</div>
                        <div class="metric-change negative">-1.8% vs 전월</div>
                    </div>
                    <div class="metric-card">
                        <h3>예상 ROI</h3>
                        <div class="metric-value">185%</div>
                        <div class="metric-change positive">+12% vs 전월</div>
                    </div>
                </div>

                <div class="charts-container">
                    <div class="chart-section">
                        <h3>부서별 인건비 현황</h3>
                        <div style="height: 300px;">
                            <canvas id="departmentChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-section">
                        <h3>월별 ROI 추이</h3>
                        <div style="height: 300px;">
                            <canvas id="roiTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI 분석 -->
            <div id="analysis-tab" class="tab-content analysis-section" style="display: none;">
                <div class="ai-insights">
                    <h3>🤖 AI 인사이트</h3>
                    <div class="insight-cards">
                        <div class="insight-card critical">
                            <h4>⚠️ 중요 발견사항</h4>
                            <p>개발팀 생산성이 95%로 최고 수준이나, 인건비 대비 아웃풋 효율성 개선 여지 존재</p>
                        </div>
                        <div class="insight-card opportunity">
                            <h4>💡 기회 요소</h4>
                            <p>마케팅팀 ROI 개선 시 전체 HC ROI 15% 이상 향상 가능</p>
                        </div>
                        <div class="insight-card prediction">
                            <h4>🔮 예측 모델</h4>
                            <p>현재 추세 유지 시 Q3 HC ROI 190% 달성 예상</p>
                        </div>
                    </div>
                </div>

                <div class="productivity-analysis">
                    <h3>부서별 생산성 분석</h3>
                    <div style="height: 400px; display: flex; justify-content: center; align-items: center;">
                        <canvas id="productivityChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- HC ROI -->
            <div id="hcroi-tab" class="tab-content hcroi-section" style="display: none;">
                <div class="hcroi-header">
                    <h2>💎 HC ROI 전문가 분석</h2>
                    <button class="analyze-btn" onclick="analyzeHCROI()" id="analyzeBtn">
                        🚀 최신 HC ROI 분석 실행
                    </button>
                </div>

                <div id="loading-section" class="loading-animation" style="display: none;">
                    <div class="spinner"></div>
                    <p>AI가 최신 데이터를 분석하고 있습니다...</p>
                </div>

                <div id="hcroi-results" class="hcroi-results" style="display: none;">
                    <div class="roi-highlight">
                        <div class="roi-main">
                            <h3>최종 HC ROI</h3>
                            <div class="roi-value" id="roiValue">---%</div>
                            <div class="risk-level" id="riskLevel">
                                리스크: ---
                            </div>
                        </div>
                    </div>

                    <div class="roi-breakdown">
                        <div class="breakdown-item">
                            <span>총 인건비</span>
                            <span id="totalCost">---</span>
                        </div>
                        <div class="breakdown-item">
                            <span>총 인원수</span>
                            <span id="totalHeadcount">---</span>
                        </div>
                        <div class="breakdown-item">
                            <span>평균 생산성</span>
                            <span id="avgProductivity">---</span>
                        </div>
                        <div class="breakdown-item">
                            <span>예측 매출</span>
                            <span id="predictedRevenue">---</span>
                        </div>
                    </div>

                    <div class="recommendations">
                        <h4>🎯 전문가 추천사항</h4>
                        <ul id="recommendationsList">
                            <!-- 추천사항이 동적으로 추가됩니다 -->
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 탭 전환 함수
function switchAnalysisTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 모든 탭 콘텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // 선택된 탭 활성화
    event.target.classList.add('active');
    
    // 선택된 탭 콘텐츠 표시
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.style.display = 'block';
        
        // 탭별 초기화
        if (tabName === 'dashboard') {
            initializeDashboardCharts();
        } else if (tabName === 'analysis') {
            initializeAnalysisCharts();
        }
    }
}

// 대시보드 차트 초기화
function initializeDashboardCharts() {
    // Chart.js 라이브러리 로드 확인
    if (typeof Chart === 'undefined') {
        console.log('Chart.js 라이브러리 로드 대기 중...');
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js 로드 완료, 차트 초기화 시작');
                clearInterval(checkChart);
                setTimeout(() => {
                    createDepartmentChart();
                    createROITrendChart();
                }, 200);
            }
        }, 100);
    } else {
        setTimeout(() => {
            createDepartmentChart();
            createROITrendChart();
        }, 200);
    }
}

// 분석 차트 초기화
function initializeAnalysisCharts() {
    // Chart.js 라이브러리 로드 확인
    if (typeof Chart === 'undefined') {
        console.log('Chart.js 라이브러리 로드 대기 중...');
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js 로드 완료, 생산성 차트 초기화 시작');
                clearInterval(checkChart);
                setTimeout(() => {
                    createProductivityChart();
                }, 200);
            }
        }, 100);
    } else {
        setTimeout(() => {
            createProductivityChart();
        }, 200);
    }
}

// 부서별 인건비 차트
function createDepartmentChart() {
    console.log('🔧 전문가 분석: 부서별 인건비 차트 초기화');
    
    const chartData = {
        labels: ['개발팀', '마케팅팀', '영업팀', '인사팀', '재무팀'],
        datasets: [{
            label: '인건비 (억원)',
            data: [4.5, 2.8, 3.2, 1.8, 1.5],
            backgroundColor: window.colorPalettes?.primary || [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ],
            borderColor: window.colorPalettes?.borders || [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 2
        }]
    };

    const customOptions = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: '부서별 인건비 현황'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '인건비 (억원)'
                }
            }
        }
    };

    if (typeof window.safeInitChart === 'function') {
        window.safeInitChart('departmentChart', () => {
            const canvas = window.prepareCanvas('departmentChart');
            if (!canvas) return;
            
            window.safeDestroyChart(window.departmentChartInstance);
            
            const ctx = canvas.getContext('2d');
            window.departmentChartInstance = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    ...window.standardChartOptions?.bar,
                    ...customOptions
                }
            });
            console.log('✅ 부서별 인건비 차트 생성 완료');
        });
    } else {
        console.log('⚠️ 차트 유틸리티 미로드, fallback 사용');
        // fallback code...
    }
}

// ROI 추이 차트
function createROITrendChart() {
    console.log('🔧 전문가 분석: ROI 추이 차트 초기화');
    
    const chartData = {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [{
            label: 'ROI (%)',
            data: [150, 156, 178, 169, 184, 185],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };

    const customOptions = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: '월별 ROI 추이'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 140,
                max: 200,
                title: {
                    display: true,
                    text: 'ROI (%)'
                }
            }
        }
    };

    if (typeof window.safeInitChart === 'function') {
        window.safeInitChart('roiTrendChart', () => {
            const canvas = window.prepareCanvas('roiTrendChart');
            if (!canvas) return;
            
            window.safeDestroyChart(window.roiTrendChartInstance);
            
            const ctx = canvas.getContext('2d');
            window.roiTrendChartInstance = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    ...window.standardChartOptions?.line,
                    ...customOptions
                }
            });
            console.log('✅ ROI 추이 차트 생성 완료');
        });
    } else {
        console.log('⚠️ 차트 유틸리티 미로드, fallback 사용');
        // fallback code...
    }
}

// 생산성 파이차트
function createProductivityChart() {
    const canvas = document.getElementById('productivityChart');
    if (!canvas) {
        console.log('productivityChart 캔버스를 찾을 수 없습니다');
        return;
    }

    if (typeof Chart === 'undefined') {
        console.log('Chart.js가 로드되지 않았습니다');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (window.productivityChartInstance) {
        window.productivityChartInstance.destroy();
    }

    // 캔버스 크기 설정
    canvas.style.width = '100%';
    canvas.style.height = '350px';

    console.log('생산성 차트 생성 중...');

    window.productivityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: expertAnalysisData.departmentCosts.map(dept => dept.name),
            datasets: [{
                data: expertAnalysisData.departmentCosts.map(dept => dept.productivity),
                backgroundColor: [
                    '#0088FE',
                    '#00C49F',
                    '#FFBB28',
                    '#FF8042',
                    '#8884D8'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            return data.labels.map((label, index) => ({
                                text: `${label}: ${data.datasets[0].data[index]}%`,
                                fillStyle: data.datasets[0].backgroundColor[index],
                                strokeStyle: data.datasets[0].backgroundColor[index],
                                lineWidth: 0,
                                pointStyle: 'circle'
                            }));
                        }
                    }
                }
            }
        }
    });
    
    console.log('생산성 차트 생성 완료');
}

// HC ROI 분석 함수
function analyzeHCROI() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('hcroi-results');

    // 버튼 비활성화 및 로딩 표시
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 AI 분석 중...';
    loadingSection.style.display = 'block';
    resultsSection.style.display = 'none';

    // 3초 후 결과 표시 (실제 AI 분석 시뮬레이션)
    setTimeout(() => {
        const totalCost = expertAnalysisData.departmentCosts.reduce((sum, dept) => sum + dept.cost, 0);
        const totalHeadcount = expertAnalysisData.departmentCosts.reduce((sum, dept) => sum + dept.headcount, 0);
        const avgProductivity = expertAnalysisData.departmentCosts.reduce((sum, dept) => sum + dept.productivity, 0) / expertAnalysisData.departmentCosts.length;
        
        const predictedRevenue = totalCost * (avgProductivity / 100) * 2.3;
        const hcRoi = ((predictedRevenue - totalCost) / totalCost * 100).toFixed(2);
        
        const riskLevel = hcRoi > 80 ? 'LOW' : hcRoi > 50 ? 'MEDIUM' : 'HIGH';
        const riskLevelKr = riskLevel === 'LOW' ? '낮음' : riskLevel === 'MEDIUM' ? '보통' : '높음';
        
        // 결과 업데이트
        document.getElementById('roiValue').textContent = `${hcRoi}%`;
        document.getElementById('riskLevel').textContent = `리스크: ${riskLevelKr}`;
        document.getElementById('riskLevel').className = `risk-level ${riskLevel.toLowerCase()}`;
        
        document.getElementById('totalCost').textContent = `₩${(totalCost/100000000).toFixed(1)}억`;
        document.getElementById('totalHeadcount').textContent = `${totalHeadcount}명`;
        document.getElementById('avgProductivity').textContent = `${avgProductivity.toFixed(1)}%`;
        document.getElementById('predictedRevenue').textContent = `₩${(predictedRevenue/100000000).toFixed(1)}억`;
        
        // 추천사항
        const recommendations = [
            '개발팀 생산성 향상을 위한 AI 도구 도입 검토',
            '마케팅팀 ROI 최적화를 위한 디지털 전환 가속화',
            '인력 재배치를 통한 부서별 효율성 극대화'
        ];
        
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
        
        // UI 업데이트
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'block';
        
        // 버튼 복원
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🚀 최신 HC ROI 분석 실행';
        
    }, 3000);
}

// 전문가 분석 페이지 초기화
function initializeExpertAnalysis() {
    console.log('전문가 분석 페이지 초기화');
    
    // Chart.js 라이브러리 로드 확인 후 대시보드 차트 초기화
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js 로드 확인됨, 즉시 차트 초기화');
        initializeDashboardCharts();
    } else {
        console.log('Chart.js 로드 대기 중...');
        const checkChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js 로드 완료, 차트 초기화 시작');
                clearInterval(checkChart);
                initializeDashboardCharts();
            }
        }, 100);
    }
}

// 기존 getPageContent 함수 확장
if (typeof window.originalGetPageContent === 'undefined') {
    window.originalGetPageContent = window.getPageContent || function() { return ''; };
    
    window.getPageContent = function(pageName) {
        if (pageName === 'hc-roi') {
            return getExpertAnalysisHTML();
        }
        return window.originalGetPageContent(pageName);
    };
}

// 기존 initializePage 함수 확장
if (typeof window.originalInitializePage === 'undefined') {
    window.originalInitializePage = window.initializePage || function() {};
    
    window.initializePage = function(pageName) {
        if (pageName === 'hc-roi') {
            initializeExpertAnalysis();
        } else {
            window.originalInitializePage(pageName);
        }
    };
}

console.log('✅ 전문가 분석&예측 모듈 로드 완료');