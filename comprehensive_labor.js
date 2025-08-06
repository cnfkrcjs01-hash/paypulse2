// comprehensive_labor.js - 종합 인건비 PayPulse 대시보드

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
    }
};

// 애니메이션 유틸리티 클래스
class PayPulseAnimations {
    static animateNumber(element, targetValue, format = 'currency', duration = 2000) {
        if (!element) return;
        
        let startValue = 0;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out-quart 효과
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            switch (format) {
                case 'currency':
                    element.textContent = `₩${Math.round(currentValue).toLocaleString()}`;
                    break;
                case 'number':
                    element.textContent = `${Math.round(currentValue)}명`;
                    break;
                default:
                    element.textContent = Math.round(currentValue).toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    static slideInCards() {
        const cards = document.querySelectorAll('.stat-card, .task-card, .alert-card, .feature-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

// 종합 인건비 대시보드 HTML (React 스타일)
function getComprehensiveLaborHTML() {
    const totalCost = comprehensiveLaborData.employeeSalary.total + 
                     comprehensiveLaborData.freelancers.total + 
                     comprehensiveLaborData.contractors.total + 
                     comprehensiveLaborData.agencyFees.total;
    
    const directLabor = comprehensiveLaborData.employeeSalary.total;
    const indirectLabor = comprehensiveLaborData.freelancers.total;
    const employeeCount = 156;
    
    return `
        <div class="dashboard-container">
            <!-- 헤더 -->
            <div class="dashboard-header">
                <div class="header-info">
                    <div class="logo-section">
                        <div class="logo-circle">
                            <span class="logo-text">P</span>
                        </div>
                        <h1 class="dashboard-title">PayPulse 대시보드</h1>
                    </div>
                    <p class="dashboard-subtitle">AI 기반 스마트 인건비 관리 시스템으로 조직 정형 집약화 IT</p>
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span class="status-text">실시간 급여와 보안 - 마지막 업데이트: 방금 전</span>
                    </div>
                </div>
            </div>

            <!-- 통계 카드 -->
            <div class="stats-grid">
                <div class="stat-card orange">
                    <div class="stat-header">
                        <span class="stat-title">총 인건비</span>
                    </div>
                    <div class="stat-value" data-value="${totalCost}" data-format="currency">₩0</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>+8.2% vs 전월</span>
                    </div>
                </div>

                <div class="stat-card blue">
                    <div class="stat-header">
                        <span class="stat-title">직접 인건비</span>
                    </div>
                    <div class="stat-value" data-value="${directLabor}" data-format="currency">₩0</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>+12.5% vs 전월</span>
                    </div>
                </div>

                <div class="stat-card green">
                    <div class="stat-header">
                        <span class="stat-title">간접 인건비</span>
                    </div>
                    <div class="stat-value" data-value="${indirectLabor}" data-format="currency">₩0</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        <span>+3.1% vs 전월</span>
                    </div>
                </div>

                <div class="stat-card purple">
                    <div class="stat-header">
                        <span class="stat-title">총 직원수</span>
                    </div>
                    <div class="stat-value" data-value="${employeeCount}" data-format="number">0명</div>
                    <div class="stat-change negative">
                        <i class="fas fa-arrow-down"></i>
                        <span>-1.4% vs 전월</span>
                    </div>
                </div>
            </div>

            <!-- 메인 콘텐츠 영역 -->
            <div class="main-content-grid">
                <!-- 핵심 작업 -->
                <div class="content-card">
                    <div class="card-header">
                        <div class="header-dot orange"></div>
                        <h2 class="card-title">핵심 작업</h2>
                    </div>
                    
                    <div class="tasks-container">
                        <div class="task-card urgent">
                            <div class="task-indicator urgent"></div>
                            <div class="task-content">
                                <h4 class="task-title">직원 인건비 관리</h4>
                                <p class="task-description">새로운 직원들의 급여 및 수당을 관리합니다.</p>
                            </div>
                        </div>
                        
                        <div class="task-card normal">
                            <div class="task-indicator normal"></div>
                            <div class="task-content">
                                <h4 class="task-title">간접 인건비 관리</h4>
                                <p class="task-description">복리후생비와 관련된 비용을 체계적으로 관리합니다.</p>
                            </div>
                        </div>
                        
                        <div class="task-card normal">
                            <div class="task-indicator normal"></div>
                            <div class="task-content">
                                <h4 class="task-title">급여 인건비 분석</h4>
                                <p class="task-description">월별 급여 추이와 패턴을 분석하고 최적화합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 최근 활동 -->
                <div class="content-card">
                    <div class="card-header">
                        <div class="header-dot blue"></div>
                        <h2 class="card-title">최근 활동</h2>
                    </div>

                    <div class="alerts-container">
                        <div class="alert-card warning">
                            <div class="alert-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="alert-content">
                                <h4 class="alert-title">인건비 초과 부서 약 3개에 대해 리뷰이즈</h4>
                                <p class="alert-description">IT팀 예산 초과</p>
                                <p class="alert-time">5분 전</p>
                            </div>
                        </div>
                        
                        <div class="alert-card success">
                            <div class="alert-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div class="alert-content">
                                <h4 class="alert-title">AI 분석이 완료됨 셀 중 완료</h4>
                                <p class="alert-description">월별 분석 완료</p>
                                <p class="alert-time">30분 전</p>
                            </div>
                        </div>
                        
                        <div class="alert-card info">
                            <div class="alert-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="alert-content">
                                <h4 class="alert-title">신규 외주업체 안건 등급 생체</h4>
                                <p class="alert-description">계약서 검토 필요</p>
                                <p class="alert-time">1시간 전</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 추가 위젯 영역 -->
                <div class="content-card">
                    <div class="empty-widget">
                        <i class="fas fa-chart-bar empty-icon"></i>
                        <p class="empty-text">추가 위젯 영역</p>
                    </div>
                </div>
            </div>

            <!-- PayPulse 주요 기능 -->
            <div class="features-section">
                <div class="section-header">
                    <div class="header-dot purple"></div>
                    <h2 class="section-title">PayPulse 주요 기능</h2>
                </div>

                <div class="features-grid">
                    <div class="feature-card orange" onclick="navigateToPage('direct-labor')">
                        <div class="feature-icon orange">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <h3 class="feature-title">직접 인건비 관리</h3>
                        <p class="feature-description">직접 인건비의 모든 구성 요소를 실시간으로 모니터링하고 최적화할 수 있습니다. 급여, 수당, 성과급 등을 체계적으로 관리합니다.</p>
                    </div>
                    
                    <div class="feature-card blue" onclick="navigateToPage('indirect-labor')">
                        <div class="feature-icon blue">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <h3 class="feature-title">간접 인건비 관리</h3>
                        <p class="feature-description">복리후생, 교육훈련비, 관리비용 등 간접 인건비를 효과적으로 분석하고 관리할 수 있는 통합 솔루션입니다.</p>
                    </div>
                    
                    <div class="feature-card green" onclick="navigateToPage('ai-analytics')">
                        <div class="feature-icon green">
                            <i class="fas fa-brain"></i>
                        </div>
                        <h3 class="feature-title">AI 기반 분석</h3>
                        <p class="feature-description">머신러닝을 활용한 인건비 패턴 분석과 미래 예측을 통해 더 스마트한 인사 결정을 지원합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 페이지 네비게이션 함수
function navigateToPage(page) {
    console.log(`🔄 ${page} 페이지로 이동`);
    if (typeof showPage === 'function') {
        showPage(page);
    } else {
        alert(`${page} 페이지로 이동합니다.`);
    }
}

// 종합 인건비 대시보드 초기화
function initializeComprehensiveLabor() {
    console.log('🚀 PayPulse 대시보드 초기화 시작');
    
    setTimeout(() => {
        // 카드 슬라이드인 애니메이션
        PayPulseAnimations.slideInCards();
        
        // 숫자 애니메이션 시작
        setTimeout(() => {
            initializeNumberAnimations();
        }, 500);
        
    }, 200);
    
    console.log('✅ PayPulse 대시보드 초기화 완료');
}

// 숫자 애니메이션 초기화
function initializeNumberAnimations() {
    console.log('🔢 숫자 애니메이션 시작');
    
    document.querySelectorAll('.stat-value').forEach((element, index) => {
        const value = parseInt(element.dataset.value);
        const format = element.dataset.format;
        
        setTimeout(() => {
            PayPulseAnimations.animateNumber(element, value, format, 2000);
        }, index * 200);
    });
}

console.log('✅ 종합 인건비 PayPulse 대시보드 시스템 로드 완료');