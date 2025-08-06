// comprehensive_labor.js - 종합 인건비 관리 시스템

// 종합 인건비 데이터 구조
const comprehensiveLaborData = {
    // 직원 급여 데이터
    employeeSalary: {
        total: 2850000000,
        breakdown: [
            { category: '기본급', amount: 1800000000, percentage: 63.2 },
            { category: '상여금', amount: 450000000, percentage: 15.8 },
            { category: '수당', amount: 320000000, percentage: 11.2 },
            { category: '4대보험(회사부담)', amount: 280000000, percentage: 9.8 }
        ]
    },
    
    // 개인사업자 비용
    freelancers: {
        total: 680000000,
        breakdown: [
            { category: '개발 외주', amount: 350000000, percentage: 51.5 },
            { category: '디자인 외주', amount: 180000000, percentage: 26.5 },
            { category: '마케팅 외주', amount: 120000000, percentage: 17.6 },
            { category: '기타 전문서비스', amount: 30000000, percentage: 4.4 }
        ]
    },
    
    // 도급사 비용
    contractors: {
        total: 420000000,
        breakdown: [
            { category: '청소용역', amount: 180000000, percentage: 42.9 },
            { category: '보안용역', amount: 150000000, percentage: 35.7 },
            { category: '시설관리', amount: 90000000, percentage: 21.4 }
        ]
    },
    
    // 각종 대행 수수료
    agencyFees: {
        total: 150000000,
        breakdown: [
            { category: '급여대행 수수료', amount: 60000000, percentage: 40.0 },
            { category: '인사대행 수수료', amount: 45000000, percentage: 30.0 },
            { category: '세무대행 수수료', amount: 30000000, percentage: 20.0 },
            { category: '기타 대행비', amount: 15000000, percentage: 10.0 }
        ]
    },
    
    // 월별 트렌드
    monthlyTrend: [
        { month: '1월', employee: 290000000, freelancer: 55000000, contractor: 35000000, agency: 12000000 },
        { month: '2월', employee: 285000000, freelancer: 58000000, contractor: 35000000, agency: 13000000 },
        { month: '3월', employee: 295000000, freelancer: 62000000, contractor: 35000000, agency: 12500000 },
        { month: '4월', employee: 300000000, freelancer: 65000000, contractor: 35000000, agency: 13500000 },
        { month: '5월', employee: 310000000, freelancer: 70000000, contractor: 35000000, agency: 14000000 },
        { month: '6월', employee: 320000000, freelancer: 68000000, contractor: 35000000, agency: 12000000 }
    ]
};

