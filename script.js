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
        case 'upload':
            // 업로드 페이지 이벤트 설정
            setTimeout(() => {
                setupFileUploadEvents();
            }, 100);
            break;
        case 'ai-chat':
            // AI 채팅 페이지 이벤트 설정 (향후 구현)
            console.log('AI 채팅 페이지 이벤트 설정');
            break;
        default:
            console.log('기본 페이지 이벤트 설정');
    }
}

// 기본 페이지 콘텐츠 함수
function getPageContent(pageName) {
    switch (pageName) {
        case 'upload':
            return getUploadPageContent();
        case 'employee':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-users"></i> 직원 정보 관리</h2>
                    <p>직원 정보를 관리하고 업데이트하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-users"></i>
                    <h3>직원 정보 관리</h3>
                    <p>직원 정보 관리 기능이 곧 추가됩니다</p>
                </div>
            `;
        case 'insurance':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-shield-alt"></i> 4대 보험 요율</h2>
                    <p>4대보험 요율을 확인하고 관리하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-shield-alt"></i>
                    <h3>4대 보험 요율</h3>
                    <p>4대보험 요율 관리 기능이 곧 추가됩니다</p>
                </div>
            `;
        case 'calculation':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-calculator"></i> 인건비 계산</h2>
                    <p>인건비를 계산하고 시뮬레이션하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-calculator"></i>
                    <h3>인건비 계산</h3>
                    <p>인건비 계산 기능이 곧 추가됩니다</p>
                </div>
            `;
        case 'retirement':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-piggy-bank"></i> 퇴직금 계산기</h2>
                    <p>퇴직금을 계산하고 예측하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-piggy-bank"></i>
                    <h3>퇴직금 계산기</h3>
                    <p>퇴직금 계산 기능이 곧 추가됩니다</p>
                </div>
            `;
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
            return `
                <div class="page-header">
                    <h2><i class="fas fa-brain"></i> AI 진단 분석</h2>
                    <p>AI 기반 데이터 진단 및 분석을 수행하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-brain"></i>
                    <h3>AI 진단 분석</h3>
                    <p>AI 진단 분석 기능이 곧 추가됩니다</p>
                </div>
            `;
        case 'hc-roi':
            return `
                <div class="page-header">
                    <h2><i class="fas fa-chart-pie"></i> HC ROI 분석</h2>
                    <p>인적자원 투자수익률을 분석하세요</p>
                </div>
                <div class="coming-soon">
                    <i class="fas fa-chart-pie"></i>
                    <h3>HC ROI 분석</h3>
                    <p>HC ROI 분석 기능이 곧 추가됩니다</p>
                </div>
            `;
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
        default:
            return '<p>페이지를 찾을 수 없습니다.</p>';
    }
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
    setupFileUploadEvents();
});

// 데이터 업로드 관련 함수들
let uploadedData = []; // 업로드된 데이터 저장

// 파일 업로드 처리 함수 개선
function handleFileUpload(event) {
    console.log('handleFileUpload 함수 시작');
    
    const files = event.target.files;
    console.log('선택된 파일들:', files);
    
    if (!files || files.length === 0) {
        console.log('파일이 선택되지 않음');
        alert('파일을 선택해주세요.');
        return;
    }
    
    console.log('처리할 파일 개수:', files.length);
    
    // 각 파일 처리
    Array.from(files).forEach((file, index) => {
        console.log(`파일 ${index + 1} 처리 시작:`, file.name, file.type, file.size);
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        console.log('파일 확장자:', fileExtension);
        
        // 지원하는 파일 형식 확인
        if (['json', 'txt', 'csv', 'xlsx'].includes(fileExtension)) {
            processFile(file, fileExtension);
        } else {
            console.log('지원하지 않는 파일 형식:', fileExtension);
            alert(`지원하지 않는 파일 형식입니다: ${file.name}\n지원 형식: JSON, TXT, CSV, XLSX`);
        }
    });
}

// 파일 처리 함수 개선
function processFile(file, extension) {
    console.log('processFile 시작:', file.name, extension);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('파일 읽기 완료');
        const data = e.target.result;
        
        try {
            switch (extension) {
                case 'json':
                case 'txt': // .json.txt 파일도 JSON으로 처리
                    console.log('JSON 데이터 파싱 시작');
                    const jsonData = JSON.parse(data);
                    console.log('JSON 파싱 완료, 데이터 개수:', Array.isArray(jsonData) ? jsonData.length : 'Object');
                    processJsonData(jsonData, file.name);
                    break;
                case 'csv':
                    console.log('CSV 데이터 처리 시작');
                    processCsvData(data, file.name);
                    break;
                case 'xlsx':
                    console.log('Excel 파일 처리 시작');
                    processExcelData(data, file.name);
                    break;
                default:
                    console.log('알 수 없는 파일 형식:', extension);
                    alert('알 수 없는 파일 형식입니다.');
            }
        } catch (error) {
            console.error('파일 처리 중 오류:', error);
            alert(`파일 처리 중 오류가 발생했습니다: ${file.name}\n오류: ${error.message}`);
        }
    };
    
    reader.onerror = function(error) {
        console.error('파일 읽기 오류:', error);
        alert(`파일 읽기 중 오류가 발생했습니다: ${file.name}`);
    };
    
    // 파일 읽기 시작
    if (extension === 'xlsx') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file, 'UTF-8');
    }
}

