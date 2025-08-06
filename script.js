// 기본 페이지 전환 및 메뉴 기능
let currentPage = 'dashboard';

// 페이지 전환 함수 개선
function switchPage(pageName) {
    console.log('페이지 전환:', pageName);
    
    // 메뉴 아이템 활성화 상태 변경
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 클릭된 메뉴 활성화
    const activeMenu = document.querySelector(`[data-page="${pageName}"]`);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }
    
    // 페이지 콘텐츠 로드
    updatePageContentWithEvents(pageName);
}

// 페이지 콘텐츠 업데이트 및 이벤트 설정
function updatePageContentWithEvents(pageName) {
    console.log('페이지 콘텐츠 업데이트:', pageName);
    
    const mainDashboard = document.getElementById('main-dashboard');
    const pageContent = document.getElementById('page-content');
    
    if (pageName === 'dashboard') {
        // 대시보드 페이지
        mainDashboard.style.display = 'grid';
        pageContent.innerHTML = '';
    } else {
        // 다른 페이지들
        mainDashboard.style.display = 'none';
        pageContent.innerHTML = getPageContent(pageName);
        
        // 페이지별 이벤트 설정
        setupPageSpecificEvents(pageName);
    }
}

// 페이지별 이벤트 설정
function setupPageSpecificEvents(pageName) {
    console.log('페이지별 이벤트 설정:', pageName);
    
    switch (pageName) {
        case 'data-manager':
            // 새로운 PayPulse 데이터 관리 시스템 초기화
            setTimeout(() => {
                console.log('🎯 새로운 PayPulse 데이터 관리 시스템 초기화 시작');
                if (typeof PayPulseDataManager === 'function') {
                    // 기존 인스턴스가 있다면 정리
                    if (window.dataManager) {
                        console.log('기존 데이터 관리자 정리');
                    }
                    // 새로운 인스턴스 생성
                    window.dataManager = new PayPulseDataManager();
                    window.dataManager.init();
                    console.log('✅ 새로운 PayPulse 데이터 관리 시스템 초기화 완료');
                } else {
                    console.log('paypulse-manager.js 로드 대기 중...');
                    const checkDataManager = setInterval(() => {
                        if (typeof PayPulseDataManager === 'function') {
                            window.dataManager = new PayPulseDataManager();
                            window.dataManager.init();
                            console.log('✅ 새로운 PayPulse 데이터 관리 시스템 초기화 완료 (지연)');
                            clearInterval(checkDataManager);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'ai-chat':
            // AI 채팅 페이지 이벤트 설정 (향후 구현)
            console.log('AI 채팅 페이지 이벤트 설정');
            break;
        case 'insurance':
            // 4대보험 요율 페이지 초기화
        setTimeout(() => {
                console.log('4대보험 요율 페이지 초기화 시작');
                if (typeof initializeInsuranceRates === 'function') {
                    initializeInsuranceRates();
                    console.log('4대보험 요율 차트 초기화 완료');
            } else {
                    console.log('insurance_rates.js 로드 대기 중...');
                    // insurance_rates.js 로드 완료 대기
                    const checkInsuranceRates = setInterval(() => {
                        if (typeof initializeInsuranceRates === 'function') {
                            initializeInsuranceRates();
                            console.log('4대보험 요율 차트 초기화 완료 (지연)');
                            clearInterval(checkInsuranceRates);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'calculation':
            // 스마트 인건비 계산기 초기화
            setTimeout(() => {
                console.log('스마트 인건비 계산기 초기화 시작');
                if (typeof initializeSalaryCalculator === 'function') {
                    initializeSalaryCalculator();
                    console.log('스마트 인건비 계산기 초기화 완료');
        } else {
                    console.log('salary_calculator.js 로드 대기 중...');
                    // salary_calculator.js 로드 완료 대기
                    const checkSalaryCalculator = setInterval(() => {
                        if (typeof initializeSalaryCalculator === 'function') {
                            initializeSalaryCalculator();
                            console.log('스마트 인건비 계산기 초기화 완료 (지연)');
                            clearInterval(checkSalaryCalculator);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'comprehensive-labor':
            // 종합 인건비 페이지 - 새로운 종합 인건비 시스템 초기화
            setTimeout(() => {
                console.log('종합 인건비 페이지 초기화 시작');
                
                // comprehensive_labor.js의 HTML 가져오기
                if (typeof getComprehensiveLaborHTML === 'function') {
                    const container = document.getElementById('comprehensive-labor-content');
                    if (container) {
                        container.innerHTML = getComprehensiveLaborHTML();
                        console.log('종합 인건비 HTML 삽입 완료');
                        
                        // 종합 인건비 차트 초기화
                        if (typeof initializeComprehensiveLabor === 'function') {
            setTimeout(() => {
                                initializeComprehensiveLabor();
                                console.log('종합 인건비 시스템 초기화 완료');
                            }, 100);
                        }
                }
            } else {
                    console.log('comprehensive_labor.js 로드 대기 중...');
                    // comprehensive_labor.js 로드 완료 대기
                    const checkComprehensiveLabor = setInterval(() => {
                        if (typeof getComprehensiveLaborHTML === 'function') {
                            const container = document.getElementById('comprehensive-labor-content');
                            if (container) {
                                container.innerHTML = getComprehensiveLaborHTML();
                                console.log('종합 인건비 HTML 삽입 완료 (지연)');
                                
                                // 종합 인건비 차트 초기화
                                if (typeof initializeComprehensiveLabor === 'function') {
            setTimeout(() => {
                                        initializeComprehensiveLabor();
                                        console.log('종합 인건비 시스템 초기화 완료 (지연)');
                                    }, 100);
                                }
                            }
                            clearInterval(checkComprehensiveLabor);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'direct-labor':
            // 직접 인건비 페이지 초기화
            setTimeout(() => {
                console.log('💼 직접 인건비 페이지 초기화 시작');
                if (typeof initializeDirectLabor === 'function') {
                    initializeDirectLabor();
                    console.log('✅ 직접 인건비 시스템 초기화 완료');
                } else {
                    console.log('direct_labor.js 로드 대기 중...');
                    const checkDirectLabor = setInterval(() => {
                        if (typeof initializeDirectLabor === 'function') {
                            initializeDirectLabor();
                            console.log('✅ 직접 인건비 시스템 초기화 완료 (지연)');
                            clearInterval(checkDirectLabor);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'indirect-labor':
            // 간접 인건비 페이지 초기화
            setTimeout(() => {
                console.log('🏢 간접 인건비 페이지 초기화 시작');
                if (typeof initializeIndirectLabor === 'function') {
                    initializeIndirectLabor();
                    console.log('✅ 간접 인건비 시스템 초기화 완료');
                } else {
                    console.log('indirect_labor.js 로드 대기 중...');
                    const checkIndirectLabor = setInterval(() => {
                        if (typeof initializeIndirectLabor === 'function') {
                            initializeIndirectLabor();
                            console.log('✅ 간접 인건비 시스템 초기화 완료 (지연)');
                            clearInterval(checkIndirectLabor);
                        }
                    }, 100);
                }
            }, 200);
            break;
        case 'expert-analysis':
            console.log('🔧 전문가 분석&예측 페이지 이벤트 설정 시작');
            
            setTimeout(() => {
                console.log('🚀 전문가 분석 초기화 시작');
                if (typeof initializeExpertAnalysis === 'function') {
                    initializeExpertAnalysis();
                    console.log('✅ 전문가 분석 시스템 초기화 완료');
                } else {
                    console.log('expert_analysis.js 로드 대기 중...');
                    const checkExpertAnalysis = setInterval(() => {
                        if (typeof initializeExpertAnalysis === 'function') {
                            initializeExpertAnalysis();
                            console.log('✅ 전문가 분석 시스템 초기화 완료 (지연)');
                            clearInterval(checkExpertAnalysis);
                        }
                    }, 100);
                }
            }, 200);
            break;
        default:
            console.log('기본 페이지 이벤트 설정');
    }
}

// 기본 페이지 콘텐츠 함수
function getPageContent(pageName) {
    switch (pageName) {
        case 'data-manager':
            // 새로운 PayPulse 데이터 관리 HTML 반환
            return `
                <div id="app">
                    <!-- 헤더 -->
                    <header class="pdm-header">
                        <div class="header-content">
                            <h1>📊 PayPulse 데이터 관리</h1>
                            <p>스마트한 급여 데이터 관리 시스템</p>
                        </div>
                        <!-- 헤더 통계 - 의미있는 정보만 -->
                        <div class="header-stats">
                            <div class="stat-item">
                                <span class="stat-label">업로드된 파일</span>
                                <span class="stat-value" id="fileCountHeader">0개</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">최근 업로드</span>
                                <span class="stat-value" id="lastUploadDate">-</span>
                            </div>
                        </div>
                    </header>

                    <!-- 네비게이션 -->
                    <nav class="pdm-navigation">
                        <button class="nav-btn active" data-view="dashboard">🏠 대시보드</button>
                        <button class="nav-btn" data-view="upload">📤 업로드</button>
                        <button class="nav-btn" data-view="history">📋 히스토리</button>
                        <button class="nav-btn" data-view="preview" id="previewBtn" style="display: none;">👁️ 미리보기</button>
                    </nav>

                    <!-- 메인 컨텐츠 -->
                    <main class="pdm-content">
                        <!-- 대시보드 뷰 -->
                        <div id="dashboardView" class="view-container">
                            <!-- 대시보드 그리드 - 의미없는 카드 제거 -->
                            <div class="dashboard-grid">
                                <div class="dashboard-card">
                                    <h3>📁 업로드된 파일</h3>
                                    <div class="file-count" id="fileCount">0개</div>
                                    <div class="file-types">
                                        <span>템플릿: <span id="templateCount">0</span></span>
                                        <span>급여대장: <span id="payrollCount">0</span></span>
                                    </div>
                                </div>
                                
                                <div class="dashboard-card">
                                    <h3>📊 데이터 현황</h3>
                                    <div class="data-overview">
                                        <div>개별 파일별로</div>
                                        <div>데이터를 관리합니다</div>
                                        <div class="data-note">누적 계산하지 않음</div>
                                    </div>
                                </div>

                                <div class="dashboard-card quick-upload">
                                    <h3>⚡ 빠른 업로드</h3>
                                    <button class="quick-upload-btn" id="quickUploadBtn">
                                        새 파일 업로드
                                    </button>
                                </div>

                                <div class="dashboard-card">
                                    <h3>🔍 데이터 분석</h3>
                                    <div class="analysis-info">
                                        <div>각 파일을 개별적으로</div>
                                        <div>미리보기에서 확인하세요</div>
                                        <button class="analysis-btn" id="analysisBtn">
                                            파일 목록 보기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="recent-files" id="recentFiles" style="display: none;">
                                <h3>최근 업로드된 파일</h3>
                                <div class="recent-files-list" id="recentFilesList"></div>
                            </div>
                        </div>

                        <!-- 업로드 뷰 -->
                        <div id="uploadView" class="view-container" style="display: none;">
                            <div class="upload-container">
                                <h2>📤 파일 업로드</h2>
                                
                                <div class="upload-zone" id="uploadZone">
                                    <div class="upload-content">
                                        <div class="upload-icon">📁</div>
                                        <h3>파일을 드래그하거나 클릭하여 업로드</h3>
                                        <p>Excel (.xlsx, .xls), CSV 파일을 지원합니다</p>
                                        <button class="upload-btn" id="selectFileBtn">파일 선택</button>
                                    </div>
                                    <div class="uploading" id="uploadingIndicator" style="display: none;">
                                        <div class="spinner"></div>
                                        <p>업로드 중...</p>
                                    </div>
                                </div>

                                <!-- 숨겨진 파일 입력 -->
                                <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" style="display: none;">

                                <div class="upload-guide">
                                    <h4>📋 업로드 가이드</h4>
                                    <ul>
                                        <li>Excel 파일(.xlsx, .xls) 또는 CSV 파일을 업로드할 수 있습니다</li>
                                        <li>파일명에 "템플릿"이 포함되면 템플릿으로 자동 분류됩니다</li>
                                        <li>파일명에 "급여"가 포함되면 급여대장으로 자동 분류됩니다</li>
                                        <li>업로드된 파일은 즉시 미리보기에서 확인할 수 있습니다</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- 히스토리 뷰 -->
                        <div id="historyView" class="view-container" style="display: none;">
                            <h2>📋 업로드 히스토리</h2>
                            
                            <div class="empty-state" id="emptyState">
                                <p>아직 업로드된 파일이 없습니다.</p>
                                <button class="upload-btn" id="emptyUploadBtn">
                                    첫 번째 파일 업로드하기
                                </button>
                            </div>

                            <div class="files-list" id="filesList" style="display: none;"></div>
                        </div>

                        <!-- 미리보기 뷰 -->
                        <div id="previewView" class="view-container" style="display: none;">
                            <div class="preview-header">
                                <h2 id="previewTitle">👁️ 파일 미리보기</h2>
                                <div class="preview-info" id="previewInfo"></div>
                            </div>

                            <div class="preview-content" id="previewContent"></div>

                            <div class="preview-actions">
                                <button class="delete-btn" id="deleteCurrentBtn">
                                    🗑️ 파일 삭제
                                </button>
                                <button class="view-btn" id="exportBtn">
                                    📊 PayPulse 연동
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            `;
            break;
            
        case 'insurance':
            // insurance_rates.js에서 HTML을 가져옴
            if (typeof getInsuranceRatesHTML === 'function') {
                return getInsuranceRatesHTML();
            } else {
                return `
            <div class="page-header">
                        <h2><i class="fas fa-shield-alt"></i> 4대 보험 요율</h2>
                        <p>4대보험 요율 시스템을 로드하는 중...</p>
            </div>
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>4대보험 요율 차트를 로드하는 중...</p>
                        </div>
                `;
            }
            break;
            
        case 'calculation':
            return getSmartSalaryCalculatorHTML();
            break;

        case 'provision':
            return `
            <div class="page-header">
                    <h2><i class="fas fa-chart-line"></i> 퇴직충당금</h2>
                    <p>퇴직충당금을 관리하고 분석하세요</p>
            </div>
                <div class="coming-soon">
                    <i class="fas fa-chart-line"></i>
                    <h3>퇴직충당금</h3>
                    <p>퇴직충당금 관리 기능이 곧 추가됩니다</p>
                </div>
            `;
            break;
            
        case 'ai-chat':
            return `
    <div class="page-header">
        <h2><i class="fas fa-robot"></i> AI 어시스턴트</h2>
                    <p>AI와 대화하며 인건비 관련 질문을 해보세요</p>
    </div>
                <div class="coming-soon">
                    <i class="fas fa-robot"></i>
                    <h3>AI 어시스턴트</h3>
                    <p>AI 채팅 기능이 곧 추가됩니다</p>
            </div>
            `;
        case 'analytics':
            // ai_analytics.js에서 HTML을 가져옴
            if (typeof getAIAnalyticsHTML === 'function') {
                return getAIAnalyticsHTML();
            } else {
                return `
                    <div class="page-header">
                        <h2><i class="fas fa-brain"></i> AI 진단 분석</h2>
                        <p>AI 기반 데이터 진단 및 분석을 수행하세요</p>
                    </div>
                    <div class="coming-soon">
                        <i class="fas fa-brain"></i>
                        <h3>AI 진단 분석</h3>
                        <p>AI 진단 분석 기능을 로드하는 중...</p>
                    </div>
                `;
            }

        case 'reports':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-file-alt"></i> 급여명세서</h2>
                    <p>급여명세서를 생성하고 관리하세요</p>
                        </div>
                <div class="coming-soon">
                    <i class="fas fa-file-alt"></i>
                    <h3>급여명세서</h3>
                    <p>급여명세서 생성 기능이 곧 추가됩니다</p>
                    </div>
            `;
        case 'risk-matrix':
            return `
            <div class="page-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> 리스크 매트릭스</h2>
                    <p>인건비 관련 리스크를 분석하세요</p>
            </div>
                <div class="coming-soon">
                            <i class="fas fa-exclamation-triangle"></i>
                    <h3>리스크 매트릭스</h3>
                    <p>리스크 매트릭스 기능이 곧 추가됩니다</p>
                        </div>
            `;
        case 'direct-labor':
            // direct_labor.js에서 HTML을 가져옴
            if (typeof getDirectLaborHTML === 'function') {
                return getDirectLaborHTML();
            } else {
                return `
                    <div class="page-header">
                        <h2><i class="fas fa-users-cog"></i> 직접 인건비 관리</h2>
                        <p>생산활동에 직접 투입되는 인력 비용 관리</p>
                    </div>
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>직접 인건비 시스템을 로드하는 중...</p>
                    </div>
                `;
            }
        case 'indirect-labor':
            // indirect_labor.js에서 HTML을 가져옴
            if (typeof getIndirectLaborHTML === 'function') {
                return getIndirectLaborHTML();
            } else {
                return `
                    <div class="page-header">
                        <h2><i class="fas fa-heart"></i> 간접 인건비 관리</h2>
                        <p>복리후생 및 관리·지원 업무 관련 비용 관리</p>
                    </div>
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>간접 인건비 시스템을 로드하는 중...</p>
                    </div>
                `;
            }
        case 'comprehensive-labor':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-chart-line"></i> 종합 인건비 관리</h2>
                    <p>AI 기반 전문가 수준의 인건비 분석 및 예측</p>
                        </div>
                <div id="comprehensive-labor-content">
                    <!-- 전문가 분석&예측 내용이 여기에 로드됩니다 -->
                    <div class="expert-analysis-container">
                        <div class="loading-message">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>전문가 분석 시스템을 로드하는 중...</p>
                    </div>
                        </div>
                        </div>
            `;
        case 'expert-analysis':
            // expert_analysis.js에서 HTML을 가져옴
            if (typeof getExpertAnalysisHTML === 'function') {
                return getExpertAnalysisHTML();
            } else {
                return `
                    <div class="page-header">
                        <h2><i class="fas fa-brain"></i> 전문가 분석&예측</h2>
                        <p>AI 기반 고급 인건비 분석 및 예측 시스템</p>
                    </div>
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>전문가 분석&예측 시스템을 로드하는 중...</p>
                    </div>
                `;
            }
        default:
            return '<p>페이지를 찾을 수 없습니다.</p>';
    }
}

// 스마트 인건비 계산기 HTML 생성 (네오모피즘 스타일)
function getSmartSalaryCalculatorHTML() {
    return `
        <div class="salary-calculator-page" style="max-width: 1200px; margin: 0 auto; padding: 2rem; background: #e0e7ff; min-height: 100vh;">
            <!-- 페이지 헤더 (네오모피즘) -->
            <div style="text-align: center; margin-bottom: 3rem; padding: 3rem 2rem; background: #e0e7ff; border-radius: 20px; box-shadow: 20px 20px 40px #c7d2fe, -20px -20px 40px #f9fafb;">
                <h1 style="font-size: 2.8rem; margin-bottom: 0.5rem; font-weight: 800; color: #374151; letter-spacing: -0.02em;">
                    <i class="fas fa-calculator" style="color: #6366f1; margin-right: 0.5rem;"></i>스마트 인건비 계산기
                </h1>
                <p style="font-size: 1.1rem; color: #6b7280; margin: 0; font-weight: 400;">다양한 수당과 급여를 정확하게 계산하는 올인원 계산기</p>
                    </div>
                    
            <!-- 계산기 탭 네비게이션 (네오모피즘) -->
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; background: #e0e7ff; padding: 1.5rem; border-radius: 16px; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb; justify-content: center;">
                <div class="calc-tab active" data-tab="salary" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 600; color: #6366f1; background: #e0e7ff; box-shadow: 8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-wallet" style="margin-right: 0.5rem;"></i>직원급여
                        </div>
                <div class="calc-tab" data-tab="annual-leave" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-calendar-alt" style="margin-right: 0.5rem;"></i>연차수당
                        </div>
                <div class="calc-tab" data-tab="overtime" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-clock" style="margin-right: 0.5rem;"></i>연장근로수당
                    </div>
                <div class="calc-tab" data-tab="parental-leave" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-baby" style="margin-right: 0.5rem;"></i>육아휴직급여
                </div>
                <div class="calc-tab" data-tab="reduced-hours" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-user-clock" style="margin-right: 0.5rem;"></i>단축근로
                        </div>
                <div class="calc-tab" data-tab="holiday-work" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-calendar-check" style="margin-right: 0.5rem;"></i>휴일근로
                        </div>
                <div class="calc-tab" data-tab="retirement" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-piggy-bank" style="margin-right: 0.5rem;"></i>퇴직금(DB/DC)
                        </div>
                <div class="calc-tab" data-tab="insurance" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-shield-alt" style="margin-right: 0.5rem;"></i>4대보험료
                    </div>
                <div class="calc-tab" data-tab="minimum-wage" style="padding: 1rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500; color: #6b7280; background: #e0e7ff; box-shadow: inset 4px 4px 8px #c7d2fe, inset -4px -4px 8px #f9fafb; transition: all 0.3s ease;">
                    <i class="fas fa-balance-scale" style="margin-right: 0.5rem;"></i>최저임금검증
                </div>
            </div>

            <!-- 계산기 컨텐츠 영역 (네오모피즘) -->
            <div id="calculator-content" style="margin-bottom: 2rem;">
                <!-- 각 계산기가 동적으로 로드됩니다 -->
                </div>

            <!-- 계산 결과 영역 (네오모피즘) -->
            <div id="calculation-results" style="display: none; background: #e0e7ff; border-radius: 16px; padding: 2rem; box-shadow: 20px 20px 40px #c7d2fe, -20px -20px 40px #f9fafb;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #374151; margin: 0; font-weight: 700; font-size: 1.5rem;">
                        <i class="fas fa-chart-bar" style="color: #6366f1; margin-right: 0.5rem;"></i>계산 결과
                    </h3>
                    <button onclick="exportCalculationResult()" style="background: #e0e7ff; color: #6366f1; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; cursor: pointer; font-size: 0.9rem; font-weight: 600; box-shadow: 8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb; transition: all 0.3s ease;">
                        <i class="fas fa-copy" style="margin-right: 0.3rem;"></i>결과 복사
                            </button>
                        </div>
                <div id="result-content" style="background: #e0e7ff; border-radius: 12px; padding: 1.5rem; box-shadow: inset 8px 8px 16px #c7d2fe, inset -8px -8px 16px #f9fafb;">
                    <!-- 계산 결과가 여기에 표시됩니다 -->
                            </div>
                        </div>
                        
            <!-- 네오모피즘 스타일 적용을 위한 CSS -->
            <style>
                .calc-tab.active {
                    box-shadow: 8px 8px 16px #c7d2fe, -8px -8px 16px #f9fafb !important;
                    color: #6366f1 !important;
                }
                .calc-tab:hover {
                    transform: translateY(-2px);
                    box-shadow: 12px 12px 20px #c7d2fe, -12px -12px 20px #f9fafb !important;
                }
                .calc-tab:active {
                    transform: translateY(0px);
                    box-shadow: inset 6px 6px 12px #c7d2fe, inset -6px -6px 12px #f9fafb !important;
                }
            </style>
        </div>
    `;
}

// 메뉴 클릭 이벤트 설정
function setupMenuEvents() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            if (pageName) {
            switchPage(pageName);
            }
        });
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupMenuEvents();
});



// 급여 데이터 전용 처리 함수들
let salaryData = []; // 급여 데이터 저장
let dataAnalysis = {}; // 분석 결과 저장

// 급여 데이터 분석 함수
function analyzeSalaryData(data) {
    const analysis = {
        totalRecords: data.length,
        uniqueEmployees: new Set(data.map(d => d.사번)).size,
        departments: [...new Set(data.map(d => d.조직))].filter(d => d),
        payPeriods: [...new Set(data.map(d => d.급여일_급여유형))].filter(d => d),
        yearRange: {
            min: Math.min(...data.map(d => d.연도).filter(y => y)),
            max: Math.max(...data.map(d => d.연도).filter(y => y))
        },
        companies: [...new Set(data.map(d => d.급여영역))].filter(d => d),
        positions: [...new Set(data.map(d => d.직급))].filter(d => d),
        totalPayment: data.reduce((sum, d) => sum + (d.실지급액 || 0), 0),
        totalDeduction: data.reduce((sum, d) => sum + (d.공제총액 || 0), 0)
    };
    
    // 부서별 통계
    analysis.departmentStats = analysis.departments.map(dept => {
        const deptData = data.filter(d => d.조직 === dept);
        return {
            name: dept,
            employeeCount: new Set(deptData.map(d => d.사번)).size,
            totalPay: deptData.reduce((sum, d) => sum + (d.실지급액 || 0), 0),
            avgPay: deptData.length > 0 ? deptData.reduce((sum, d) => sum + (d.실지급액 || 0), 0) / deptData.length : 0
        };
    });
    
    // 직급별 통계
    analysis.positionStats = analysis.positions.map(pos => {
        const posData = data.filter(d => d.직급 === pos);
        return {
            name: pos,
            employeeCount: new Set(posData.map(d => d.사번)).size,
            totalPay: posData.reduce((sum, d) => sum + (d.실지급액 || 0), 0),
            avgPay: posData.length > 0 ? posData.reduce((sum, d) => sum + (d.실지급액 || 0), 0) / posData.length : 0
        };
    });
    
    return analysis;
}

// 급여 데이터 전용 JSON 처리
function processSalaryJsonData(data, fileName) {
    console.log('급여 데이터 처리 시작:', data.length, '건');
    
    // 데이터 저장
    salaryData = data;
    dataAnalysis = analyzeSalaryData(data);
    
    // 로컬 스토리지에 저장 (큰 데이터는 일부만)
    try {
        const sampleData = data.slice(0, 100); // 처음 100건만 저장
        localStorage.setItem('paypulse_salary_data', JSON.stringify(sampleData));
        localStorage.setItem('paypulse_analysis', JSON.stringify(dataAnalysis));
    } catch (e) {
        console.warn('로컬 스토리지 저장 실패:', e);
    }
    
    // 업로드 성공 표시
    showSalaryUploadSuccess(fileName, dataAnalysis);
}

// 급여 데이터 업로드 성공 표시
function showSalaryUploadSuccess(fileName, analysis) {
    const successHtml = `
        <div class="salary-upload-success">
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h3>급여 데이터 업로드 완료!</h3>
                <p class="file-name">${fileName}</p>
        </div>
            
            <div class="data-summary">
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-database"></i></div>
                        <div class="card-content">
                            <h4>${analysis.totalRecords.toLocaleString()}</h4>
                            <p>총 급여 레코드</p>
            </div>
            </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-users"></i></div>
                        <div class="card-content">
                            <h4>${analysis.uniqueEmployees}</h4>
                            <p>고유 직원 수</p>
            </div>
                    </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-building"></i></div>
                        <div class="card-content">
                            <h4>${analysis.departments.length}</h4>
                            <p>부서 수</p>
                    </div>
                    </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-calendar"></i></div>
                        <div class="card-content">
                            <h4>${analysis.yearRange.min}-${analysis.yearRange.max}</h4>
                            <p>데이터 기간</p>
                </div>
            </div>
        </div>
                
                <div class="financial-summary">
                    <div class="financial-card total-pay">
                        <h4>총 지급액</h4>
                        <p class="amount">₩${analysis.totalPayment.toLocaleString()}</p>
        </div>
                    <div class="financial-card total-deduction">
                        <h4>총 공제액</h4>
                        <p class="amount">₩${analysis.totalDeduction.toLocaleString()}</p>
                </div>
                    <div class="financial-card net-pay">
                        <h4>순 지급액</h4>
                        <p class="amount">₩${(analysis.totalPayment - analysis.totalDeduction).toLocaleString()}</p>
            </div>
                </div>
            </div>
            
            <div class="quick-insights">
                <h4><i class="fas fa-lightbulb"></i> 데이터 인사이트</h4>
                <div class="insight-list">
                    <div class="insight-item">
                        <span class="insight-label">주요 회사:</span>
                        <span class="insight-value">${analysis.companies.join(', ')}</span>
                            </div>
                    <div class="insight-item">
                        <span class="insight-label">최다 부서:</span>
                        <span class="insight-value">${analysis.departmentStats.sort((a, b) => b.employeeCount - a.employeeCount)[0]?.name || 'N/A'}</span>
                </div>
                    <div class="insight-item">
                        <span class="insight-label">급여 유형:</span>
                        <span class="insight-value">${analysis.payPeriods.length}가지 유형</span>
            </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn" onclick="showDetailedAnalysis()">
                    <i class="fas fa-chart-bar"></i>
                    상세 분석 보기
                </button>
                <button class="btn btn-secondary" onclick="startAIAnalysis()">
                    <i class="fas fa-robot"></i>
                    AI 분석 시작
                </button>
                <button class="btn btn-outline" onclick="exportSummary()">
                    <i class="fas fa-download"></i>
                    요약 리포트 다운로드
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('page-content').innerHTML = getUploadPageContent() + successHtml;
    
    // 파일 입력 이벤트 다시 연결
    setupFileUploadEvents();
}

// 상세 분석 보기
function showDetailedAnalysis() {
    if (!dataAnalysis || Object.keys(dataAnalysis).length === 0) {
        alert('분석할 데이터가 없습니다.');
        return;
    }
    
    const analysisHtml = `
        <div class="detailed-analysis">
            <div class="analysis-header">
                <h2><i class="fas fa-chart-line"></i> 상세 데이터 분석</h2>
                <p>업로드된 급여 데이터의 종합 분석 결과입니다</p>
            </div>
            
            <div class="analysis-tabs">
                <button class="tab-btn active" onclick="showAnalysisTab('department')">부서별 분석</button>
                <button class="tab-btn" onclick="showAnalysisTab('position')">직급별 분석</button>
                <button class="tab-btn" onclick="showAnalysisTab('trend')">트렌드 분석</button>
                <button class="tab-btn" onclick="showAnalysisTab('insurance')">4대보험 분석</button>
        </div>
            
            <div class="analysis-content">
                <div id="department-analysis" class="analysis-tab-content active">
                    ${generateDepartmentAnalysis()}
            </div>
                <div id="position-analysis" class="analysis-tab-content">
                    ${generatePositionAnalysis()}
            </div>
                <div id="trend-analysis" class="analysis-tab-content">
                    <div class="coming-soon">
                        <i class="fas fa-chart-line"></i>
                        <h3>트렌드 분석</h3>
                        <p>시계열 분석 및 예측 기능이 곧 추가됩니다</p>
            </div>
                </div>
                <div id="insurance-analysis" class="analysis-tab-content">
                    <div class="coming-soon">
                        <i class="fas fa-shield-alt"></i>
                        <h3>4대보험 분석</h3>
                        <p>보험료 최적화 분석 기능이 곧 추가됩니다</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('page-content').innerHTML = analysisHtml;
}

// 부서별 분석 생성
function generateDepartmentAnalysis() {
    const sortedDepts = dataAnalysis.departmentStats.sort((a, b) => b.totalPay - a.totalPay);
    
    let html = `
        <div class="analysis-section">
            <h3>부서별 급여 현황</h3>
            <div class="analysis-table-container">
                <table class="analysis-table">
                    <thead>
                        <tr>
                            <th>부서명</th>
                            <th>직원 수</th>
                            <th>총 지급액</th>
                            <th>평균 지급액</th>
                            <th>비율</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    const totalPay = sortedDepts.reduce((sum, d) => sum + d.totalPay, 0);
    
    sortedDepts.forEach(dept => {
        const percentage = totalPay > 0 ? (dept.totalPay / totalPay * 100).toFixed(1) : 0;
        html += `
            <tr>
                <td class="dept-name">${dept.name}</td>
                <td>${dept.employeeCount}명</td>
                <td class="amount">₩${dept.totalPay.toLocaleString()}</td>
                <td class="amount">₩${Math.round(dept.avgPay).toLocaleString()}</td>
                <td>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${percentage}%"></div>
                        <span class="percentage-text">${percentage}%</span>
            </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
                    </div>
                </div>
            `;
            
    return html;
}

// 직급별 분석 생성
function generatePositionAnalysis() {
    const sortedPositions = dataAnalysis.positionStats.sort((a, b) => b.avgPay - a.avgPay);
    
    let html = `
        <div class="analysis-section">
            <h3>직급별 급여 현황</h3>
            <div class="analysis-table-container">
                <table class="analysis-table">
                    <thead>
                        <tr>
                            <th>직급</th>
                            <th>직원 수</th>
                            <th>총 지급액</th>
                            <th>평균 지급액</th>
                            <th>급여 수준</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    const maxAvgPay = Math.max(...sortedPositions.map(p => p.avgPay));
    
    sortedPositions.forEach(pos => {
        const level = maxAvgPay > 0 ? (pos.avgPay / maxAvgPay * 100) : 0;
        html += `
            <tr>
                <td class="position-name">${pos.name}</td>
                <td>${pos.employeeCount}명</td>
                <td class="amount">₩${pos.totalPay.toLocaleString()}</td>
                <td class="amount">₩${Math.round(pos.avgPay).toLocaleString()}</td>
                <td>
                    <div class="level-indicator">
                        <div class="level-bar" style="width: ${level}%"></div>
                        <span class="level-text">${level.toFixed(0)}%</span>
                </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

// 분석 탭 전환
function showAnalysisTab(tabName) {
    // 모든 탭 버튼과 콘텐츠 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analysis-tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    event.target.classList.add('active');
    document.getElementById(`${tabName}-analysis`).classList.add('active');
}

// AI 분석 시작
function startAIAnalysis() {
    if (!salaryData || salaryData.length === 0) {
        alert('분석할 데이터가 없습니다.');
        return;
    }
    
    // AI 채팅 페이지로 이동하면서 데이터 분석 모드 활성화
    switchPage('ai-chat');
    
    setTimeout(() => {
        const aiMessage = `
            급여 데이터가 성공적으로 로드되었습니다! 🎉
            
            📊 <strong>데이터 요약</strong>:
            • 총 ${dataAnalysis.totalRecords.toLocaleString()}건의 급여 레코드
            • ${dataAnalysis.uniqueEmployees}명의 직원 데이터
            • ${dataAnalysis.departments.length}개 부서, ${dataAnalysis.companies.length}개 회사
            • ${dataAnalysis.yearRange.min}~${dataAnalysis.yearRange.max}년 데이터
            
            이제 다음과 같은 질문을 해보세요:
            • "부서별 평균 급여가 가장 높은 곳은?"
            • "시간외 근무가 많은 부서 분석해줘"
            • "내년 인건비 예상 증가율은?"
            • "4대보험료 최적화 방안은?"
            • "퇴직금 충당금은 얼마나 필요할까?"
            
            무엇이 궁금하신가요? 💭
        `;
        
        addMessage('ai', aiMessage);
    }, 500);
}

// 누락된 함수들 정의
function processCsvData(csvText, fileName) {
    console.log('CSV 데이터 처리:', fileName);
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        rows.push(row);
    }
    
    processJsonData(rows, fileName);
}

function processExcelData(arrayBuffer, fileName) {
    console.log('Excel 데이터 처리:', fileName);
    alert('Excel 파일 처리 기능은 곧 구현됩니다!');
}

function updateDataPreview(data, type) {
    console.log('데이터 미리보기 업데이트:', type);
    // 미리보기 업데이트 로직
}

function generatePreviewTable(data, type) {
    if (!data || data.length === 0) return '<p>데이터가 없습니다.</p>';
    
    const sampleData = data.slice(0, 5); // 첫 5개 행만 미리보기
    const headers = Object.keys(sampleData[0]);
    
    let tableHtml = '<table class="preview-table-content"><thead><tr>';
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    sampleData.forEach(row => {
        tableHtml += '<tr>';
        headers.forEach(header => {
            tableHtml += `<td>${row[header] || ''}</td>`;
        });
        tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table>';
    return tableHtml;
}

// 기본 JSON 처리 함수 정의
function processJsonData(data, fileName) {
    console.log('기본 JSON 데이터 처리:', data);
    // 기본 처리 로직 - 단순히 데이터를 표시
    alert(`${fileName} 파일이 업로드되었습니다. ${Array.isArray(data) ? data.length : Object.keys(data).length}개의 항목이 있습니다.`);
}

// 급여 데이터 전용 JSON 처리 함수
const originalProcessJsonData = processJsonData;
processJsonData = function(data, fileName) {
    // 급여 데이터인지 확인 (사번, 성명, 급여일_급여유형 필드가 있으면 급여 데이터로 판단)
    if (Array.isArray(data) && data.length > 0 && 
        data[0].hasOwnProperty('사번') && 
        data[0].hasOwnProperty('성명') && 
        data[0].hasOwnProperty('급여일_급여유형')) {
        
        processSalaryJsonData(data, fileName);
    } else {
        originalProcessJsonData(data, fileName);
    }
};



// 요약 리포트 내보내기
function exportSummary() {
    if (!dataAnalysis) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    
    const reportData = {
        generatedAt: new Date().toISOString(),
        summary: dataAnalysis,
        departmentRanking: dataAnalysis.departmentStats.sort((a, b) => b.avgPay - a.avgPay),
        positionRanking: dataAnalysis.positionStats.sort((a, b) => b.avgPay - a.avgPay)
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `PayPulse_분석리포트_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}