// 종합 인건비 메인 HTML
function getComprehensiveLaborHTML() {
    const totalCost = comprehensiveLaborData.employeeSalary.total + 
                     comprehensiveLaborData.freelancers.total + 
                     comprehensiveLaborData.contractors.total + 
                     comprehensiveLaborData.agencyFees.total;
    
    return `
        <div class="comprehensive-labor">
            <div class="header">
                <h1>💼 종합 인건비 관리</h1>
                <p class="subtitle">전체 인력 비용의 통합 관리 및 AI 분석 시스템</p>
            </div>

            <div class="tab-navigation">
                <button class="tab-btn active" onclick="switchLaborTab('overview')">
                    📊 종합 현황
                </button>
                <button class="tab-btn" onclick="switchLaborTab('analysis')">
                    🤖 AI 분석
                </button>
                <button class="tab-btn" onclick="switchLaborTab('report')">
                    📄 보고서 작성
                </button>
            </div>

            <!-- 종합 현황 탭 -->
            <div id="overview-tab" class="tab-content">
                <div class="summary-cards">
                    <div class="summary-card total">
                        <h3>📈 총 인건비</h3>
                        <div class="amount">₩${(totalCost / 100000000).toFixed(1)}억원</div>
                        <div class="period">2024년 상반기 누적</div>
                    </div>
                    <div class="summary-card employee">
                        <h3>👥 직원 급여</h3>
                        <div class="amount">₩${(comprehensiveLaborData.employeeSalary.total / 100000000).toFixed(1)}억원</div>
                        <div class="percentage">${((comprehensiveLaborData.employeeSalary.total / totalCost) * 100).toFixed(1)}%</div>
                    </div>
                    <div class="summary-card freelancer">
                        <h3>🎯 개인사업자</h3>
                        <div class="amount">₩${(comprehensiveLaborData.freelancers.total / 100000000).toFixed(1)}억원</div>
                        <div class="percentage">${((comprehensiveLaborData.freelancers.total / totalCost) * 100).toFixed(1)}%</div>
                    </div>
                    <div class="summary-card contractor">
                        <h3>🏢 도급사</h3>
                        <div class="amount">₩${(comprehensiveLaborData.contractors.total / 100000000).toFixed(1)}억원</div>
                        <div class="percentage">${((comprehensiveLaborData.contractors.total / totalCost) * 100).toFixed(1)}%</div>
                    </div>
                    <div class="summary-card agency">
                        <h3>⚙️ 대행 수수료</h3>
                        <div class="amount">₩${(comprehensiveLaborData.agencyFees.total / 100000000).toFixed(1)}억원</div>
                        <div class="percentage">${((comprehensiveLaborData.agencyFees.total / totalCost) * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>📊 인건비 구성 비율</h3>
                        <canvas id="laborCompositionChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>📈 월별 인건비 추이</h3>
                        <canvas id="laborTrendChart"></canvas>
                    </div>
                </div>

                <div class="breakdown-section">
                    <div class="breakdown-grid">
                        <div class="breakdown-card">
                            <h4>👥 직원 급여 세부내역</h4>
                            <div class="breakdown-list">
                                ${comprehensiveLaborData.employeeSalary.breakdown.map(item => `
                                    <div class="breakdown-item">
                                        <span class="category">${item.category}</span>
                                        <span class="amount">₩${(item.amount / 100000000).toFixed(1)}억원</span>
                                        <span class="percentage">${item.percentage}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="breakdown-card">
                            <h4>🎯 개인사업자 세부내역</h4>
                            <div class="breakdown-list">
                                ${comprehensiveLaborData.freelancers.breakdown.map(item => `
                                    <div class="breakdown-item">
                                        <span class="category">${item.category}</span>
                                        <span class="amount">₩${(item.amount / 100000000).toFixed(1)}억원</span>
                                        <span class="percentage">${item.percentage}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI 분석 탭 -->
            <div id="analysis-tab" class="tab-content" style="display: none;">
                <div class="ai-analysis-section">
                    <div class="analysis-header">
                        <h3>🤖 AI 종합 인건비 분석</h3>
                        <button class="btn-primary" onclick="generateAIAnalysis()">
                            <i class="fas fa-brain"></i> AI 분석 실행
                        </button>
                    </div>
                    
                    <div id="ai-analysis-results" class="analysis-results">
                        <div class="analysis-placeholder">
                            <i class="fas fa-robot"></i>
                            <p>AI 분석을 실행하면 종합 인건비에 대한 전문적인 분석 결과가 여기에 표시됩니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 보고서 작성 탭 -->
            <div id="report-tab" class="tab-content" style="display: none;">
                <div class="report-section">
                    <div class="report-header">
                        <h3>📄 종합 인건비 보고서 작성</h3>
                        <div class="report-controls">
                            <select id="reportTemplate">
                                <option value="executive">임원진용 요약 보고서</option>
                                <option value="detailed">상세 분석 보고서</option>
                                <option value="comparison">전년 대비 비교 보고서</option>
                                <option value="forecast">향후 전망 보고서</option>
                            </select>
                            <button class="btn-primary" onclick="generateReport()">
                                <i class="fas fa-file-alt"></i> 보고서 생성
                            </button>
                        </div>
                    </div>
                    
                    <div id="report-content" class="report-content">
                        <div class="report-placeholder">
                            <i class="fas fa-file-alt"></i>
                            <p>보고서 템플릿을 선택하고 생성 버튼을 클릭하면 AI가 주변 자료를 참고하여 전문적인 보고서를 작성합니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 탭 전환 함수
function switchLaborTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    // 선택된 탭 활성화
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // 탭별 초기화
    if (tabName === 'overview') {
        setTimeout(() => {
            initializeLaborCharts();
        }, 100);
    }
}

// 차트 초기화
function initializeLaborCharts() {
    initializeCompositionChart();
    initializeTrendChart();
}

// 구성 비율 차트
function initializeCompositionChart() {
    console.log('🔧 종합 인건비 구성 비율 차트 초기화');
    
    const chartData = {
        labels: ['직원 급여', '개인사업자', '도급사', '대행 수수료'],
        datasets: [{
            data: [
                comprehensiveLaborData.employeeSalary.total,
                comprehensiveLaborData.freelancers.total,
                comprehensiveLaborData.contractors.total,
                comprehensiveLaborData.agencyFees.total
            ],
            backgroundColor: window.colorPalettes?.gradients || ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    if (typeof window.createStandardChart === 'function') {
        console.log('🔧 표준 차트 유틸리티 사용');
        window.laborCompositionChartInstance = window.createStandardChart(
            'laborCompositionChart', 
            'doughnut', 
            chartData
        );
    } else {
        // fallback - 직접 차트 생성
        console.log('🔧 fallback 방식으로 차트 생성');
        const canvas = document.getElementById('laborCompositionChart');
        if (!canvas) {
            console.log('❌ laborCompositionChart 캔버스를 찾을 수 없습니다');
            return;
        }

        if (typeof Chart === 'undefined') {
            console.log('❌ Chart.js가 로드되지 않았습니다');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 기존 차트 제거
        if (window.laborCompositionChartInstance) {
            window.laborCompositionChartInstance.destroy();
        }

        window.laborCompositionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['직원 급여', '개인사업자', '도급사', '대행 수수료'],
            datasets: [{
                data: [
                    comprehensiveLaborData.employeeSalary.total,
                    comprehensiveLaborData.freelancers.total,
                    comprehensiveLaborData.contractors.total,
                    comprehensiveLaborData.agencyFees.total
                ],
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    console.log('✅ 종합 인건비 구성 차트 생성 완료');
    }
}

// 월별 추이 차트
function initializeTrendChart() {
    console.log('🔧 종합 인건비 월별 추이 차트 초기화');
    
    const chartData = {
        labels: comprehensiveLaborData.monthlyTrend.map(item => item.month),
        datasets: [
            {
                label: '직원 급여',
                data: comprehensiveLaborData.monthlyTrend.map(item => item.employee / 1000000),
                borderColor: window.colorPalettes?.borders[0] || '#FF6B6B',
                backgroundColor: window.colorPalettes?.primary[0] || 'rgba(255, 107, 107, 0.1)',
                borderWidth: 3,
                fill: false
            },
            {
                label: '개인사업자',
                data: comprehensiveLaborData.monthlyTrend.map(item => item.freelancer / 1000000),
                borderColor: window.colorPalettes?.borders[1] || '#4ECDC4',
                backgroundColor: window.colorPalettes?.primary[1] || 'rgba(78, 205, 196, 0.1)',
                borderWidth: 3,
                fill: false
            },
            {
                label: '도급사',
                data: comprehensiveLaborData.monthlyTrend.map(item => item.contractor / 1000000),
                borderColor: window.colorPalettes?.borders[2] || '#45B7D1',
                backgroundColor: window.colorPalettes?.primary[2] || 'rgba(69, 183, 209, 0.1)',
                borderWidth: 3,
                fill: false
            }
        ]
    };

    if (typeof window.createStandardChart === 'function') {
        console.log('🔧 표준 차트 유틸리티로 추이 차트 생성');
        window.laborTrendChartInstance = window.createStandardChart(
            'laborTrendChart', 
            'line', 
            chartData,
            {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: '금액 (백만원)'
                        }
                    }
                }
            }
        );
    } else {
        // fallback - 직접 차트 생성
        console.log('🔧 fallback 방식으로 추이 차트 생성');
        const canvas = document.getElementById('laborTrendChart');
        if (!canvas) {
            console.log('❌ laborTrendChart 캔버스를 찾을 수 없습니다');
            return;
        }

        if (typeof Chart === 'undefined') {
            console.log('❌ Chart.js가 로드되지 않았습니다');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // 기존 차트 제거
        if (window.laborTrendChartInstance) {
            window.laborTrendChartInstance.destroy();
        }

        window.laborTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: comprehensiveLaborData.monthlyTrend.map(item => item.month),
            datasets: [
                {
                    label: '직원 급여',
                    data: comprehensiveLaborData.monthlyTrend.map(item => item.employee / 1000000),
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                },
                {
                    label: '개인사업자',
                    data: comprehensiveLaborData.monthlyTrend.map(item => item.freelancer / 1000000),
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4
                },
                {
                    label: '도급사',
                    data: comprehensiveLaborData.monthlyTrend.map(item => item.contractor / 1000000),
                    borderColor: '#45B7D1',
                    backgroundColor: 'rgba(69, 183, 209, 0.1)',
                    tension: 0.4
                },
                {
                    label: '대행 수수료',
                    data: comprehensiveLaborData.monthlyTrend.map(item => item.agency / 1000000),
                    borderColor: '#96CEB4',
                    backgroundColor: 'rgba(150, 206, 180, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '금액 (백만원)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    console.log('✅ 종합 인건비 추이 차트 생성 완료');
    }
}

// AI 분석 실행
function generateAIAnalysis() {
    const resultContainer = document.getElementById('ai-analysis-results');
    
    // 로딩 표시
    resultContainer.innerHTML = `
        <div class="loading-analysis">
            <i class="fas fa-spinner fa-spin"></i>
            <p>AI가 종합 인건비를 분석하고 있습니다...</p>
        </div>
    `;
    
    // 시뮬레이션 (실제로는 AI API 호출)
    setTimeout(() => {
        const analysis = generateMockAIAnalysis();
        resultContainer.innerHTML = analysis;
    }, 3000);
}

// Mock AI 분석 결과
function generateMockAIAnalysis() {
    return `
        <div class="ai-analysis-content">
            <div class="analysis-summary">
                <h4>🎯 핵심 분석 결과</h4>
                <div class="key-insights">
                    <div class="insight">
                        <div class="insight-icon">📈</div>
                        <div class="insight-text">
                            <strong>인건비 효율성:</strong> 현재 총 인건비 대비 매출 비율이 32.1%로 업계 평균(35.2%)보다 양호한 수준입니다.
                        </div>
                    </div>
                    <div class="insight">
                        <div class="insight-icon">⚠️</div>
                        <div class="insight-text">
                            <strong>주의사항:</strong> 개인사업자 비용이 전월 대비 15% 증가했습니다. 계약 구조 재검토가 필요합니다.
                        </div>
                    </div>
                    <div class="insight">
                        <div class="insight-icon">💡</div>
                        <div class="insight-text">
                            <strong>개선 제안:</strong> 대행 수수료 통합 관리를 통해 연간 약 2,000만원의 비용 절감이 가능할 것으로 예상됩니다.
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="detailed-analysis">
                <h4>📊 세부 분석</h4>
                <div class="analysis-sections">
                    <div class="analysis-section">
                        <h5>비용 구조 분석</h5>
                        <p>직원 급여(69.1%)가 가장 큰 비중을 차지하며, 이는 일반적인 서비스업 기준과 부합합니다. 
                        개인사업자 비용(16.5%)은 프로젝트 특성상 적정 수준이나, 향후 내재화 검토가 필요합니다.</p>
                    </div>
                    
                    <div class="analysis-section">
                        <h5>트렌드 분석</h5>
                        <p>최근 6개월간 총 인건비는 월평균 2.3% 증가 추세를 보이고 있습니다. 
                        특히 개인사업자 비용의 증가폭이 크므로, 계약 조건 최적화를 권장합니다.</p>
                    </div>
                    
                    <div class="analysis-section">
                        <h5>업계 비교</h5>
                        <p>동종업계 대비 인건비 효율성은 상위 25% 수준입니다. 
                        다만, 4대보험 회사 부담률 최적화를 통한 추가 개선 여지가 있습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 보고서 생성
function generateReport() {
    const template = document.getElementById('reportTemplate').value;
    const reportContainer = document.getElementById('report-content');
    
    // 로딩 표시
    reportContainer.innerHTML = `
        <div class="loading-report">
            <i class="fas fa-file-alt fa-spin"></i>
            <p>AI가 ${getTemplateName(template)}를 작성하고 있습니다...</p>
        </div>
    `;
    
    // 시뮬레이션
    setTimeout(() => {
        const report = generateMockReport(template);
        reportContainer.innerHTML = report;
    }, 4000);
}

// 템플릿 이름 반환
function getTemplateName(template) {
    const names = {
        'executive': '임원진용 요약 보고서',
        'detailed': '상세 분석 보고서',
        'comparison': '전년 대비 비교 보고서',
        'forecast': '향후 전망 보고서'
    };
    return names[template] || '보고서';
}

// Mock 보고서 생성
function generateMockReport(template) {
    const reportHeaders = {
        'executive': '📋 임원진용 종합 인건비 요약 보고서',
        'detailed': '📊 종합 인건비 상세 분석 보고서',
        'comparison': '📈 전년 대비 인건비 비교 보고서',
        'forecast': '🔮 종합 인건비 향후 전망 보고서'
    };
    
    return `
        <div class="generated-report">
            <div class="report-header">
                <h3>${reportHeaders[template]}</h3>
                <div class="report-meta">
                    <span>작성일: ${new Date().toLocaleDateString('ko-KR')}</span>
                    <button class="btn-secondary" onclick="downloadReport()">
                        <i class="fas fa-download"></i> PDF 다운로드
                    </button>
                </div>
            </div>
            
            <div class="report-body">
                <div class="report-section">
                    <h4>📋 요약</h4>
                    <p>2024년 상반기 종합 인건비는 총 410억원으로, 전년 동기 대비 8.2% 증가했습니다. 
                    직원 급여가 전체의 69.1%를 차지하며, 개인사업자 및 도급사 비용도 사업 확장에 따라 적정 수준에서 증가했습니다.</p>
                </div>
                
                <div class="report-section">
                    <h4>📊 주요 지표</h4>
                    <ul>
                        <li><strong>총 인건비:</strong> 410억원 (전년 동기 대비 +8.2%)</li>
                        <li><strong>직원 급여:</strong> 285억원 (69.1%, +6.8%)</li>
                        <li><strong>개인사업자:</strong> 68억원 (16.5%, +12.3%)</li>
                        <li><strong>도급사:</strong> 42억원 (10.2%, +5.1%)</li>
                        <li><strong>대행 수수료:</strong> 15억원 (3.7%, +3.2%)</li>
                    </ul>
                </div>
                
                <div class="report-section">
                    <h4>💡 권장사항</h4>
                    <ol>
                        <li><strong>개인사업자 계약 최적화:</strong> 증가 폭이 큰 개인사업자 비용에 대한 계약 조건 재검토</li>
                        <li><strong>대행 수수료 통합:</strong> 분산된 대행 업무의 통합을 통한 비용 절감</li>
                        <li><strong>4대보험 효율화:</strong> 법정 범위 내에서의 부담률 최적화 방안 검토</li>
                    </ol>
                </div>
                
                <div class="report-section">
                    <h4>🔮 향후 전망</h4>
                    <p>하반기에는 신규 프로젝트 증가로 개인사업자 비용이 추가 상승할 것으로 예상됩니다. 
                    다만, 내부 역량 강화를 통한 내재화로 장기적 비용 효율성을 제고할 수 있을 것으로 판단됩니다.</p>
                </div>
            </div>
        </div>
    `;
}

// PDF 다운로드 (시뮬레이션)
function downloadReport() {
    alert('📄 보고서 PDF 다운로드 기능이 실행됩니다.\n\n실제 서비스에서는 여기서 PDF 파일을 생성하고 다운로드합니다.');
}

// 종합 인건비 시스템 초기화
function initializeComprehensiveLabor() {
    console.log('🔧 종합 인건비 시스템 초기화 시작');
    
    // 차트 초기화를 더 안정적으로 처리
    const waitForElements = () => {
        const compositionCanvas = document.getElementById('laborCompositionChart');
        const trendCanvas = document.getElementById('laborTrendChart');
        
        console.log('캔버스 요소 확인:', {
            composition: !!compositionCanvas,
            trend: !!trendCanvas,
            chartJS: typeof Chart !== 'undefined'
        });
        
        if (compositionCanvas && trendCanvas && typeof Chart !== 'undefined') {
            console.log('✅ 모든 요소 준비 완료, 차트 생성 시작');
            
            // 강제로 직접 차트 생성
            createLaborChartsDirect();
            
        } else {
            console.log('⏳ 요소 대기 중... 재시도');
            setTimeout(waitForElements, 100);
        }
    };
    
    setTimeout(waitForElements, 100);
}

// 직접 차트 생성 함수
function createLaborChartsDirect() {
    try {
        console.log('🎨 직접 차트 생성 시작');
        
        // 1. 구성 차트 생성
        const compositionCanvas = document.getElementById('laborCompositionChart');
        compositionCanvas.width = 400;
        compositionCanvas.height = 300;
        const compositionCtx = compositionCanvas.getContext('2d');
        
        // 기존 차트 파괴
        if (window.laborCompositionChartInstance) {
            window.laborCompositionChartInstance.destroy();
        }
        
        window.laborCompositionChartInstance = new Chart(compositionCtx, {
            type: 'doughnut',
            data: {
                labels: ['직원 급여', '개인사업자', '도급사', '대행 수수료'],
                datasets: [{
                    data: [1200000000, 800000000, 400000000, 200000000],
                    backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
                    borderWidth: 2,
                    borderColor: '#fff'
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
        
        console.log('✅ 구성 차트 생성 완료');
        
        // 2. 추이 차트 생성
        const trendCanvas = document.getElementById('laborTrendChart');
        trendCanvas.width = 400;
        trendCanvas.height = 300;
        const trendCtx = trendCanvas.getContext('2d');
        
        // 기존 차트 파괴
        if (window.laborTrendChartInstance) {
            window.laborTrendChartInstance.destroy();
        }
        
        window.laborTrendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [
                    {
                        label: '직원 급여',
                        data: [200, 210, 205, 220, 215, 225],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '개인사업자',
                        data: [130, 135, 140, 145, 150, 155],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '도급사',
                        data: [65, 70, 68, 75, 72, 78],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '금액 (백만원)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        
        console.log('✅ 추이 차트 생성 완료');
        console.log('🎉 모든 종합 인건비 차트 생성 성공!');
        
    } catch (error) {
        console.error('❌ 직접 차트 생성 중 오류:', error);
        
        // 폴백: 기존 함수 호출
        setTimeout(() => {
            initializeCompositionChart();
            initializeTrendChart();
        }, 200);
    }
}

console.log('✅ 종합 인건비 관리 시스템 로드 완료');