// JSON 데이터 처리
function processJsonData(data, fileName) {
    console.log('JSON 데이터 처리:', data);
    uploadedData.push({
        fileName: fileName,
        type: 'json',
        data: data,
        uploadTime: new Date()
    });
    
    showUploadSuccess(fileName, data.length || Object.keys(data).length);
    updateDataPreview(data, 'json');
}

// CSV 데이터 처리
function processCsvData(csvText, fileName) {
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
    
    console.log('CSV 데이터 처리:', rows);
    uploadedData.push({
        fileName: fileName,
        type: 'csv',
        data: rows,
        uploadTime: new Date(),
        headers: headers
    });
    
    showUploadSuccess(fileName, rows.length);
    updateDataPreview(rows, 'csv');
}

// Excel 데이터 처리 (라이브러리 필요)
function processExcelData(arrayBuffer, fileName) {
    // SheetJS 라이브러리 사용 예정
    alert('Excel 파일 처리 기능은 곧 구현됩니다!');
}

// 업로드 성공 메시지
function showUploadSuccess(fileName, recordCount) {
    const successMessage = `
        <div class="upload-success">
            <i class="fas fa-check-circle"></i>
            <h3>업로드 완료!</h3>
            <p><strong>${fileName}</strong></p>
            <p>${recordCount}개의 레코드가 처리되었습니다.</p>
        </div>
    `;
    
    // 페이지에 성공 메시지 표시
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = getPageContent('upload') + successMessage;
    
    // 파일 입력 이벤트 다시 연결
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
}

// 데이터 미리보기 업데이트
function updateDataPreview(data, type) {
    const previewHtml = `
        <div class="data-preview">
            <h3><i class="fas fa-table"></i> 데이터 미리보기</h3>
            <div class="preview-table">
                ${generatePreviewTable(data, type)}
            </div>
            <div class="data-actions">
                <button class="btn" onclick="viewAllData()">전체 데이터 보기</button>
                <button class="btn btn-secondary" onclick="analyzeData()">AI 분석 시작</button>
            </div>
        </div>
    `;
    
    document.getElementById('page-content').innerHTML += previewHtml;
}

// 미리보기 테이블 생성
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

// 업로드 페이지 콘텐츠 업데이트
function getUploadPageContent() {
    return `
        <div class="page-header">
            <h2><i class="fas fa-upload"></i> 데이터 업로드</h2>
            <p>급여/상여 대장을 업로드하여 시스템에 반영하세요</p>
        </div>
        <div class="upload-area">
            <div class="upload-box" onclick="triggerFileUpload()">
                <i class="fas fa-cloud-upload-alt"></i>
                <h3>파일을 드래그하거나 클릭하여 업로드</h3>
                <p>지원 형식: Excel (.xlsx), CSV (.csv), JSON (.json), TXT (.txt)</p>
                <input type="file" id="fileInput" accept=".xlsx,.csv,.json,.txt" multiple style="display: none;">
                <button class="btn" type="button" onclick="triggerFileUpload()">파일 선택</button>
            </div>
        </div>
        <div class="upload-guide">
            <h3><i class="fas fa-info-circle"></i> 업로드 가이드</h3>
            <div class="guide-cards">
                <div class="guide-card">
                    <h4>Excel (.xlsx)</h4>
                    <p>첫 번째 시트의 첫 행을 헤더로 인식합니다.</p>
                </div>
                <div class="guide-card">
                    <h4>CSV (.csv)</h4>
                    <p>UTF-8 인코딩, 쉼표로 구분된 값을 지원합니다.</p>
                </div>
                <div class="guide-card">
                    <h4>JSON (.json/.txt)</h4>
                    <p>배열 형태의 객체 데이터를 지원합니다.</p>
                </div>
            </div>
        </div>
    `;
}

// 페이지 콘텐츠 함수 업데이트
const originalGetPageContent = getPageContent;
getPageContent = function(pageName) {
    if (pageName === 'upload') {
        return getUploadPageContent();
    }
    return originalGetPageContent(pageName);
};

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

// 기존 JSON 처리 함수 업데이트
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

// 파일 업로드 트리거 함수
function triggerFileUpload() {
    console.log('triggerFileUpload 함수 호출됨');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
    } else {
        console.error('fileInput 요소를 찾을 수 없습니다.');
    }
}

// 파일 업로드 이벤트 설정 (완전 새로운 버전)
function setupFileUploadEvents() {
    console.log('파일 업로드 이벤트 설정 시작');
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        console.log('파일 입력 요소 발견됨');
        
        // 기존 이벤트 제거 후 새로 추가
        fileInput.removeEventListener('change', handleFileUpload);
        fileInput.addEventListener('change', function(e) {
            console.log('파일 선택됨:', e.target.files.length, '개');
            handleFileUpload(e);
        });
        
        // 업로드 박스 클릭 이벤트
        const uploadBox = document.querySelector('.upload-box');
        if (uploadBox) {
            uploadBox.addEventListener('click', function(e) {
                console.log('업로드 박스 클릭됨');
                fileInput.click();
            });
        }
    } else {
        console.log('파일 입력 요소를 찾을 수 없음');
    }
}

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
