// AI 진단 분석 시스템
// 인건비 데이터를 기반으로 한 종합적인 AI 분석 기능

// AI 진단 분석 메인 HTML 생성
function getAIAnalyticsHTML() {
    return `
        <div class="analytics-container">
            <!-- 헤더 섹션 -->
            <div class="analytics-header">
                <div class="header-content">
                    <div class="header-text">
                        <h1><i class="fas fa-brain"></i> AI 진단 분석</h1>
                        <p>인공지능이 당신의 인건비 데이터를 분석하여 숨겨진 인사이트를 발견합니다</p>
                    </div>
                    <div class="analysis-status" id="analysisStatus">
                        <div class="status-indicator ready">
                            <i class="fas fa-check-circle"></i>
                            <span>분석 준비 완료</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 빠른 분석 대시보드 -->
            <div class="quick-analytics-dashboard">
                <div class="dashboard-card" onclick="startHealthCheck()">
                    <div class="card-icon health">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <div class="card-content">
                        <h3>조직 건강도 진단</h3>
                        <p>급여 분산, 이직률, 만족도 예측</p>
                        <div class="card-action">
                            <span>즉시 진단</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card" onclick="startAnomalyDetection()">
                    <div class="card-icon anomaly">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="card-content">
                        <h3>이상 데이터 탐지</h3>
                        <p>급여 이상치, 패턴 변화 감지</p>
                        <div class="card-action">
                            <span>탐지 시작</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card" onclick="startTrendAnalysis()">
                    <div class="card-icon trend">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-content">
                        <h3>트렌드 예측</h3>
                        <p>인건비 증감, 미래 비용 예측</p>
                        <div class="card-action">
                            <span>예측하기</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card" onclick="startBenchmarking()">
                    <div class="card-icon benchmark">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                    <div class="card-content">
                        <h3>업계 벤치마킹</h3>
                        <p>동종업계 대비 급여 수준 비교</p>
                        <div class="card-action">
                            <span>비교하기</span>
                            <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 분석 결과 영역 -->
            <div class="analysis-results" id="analysisResults" style="display: none;">
                <!-- 동적으로 로드될 분석 결과 -->
            </div>

            <!-- AI 인사이트 히스토리 -->
            <div class="insights-history">
                <div class="section-header">
                    <h3><i class="fas fa-history"></i> 최근 AI 인사이트</h3>
                    <button class="btn btn-outline" onclick="clearInsightHistory()">히스토리 초기화</button>
                </div>
                <div class="insights-timeline" id="insightsTimeline">
                    ${generateSampleInsights()}
                </div>
            </div>

            <!-- 분석 설정 패널 -->
            <div class="analysis-settings">
                <h3><i class="fas fa-cogs"></i> 분석 설정</h3>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>분석 깊이</label>
                        <select id="analysisDepth">
                            <option value="basic">기본 분석</option>
                            <option value="standard" selected>표준 분석</option>
                            <option value="advanced">고급 분석</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>분석 기간</label>
                        <select id="analysisPeriod">
                            <option value="1month">최근 1개월</option>
                            <option value="3months" selected>최근 3개월</option>
                            <option value="6months">최근 6개월</option>
                            <option value="1year">최근 1년</option>
                            <option value="all">전체 기간</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>분석 범위</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" checked> 급여 분석</label>
                            <label><input type="checkbox" checked> 조직 분석</label>
                            <label><input type="checkbox" checked> 성과 분석</label>
                            <label><input type="checkbox"> 예측 분석</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 샘플 인사이트 생성
function generateSampleInsights() {
    const sampleInsights = [
        {
            time: '2시간 전',
            type: 'warning',
            icon: 'exclamation-triangle',
            title: '급여 이상치 감지',
            content: '개발팀에서 평균 대비 120% 높은 급여 지급이 발견되었습니다.',
            action: '상세 분석'
        },
        {
            time: '5시간 전',
            type: 'success',
            icon: 'check-circle',
            title: '조직 건강도 양호',
            content: '전체 조직의 급여 만족도가 88%로 업계 평균을 상회합니다.',
            action: '리포트 보기'
        },
        {
            time: '1일 전',
            type: 'info',
            icon: 'info-circle',
            title: '계절성 패턴 분석',
            content: 'Q4 대비 Q1 인건비가 평균 12% 증가하는 패턴이 감지되었습니다.',
            action: '트렌드 보기'
        },
        {
            time: '2일 전',
            type: 'trend',
            icon: 'chart-line',
            title: '인건비 예측 업데이트',
            content: '다음 분기 예상 인건비: 12.5억원 (현재 대비 +8.3%)',
            action: '예측 모델'
        }
    ];

    return sampleInsights.map(insight => `
        <div class="insight-item ${insight.type}">
            <div class="insight-icon">
                <i class="fas fa-${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-header">
                    <h4>${insight.title}</h4>
                    <span class="insight-time">${insight.time}</span>
                </div>
                <p>${insight.content}</p>
                <button class="insight-action">${insight.action}</button>
            </div>
        </div>
    `).join('');
}

// 조직 건강도 진단
function startHealthCheck() {
    showAnalysisProgress('조직 건강도 진단 중...');
    
    setTimeout(() => {
        const healthResults = generateHealthCheckResults();
        showAnalysisResults('조직 건강도 진단', healthResults);
    }, 2000);
}

// 조직 건강도 결과 생성
function generateHealthCheckResults() {
    return `
        <div class="health-check-results">
            <div class="health-score-card">
                <div class="score-display">
                    <div class="score-circle">
                        <div class="score-number">85</div>
                        <div class="score-label">점</div>
                    </div>
                    <div class="score-status excellent">우수</div>
                </div>
                <div class="score-breakdown">
                    <div class="metric">
                        <span class="metric-label">급여 형평성</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 88%"></div>
                        </div>
                        <span class="metric-value">88점</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">조직 안정성</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 82%"></div>
                        </div>
                        <span class="metric-value">82점</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">성장 잠재력</span>
                        <div class="metric-bar">
                            <div class="metric-fill" style="width: 85%"></div>
                        </div>
                        <span class="metric-value">85점</span>
                    </div>
                </div>
            </div>

            <div class="health-insights">
                <h4><i class="fas fa-lightbulb"></i> AI 분석 인사이트</h4>
                <div class="insight-cards">
                    <div class="insight-card positive">
                        <h5>강점</h5>
                        <ul>
                            <li>급여 수준이 업계 평균 대비 112% 수준으로 경쟁력 있음</li>
                            <li>부서별 급여 편차가 15% 이내로 형평성 우수</li>
                            <li>신입 대비 경력직 급여 체계가 잘 설계됨</li>
                        </ul>
                    </div>
                    <div class="insight-card warning">
                        <h5>개선 포인트</h5>
                        <ul>
                            <li>관리직 급여 상승률이 일반직 대비 높아 격차 확대 우려</li>
                            <li>특정 팀(개발팀)에 급여 집중도가 높음</li>
                            <li>성과급 비중이 낮아 동기부여 효과 제한적</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="recommendations">
                <h4><i class="fas fa-prescription"></i> AI 추천 액션</h4>
                <div class="action-items">
                    <div class="action-item high">
                        <div class="priority high">높음</div>
                        <div class="action-content">
                            <h5>급여 체계 재설계</h5>
                            <p>직급별 급여 밴드를 재조정하여 형평성을 개선하세요</p>
                        </div>
                    </div>
                    <div class="action-item medium">
                        <div class="priority medium">보통</div>
                        <div class="action-content">
                            <h5>성과급 제도 도입</h5>
                            <p>기본급 대비 성과급 비율을 20%까지 확대 검토</p>
                        </div>
                    </div>
                    <div class="action-item low">
                        <div class="priority low">낮음</div>
                        <div class="action-content">
                            <h5>복리후생 확대</h5>
                            <p>비금전적 보상을 통한 총 보상 패키지 강화</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 이상 데이터 탐지
function startAnomalyDetection() {
    showAnalysisProgress('이상 데이터 탐지 중...');
    
    setTimeout(() => {
        const anomalyResults = generateAnomalyResults();
        showAnalysisResults('이상 데이터 탐지', anomalyResults);
    }, 1500);
}

// 이상 데이터 결과 생성
function generateAnomalyResults() {
    return `
        <div class="anomaly-results">
            <div class="anomaly-summary">
                <div class="summary-stats">
                    <div class="stat-card critical">
                        <h3>3</h3>
                        <p>심각한 이상치</p>
                    </div>
                    <div class="stat-card warning">
                        <h3>7</h3>
                        <p>경고 수준</p>
                    </div>
                    <div class="stat-card normal">
                        <h3>245</h3>
                        <p>정상 범위</p>
                    </div>
                </div>
            </div>

            <div class="anomaly-details">
                <h4><i class="fas fa-search"></i> 발견된 이상 패턴</h4>
                <div class="anomaly-list">
                    <div class="anomaly-item critical">
                        <div class="anomaly-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <div class="anomaly-info">
                            <h5>급여 급증 패턴</h5>
                            <p><strong>김○○ (개발팀)</strong> - 전월 대비 350% 급여 증가</p>
                            <div class="anomaly-details-text">
                                승진 또는 특별 보너스로 추정되나 검토 필요
                            </div>
                        </div>
                        <div class="anomaly-actions">
                            <button class="btn-small">상세 조회</button>
                        </div>
                    </div>

                    <div class="anomaly-item critical">
                        <div class="anomaly-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <div class="anomaly-info">
                            <h5>부서별 급여 편차</h5>
                            <p><strong>마케팅팀</strong> - 동일 직급 내 급여 편차 45%</p>
                            <div class="anomaly-details-text">
                                직급 체계 점검 및 급여 정책 재검토 권장
                            </div>
                        </div>
                        <div class="anomaly-actions">
                            <button class="btn-small">부서 분석</button>
                        </div>
                    </div>

                    <div class="anomaly-item warning">
                        <div class="anomaly-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="anomaly-info">
                            <h5>계절성 패턴 이탈</h5>
                            <p><strong>전체 조직</strong> - 3월 인건비가 예상 패턴 대비 12% 높음</p>
                            <div class="anomaly-details-text">
                                신규 채용 또는 임시직 증가로 추정
                            </div>
                        </div>
                        <div class="anomaly-actions">
                            <button class="btn-small">트렌드 분석</button>
                        </div>
                    </div>

                    <div class="anomaly-item warning">
                        <div class="anomaly-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="anomaly-info">
                            <h5>급여 정체 현상</h5>
                            <p><strong>인사팀, 재무팀</strong> - 6개월간 급여 변동 없음</p>
                            <div class="anomaly-details-text">
                                인센티브 또는 승진 기회 부족 가능성
                            </div>
                        </div>
                        <div class="anomaly-actions">
                            <button class="btn-small">개별 분석</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="anomaly-recommendations">
                <h4><i class="fas fa-robot"></i> AI 추천 대응방안</h4>
                <div class="recommendation-grid">
                    <div class="recommendation-card immediate">
                        <h5>즉시 조치</h5>
                        <ul>
                            <li>급여 급증 사례 사유 확인</li>
                            <li>부서별 급여 정책 점검</li>
                            <li>이상치 데이터 정확성 검증</li>
                        </ul>
                    </div>
                    <div class="recommendation-card short-term">
                        <h5>단기 개선</h5>
                        <ul>
                            <li>급여 밴드 재설정</li>
                            <li>성과 평가 체계 점검</li>
                            <li>부서간 형평성 조정</li>
                        </ul>
                    </div>
                    <div class="recommendation-card long-term">
                        <h5>장기 전략</h5>
                        <ul>
                            <li>예측 모델 고도화</li>
                            <li>실시간 모니터링 체계 구축</li>
                            <li>AI 기반 자동 알림 시스템</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 트렌드 예측 분석
function startTrendAnalysis() {
    showAnalysisProgress('트렌드 분석 및 예측 중...');
    
    setTimeout(() => {
        const trendResults = generateTrendResults();
        showAnalysisResults('트렌드 예측 분석', trendResults);
    }, 3000);
}

// 트렌드 예측 결과 생성
function generateTrendResults() {
    return `
        <div class="trend-results">
            <div class="trend-summary">
                <div class="trend-chart-container">
                    <h4>인건비 트렌드 예측</h4>
                    <canvas id="trendChart" width="400" height="200"></canvas>
                </div>
                <div class="trend-metrics">
                    <div class="metric-card growth">
                        <h3>+8.3%</h3>
                        <p>연간 증가율</p>
                        <small>지난 3년 평균</small>
                    </div>
                    <div class="metric-card forecast">
                        <h3>15.2억</h3>
                        <p>내년 예상 인건비</p>
                        <small>95% 신뢰구간</small>
                    </div>
                </div>
            </div>

            <div class="trend-insights">
                <h4><i class="fas fa-crystal-ball"></i> 예측 인사이트</h4>
                <div class="insight-timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">2024 Q2</div>
                        <div class="timeline-content">
                            <h5>인건비 안정화 구간</h5>
                            <p>신규 채용 완료로 증가폭 둔화 예상 (+2.1%)</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">2024 Q3</div>
                        <div class="timeline-content">
                            <h5>성과급 지급 시기</h5>
                            <p>연간 성과급 지급으로 일시적 증가 (+12.5%)</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">2024 Q4</div>
                        <div class="timeline-content">
                            <h5>연말 조정 기간</h5>
                            <p>급여 조정 및 승진으로 구조적 변화 (+6.8%)</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">2025 Q1</div>
                        <div class="timeline-content">
                            <h5>신규 사업 확장</h5>
                            <p>신규 부서 신설로 대폭 증가 예상 (+18.2%)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="scenario-analysis">
                <h4><i class="fas fa-sitemap"></i> 시나리오별 분석</h4>
                <div class="scenario-tabs">
                    <button class="scenario-tab active" onclick="showScenario('conservative')">보수적</button>
                    <button class="scenario-tab" onclick="showScenario('realistic')">현실적</button>
                    <button class="scenario-tab" onclick="showScenario('aggressive')">적극적</button>
                </div>
                <div class="scenario-content" id="scenarioContent">
                    <div class="scenario conservative active">
                        <div class="scenario-stats">
                            <div class="stat">
                                <h5>13.8억원</h5>
                                <p>2025년 예상 인건비</p>
                            </div>
                            <div class="stat">
                                <h5>+4.2%</h5>
                                <p>연간 증가율</p>
                            </div>
                            <div class="stat">
                                <h5>85%</h5>
                                <p>예측 신뢰도</p>
                            </div>
                        </div>
                        <div class="scenario-assumptions">
                            <h6>주요 가정</h6>
                            <ul>
                                <li>최소한의 신규 채용 (5명 이하)</li>
                                <li>급여 인상률 3% 수준 유지</li>
                                <li>현재 조직 구조 유지</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 업계 벤치마킹 분석
function startBenchmarking() {
    showAnalysisProgress('업계 벤치마킹 분석 중...');
    
    setTimeout(() => {
        const benchmarkResults = generateBenchmarkResults();
        showAnalysisResults('업계 벤치마킹', benchmarkResults);
    }, 2500);
}

// 벤치마킹 결과 생성
function generateBenchmarkResults() {
    return `
        <div class="benchmark-results">
            <div class="benchmark-overview">
                <div class="company-position">
                    <h4>업계 내 포지션</h4>
                    <div class="position-indicator">
                        <div class="position-bar">
                            <div class="position-markers">
                                <span class="marker low">하위 25%</span>
                                <span class="marker mid">평균</span>
                                <span class="marker high">상위 25%</span>
                            </div>
                            <div class="position-fill" style="width: 68%"></div>
                            <div class="position-current" style="left: 68%">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>당사 위치</span>
                            </div>
                        </div>
                    </div>
                    <p class="position-description">
                        동종업계 대비 <strong>상위 32% 수준</strong>의 급여를 지급하고 있습니다.
                    </p>
                </div>
            </div>

            <div class="benchmark-comparison">
                <h4><i class="fas fa-chart-bar"></i> 직급별 업계 비교</h4>
                <div class="comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>직급</th>
                                <th>당사 평균</th>
                                <th>업계 평균</th>
                                <th>차이</th>
                                <th>순위</th>
                                <th>경쟁력</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="excellent">
                                <td>임원급</td>
                                <td>12,500만원</td>
                                <td>11,200만원</td>
                                <td class="positive">+11.6%</td>
                                <td>상위 15%</td>
                                <td><span class="badge excellent">우수</span></td>
                            </tr>
                            <tr class="good">
                                <td>부장급</td>
                                <td>8,200만원</td>
                                <td>7,800만원</td>
                                <td class="positive">+5.1%</td>
                                <td>상위 35%</td>
                                <td><span class="badge good">양호</span></td>
                            </tr>
                            <tr class="average">
                                <td>과장급</td>
                                <td>5,800만원</td>
                                <td>5,950만원</td>
                                <td class="negative">-2.5%</td>
                                <td>하위 45%</td>
                                <td><span class="badge average">보통</span></td>
                            </tr>
                            <tr class="poor">
                                <td>대리급</td>
                                <td>4,200만원</td>
                                <td>4,600만원</td>
                                <td class="negative">-8.7%</td>
                                <td>하위 25%</td>
                                <td><span class="badge poor">개선필요</span></td>
                            </tr>
                            <tr class="good">
                                <td>사원급</td>
                                <td>3,100만원</td>
                                <td>2,950만원</td>
                                <td class="positive">+5.1%</td>
                                <td>상위 30%</td>
                                <td><span class="badge good">양호</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="benchmark-insights">
                <h4><i class="fas fa-lightbulb"></i> 벤치마킹 인사이트</h4>
                <div class="insights-grid">
                    <div class="insight-card competitive">
                        <h5>경쟁 우위</h5>
                        <ul>
                            <li>임원급 보상이 업계 최상위 수준</li>
                            <li>신입사원 급여가 경쟁력 있음</li>
                            <li>복리후생이 업계 평균 대비 우수</li>
                        </ul>
                    </div>
                    <div class="insight-card improvement">
                        <h5>개선 필요</h5>
                        <ul>
                            <li>중간관리직(과장급) 급여 경쟁력 부족</li>
                            <li>대리급 급여가 업계 평균 미달</li>
                            <li>성과급 비중이 업계 평균보다 낮음</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="benchmark-recommendations">
                <h4><i class="fas fa-target"></i> 전략적 제안</h4>
                <div class="recommendation-timeline">
                    <div class="timeline-item immediate">
                        <div class="timeline-badge immediate">즉시</div>
                        <div class="timeline-content">
                            <h5>대리급 급여 조정</h5>
                            <p>업계 평균 수준까지 급여 인상 검토 (약 400만원)</p>
                            <div class="impact">예상 비용: 연간 2억원</div>
                        </div>
                    </div>
                    <div class="timeline-item short-term">
                        <div class="timeline-badge short-term">3개월</div>
                        <div class="timeline-content">
                            <h5>성과급 제도 강화</h5>
                            <p>기본급 대비 성과급 비율을 15%에서 25%로 확대</p>
                            <div class="impact">예상 효과: 상위 20% 진입</div>
                        </div>
                    </div>
                    <div class="timeline-item long-term">
                        <div class="timeline-badge long-term">1년</div>
                        <div class="timeline-content">
                            <h5>종합 보상 체계 혁신</h5>
                            <p>비금전적 보상까지 포함한 총 보상 패키지 재설계</p>
                            <div class="impact">목표: 업계 상위 10% 진입</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 분석 진행 상태 표시
function showAnalysisProgress(message) {
    const resultsContainer = document.getElementById('analysisResults');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="analysis-progress">
            <div class="progress-animation">
                <div class="progress-circle">
                    <div class="progress-spinner"></div>
                </div>
                <h3>${message}</h3>
                <div class="progress-steps">
                    <div class="step active">데이터 수집</div>
                    <div class="step active">패턴 분석</div>
                    <div class="step">인사이트 생성</div>
                    <div class="step">결과 검증</div>
                </div>
            </div>
        </div>
    `;
}

// 분석 결과 표시
function showAnalysisResults(title, content) {
    const resultsContainer = document.getElementById('analysisResults');
    resultsContainer.innerHTML = `
        <div class="analysis-result-container">
            <div class="result-header">
                <h3><i class="fas fa-chart-line"></i> ${title} 결과</h3>
                <div class="result-actions">
                    <button class="btn btn-outline" onclick="exportResults()">
                        <i class="fas fa-download"></i> 결과 내보내기
                    </button>
                    <button class="btn btn-secondary" onclick="shareResults()">
                        <i class="fas fa-share"></i> 공유
                    </button>
                </div>
            </div>
            <div class="result-content">
                ${content}
            </div>
        </div>
    `;
    
    // 차트가 있는 경우 초기화
    if (title === '트렌드 예측 분석') {
        setTimeout(() => initializeTrendChart(), 100);
    }
}

// 트렌드 차트 초기화
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (ctx && typeof Chart !== 'undefined') {
        // 차트 크기 설정
        ctx.style.width = '100%';
        ctx.style.height = '280px';
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4'],
                datasets: [{
                    label: '실제 인건비',
                    data: [11.2, 11.8, 12.1, 13.5, 12.3, 12.6, 14.2, 13.8],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: '예측 인건비',
                    data: [null, null, null, null, null, 12.8, 14.5, 14.1],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        min: 10,
                        max: 16,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: '인건비 (억원)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '억';
                            },
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            }
        });
    }
}

// 기타 유틸리티 함수들
function clearInsightHistory() {
    if (confirm('인사이트 히스토리를 모두 삭제하시겠습니까?')) {
        document.getElementById('insightsTimeline').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>히스토리가 비어있습니다</p>
            </div>
        `;
    }
}

function exportResults() {
    alert('분석 결과를 PDF로 내보내는 기능이 곧 추가됩니다!');
}

function shareResults() {
    alert('분석 결과 공유 기능이 곧 추가됩니다!');
}

function showScenario(type) {
    // 시나리오 탭 전환 로직
    document.querySelectorAll('.scenario-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[onclick="showScenario('${type}')"]`).classList.add('active');
    
    // 시나리오별 컨텐츠 표시 로직 추가 가능
}