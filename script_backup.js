// 전역 데이터 저장소
let uploadedData = [];
let filteredData = [];
let currentFilters = {
    dateRange: { start: null, end: null },
    department: '',
    items: [],
    name: ''
};

// filteredData 초기화 (업로드된 데이터가 있으면 복원)
function initializeFilteredData() {
    const savedData = localStorage.getItem('paypulse_data');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.data && Array.isArray(parsedData.data)) {
                filteredData = parsedData.data;
                uploadedData = parsedData.data;
            }
        } catch (e) {
            console.log('저장된 데이터 복원 실패:', e);
        }
    }
}

// 테스트 함수들
function testAlert() {
    alert('JavaScript가 작동합니다!');
    console.log('테스트 함수 호출됨');
}

// 테스트 데이터 로드 함수
function loadTestData() {
    const testData = [
        {
            "사번": "EMP001",
            "성명": "김철수",
            "조직": "개발팀",
            "직급": "사원",
            "급여일_급여유형": "2024-01-15_정기급여",
            "연도": 2024,
            "급여영역": "본사",
            "실지급액": 3500000,
            "공제총액": 500000
        },
        {
            "사번": "EMP002",
            "성명": "이영희",
            "조직": "마케팅팀",
            "직급": "대리",
            "급여일_급여유형": "2024-01-15_정기급여",
            "연도": 2024,
            "급여영역": "본사",
            "실지급액": 4200000,
            "공제총액": 600000
        },
        {
            "사번": "EMP003",
            "성명": "박민수",
            "조직": "개발팀",
            "직급": "팀장",
            "급여일_급여유형": "2024-01-15_정기급여",
            "연도": 2024,
            "급여영역": "본사",
            "실지급액": 5500000,
            "공제총액": 800000
        }
    ];
    
    filteredData = testData;
    uploadedData = testData;
    
    // 로컬 스토리지에 저장
    const dataToSave = {
        data: testData,
        fileName: 'test-data.json',
        uploadDate: new Date().toISOString(),
        recordCount: testData.length
    };
    
    localStorage.setItem('paypulse_data', JSON.stringify(dataToSave));
    
    alert('테스트 데이터가 로드되었습니다! AI 어시스턴트에서 데이터 기반 분석을 시도해보세요.');
    console.log('테스트 데이터 로드됨:', testData);
}

function testFileInput() {
    console.log('파일 입력 테스트 함수 호출됨');
    const fileInput = document.getElementById('fileInput');
    console.log('파일 입력 요소:', fileInput);
    
    if (fileInput) {
        console.log('파일 개수:', fileInput.files.length);
        if (fileInput.files.length > 0) {
            console.log('선택된 파일:', fileInput.files[0].name);
            alert(`파일이 선택됨: ${fileInput.files[0].name}`);
        } else {
            alert('파일이 선택되지 않음');
        }
    } else {
        alert('파일 입력 요소를 찾을 수 없음');
    }
}

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
            // AI 채팅 페이지 이벤트 설정
            setTimeout(() => {
                setupAIChatEvents();
            }, 100);
            break;
        default:
            console.log('기본 페이지 이벤트 설정');
    }
}

// AI 채팅 페이지 이벤트 설정
function setupAIChatEvents() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        // Enter 키 이벤트 처리
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
        
        // 자동 높이 조절
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
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
                    <p>업로드된 데이터를 바탕으로 스마트한 분석을 받아보세요</p>
                </div>
                
                <!-- 데이터 업로드 영역 -->
                <div class="ai-data-section">
                    <div class="data-upload-area">
                        <h3><i class="fas fa-database"></i> 데이터 업로드</h3>
                        <div class="upload-box-small">
                            <input type="file" id="aiFileInput" accept=".xlsx,.csv,.json" multiple style="display: none;">
                            <button class="btn btn-outline" onclick="document.getElementById('aiFileInput').click()">
                                <i class="fas fa-upload"></i> 파일 업로드
                            </button>
                            <span id="uploadStatus"></span>
                        </div>
                    </div>
                    
                    <!-- 필터링 패널 -->
                    <div class="filter-panel" id="filterPanel" style="display: none;">
                        <h3><i class="fas fa-filter"></i> 데이터 필터링</h3>
                        <div class="filter-grid">
                            <div class="filter-item">
                                <label>📅 일자별</label>
                                <input type="date" id="startDate" onchange="applyFilters()">
                                <input type="date" id="endDate" onchange="applyFilters()">
                            </div>
                            <div class="filter-item">
                                <label>🏢 부서별</label>
                                <select id="departmentFilter" onchange="applyFilters()">
                                    <option value="">전체 부서</option>
                                </select>
                            </div>
                            <div class="filter-item">
                                <label>👤 성함 검색</label>
                                <input type="text" id="nameFilter" placeholder="이름 입력" oninput="applyFilters()">
                            </div>
                            <div class="filter-item">
                                <button class="btn btn-sm" onclick="clearFilters()">필터 초기화</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 데이터 테이블 -->
                    <div class="data-table-container" id="dataTableContainer" style="display: none;">
                        <div class="table-header">
                            <h3><i class="fas fa-table"></i> 업로드된 데이터</h3>
                            <span class="record-count" id="recordCount">0개 레코드</span>
                        </div>
                        <div class="table-wrapper">
                            <table id="dataTable">
                                <thead id="tableHead"></thead>
                                <tbody id="tableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- AI 채팅 영역 -->
                <div class="ai-chat-container">
                    <div class="chat-messages" id="chatMessages">
                        <div class="ai-message">
                            <div class="message-avatar">🤖</div>
                            <div class="message-content">
                                안녕하세요! PayPulse AI 어시스턴트입니다. 📊<br>
                                <strong>데이터를 업로드하시면 다음과 같은 분석을 도와드릴 수 있어요:</strong><br>
                                • 급여 데이터 통계 분석<br>
                                • 부서별/개인별 인건비 현황<br>
                                • 급여 인상률 및 트렌드 분석<br>
                                • 퇴직금/보험료 계산 검토<br><br>
                                파일을 업로드하고 질문해 보세요! 💡
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" id="chatInput" placeholder="예: 이번 달 총 인건비는 얼마야?" onkeypress="handleEnter(event)">
                        <button class="btn" onclick="sendMessage()">
                            <i class="fas fa-paper-plane"></i> 전송
                        </button>
                    </div>
                    
                    <!-- 추천 질문 -->
                    <div class="suggested-questions" id="suggestedQuestions" style="display: none;">
                        <h4>💡 추천 질문:</h4>
                        <div class="question-buttons">
                            <button class="question-btn" onclick="sendSuggestedMessage('총 몇 명의 직원 데이터가 있어?')">
                                총 직원 수
                            </button>
                            <button class="question-btn" onclick="sendSuggestedMessage('부서별 평균 급여를 알려줘')">
                                부서별 평균 급여
                            </button>
                            <button class="question-btn" onclick="sendSuggestedMessage('가장 높은 급여와 낮은 급여는?')">
                                급여 최고/최저
                            </button>
                            <button class="question-btn" onclick="sendSuggestedMessage('이번 달 총 인건비 계산해줘')">
                                총 인건비
                            </button>
                        </div>
                    </div>
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
    initializeFilteredData(); // 저장된 데이터 복원
    setupMenuEvents();
    setupFileUploadEvents();
});

// 데이터 업로드 관련 함수들

// 기존 파일 업로드 처리 함수 (AI 채팅용으로 대체됨)
function handleFileUpload(event) {
    console.log('기존 handleFileUpload 함수 호출됨');
    // 새로운 AI 채팅용 handleFileUpload 함수가 있으므로 이 함수는 사용하지 않음
}

// 파일 처리 함수도 개선
function processFile(file, extension) {
    console.log('processFile 시작:', file.name, extension);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('파일 읽기 완료');
        let data = e.target.result;
        
        try {
            switch (extension) {
                case 'json':
                case 'txt': // .json.txt 파일도 JSON으로 처리
                    console.log('JSON/TXT 데이터 전처리 시작');
                    
                    // 파일 내용이 JSON인지 확인
                    if (typeof data === 'string') {
                        // NaN, undefined, Infinity 등을 null로 변경
                        console.log('잘못된 JSON 값들을 정리 중...');
                        data = data.replace(/:\s*NaN/g, ': null')
                                  .replace(/:\s*undefined/g, ': null')
                                  .replace(/:\s*Infinity/g, ': null')
                                  .replace(/:\s*-Infinity/g, ': null');
                        
                        // JSON 파싱 시도
                        try {
                            const jsonData = JSON.parse(data);
                            console.log('JSON 파싱 성공');
                            processJsonData(jsonData, file.name);
                        } catch (parseError) {
                            console.error('JSON 파싱 실패:', parseError);
                            alert(`JSON 파일 형식이 올바르지 않습니다.\n파일: ${file.name}\n오류: ${parseError.message}`);
                        }
                    } else {
                        processJsonData(data, file.name);
                    }
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

// JSON 데이터 처리 함수 개선 (NaN 처리 포함)
function processJsonData(data, fileName) {
    console.log('JSON 데이터 처리 시작');
    
    // 먼저 문자열인지 확인하고 NaN 처리
    if (typeof data === 'string') {
        console.log('문자열 형태의 JSON 데이터 정리 중...');
        
        // NaN을 null로 변경
        data = data.replace(/:\s*NaN/g, ': null');
        
        // 기타 잘못된 JSON 형식 수정
        data = data.replace(/:\s*undefined/g, ': null');
        data = data.replace(/:\s*Infinity/g, ': null');
        
        try {
            data = JSON.parse(data);
            console.log('JSON 파싱 성공');
        } catch (error) {
            console.error('JSON 파싱 실패:', error);
            alert(`JSON 파싱 중 오류가 발생했습니다: ${error.message}`);
            return;
        }
    }
    
    // 데이터가 배열인지 확인
    if (!Array.isArray(data)) {
        console.log('데이터가 배열이 아님, 배열로 변환 시도');
        if (typeof data === 'object' && data !== null) {
            data = [data]; // 객체를 배열로 감싸기
        } else {
            alert('올바른 JSON 배열 형식이 아닙니다.');
            return;
        }
    }
    
    console.log('처리된 JSON 데이터:', data.length, '건');
    
    // 급여 데이터인지 확인 및 처리
    if (data.length > 0 && 
        data[0].hasOwnProperty('사번') && 
        data[0].hasOwnProperty('성명') && 
        data[0].hasOwnProperty('급여일_급여유형')) {
        
        console.log('급여 데이터로 인식됨');
        processSalaryJsonData(data, fileName);
    } else {
        console.log('일반 JSON 데이터로 처리');
        uploadedData.push({
            fileName: fileName,
            type: 'json',
            data: data,
            uploadTime: new Date()
        });
        
        showUploadSuccess(fileName, data.length);
        updateDataPreview(data, 'json');
    }
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

function getUploadPageContent() {
    const storageInfo = getStorageInfo();
    const hasSavedData = storageInfo.hasData;
    
    return `
        <div class="page-header">
            <h2><i class="fas fa-upload"></i> 데이터 업로드</h2>
            <p>급여 데이터를 업로드하고 분석하세요</p>
        </div>
        
        ${hasSavedData ? `
        <div class="saved-data-section">
            <div class="saved-data-header">
                <h3><i class="fas fa-database"></i> 저장된 데이터</h3>
                <div class="saved-data-actions">
                    <button class="btn btn-sm" onclick="showDetailedAnalysis()">
                        <i class="fas fa-chart-bar"></i> 분석 보기
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="showUploadHistory()">
                        <i class="fas fa-history"></i> 업로드 이력
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="clearSavedData(true)">
                        <i class="fas fa-trash"></i> 데이터 삭제
                    </button>
                </div>
            </div>
            <div class="saved-data-info">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">파일명:</span>
                        <span class="info-value">${storageInfo.fileName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">레코드 수:</span>
                        <span class="info-value">${storageInfo.recordCount.toLocaleString()}건</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">업로드일:</span>
                        <span class="info-value">${storageInfo.lastUpload ? storageInfo.lastUpload.toLocaleString('ko-KR') : '알 수 없음'}</span>
                    </div>
                    ${storageInfo.isSample ? `
                    <div class="info-item warning">
                        <span class="info-label">⚠️ 샘플 데이터:</span>
                        <span class="info-value">용량 제한으로 일부만 저장됨</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
        ` : ''}
        
        <div class="upload-area">
            <div class="upload-box" onclick="triggerFileUpload()">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h3>파일을 선택하거나 여기에 드래그하세요</h3>
                <p>지원 형식: JSON, CSV, Excel (.xlsx), TXT</p>
                <input type="file" id="fileInput" accept=".json,.csv,.xlsx,.txt" style="display: none;" onchange="directFileUpload(this)">
                <button class="btn btn-primary">파일 선택</button>
            </div>
            
            <div id="upload-result"></div>
            
            <div class="upload-guide">
                <h4><i class="fas fa-info-circle"></i> 업로드 가이드</h4>
                <div class="guide-cards">
                    <div class="guide-card">
                        <div class="guide-icon">
                            <i class="fas fa-file-code"></i>
                        </div>
                        <h5>JSON 형식</h5>
                        <p>급여 데이터가 JSON 배열 형태로 되어 있어야 합니다.</p>
                    </div>
                    <div class="guide-card">
                        <div class="guide-icon">
                            <i class="fas fa-table"></i>
                        </div>
                        <h5>CSV/Excel 형식</h5>
                        <p>첫 번째 행에 필드명이 있어야 하며, 쉼표로 구분됩니다.</p>
                    </div>
                    <div class="guide-card">
                        <div class="guide-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <h5>필수 필드</h5>
                        <p>사번, 성명, 급여일_급여유형 필드가 포함되어야 합니다.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="test-buttons">
            <button class="btn btn-outline" onclick="testAlert()">
                <i class="fas fa-vial"></i> JavaScript 테스트
            </button>
            <button class="btn btn-outline" onclick="testFileInput()">
                <i class="fas fa-file"></i> 파일 입력 테스트
            </button>
            <button class="btn btn-outline" onclick="manualUploadTest()">
                <i class="fas fa-magic"></i> 수동 업로드 테스트
            </button>
        </div>
    `;
}

// 페이지 콘텐츠 함수 업데이트
const originalGetPageContent = getPageContent;
getPageContent = function(pageName) {
    if (pageName === 'upload') {
        return getUploadPageContent();
    } else if (pageName === 'ai-chat') {
        return getAIChatPageContent();
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

// 급여 데이터 정리 함수 추가
function cleanSalaryData(data) {
    console.log('급여 데이터 정리 시작');
    
    return data.map(record => {
        const cleanRecord = {};
        
        // 각 필드의 NaN, undefined 값을 적절히 처리
        Object.keys(record).forEach(key => {
            let value = record[key];
            
            // NaN이나 undefined를 null로 변경
            if (value === null || value === undefined || 
                (typeof value === 'number' && isNaN(value))) {
                cleanRecord[key] = null;
            } else {
                cleanRecord[key] = value;
            }
        });
        
        return cleanRecord;
    });
}

// 급여 데이터 전용 JSON 처리 함수 개선
function processSalaryJsonData(data, fileName) {
    console.log('급여 데이터 처리 시작:', data.length, '건');
    
    // 데이터 정리
    const cleanedData = cleanSalaryData(data);
    console.log('데이터 정리 완료');
    
    // 데이터 저장
    salaryData = cleanedData;
    dataAnalysis = analyzeSalaryData(cleanedData);
    
    // 로컬 스토리지에 저장 (샘플 데이터만)
    try {
        const sampleData = cleanedData.slice(0, 100);
        localStorage.setItem('paypulse_salary_data', JSON.stringify(sampleData));
        localStorage.setItem('paypulse_analysis', JSON.stringify(dataAnalysis));
        console.log('로컬 스토리지 저장 완료');
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

// 직접 파일 업로드 처리 (가장 단순한 버전)
function directFileUpload(input) {
    console.log('directFileUpload 호출됨');
    console.log('input:', input);
    console.log('files:', input.files);
    
    const resultDiv = document.getElementById('upload-result');
    
    if (!input.files || input.files.length === 0) {
        console.log('파일이 선택되지 않음');
        resultDiv.innerHTML = '<p style="color: red;">파일이 선택되지 않았습니다.</p>';
        return;
    }
    
    const file = input.files[0];
    console.log('선택된 파일:', file.name, file.type, file.size);
    
    resultDiv.innerHTML = `
        <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h4>파일 선택 완료!</h4>
            <p><strong>파일명:</strong> ${file.name}</p>
            <p><strong>크기:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>타입:</strong> ${file.type}</p>
            <button onclick="processSelectedFile()" class="btn">파일 처리 시작</button>
        </div>
    `;
    
    // 전역 변수에 파일 저장
    window.selectedFile = file;
}

// 선택된 파일 처리
function processSelectedFile() {
    console.log('processSelectedFile 호출됨');
    
    if (!window.selectedFile) {
        alert('선택된 파일이 없습니다.');
        return;
    }
    
    const file = window.selectedFile;
    const resultDiv = document.getElementById('upload-result');
    
    resultDiv.innerHTML = `
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px;">
            <h4>파일 처리 중...</h4>
            <p>${file.name} 파일을 읽고 있습니다.</p>
        </div>
    `;
    
    // 파일 읽기
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('파일 읽기 완료');
        let content = e.target.result;
        
        try {
            // NaN 처리
            if (typeof content === 'string') {
                content = content.replace(/:\s*NaN/g, ': null');
                const data = JSON.parse(content);
                
                console.log('JSON 파싱 성공, 데이터 개수:', data.length);
                
                resultDiv.innerHTML = `
                    <div style="background: #d4edda; padding: 20px; border-radius: 10px;">
                        <h4>✅ 업로드 성공!</h4>
                        <p><strong>파일:</strong> ${file.name}</p>
                        <p><strong>레코드 수:</strong> ${data.length}개</p>
                        <p><strong>첫 번째 레코드 예시:</strong></p>
                        <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">${JSON.stringify(data[0], null, 2)}</pre>
                        <button onclick="startDetailedAnalysis()" class="btn">상세 분석 시작</button>
                    </div>
                `;
                
                // 전역 변수에 데이터 저장
                window.uploadedSalaryData = data;
                
            } else {
                throw new Error('파일 내용을 읽을 수 없습니다.');
            }
            
        } catch (error) {
            console.error('파일 처리 오류:', error);
            resultDiv.innerHTML = `
                <div style="background: #f8d7da; padding: 20px; border-radius: 10px;">
                    <h4>❌ 처리 실패</h4>
                    <p><strong>오류:</strong> ${error.message}</p>
                </div>
            `;
        }
    };
    
    reader.onerror = function() {
        console.error('파일 읽기 실패');
        resultDiv.innerHTML = `
            <div style="background: #f8d7da; padding: 20px; border-radius: 10px;">
                <h4>❌ 파일 읽기 실패</h4>
            </div>
        `;
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 상세 분석 시작
function startDetailedAnalysis() {
    if (!window.uploadedSalaryData) {
        alert('분석할 데이터가 없습니다.');
        return;
    }
    
    console.log('상세 분석 시작');
    
    // 기존 분석 함수 호출
    salaryData = window.uploadedSalaryData;
    dataAnalysis = analyzeSalaryData(salaryData);
    
    showSalaryUploadSuccess('업로드된 파일', dataAnalysis);
}

// 수동 업로드 테스트
function manualUploadTest() {
    console.log('수동 업로드 테스트');
    
    const testData = [
        {
            "급여일_급여유형": "2021.12.28 상여금_테스트",
            "급여영역": "테스트회사",
            "사번": "T001",
            "성명": "김테스트",
            "조직": "테스트부서",
            "직급": "대리",
            "실지급액": 3000000,
            "공제총액": 500000,
            "연도": 2021
        }
    ];
    
    window.uploadedSalaryData = testData;
    
    const resultDiv = document.getElementById('upload-result');
    resultDiv.innerHTML = `
        <div style="background: #d4edda; padding: 20px; border-radius: 10px;">
            <h4>✅ 테스트 데이터 생성 완료!</h4>
            <p>샘플 급여 데이터가 생성되었습니다.</p>
            <button onclick="startDetailedAnalysis()" class="btn">분석 시작</button>
        </div>
    `;
}

// 업로드 결과 표시 함수
function showUploadResult(message, type = 'info') {
    const resultDiv = document.getElementById('upload-result');
    if (resultDiv) {
        const className = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
        resultDiv.innerHTML = `
            <div class="alert alert-${className}" style="padding: 15px; margin: 10px 0; border-radius: 5px; background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'}; color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};">
                <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</strong> ${message}
            </div>
        `;
    }
}

// 요약 리포트 내보내기
function exportSummary() {
    showDownloadOptions();
}

// 보고서 다운로드 관련 함수들
function showDownloadOptions() {
    if (!dataAnalysis) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }
    
    const downloadHtml = `
        <div class="download-options-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-download"></i> 보고서 다운로드</h3>
                    <button class="close-btn" onclick="closeDownloadModal()">&times;</button>
                </div>
                
                <div class="download-options">
                    <div class="download-option" onclick="downloadExcelReport()">
                        <div class="option-icon excel">
                            <i class="fas fa-file-excel"></i>
                        </div>
                        <div class="option-content">
                            <h4>Excel 보고서</h4>
                            <p>상세 데이터와 분석 결과를 Excel 형식으로 다운로드</p>
                            <span class="file-format">.xlsx</span>
                        </div>
                    </div>
                    
                    <div class="download-option" onclick="downloadPDFReport()">
                        <div class="option-icon pdf">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="option-content">
                            <h4>PDF 보고서</h4>
                            <p>인쇄 가능한 전문적인 분석 보고서</p>
                            <span class="file-format">.pdf</span>
                        </div>
                    </div>
                    
                    <div class="download-option" onclick="downloadWordReport()">
                        <div class="option-icon word">
                            <i class="fas fa-file-word"></i>
                        </div>
                        <div class="option-content">
                            <h4>Word 보고서</h4>
                            <p>편집 가능한 문서 형태의 분석 보고서</p>
                            <span class="file-format">.docx</span>
                        </div>
                    </div>
                    
                    <div class="download-option" onclick="downloadHtmlReport()">
                        <div class="option-icon html">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="option-content">
                            <h4>웹 보고서</h4>
                            <p>브라우저에서 열 수 있는 HTML 보고서</p>
                            <span class="file-format">.html</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', downloadHtml);
}

function closeDownloadModal() {
    const modal = document.querySelector('.download-options-modal');
    if (modal) {
        modal.remove();
    }
}

// Excel 보고서 다운로드
function downloadExcelReport() {
    console.log('Excel 보고서 생성 시작');
    
    // CSV 형식으로 데이터 생성 (Excel에서 열 수 있음)
    let csvContent = '\uFEFF'; // BOM for UTF-8
    
    // 요약 정보
    csvContent += '=== PayPulse 급여 분석 보고서 ===\n';
    csvContent += `생성일시,${new Date().toLocaleString('ko-KR')}\n`;
    csvContent += `데이터 기간,${dataAnalysis.yearRange.min}-${dataAnalysis.yearRange.max}\n`;
    csvContent += `총 레코드 수,${dataAnalysis.totalRecords.toLocaleString()}\n`;
    csvContent += `고유 직원 수,${dataAnalysis.uniqueEmployees}\n`;
    csvContent += `부서 수,${dataAnalysis.departments.length}\n`;
    csvContent += `총 지급액,₩${dataAnalysis.totalPayment.toLocaleString()}\n`;
    csvContent += `총 공제액,₩${dataAnalysis.totalDeduction.toLocaleString()}\n`;
    csvContent += `순 지급액,₩${(dataAnalysis.totalPayment - dataAnalysis.totalDeduction).toLocaleString()}\n\n`;
    
    // 부서별 분석
    csvContent += '=== 부서별 분석 ===\n';
    csvContent += '부서명,직원수,총지급액,평균지급액\n';
    dataAnalysis.departmentStats.forEach(dept => {
        csvContent += `${dept.name},${dept.employeeCount},₩${dept.totalPay.toLocaleString()},₩${Math.round(dept.avgPay).toLocaleString()}\n`;
    });
    csvContent += '\n';
    
    // 직급별 분석
    csvContent += '=== 직급별 분석 ===\n';
    csvContent += '직급,직원수,총지급액,평균지급액\n';
    dataAnalysis.positionStats.forEach(pos => {
        csvContent += `${pos.name},${pos.employeeCount},₩${pos.totalPay.toLocaleString()},₩${Math.round(pos.avgPay).toLocaleString()}\n`;
    });
    
    // 샘플 데이터 (처음 10건)
    if (salaryData && salaryData.length > 0) {
        csvContent += '\n=== 샘플 데이터 (처음 10건) ===\n';
        const headers = Object.keys(salaryData[0]);
        csvContent += headers.join(',') + '\n';
        
        salaryData.slice(0, 10).forEach(record => {
            const values = headers.map(header => {
                let value = record[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value;
            });
            csvContent += values.join(',') + '\n';
        });
    }
    
    downloadFile(csvContent, `PayPulse_분석보고서_${getCurrentDate()}.csv`, 'text/csv;charset=utf-8;');
    closeDownloadModal();
}

// PDF 보고서 다운로드 (HTML → PDF 변환)
function downloadPDFReport() {
    console.log('PDF 보고서 생성 시작');
    
    const pdfContent = generatePDFHTML();
    
    // 새 창에서 PDF 생성용 페이지 열기
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // PDF 인쇄 대화상자 열기
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    closeDownloadModal();
}

// Word 보고서 다운로드 (HTML → Word)
function downloadWordReport() {
    console.log('Word 보고서 생성 시작');
    
    const wordContent = generateWordHTML();
    
    // HTML을 Word 문서로 다운로드
    downloadFile(wordContent, `PayPulse_분석보고서_${getCurrentDate()}.doc`, 'application/msword');
    closeDownloadModal();
}

// HTML 보고서 다운로드
function downloadHtmlReport() {
    console.log('HTML 보고서 생성 시작');
    
    const htmlContent = generateFullHTMLReport();
    
    downloadFile(htmlContent, `PayPulse_분석보고서_${getCurrentDate()}.html`, 'text/html');
    closeDownloadModal();
}

// PDF용 HTML 생성
function generatePDFHTML() {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>PayPulse 급여 분석 보고서</title>
    <style>
        @media print {
            body { margin: 0; font-family: 'Malgun Gothic', sans-serif; }
            .page-break { page-break-before: always; }
        }
        body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #f5500; padding-bottom: 20px; }
        .header h1 { color: #f55000; font-size: 2.5rem; margin-bottom: 10px; }
        .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .summary-table th { background: #f55000; color: white; }
        .chart-section { margin: 30px 0; }
        .chart-title { color: #f55000; font-size: 1.5rem; margin-bottom: 15px; border-left: 4px solid #f55000; padding-left: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 PayPulse 급여 분석 보고서</h1>
        <p>생성일시: ${new Date().toLocaleString('ko-KR')}</p>
    </div>
    
    <div class="summary-section">
        <h2 class="chart-title">📊 데이터 요약</h2>
        <table class="summary-table">
            <tr><th>항목</th><th>값</th></tr>
            <tr><td>데이터 기간</td><td>${dataAnalysis.yearRange.min} - ${dataAnalysis.yearRange.max}</td></tr>
            <tr><td>총 레코드 수</td><td>${dataAnalysis.totalRecords.toLocaleString()}건</td></tr>
            <tr><td>고유 직원 수</td><td>${dataAnalysis.uniqueEmployees}명</td></tr>
            <tr><td>부서 수</td><td>${dataAnalysis.departments.length}개</td></tr>
            <tr><td>총 지급액</td><td>₩${dataAnalysis.totalPayment.toLocaleString()}</td></tr>
            <tr><td>총 공제액</td><td>₩${dataAnalysis.totalDeduction.toLocaleString()}</td></tr>
            <tr><td>순 지급액</td><td>₩${(dataAnalysis.totalPayment - dataAnalysis.totalDeduction).toLocaleString()}</td></tr>
        </table>
    </div>
    
    <div class="page-break"></div>
    
    <div class="chart-section">
        <h2 class="chart-title">🏢 부서별 분석</h2>
        <table class="summary-table">
            <thead>
                <tr><th>부서명</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
            </thead>
            <tbody>
                ${dataAnalysis.departmentStats.map(dept => `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.employeeCount}명</td>
                        <td>₩${dept.totalPay.toLocaleString()}</td>
                        <td>₩${Math.round(dept.avgPay).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="chart-section">
        <h2 class="chart-title">👔 직급별 분석</h2>
        <table class="summary-table">
            <thead>
                <tr><th>직급</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
            </thead>
            <tbody>
                ${dataAnalysis.positionStats.map(pos => `
                    <tr>
                        <td>${pos.name}</td>
                        <td>${pos.employeeCount}명</td>
                        <td>₩${pos.totalPay.toLocaleString()}</td>
                        <td>₩${Math.round(pos.avgPay).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
}

// Word용 HTML 생성
function generateWordHTML() {
    return `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>PayPulse 급여 분석 보고서</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body { font-family: 맑은고딕, sans-serif; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { color: #f55000; font-size: 24pt; font-weight: bold; }
        .subtitle { color: #666; font-size: 12pt; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f55000; color: white; font-weight: bold; }
        .section-title { color: #f55000; font-size: 16pt; font-weight: bold; margin: 20px 0 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">💰 PayPulse 급여 분석 보고서</div>
        <div class="subtitle">생성일시: ${new Date().toLocaleString('ko-KR')}</div>
    </div>
    
    <div class="section-title">📊 데이터 요약</div>
    <table>
        <tr><td style="font-weight:bold;">데이터 기간</td><td>${dataAnalysis.yearRange.min} - ${dataAnalysis.yearRange.max}</td></tr>
        <tr><td style="font-weight:bold;">총 레코드 수</td><td>${dataAnalysis.totalRecords.toLocaleString()}건</td></tr>
        <tr><td style="font-weight:bold;">고유 직원 수</td><td>${dataAnalysis.uniqueEmployees}명</td></tr>
        <tr><td style="font-weight:bold;">부서 수</td><td>${dataAnalysis.departments.length}개</td></tr>
        <tr><td style="font-weight:bold;">총 지급액</td><td>₩${dataAnalysis.totalPayment.toLocaleString()}</td></tr>
        <tr><td style="font-weight:bold;">총 공제액</td><td>₩${dataAnalysis.totalDeduction.toLocaleString()}</td></tr>
        <tr><td style="font-weight:bold;">순 지급액</td><td>₩${(dataAnalysis.totalPayment - dataAnalysis.totalDeduction).toLocaleString()}</td></tr>
    </table>
    
    <div class="section-title">🏢 부서별 분석</div>
    <table>
        <thead>
            <tr><th>부서명</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
        </thead>
        <tbody>
            ${dataAnalysis.departmentStats.map(dept => `
                <tr>
                    <td>${dept.name}</td>
                    <td>${dept.employeeCount}명</td>
                    <td>₩${dept.totalPay.toLocaleString()}</td>
                    <td>₩${Math.round(dept.avgPay).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="section-title">👔 직급별 분석</div>
    <table>
        <thead>
            <tr><th>직급</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
        </thead>
        <tbody>
            ${dataAnalysis.positionStats.map(pos => `
                <tr>
                    <td>${pos.name}</td>
                    <td>${pos.employeeCount}명</td>
                    <td>₩${pos.totalPay.toLocaleString()}</td>
                    <td>₩${Math.round(pos.avgPay).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
}

// 완전한 HTML 보고서 생성
function generateFullHTMLReport() {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayPulse 급여 분석 보고서</title>
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #f55000; padding-bottom: 20px; }
        .header h1 { color: #f55000; font-size: 2.5rem; margin-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: #f55000; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2rem; }
        .summary-card p { margin: 0; font-size: 0.9rem; }
        .analysis-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .analysis-table th, .analysis-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .analysis-table th { background: #f55000; color: white; }
        .section-title { color: #f55000; font-size: 1.8rem; margin: 30px 0 15px 0; border-left: 4px solid #f55000; padding-left: 15px; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 PayPulse 급여 분석 보고서</h1>
            <p>생성일시: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>${dataAnalysis.totalRecords.toLocaleString()}</h3>
                <p>총 레코드 수</p>
            </div>
            <div class="summary-card">
                <h3>${dataAnalysis.uniqueEmployees}</h3>
                <p>고유 직원 수</p>
            </div>
            <div class="summary-card">
                <h3>${dataAnalysis.departments.length}</h3>
                <p>부서 수</p>
            </div>
            <div class="summary-card">
                <h3>₩${(dataAnalysis.totalPayment / 100000000).toFixed(1)}</h3>
                <p>총 지급액 (억원)</p>
            </div>
        </div>
        
        <h2 class="section-title">🏢 부서별 분석</h2>
        <table class="analysis-table">
            <thead>
                <tr><th>부서명</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
            </thead>
            <tbody>
                ${dataAnalysis.departmentStats.map(dept => `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.employeeCount}명</td>
                        <td>₩${dept.totalPay.toLocaleString()}</td>
                        <td>₩${Math.round(dept.avgPay).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2 class="section-title">👔 직급별 분석</h2>
        <table class="analysis-table">
            <thead>
                <tr><th>직급</th><th>직원 수</th><th>총 지급액</th><th>평균 지급액</th></tr>
            </thead>
            <tbody>
                ${dataAnalysis.positionStats.map(pos => `
                    <tr>
                        <td>${pos.name}</td>
                        <td>${pos.employeeCount}명</td>
                        <td>₩${pos.totalPay.toLocaleString()}</td>
                        <td>₩${Math.round(pos.avgPay).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>본 보고서는 PayPulse AI 인건비 관리 시스템에서 자동 생성되었습니다.</p>
        </div>
    </div>
</body>
</html>`;
}

// 파일 다운로드 헬퍼 함수
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 현재 날짜를 파일명 형식으로 반환
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
}

// 급여 데이터 처리 함수 업데이트 (자동 저장 포함)
const originalProcessSalaryJsonData = processSalaryJsonData;
processSalaryJsonData = function(data, fileName) {
    console.log('급여 데이터 처리 및 저장 시작');
    
    // 기존 처리 로직
    const cleanedData = cleanSalaryData(data);
    salaryData = cleanedData;
    dataAnalysis = analyzeSalaryData(cleanedData);
    
    // 자동 저장
    const saveSuccess = saveDataToStorage(cleanedData, dataAnalysis, fileName);
    
    if (saveSuccess) {
        console.log('데이터 자동 저장 완료');
    } else {
        console.warn('데이터 자동 저장 실패');
    }
    
    // UI 업데이트
    showSalaryUploadSuccess(fileName, dataAnalysis);
};

// 기존 exportSummary 함수 업데이트
function exportSummary() {
    showDownloadOptions();
}

// 데이터 저장 및 복원 관련 함수들
const STORAGE_KEYS = {
    SALARY_DATA: 'paypulse_salary_data_full',
    ANALYSIS: 'paypulse_analysis_data',
    UPLOAD_HISTORY: 'paypulse_upload_history',
    LAST_UPLOAD: 'paypulse_last_upload_date'
};

// 페이지 로드 시 저장된 데이터 확인 및 복원
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨 - 저장된 데이터 확인 중...');
    
    // 기존 이벤트 설정
    setupMenuEvents();
    setupFileUploadEvents();
    
    // 저장된 데이터 복원
    restoreSavedData();
    
    // 대시보드에 저장된 데이터 상태 표시
    updateDashboardWithSavedData();
});

// 저장된 데이터 복원
function restoreSavedData() {
    try {
        console.log('데이터 복원 시작...');
        const savedAnalysis = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
        const restoredData = restoreChunkedData();
        
        console.log('복원 결과:', {
            hasSavedAnalysis: !!savedAnalysis,
            hasRestoredData: !!restoredData,
            restoredDataLength: restoredData ? restoredData.length : 0
        });
        
        if (restoredData && savedAnalysis) {
            console.log('저장된 데이터 복원됨:', restoredData.length, '건');
            
            salaryData = restoredData;
            dataAnalysis = JSON.parse(savedAnalysis);
            
            console.log('전역 변수 설정 완료:', {
                salaryDataLength: salaryData.length,
                dataAnalysisKeys: Object.keys(dataAnalysis)
            });
            
            showDataRestoredNotification();
            return true;
        } else {
            console.log('복원할 데이터 없음');
            return false;
        }
    } catch (error) {
        console.error('데이터 복원 실패:', error);
        clearSavedData();
        return false;
    }
}

// 데이터 저장 (향상된 버전)
function saveDataToStorage(data, analysis, fileName) {
    try {
        // 큰 데이터를 청크 단위로 저장
        const chunkSize = 50; // 50개씩 나누어 저장
        const chunks = [];
        
        for (let i = 0; i < data.length; i += chunkSize) {
            chunks.push(data.slice(i, i + chunkSize));
        }
        
        // 청크별로 저장
        chunks.forEach((chunk, index) => {
            localStorage.setItem(`${STORAGE_KEYS.SALARY_DATA}_chunk_${index}`, JSON.stringify(chunk));
        });
        
        // 메타데이터 저장
        const metadata = {
            totalChunks: chunks.length,
            totalRecords: data.length,
            fileName: fileName,
            uploadDate: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem(`${STORAGE_KEYS.SALARY_DATA}_metadata`, JSON.stringify(metadata));
        localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
        
        // 업로드 이력 저장
        updateUploadHistory(fileName, data.length);
        
        console.log('데이터 저장 완료:', chunks.length, '청크,', data.length, '레코드');
        return true;
        
    } catch (error) {
        console.error('데이터 저장 실패:', error);
        
        // 용량 부족일 경우 샘플 데이터만 저장
        if (error.name === 'QuotaExceededError') {
            return saveReducedData(data, analysis, fileName);
        }
        return false;
    }
}

// 용량 부족 시 축소된 데이터 저장
function saveReducedData(data, analysis, fileName) {
    try {
        console.log('용량 부족으로 샘플 데이터만 저장');
        
        const sampleData = data.slice(0, 500); // 처음 500건만 저장
        localStorage.setItem(STORAGE_KEYS.SALARY_DATA, JSON.stringify(sampleData));
        localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
        
        const metadata = {
            isSample: true,
            originalCount: data.length,
            sampleCount: sampleData.length,
            fileName: fileName,
            uploadDate: new Date().toISOString()
        };
        
        localStorage.setItem(`${STORAGE_KEYS.SALARY_DATA}_metadata`, JSON.stringify(metadata));
        
        showStorageLimitNotification(data.length, sampleData.length);
        return true;
        
    } catch (error) {
        console.error('축소 데이터 저장도 실패:', error);
        return false;
    }
}

// 청크 데이터 복원
function restoreChunkedData() {
    try {
        const metadata = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.SALARY_DATA}_metadata`));
        
        if (!metadata) return null;
        
        if (metadata.isSample) {
            // 샘플 데이터 복원
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALARY_DATA));
        }
        
        // 청크 데이터 복원
        const chunks = [];
        for (let i = 0; i < metadata.totalChunks; i++) {
            const chunk = localStorage.getItem(`${STORAGE_KEYS.SALARY_DATA}_chunk_${i}`);
            if (chunk) {
                chunks.push(...JSON.parse(chunk));
            }
        }
        
        console.log('청크 데이터 복원 완료:', chunks.length, '레코드');
        return chunks;
        
    } catch (error) {
        console.error('청크 데이터 복원 실패:', error);
        return null;
    }
}

// 업로드 이력 관리
function updateUploadHistory(fileName, recordCount) {
    try {
        let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY)) || [];
        
        const newEntry = {
            fileName: fileName,
            recordCount: recordCount,
            uploadDate: new Date().toISOString(),
            id: Date.now()
        };
        
        // 최신 업로드를 맨 앞에 추가
        history.unshift(newEntry);
        
        // 최대 5개까지만 보관
        if (history.length > 5) {
            history = history.slice(0, 5);
        }
        
        localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(history));
        localStorage.setItem(STORAGE_KEYS.LAST_UPLOAD, new Date().toISOString());
        
    } catch (error) {
        console.error('업로드 이력 저장 실패:', error);
    }
}

// 대시보드에 저장된 데이터 상태 표시
function updateDashboardWithSavedData() {
    // 메인 대시보드에서 저장된 데이터 카드 제거
    // 이제 업로드 페이지에서 관리하도록 변경
    console.log('대시보드에서 저장된 데이터 카드 제거됨');
}

// 데이터 복원 알림
function showDataRestoredNotification() {
    const notification = document.createElement('div');
    notification.className = 'data-restored-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>이전 업로드 데이터가 자동으로 복원되었습니다!</span>
            <button onclick="this.parentElement.parentElement.remove()" class="close-notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 저장 공간 부족 알림
function showStorageLimitNotification(originalCount, savedCount) {
    const notification = document.createElement('div');
    notification.className = 'storage-limit-notification';
    notification.innerHTML = `
        <div class="notification-content warning">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="notification-text">
                <strong>저장 공간 부족</strong><br>
                전체 ${originalCount.toLocaleString()}건 중 ${savedCount.toLocaleString()}건만 저장되었습니다.
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
}

// 저장된 데이터 삭제
function clearSavedData(confirm = false) {
    if (confirm && !window.confirm('저장된 모든 데이터를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        // 모든 관련 데이터 삭제
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // 청크 데이터 삭제
        for (let i = 0; i < 100; i++) { // 최대 100개 청크까지 확인
            const chunkKey = `${STORAGE_KEYS.SALARY_DATA}_chunk_${i}`;
            if (localStorage.getItem(chunkKey)) {
                localStorage.removeItem(chunkKey);
            } else {
                break;
            }
        }
        
        // 메타데이터 삭제
        localStorage.removeItem(`${STORAGE_KEYS.SALARY_DATA}_metadata`);
        
        // 전역 변수 초기화
        salaryData = [];
        dataAnalysis = {};
        window.uploadedSalaryData = null;
        
        console.log('저장된 데이터 모두 삭제됨');
        
        // 페이지 새로고침으로 UI 업데이트
        location.reload();
        
    } catch (error) {
        console.error('데이터 삭제 실패:', error);
        alert('데이터 삭제 중 오류가 발생했습니다.');
    }
}

// 저장 상태 확인 함수
function getStorageInfo() {
    try {
        const metadata = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.SALARY_DATA}_metadata`) || '{}');
        const lastUpload = localStorage.getItem(STORAGE_KEYS.LAST_UPLOAD);
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY) || '[]');
        
        return {
            hasData: salaryData && salaryData.length > 0,
            recordCount: salaryData ? salaryData.length : 0,
            fileName: metadata.fileName || 'Unknown',
            lastUpload: lastUpload ? new Date(lastUpload) : null,
            isSample: metadata.isSample || false,
            uploadHistory: history
        };
    } catch (error) {
        console.error('저장 정보 확인 실패:', error);
        return { hasData: false };
    }
}

// 업로드 히스토리 보기
function showUploadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY) || '[]');
    
    if (history.length === 0) {
        alert('업로드 이력이 없습니다.');
        return;
    }
    
    const historyHtml = `
        <div class="upload-history-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-history"></i> 업로드 이력</h3>
                    <button class="close-btn" onclick="closeUploadHistoryModal()">&times;</button>
                </div>
                <div class="history-list">
                    ${history.map(item => `
                        <div class="history-item">
                            <div class="history-info">
                                <h4>${item.fileName}</h4>
                                <p>${item.recordCount.toLocaleString()}건 • ${new Date(item.uploadDate).toLocaleString('ko-KR')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', historyHtml);
}

function closeUploadHistoryModal() {
    const modal = document.querySelector('.upload-history-modal');
    if (modal) modal.remove();
}

// AI 어시스턴트 관련 함수들
let chatHistory = [];
let aiContext = '';

// AI 어시스턴트 페이지 콘텐츠 생성
function getAIChatPageContent() {
    const storageInfo = getStorageInfo();
    
    return `
        <div class="ai-chat-container">
            <div class="ai-header">
                <div class="ai-profile">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-info">
                        <h2>PayPulse AI 어시스턴트</h2>
                        <p class="ai-status">
                            ${storageInfo.hasData ? 
                                `📊 ${storageInfo.recordCount.toLocaleString()}건의 급여 데이터 분석 준비완료` : 
                                '📋 데이터를 업로드하면 더 정확한 분석을 제공합니다'
                            }
                        </p>
                    </div>
                </div>
                <div class="ai-capabilities">
                    <div class="capability-tag">급여 분석</div>
                    <div class="capability-tag">업계 동향</div>
                    <div class="capability-tag">HR 컨설팅</div>
                    <div class="capability-tag">법규 해석</div>
                </div>
            </div>
            
                                    <div class="chat-messages" id="chatMessages">
                            <div class="ai-message welcome-message">
                                <div class="message-avatar">🤖</div>
                                <div class="message-content">
                                    <div class="message-text">
                                        안녕하세요! PayPulse AI 어시스턴트입니다. 💼✨<br><br>
                                        
                                        <strong>🎯 제가 도울 수 있는 영역들:</strong><br>
                                        ${storageInfo.hasData ? `
                                        📊 <strong>업로드된 데이터 분석</strong><br>
                                        • 부서별/직급별 급여 분석<br>
                                        • 인건비 트렌드 및 패턴 발견<br>
                                        • 4대보험 최적화 방안<br>
                                        • 퇴직금 충당금 계산<br><br>
                                        ` : ''}
                                        
                                        💡 <strong>HR 전문 컨설팅</strong><br>
                                        • 최신 노동법 및 HR 규정 해석<br>
                                        • 급여 체계 개선 방안<br>
                                        • 인사평가 및 보상 전략<br><br>
                                        
                                        📈 <strong>업계 동향 분석</strong><br>
                                        • 산업별 급여 벤치마킹<br>
                                        • HR 트렌드 및 미래 전망<br>
                                        • 인건비 예산 계획<br><br>
                                        
                                        <strong>어떤 것이 궁금하신가요?</strong>
                                    </div>
                                    
                                    ${storageInfo.hasData ? `
                                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 15px; border-left: 4px solid #28a745;">
                                        <strong>📊 현재 업로드된 데이터:</strong><br>
                                        • 총 레코드: <strong>${storageInfo.recordCount.toLocaleString()}건</strong><br>
                                        • 고유 직원: <strong>${storageInfo.uniqueEmployees}명</strong><br>
                                        • 부서 수: <strong>${storageInfo.departmentCount}개</strong><br>
                                        • 직급 수: <strong>${storageInfo.positionCount}개</strong><br>
                                        • 분석 기간: <strong>${storageInfo.yearRange.min}년 ~ ${storageInfo.yearRange.max}년</strong>
                                    </div>
                                    ` : ''}
                        <div class="quick-questions">
                            <div class="quick-question" onclick="sendQuickQuestion('부서별 평균 급여 분석해줘')">
                                부서별 평균 급여 분석
                            </div>
                            <div class="quick-question" onclick="sendQuickQuestion('2024년 최저임금 인상률과 우리 회사 영향도는?')">
                                최저임금 영향도 분석
                            </div>
                            <div class="quick-question" onclick="sendQuickQuestion('시간외근무 수당 최적화 방안은?')">
                                시간외근무 최적화
                            </div>
                            <div class="quick-question" onclick="sendQuickQuestion('퇴직연금 vs 퇴직금 장단점 비교해줘')">
                                퇴직연금 vs 퇴직금
                            </div>
                            ${!storageInfo.hasData ? `
                            <div class="quick-question" onclick="loadTestData()" style="background: #28a745; color: white;">
                                🧪 테스트 데이터 로드
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <div class="input-suggestions" id="inputSuggestions"></div>
                <div class="chat-input-area">
                    <div class="input-wrapper">
                        <textarea 
                            id="chatInput" 
                            placeholder="예: 우리 회사 인건비가 업계 평균보다 높은 이유가 뭘까?"
                            rows="1"></textarea>
                        <div class="input-actions">
                            <button class="attachment-btn" onclick="showDataAttachment()" title="데이터 첨부">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <button class="send-btn" onclick="sendMessage()" title="전송">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 빠른 질문 전송
function sendQuickQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = question;
        sendMessage();
    }
}

// AI 채팅용 메시지 전송 함수
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage('user', message);
        input.value = '';
        
        // AI 응답 생성 (데이터 기반)
        setTimeout(() => {
            const aiResponse = generateDataBasedResponse(message);
            addMessage('ai', aiResponse);
        }, 1000);
    }
}

// AI 응답 처리
async function processAIResponse(userMessage) {
    // 타이핑 인디케이터 표시
    const typingId = showTypingIndicator();
    
    try {
        // 컨텍스트 준비
        const context = prepareAIContext(userMessage);
        
        // AI 응답 생성 (실제 API 호출 시뮬레이션)
        const aiResponse = await generateAIResponse(userMessage, context);
        
        // 타이핑 인디케이터 제거
        removeTypingIndicator(typingId);
        
        // AI 응답 추가
        addMessage('ai', aiResponse);
        
        // 채팅 기록 저장
        saveChatHistory(userMessage, aiResponse);
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('ai', '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요. 🔄');
        console.error('AI 응답 생성 오류:', error);
    }
}

// AI 컨텍스트 준비
function prepareAIContext(userMessage) {
    let context = `
당신은 PayPulse의 전문 HR AI 어시스턴트입니다. 다음 역할을 수행해주세요:

1. 급여 및 인사 데이터 분석 전문가
2. 최신 노동법 및 HR 규정 해석
3. 업계 동향 및 벤치마킹 제공
4. 실무진에게 실용적인 조언 제공

현재 사용자 질문: "${userMessage}"

`;

    // 업로드된 데이터가 있는 경우 컨텍스트 추가
    if (salaryData && salaryData.length > 0 && dataAnalysis) {
        context += `
업로드된 데이터 정보:
- 총 레코드: ${dataAnalysis.totalRecords.toLocaleString()}건
- 직원 수: ${dataAnalysis.uniqueEmployees}명
- 부서 수: ${dataAnalysis.departments.length}개
- 데이터 기간: ${dataAnalysis.yearRange.min}-${dataAnalysis.yearRange.max}
- 총 지급액: ₩${dataAnalysis.totalPayment.toLocaleString()}
- 주요 부서: ${dataAnalysis.departments.join(', ')}
- 주요 직급: ${dataAnalysis.positionStats.slice(0, 5).map(p => p.name).join(', ')}

부서별 현황:
${dataAnalysis.departmentStats.slice(0, 5).map(dept => 
    `- ${dept.name}: ${dept.employeeCount}명, 평균 ₩${Math.round(dept.avgPay).toLocaleString()}`
).join('\n')}

`;
    }

    return context;
}

// AI 응답 생성 (실제 구현 시 API 연동)
async function generateAIResponse(message, context) {
    // 실제 구현에서는 OpenAI API, Claude API 등을 호출
    // 여기서는 시뮬레이션 응답을 생성
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 업로드된 데이터가 있는지 확인
    const hasData = salaryData && salaryData.length > 0 && dataAnalysis;
    
    // 디버깅 정보 출력
    console.log('AI 응답 생성 시작:', {
        message: message,
        hasSalaryData: !!salaryData,
        salaryDataLength: salaryData ? salaryData.length : 0,
        hasDataAnalysis: !!dataAnalysis,
        dataAnalysisKeys: dataAnalysis ? Object.keys(dataAnalysis) : []
    });
    
    // 메시지 패턴에 따른 응답 생성
    if (message.includes('부서별') && message.includes('분석')) {
        console.log('부서별 분석 요청');
        return generateDepartmentAnalysisResponse();
    } else if (message.includes('최저임금') || message.includes('임금')) {
        console.log('최저임금 분석 요청');
        return generateMinimumWageResponse();
    } else if (message.includes('시간외') || message.includes('야근') || message.includes('수당')) {
        console.log('시간외근무 분석 요청');
        return generateOvertimeResponse();
    } else if (message.includes('퇴직금') || message.includes('퇴직연금')) {
        console.log('퇴직금 분석 요청');
        return generateRetirementResponse();
    } else if (message.includes('4대보험') || message.includes('보험')) {
        console.log('4대보험 분석 요청');
        return generateInsuranceResponse();
    } else if (message.includes('직급') || message.includes('직책')) {
        console.log('직급별 분석 요청');
        return generatePositionAnalysisResponse();
    } else if (message.includes('연도') || message.includes('년도') || message.includes('기간')) {
        console.log('연도별 분석 요청');
        return generateYearlyAnalysisResponse();
    } else if (message.includes('평균') || message.includes('중간값') || message.includes('분포')) {
        console.log('통계 분석 요청');
        return generateStatisticalAnalysisResponse();
    } else if (message.includes('이직') || message.includes('퇴사') || message.includes('유지')) {
        console.log('인재 유지 분석 요청');
        return generateRetentionAnalysisResponse();
    } else if (message.includes('성과') || message.includes('KPI') || message.includes('평가')) {
        console.log('성과 분석 요청');
        return generatePerformanceAnalysisResponse();
    } else if (message.includes('예산') || message.includes('비용') || message.includes('절감')) {
        console.log('예산 분석 요청');
        return generateBudgetAnalysisResponse();
    } else {
        console.log('일반 HR 응답');
        return generateGeneralHRResponse(message);
    }
}

// 부서별 분석 응답 생성 (가독성 개선)
function generateDepartmentAnalysisResponse() {
    console.log('부서별 분석 함수 호출:', {
        hasDataAnalysis: !!dataAnalysis,
        hasDepartmentStats: !!(dataAnalysis && dataAnalysis.departmentStats),
        departmentStatsLength: dataAnalysis && dataAnalysis.departmentStats ? dataAnalysis.departmentStats.length : 0
    });
    
    if (!dataAnalysis || !dataAnalysis.departmentStats) {
        console.log('데이터 없음 - 일반 가이드 제공');
        return `
<h3>📊 부서별 급여 분석</h3>

현재 업로드된 데이터가 없어 일반적인 분석 가이드를 제공합니다.

<h4>🔍 분석 시 고려사항</h4>
<strong>1. 직무 특성별 그룹핑</strong>
• <strong>영업직:</strong> 인센티브 비중이 큰 변동급여 구조<br>
• <strong>관리직:</strong> 안정적인 고정급여 위주<br>
• <strong>기술직:</strong> 전문성에 따른 차등 보상

<strong>2. 부서별 성과 연동성</strong>
• KPI 달성도와 급여 상관관계 분석<br>
• 부서별 매출 기여도 대비 인건비 효율성

<h4>💡 개선 방안</h4>
• 부서별 급여 편차가 <strong>30% 이상</strong>이면 형평성 검토 필요<br>
• 고성과 부서의 이탈률과 급여 수준 상관관계 분석

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 더 구체적인 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    console.log('데이터 있음 - 구체적 분석 제공');
    console.log('부서 통계:', dataAnalysis.departmentStats);
    
    const topDepts = dataAnalysis.departmentStats
        .sort((a, b) => b.avgPay - a.avgPay)
        .slice(0, 3);
    
    const lowDepts = dataAnalysis.departmentStats
        .sort((a, b) => a.avgPay - b.avgPay)
        .slice(0, 3);

    console.log('상위 부서:', topDepts);
    console.log('하위 부서:', lowDepts);

    return `
<h3>📊 부서별 급여 분석 결과</h3>

<h4>🏆 평균 급여 상위 부서</h4>
${topDepts.map((dept, index) => `
<strong>${index + 1}. ${dept.name}</strong><br>
📋 직원 수: <strong>${dept.employeeCount}명</strong><br>
💰 평균 급여: <strong>₩${Math.round(dept.avgPay).toLocaleString()}</strong><br>
📊 총 지급액: <strong>₩${dept.totalPay.toLocaleString()}</strong><br><br>
`).join('')}

<h4>📉 평균 급여 하위 부서</h4>
${lowDepts.map((dept, index) => `
<strong>${index + 1}. ${dept.name}</strong><br>
👥 직원 수: <strong>${dept.employeeCount}명</strong> | 💰 평균 급여: <strong>₩${Math.round(dept.avgPay).toLocaleString()}</strong><br>
`).join('')}

<h4>💡 핵심 인사이트</h4>
<table>
<tr><th>분석 항목</th><th>결과</th></tr>
<tr><td>최고-최저 부서 간 급여 격차</td><td><strong>${((topDepts[0].avgPay / lowDepts[0].avgPay - 1) * 100).toFixed(1)}%</strong></td></tr>
<tr><td>권장 조치</td><td>전체 평균 대비 편차가 큰 부서들의 역할과 성과 재검토</td></tr>
<tr><td>리스크 관리</td><td>핵심 부서의 경쟁력 있는 보상 체계로 인재 유출 방지</td></tr>
</table>

<h4>🎯 추천 후속 분석</h4>
• "시간외근무가 많은 부서는 어디야?"<br>
• "부서별 이직률과 급여 수준의 상관관계는?"<br>
• "성과가 좋은 부서의 특징을 분석해줘"
    `;
}

// 최저임금 관련 응답 (가독성 개선)
function generateMinimumWageResponse() {
    return `
<h3>💰 2024년 최저임금 현황 및 영향도 분석</h3>

<h4>📊 2024년 최저임금 정보</h4>
<table>
<tr><th>구분</th><th>금액</th><th>비고</th></tr>
<tr><td><strong>시급</strong></td><td>9,860원</td><td>전년 대비 2.5% 인상</td></tr>
<tr><td><strong>월급 환산</strong></td><td>약 2,060,000원</td><td>주 40시간 기준</td></tr>
<tr><td><strong>적용 대상</strong></td><td>모든 사업장 근로자</td><td>업종 불문</td></tr>
</table>

<h4>🎯 우리 회사 영향도 분석</h4>
${salaryData && salaryData.length > 0 ? `
<strong>현재 데이터 기준:</strong><br>
📋 최저임금 근접 직원: <strong>분석 중</strong><br>
📊 시급 환산 시 영향 받을 예상 인원: <strong>계산 중</strong><br>
💸 예상 추가 인건비: <strong>분석 중</strong>
` : `
<blockquote>
💬 <strong>알림:</strong> 데이터 업로드 시 구체적인 영향도를 정확히 계산해드릴 수 있습니다.
</blockquote>
`}

<h4>⚖️ 법적 준수사항</h4>
<strong>🚨 최저임금법 위반 시 처벌</strong>
• 3년 이하 징역 또는 2천만원 이하 벌금<br>
• 미지급 임금의 <strong>50% 추가 지급</strong> (지연이자)

<strong>⚠️ 주의사항</strong>
• 수습기간 중에도 최저임금의 <strong>90% 이상</strong> 지급<br>
• 식대, 교통비 등은 최저임금 산정에서 <strong>제외</strong><br>
• 포괄임금제라도 최저임금은 <strong>반드시 보장</strong>

<h4>💡 대응 전략</h4>
<strong>1. 정기적 점검</strong> - 월 단위 급여 체계 검토<br>
<strong>2. 비용 최적화</strong> - 시간외 근무 관리를 통한 효율성 증대<br>
<strong>3. 경쟁력 확보</strong> - 생산성 향상으로 임금 경쟁력 유지

<blockquote>
🔍 <strong>심화 분석 원하시나요?</strong> 급여 데이터를 업로드하시면 정확한 시뮬레이션을 제공해드릴게요!
</blockquote>
    `;
}

// 시간외근무 최적화 응답 (가독성 개선)
function generateOvertimeResponse() {
    return `
<h3>⏰ 시간외근무 수당 최적화 전략</h3>

<h4>📊 현황 분석</h4>
${salaryData && salaryData.length > 0 ? `
<strong>업로드된 데이터 분석 중:</strong><br>
⏱️ 시간외근로수당 지급 현황<br>
📈 부서별 야근 빈도 패턴<br>
🔍 비효율적 근무 패턴 식별
` : `
<blockquote>
💬 데이터 업로드 시 정확한 현황 분석과 맞춤형 솔루션을 제공합니다.
</blockquote>
`}

<h4>💡 최적화 방안</h4>

<strong>1️⃣ 근무시간 관리</strong>
• <strong>핵심시간 집중 근무제</strong> 도입<br>
• 불필요한 회의 및 업무 프로세스 개선<br>
• 원격근무/유연근무로 통근시간 절약

<strong>2️⃣ 수당 체계 개선</strong>
• <strong>포괄임금제 vs 실비정산제</strong> 비교 검토<br>
• 대체휴무제 활용으로 수당 부담 경감<br>
• 성과급 연동으로 효율성 제고

<strong>3️⃣ 업무 효율성 향상</strong>
• 업무 자동화 도구 도입<br>
• 직원 교육을 통한 역량 강화<br>
• 적절한 인력 충원으로 업무 분산

<h4>⚖️ 법적 준수사항</h4>
<table>
<tr><th>근무 유형</th><th>한도</th><th>가산률</th></tr>
<tr><td>연장근로</td><td>주 12시간 이내</td><td>50% 이상</td></tr>
<tr><td>야간근로</td><td>22시~06시</td><td>50% 이상</td></tr>
<tr><td>휴일근로</td><td>법정/약정 휴일</td><td>50% 이상</td></tr>
</table>

<h4>📈 기대효과</h4>
<strong>💰 비용 절감:</strong> 연간 인건비 <strong>10-20%</strong> 절감 가능<br>
<strong>😊 만족도 향상:</strong> 직원 워라벨 개선<br>
<strong>📊 생산성 증대:</strong> 효율적 업무 환경 조성

<blockquote>
🎯 <strong>맞춤형 최적화 플랜</strong>이 필요하시다면 구체적인 상황을 말씀해주세요!
</blockquote>
    `;
}

// 퇴직연금 관련 응답
function generateRetirementResponse() {
    return `
🏦 **퇴직연금 vs 퇴직금 비교 분석**

**📋 제도 비교표:**

| 구분 | 퇴직금 | 퇴직연금 |
|------|--------|----------|
| **운영주체** | 회사 직접 관리 | 금융기관 위탁 |
| **적립방식** | 사내적립 또는 퇴직급여충당금 | 외부 적립 의무 |
| **세제혜택** | 퇴직 시 세액공제 | 적립 시 + 퇴직 시 이중혜택 |
| **투자수익** | 없음 | 투자수익 가능 |
| **중간정산** | 제한적 | 더 유연함 |

**💰 회사 관점에서의 장단점:**

**퇴직금 제도:**
✅ 장점:
- 관리가 상대적으로 단순
- 초기 도입 비용 적음

❌ 단점:
- 퇴직급여충당금 부담
- 세제혜택 제한적
- 직원 만족도 상대적으로 낮음

**퇴직연금 제도:**
✅ 장점:
- 외부적립으로 재무부담 분산
- 우수인재 유치/유지에 유리
- 세제혜택으로 실질적 비용 절감
- 투자수익으로 직원 만족도 증가

❌ 단점:
- 초기 설정 및 관리 복잡성
- 금융기관 수수료 발생

**🎯 전환 시 고려사항:**
1. **기존 퇴직금 정산**: 전환 시점 일괄 이관
2. **직원 동의**: 노사 합의 필요
3. **제도 선택**: DB형 vs DC형 vs 혼합형
4. **금융기관 선정**: 수수료율, 서비스 품질 검토

**💡 추천 방향:**
${salaryData && salaryData.length > 0 ? `
현재 데이터 기준으로 퇴직연금 전환 시:
- 예상 절감효과: 분석 중
- 필요 적립금: 계산 중
- 직원별 영향도: 산출 중
` : `
구체적인 절감 효과 분석을 위해 급여 데이터를 업로드해주세요.
`}

더 자세한 컨설팅이 필요하시면 언제든 말씀해주세요! 📊
    `;
}

// 4대보험 관련 응답
function generateInsuranceResponse() {
    return `
🛡️ **4대보험 최적화 가이드**

**📊 2024년 4대보험 요율:**
- **국민연금**: 9% (노사 각 4.5%)
- **건강보험**: 7.09% (노사 각 3.545%) + 장기요양 0.9182%
- **고용보험**: 
  - 일반: 2.3% (근로자 0.9%, 사용자 1.4%)
  - 우선지원 대상: 1.9% (근로자 0.9%, 사용자 1.0%)
- **산재보험**: 업종별 차등 (평균 1.8%)

**💰 현재 부담 현황:**
${salaryData && salaryData.length > 0 ? `
업로드된 데이터 기준:
- 총 4대보험료: 분석 중
- 회사 부담액: 계산 중
- 직원 부담액: 계산 중
- 월평균 부담률: 산출 중
` : `
데이터 업로드 시 정확한 부담 현황을 분석해드립니다.
`}

**🎯 최적화 전략:**

**1. 고용보험 우선지원 대상 활용**
- 중소기업 인정 시 요율 인하 (2.3% → 1.9%)
- 연간 절감효과: 급여총액의 0.4%

**2. 산재보험 요율 관리**
- 안전관리 강화로 재해율 감소
- 업종 변경 시 요율 재검토
- 예방활동 참여로 할인 혜택

**3. 건강보험 관리**
- 건강검진 수검률 향상
- 질병예방 프로그램 도입
- 보험료 부과체계 이해

**4. 급여 구조 최적화**
- 비과세 항목 활용 (식대, 교통비 등)
- 복리후생 제도 개선
- 성과급 vs 고정급 비율 조정

**⚖️ 법적 준수사항:**
- 신고 기한: 매월 10일까지
- 보험료 납부: 매월 말일까지
- 4대보험 동시 취득 원칙
- 허위신고 시 과태료 부과

**📈 기대효과:**
- 연간 보험료 절감: 5-15% 가능
- 법적 리스크 최소화
- 직원 복리후생 만족도 향상

더 구체적인 절감 방안이 궁금하시면 말씀해주세요! 💼
    `;
}

// 일반 HR 응답 생성
function generateGeneralHRResponse(message) {
    const responses = [
        `
🤔 **질문 내용을 더 구체적으로 말씀해주세요!**

다음과 같은 영역에서 도움을 드릴 수 있습니다:

**📊 데이터 분석:**
- 급여 분석 및 벤치마킹
- 부서별/직급별 현황 분석
- 인건비 트렌드 분석

**💼 HR 실무:**
- 급여 체계 설계
- 성과평가 연동 방안
- 복리후생 제도 개선

**⚖️ 법무 컨설팅:**
- 노동법 해석 및 적용
- 취업규칙 작성 가이드
- 근로계약서 검토

구체적인 상황이나 궁금한 점을 말씀해주시면 더 정확한 답변을 드릴게요! 😊
        `,
        `
💡 **HR 전문가로서 다양한 조언을 드릴 수 있습니다!**

**현재 트렌드:**
- 원격근무 급여 체계
- MZ세대 맞춤 복리후생
- ESG 경영과 인사정책
- AI 활용 HR 혁신

어떤 부분이 궁금하신지 더 자세히 말씀해주세요! 🚀
        `
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const typingId = 'typing-' + Date.now();
    const typingHtml = `
        <div class="ai-message typing-indicator" id="${typingId}">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-animation">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span class="typing-text">분석 중...</span>
            </div>
        </div>
    `;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.insertAdjacentHTML('beforeend', typingHtml);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingId;
}

// 타이핑 인디케이터 제거
function removeTypingIndicator(typingId) {
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
        typingElement.remove();
    }
}

// 기존 메시지 추가 함수 (AI 채팅용으로 대체됨)
function addMessage(sender, message) {
    console.log('기존 addMessage 함수 호출됨');
    // 새로운 AI 채팅용 addMessage 함수가 있으므로 이 함수는 사용하지 않음
}

// 채팅 기록 저장
function saveChatHistory(userMessage, aiResponse) {
    try {
        const chatData = {
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString(),
            dataContext: salaryData ? {
                recordCount: salaryData.length,
                hasAnalysis: !!dataAnalysis
            } : null
        };
        
        let history = JSON.parse(localStorage.getItem('paypulse_chat_history') || '[]');
        history.push(chatData);
        
        // 최대 50개 대화만 보관
        if (history.length > 50) {
            history = history.slice(-50);
        }
        
        localStorage.setItem('paypulse_chat_history', JSON.stringify(history));
    } catch (error) {
        console.error('채팅 기록 저장 실패:', error);
    }
}

// 메시지 복사
function copyMessage(button) {
    const messageText = button.closest('.message-content').querySelector('.message-text').innerText;
    navigator.clipboard.writeText(messageText).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1000);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
}

// 응답 재생성
function regenerateResponse(button) {
    const messageElement = button.closest('.ai-message');
    const previousUserMessage = messageElement.previousElementSibling;
    
    if (previousUserMessage && previousUserMessage.classList.contains('user-message')) {
        const userMessage = previousUserMessage.querySelector('.message-text').innerText;
        messageElement.remove();
        processAIResponse(userMessage);
    }
}

// 입력창 자동 크기 조절
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
            
            // Enter 키 이벤트 (수정됨)
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // Enter 키 이벤트 (추가)
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }, 1000);
});

// 직급별 분석 응답 생성
function generatePositionAnalysisResponse() {
    if (!dataAnalysis || !dataAnalysis.positionStats) {
        return `
<h3>👔 직급별 급여 분석</h3>

현재 업로드된 데이터가 없어 일반적인 직급별 분석 가이드를 제공합니다.

<h4>🔍 직급별 급여 체계 분석 포인트</h4>
<strong>1. 직급 간 격차 분석</strong>
• 최고직급과 최하위직급 간 급여 비율<br>
• 직급별 평균 급여 분포<br>
• 연봉 인상률의 직급별 차이

<strong>2. 시장 경쟁력 분석</strong>
• 업계 평균 대비 직급별 급여 수준<br>
• 핵심 직급의 시장 가격 대비 경쟁력<br>
• 이직률이 높은 직급의 급여 현황

<h4>💡 개선 방안</h4>
• 직급별 급여 격차가 <strong>50% 이상</strong>이면 검토 필요<br>
• 핵심 인재 직급의 경쟁력 있는 보상 체계 구축<br>
• 성과 연동형 직급별 인센티브 도입

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 구체적인 직급별 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    const topPositions = dataAnalysis.positionStats
        .sort((a, b) => b.avgPay - a.avgPay)
        .slice(0, 5);
    
    const lowPositions = dataAnalysis.positionStats
        .sort((a, b) => a.avgPay - b.avgPay)
        .slice(0, 3);

    const totalEmployees = dataAnalysis.uniqueEmployees;
    const avgPayByPosition = dataAnalysis.positionStats.reduce((sum, pos) => sum + pos.avgPay, 0) / dataAnalysis.positionStats.length;

    return `
<h3>👔 직급별 급여 분석 결과</h3>

<h4>🏆 평균 급여 상위 직급</h4>
${topPositions.map((pos, index) => `
<strong>${index + 1}. ${pos.name}</strong><br>
👥 직원 수: <strong>${pos.employeeCount}명</strong> (${((pos.employeeCount/totalEmployees)*100).toFixed(1)}%)<br>
💰 평균 급여: <strong>₩${Math.round(pos.avgPay).toLocaleString()}</strong><br>
📊 총 지급액: <strong>₩${pos.totalPay.toLocaleString()}</strong><br><br>
`).join('')}

<h4>📉 평균 급여 하위 직급</h4>
${lowPositions.map((pos, index) => `
<strong>${index + 1}. ${pos.name}</strong><br>
👥 직원 수: <strong>${pos.employeeCount}명</strong> | 💰 평균 급여: <strong>₩${Math.round(pos.avgPay).toLocaleString()}</strong><br>
`).join('')}

<h4>💡 핵심 인사이트</h4>
<table>
<tr><th>분석 항목</th><th>결과</th></tr>
<tr><td>최고-최저 직급 간 급여 격차</td><td><strong>${((topPositions[0].avgPay / lowPositions[0].avgPay - 1) * 100).toFixed(1)}%</strong></td></tr>
<tr><td>전체 평균 급여</td><td><strong>₩${Math.round(avgPayByPosition).toLocaleString()}</strong></td></tr>
<tr><td>직급별 인원 분포</td><td>${dataAnalysis.positionStats.length}개 직급으로 구성</td></tr>
<tr><td>권장 조치</td><td>급여 격차가 큰 직급 간 형평성 검토 필요</td></tr>
</table>

<h4>🎯 추천 후속 분석</h4>
• "직급별 이직률과 급여 상관관계는?"<br>
• "성과가 좋은 직급의 특징을 분석해줘"<br>
• "직급별 연봉 인상률 현황은?"
    `;
}

// 연도별 분석 응답 생성
function generateYearlyAnalysisResponse() {
    if (!dataAnalysis || !dataAnalysis.yearRange) {
        return `
<h3>📅 연도별 급여 분석</h3>

현재 업로드된 데이터가 없어 일반적인 연도별 분석 가이드를 제공합니다.

<h4>🔍 연도별 분석 포인트</h4>
<strong>1. 급여 트렌드 분석</strong>
• 연도별 평균 급여 변화 추이<br>
• 인상률의 연도별 변동<br>
• 경제 상황과의 상관관계

<strong>2. 예산 계획 지원</strong>
• 연도별 인건비 예산 추정<br>
• 인상률 기반 미래 예측<br>
• 시장 동향 반영 방안

<h4>💡 활용 방안</h4>
• 연도별 급여 데이터로 <strong>트렌드 분석</strong><br>
• <strong>예산 계획</strong> 및 <strong>인상률 결정</strong>에 활용<br>
• <strong>시장 경쟁력</strong> 유지를 위한 벤치마킹

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 연도별 상세 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    const yearRange = dataAnalysis.yearRange;
    const years = [];
    for (let year = yearRange.min; year <= yearRange.max; year++) {
        years.push(year);
    }

    // 연도별 데이터 분석 (실제로는 더 복잡한 로직 필요)
    const yearlyStats = years.map(year => {
        const yearData = salaryData.filter(d => d.연도 === year);
        if (yearData.length === 0) return null;
        
        const avgPay = yearData.reduce((sum, d) => sum + (d.실지급액 || 0), 0) / yearData.length;
        const totalPay = yearData.reduce((sum, d) => sum + (d.실지급액 || 0), 0);
        const employeeCount = new Set(yearData.map(d => d.사번)).size;
        
        return { year, avgPay, totalPay, employeeCount, recordCount: yearData.length };
    }).filter(stat => stat !== null);

    return `
<h3>📅 연도별 급여 분석 결과</h3>

<h4>📊 분석 기간</h4>
<strong>데이터 기간:</strong> ${yearRange.min}년 ~ ${yearRange.max}년 (${years.length}년간)<br>
<strong>총 레코드:</strong> ${dataAnalysis.totalRecords.toLocaleString()}건

<h4>📈 연도별 현황</h4>
<table>
<tr><th>연도</th><th>직원 수</th><th>평균 급여</th><th>총 지급액</th><th>레코드 수</th></tr>
${yearlyStats.map(stat => `
<tr>
<td><strong>${stat.year}년</strong></td>
<td>${stat.employeeCount}명</td>
<td>₩${Math.round(stat.avgPay).toLocaleString()}</td>
<td>₩${stat.totalPay.toLocaleString()}</td>
<td>${stat.recordCount}건</td>
</tr>
`).join('')}
</table>

<h4>💡 트렌드 분석</h4>
${yearlyStats.length > 1 ? `
<strong>📊 급여 변화 추이:</strong><br>
• ${yearlyStats[0].year}년 대비 ${yearlyStats[yearlyStats.length-1].year}년 평균 급여: <strong>${((yearlyStats[yearlyStats.length-1].avgPay / yearlyStats[0].avgPay - 1) * 100).toFixed(1)}%</strong> 변화<br>
• 연평균 인상률: <strong>${((Math.pow(yearlyStats[yearlyStats.length-1].avgPay / yearlyStats[0].avgPay, 1/(yearlyStats.length-1)) - 1) * 100).toFixed(1)}%</strong><br>
• 인원 변화: ${yearlyStats[0].employeeCount}명 → ${yearlyStats[yearlyStats.length-1].employeeCount}명
` : `
<strong>📊 단일 연도 데이터:</strong><br>
• ${yearlyStats[0].year}년 기준 분석 완료<br>
• 다년간 데이터 확보 시 트렌드 분석 가능
`}

<h4>🎯 추천 후속 분석</h4>
• "연도별 인상률이 업계 평균과 비교해서 어떤가?"<br>
• "연도별 부서별 급여 변화는?"<br>
• "다음 연도 급여 예산은 어떻게 계획해야 할까?"
    `;
}

// 통계 분석 응답 생성
function generateStatisticalAnalysisResponse() {
    if (!dataAnalysis || !salaryData || salaryData.length === 0) {
        return `
<h3>📊 급여 통계 분석</h3>

현재 업로드된 데이터가 없어 일반적인 통계 분석 가이드를 제공합니다.

<h4>🔍 주요 통계 지표</h4>
<strong>1. 중심 경향 측정</strong>
• 평균 급여 (Mean)<br>
• 중간값 급여 (Median)<br>
• 최빈값 급여 (Mode)

<strong>2. 분산 측정</strong>
• 급여 분포의 표준편차<br>
• 변동계수 (CV)<br>
• 사분위수 범위

<h4>💡 분석 활용</h4>
• 급여 분포의 <strong>편차 정도</strong> 파악<br>
• <strong>이상치</strong> 식별 및 조정<br>
• <strong>형평성</strong> 검토 및 개선

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 상세한 통계 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    // 급여 데이터 통계 계산
    const salaries = salaryData.map(d => d.실지급액 || 0).filter(s => s > 0);
    const sortedSalaries = [...salaries].sort((a, b) => a - b);
    
    const mean = salaries.reduce((sum, s) => sum + s, 0) / salaries.length;
    const median = sortedSalaries[Math.floor(sortedSalaries.length / 2)];
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    const range = max - min;
    
    // 표준편차 계산
    const variance = salaries.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / salaries.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // 변동계수
    
    // 사분위수 계산
    const q1 = sortedSalaries[Math.floor(sortedSalaries.length * 0.25)];
    const q3 = sortedSalaries[Math.floor(sortedSalaries.length * 0.75)];
    const iqr = q3 - q1;

    return `
<h3>📊 급여 통계 분석 결과</h3>

<h4>📈 기본 통계 지표</h4>
<table>
<tr><th>지표</th><th>값</th><th>설명</th></tr>
<tr><td><strong>평균 급여</strong></td><td>₩${Math.round(mean).toLocaleString()}</td><td>전체 급여의 평균값</td></tr>
<tr><td><strong>중간값 급여</strong></td><td>₩${Math.round(median).toLocaleString()}</td><td>50% 기준점 급여</td></tr>
<tr><td><strong>최소 급여</strong></td><td>₩${min.toLocaleString()}</td><td>최하위 급여</td></tr>
<tr><td><strong>최대 급여</strong></td><td>₩${max.toLocaleString()}</td><td>최상위 급여</td></tr>
<tr><td><strong>급여 범위</strong></td><td>₩${range.toLocaleString()}</td><td>최대-최소 차이</td></tr>
</table>

<h4>📊 분포 분석</h4>
<table>
<tr><th>지표</th><th>값</th><th>해석</th></tr>
<tr><td><strong>표준편차</strong></td><td>₩${Math.round(stdDev).toLocaleString()}</td><td>급여 분산 정도</td></tr>
<tr><td><strong>변동계수</strong></td><td>${cv.toFixed(1)}%</td><td>${cv > 30 ? '높은 분산' : cv > 15 ? '보통 분산' : '낮은 분산'}</td></tr>
<tr><td><strong>Q1 (25%)</strong></td><td>₩${Math.round(q1).toLocaleString()}</td><td>하위 25% 기준점</td></tr>
<tr><td><strong>Q3 (75%)</strong></td><td>₩${Math.round(q3).toLocaleString()}</td><td>상위 25% 기준점</td></tr>
<tr><td><strong>IQR</strong></td><td>₩${Math.round(iqr).toLocaleString()}</td><td>중간 50% 범위</td></tr>
</table>

<h4>💡 인사이트</h4>
${cv > 30 ? `
<strong>⚠️ 높은 급여 분산</strong><br>
• 급여 격차가 상당히 큽니다 (변동계수: ${cv.toFixed(1)}%)<br>
• 형평성 검토 및 급여 체계 개선 권장<br>
• 부서별/직급별 급여 차이 원인 분석 필요
` : cv > 15 ? `
<strong>✅ 적정 급여 분산</strong><br>
• 급여 분포가 비교적 균등합니다 (변동계수: ${cv.toFixed(1)}%)<br>
• 현재 급여 체계가 합리적으로 운영되고 있음<br>
• 지속적인 모니터링 권장
` : `
<strong>📊 낮은 급여 분산</strong><br>
• 급여가 매우 균등하게 분포되어 있습니다 (변동계수: ${cv.toFixed(1)}%)<br>
• 성과 차별화가 부족할 수 있음<br>
• 성과 연동형 보상 체계 검토 권장
`}

<h4>🎯 추천 후속 분석</h4>
• "급여 분포에서 이상치가 있는지 확인해줘"<br>
• "부서별 급여 분산 정도는?"<br>
• "성과와 급여의 상관관계는?"
    `;
}

// 인재 유지 분석 응답 생성
function generateRetentionAnalysisResponse() {
    if (!dataAnalysis || !salaryData || salaryData.length === 0) {
        return `
<h3>👥 인재 유지 분석</h3>

현재 업로드된 데이터가 없어 일반적인 인재 유지 분석 가이드를 제공합니다.

<h4>🔍 인재 유지 분석 포인트</h4>
<strong>1. 이직률 분석</strong>
• 부서별/직급별 이직률<br>
• 급여 수준과 이직률 상관관계<br>
• 근속연수별 이직 패턴

<strong>2. 유지 전략</strong>
• 핵심 인재 식별 및 보상 강화<br>
• 이직 위험도가 높은 직원 관리<br>
• 경쟁력 있는 급여 체계 구축

<h4>💡 개선 방안</h4>
• <strong>정기적인 만족도 조사</strong> 실시<br>
• <strong>경쟁사 급여 벤치마킹</strong> 수행<br>
• <strong>성과 연동형 보상</strong> 체계 도입

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 구체적인 인재 유지 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    // 근속연수 분석 (급여일 기준으로 추정)
    const employeeTenure = {};
    salaryData.forEach(record => {
        if (!employeeTenure[record.사번]) {
            employeeTenure[record.사번] = {
                name: record.성명,
                department: record.조직,
                position: record.직급,
                firstYear: record.연도,
                lastYear: record.연도,
                totalPay: 0,
                recordCount: 0
            };
        }
        employeeTenure[record.사번].lastYear = Math.max(employeeTenure[record.사번].lastYear, record.연도);
        employeeTenure[record.사번].totalPay += (record.실지급액 || 0);
        employeeTenure[record.사번].recordCount++;
    });

    const tenureData = Object.values(employeeTenure);
    const avgTenure = tenureData.reduce((sum, emp) => sum + (emp.lastYear - emp.firstYear + 1), 0) / tenureData.length;
    const longTermEmployees = tenureData.filter(emp => (emp.lastYear - emp.firstYear + 1) >= 3).length;
    const newEmployees = tenureData.filter(emp => (emp.lastYear - emp.firstYear + 1) <= 1).length;

    return `
<h3>👥 인재 유지 분석 결과</h3>

<h4>📊 근속 현황</h4>
<table>
<tr><th>지표</th><th>값</th><th>비율</th></tr>
<tr><td><strong>총 직원 수</strong></td><td>${tenureData.length}명</td><td>100%</td></tr>
<tr><td><strong>평균 근속연수</strong></td><td>${avgTenure.toFixed(1)}년</td><td>-</td></tr>
<tr><td><strong>장기 근속자 (3년+)</strong></td><td>${longTermEmployees}명</td><td>${((longTermEmployees/tenureData.length)*100).toFixed(1)}%</td></tr>
<tr><td><strong>신입/신규 (1년 이하)</strong></td><td>${newEmployees}명</td><td>${((newEmployees/tenureData.length)*100).toFixed(1)}%</td></tr>
</table>

<h4>💡 인재 유지 전략</h4>
${avgTenure < 2 ? `
<strong>⚠️ 낮은 평균 근속연수</strong><br>
• 평균 근속연수가 ${avgTenure.toFixed(1)}년으로 상대적으로 낮습니다<br>
• 급여 경쟁력 및 복리후생 개선 필요<br>
• 이직 원인 분석 및 대응 방안 수립 권장
` : avgTenure < 4 ? `
<strong>✅ 적정 평균 근속연수</strong><br>
• 평균 근속연수가 ${avgTenure.toFixed(1)}년으로 적정 수준입니다<br>
• 지속적인 만족도 관리 및 경쟁력 유지 필요<br>
• 핵심 인재 우선 관리 체계 구축 권장
` : `
<strong>🎉 높은 평균 근속연수</strong><br>
• 평균 근속연수가 ${avgTenure.toFixed(1)}년으로 매우 높습니다<br>
• 우수한 인재 유지 환경을 구축하고 있음<br>
• 성과 연동형 보상으로 동기부여 강화 권장
`}

<h4>🎯 추천 후속 분석</h4>
• "부서별 이직률과 급여 상관관계는?"<br>
• "근속연수별 급여 변화 패턴은?"<br>
• "핵심 인재의 보상 현황은?"
    `;
}

// 성과 분석 응답 생성
function generatePerformanceAnalysisResponse() {
    if (!dataAnalysis || !salaryData || salaryData.length === 0) {
        return `
<h3>📈 성과 분석</h3>

현재 업로드된 데이터가 없어 일반적인 성과 분석 가이드를 제공합니다.

<h4>🔍 성과 분석 포인트</h4>
<strong>1. 성과 지표 설정</strong>
• KPI 기반 성과 측정<br>
• 부서별/직급별 성과 기준<br>
• 정량적 vs 정성적 평가

<strong>2. 성과 연동 보상</strong>
• 성과급 체계 설계<br>
• 인센티브 제도 운영<br>
• 장기 성과 보상 방안

<h4>💡 개선 방안</h4>
• <strong>명확한 성과 기준</strong> 설정<br>
• <strong>공정한 평가 체계</strong> 구축<br>
• <strong>성과-보상 연동</strong> 강화

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 구체적인 성과 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    // 성과 관련 데이터 분석 (실제로는 성과 데이터가 필요)
    const departmentPerformance = dataAnalysis.departmentStats.map(dept => {
        const deptData = salaryData.filter(d => d.조직 === dept.name);
        const avgPay = dept.avgPay;
        const employeeCount = dept.employeeCount;
        const totalPay = dept.totalPay;
        
        // 성과 지표 추정 (실제로는 성과 데이터 필요)
        const performanceScore = Math.random() * 100; // 임시 성과 점수
        
        return {
            name: dept.name,
            avgPay,
            employeeCount,
            totalPay,
            performanceScore: Math.round(performanceScore),
            efficiency: totalPay / employeeCount
        };
    }).sort((a, b) => b.performanceScore - a.performanceScore);

    return `
<h3>📈 성과 분석 결과</h3>

<h4>🏆 부서별 성과 현황</h4>
<table>
<tr><th>부서</th><th>직원 수</th><th>평균 급여</th><th>성과 점수</th><th>효율성</th></tr>
${departmentPerformance.slice(0, 5).map(dept => `
<tr>
<td><strong>${dept.name}</strong></td>
<td>${dept.employeeCount}명</td>
<td>₩${Math.round(dept.avgPay).toLocaleString()}</td>
<td>${dept.performanceScore}점</td>
<td>₩${Math.round(dept.efficiency).toLocaleString()}</td>
</tr>
`).join('')}
</table>

<h4>💡 성과 인사이트</h4>
<strong>📊 성과-보상 연관성:</strong><br>
• 성과가 높은 부서의 평균 급여: <strong>₩${Math.round(departmentPerformance[0].avgPay).toLocaleString()}</strong><br>
• 성과가 낮은 부서의 평균 급여: <strong>₩${Math.round(departmentPerformance[departmentPerformance.length-1].avgPay).toLocaleString()}</strong><br>
• 성과-급여 상관관계: <strong>${departmentPerformance.length > 1 ? '분석 중' : '데이터 부족'}</strong>

<h4>🎯 성과 개선 전략</h4>
<strong>1. 성과 측정 체계</strong><br>
• 명확한 KPI 설정 및 정기 모니터링<br>
• 부서별 맞춤형 성과 지표 개발<br>
• 정량적/정성적 평가 균형

<strong>2. 성과 연동 보상</strong><br>
• 성과급 비중 확대 검토<br>
• 단계별 인센티브 체계 구축<br>
• 장기 성과 보상 제도 도입

<h4>🎯 추천 후속 분석</h4>
• "성과가 좋은 부서의 특징을 분석해줘"<br>
• "성과급 체계 개선 방안은?"<br>
• "개인별 성과 평가 체계는?"
    `;
}

// 예산 분석 응답 생성
function generateBudgetAnalysisResponse() {
    if (!dataAnalysis || !salaryData || salaryData.length === 0) {
        return `
<h3>💰 예산 분석</h3>

현재 업로드된 데이터가 없어 일반적인 예산 분석 가이드를 제공합니다.

<h4>🔍 예산 분석 포인트</h4>
<strong>1. 인건비 예산 계획</strong>
• 연간 인건비 예산 추정<br>
• 부서별 예산 배분<br>
• 인상률 기반 예측

<strong>2. 비용 최적화</strong>
• 인건비 효율성 분석<br>
• 절감 가능 영역 식별<br>
• ROI 기반 투자 우선순위

<h4>💡 개선 방안</h4>
• <strong>정확한 예산 계획</strong> 수립<br>
• <strong>비용 효율성</strong> 모니터링<br>
• <strong>전략적 인건비</strong> 투자

<blockquote>
💬 <strong>추천:</strong> 데이터를 업로드하시면 구체적인 예산 분석을 제공해드릴게요!
</blockquote>
        `;
    }

    // 예산 관련 분석
    const totalAnnualPay = dataAnalysis.totalPayment;
    const totalDeduction = dataAnalysis.totalDeduction;
    const netPay = totalAnnualPay - totalDeduction;
    const avgMonthlyPay = totalAnnualPay / 12;
    const avgEmployeePay = totalAnnualPay / dataAnalysis.uniqueEmployees;

    // 예산 효율성 지표
    const efficiencyRatio = totalAnnualPay / dataAnalysis.totalRecords; // 레코드당 비용
    const costPerEmployee = totalAnnualPay / dataAnalysis.uniqueEmployees;

    return `
<h3>💰 예산 분석 결과</h3>

<h4>📊 인건비 현황</h4>
<table>
<tr><th>구분</th><th>금액</th><th>비고</th></tr>
<tr><td><strong>총 지급액</strong></td><td>₩${totalAnnualPay.toLocaleString()}</td><td>연간 총 인건비</td></tr>
<tr><td><strong>총 공제액</strong></td><td>₩${totalDeduction.toLocaleString()}</td><td>세금, 보험료 등</td></tr>
<tr><td><strong>순 지급액</strong></td><td>₩${netPay.toLocaleString()}</td><td>실제 지급액</td></tr>
<tr><td><strong>월평균 지급액</strong></td><td>₩${Math.round(avgMonthlyPay).toLocaleString()}</td><td>월 단위 인건비</td></tr>
<tr><td><strong>1인당 평균 급여</strong></td><td>₩${Math.round(avgEmployeePay).toLocaleString()}</td><td>직원당 평균</td></tr>
</table>

<h4>💡 비용 효율성 분석</h4>
<strong>📈 효율성 지표:</strong><br>
• 레코드당 평균 비용: <strong>₩${Math.round(efficiencyRatio).toLocaleString()}</strong><br>
• 직원당 평균 비용: <strong>₩${Math.round(costPerEmployee).toLocaleString()}</strong><br>
• 공제율: <strong>${((totalDeduction/totalAnnualPay)*100).toFixed(1)}%</strong>

<h4>🎯 예산 최적화 방안</h4>
<strong>1. 비용 절감 영역</strong><br>
• 불필요한 시간외근무 관리<br>
• 효율적인 인력 배치<br>
• 복리후생 비용 최적화

<strong>2. 투자 우선순위</strong><br>
• 핵심 인재 보상 강화<br>
• 성과 연동형 보상 확대<br>
• 직원 교육 및 개발 투자

<h4>📊 예산 계획 가이드</h4>
<strong>다음 연도 예산 추정:</strong><br>
• 현재 기준 연간 인건비: <strong>₩${totalAnnualPay.toLocaleString()}</strong><br>
• 3% 인상 시: <strong>₩${Math.round(totalAnnualPay * 1.03).toLocaleString()}</strong><br>
• 5% 인상 시: <strong>₩${Math.round(totalAnnualPay * 1.05).toLocaleString()}</strong><br>
• 10% 인상 시: <strong>₩${Math.round(totalAnnualPay * 1.10).toLocaleString()}</strong>

<h4>🎯 추천 후속 분석</h4>
• "부서별 인건비 효율성은?"<br>
• "인상률별 예산 영향도는?"<br>
• "경쟁사 대비 인건비 수준은?"
    `;
}

// ============ 데이터 업로드 및 처리 함수들 ============

// 파일 업로드 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 기존 코드는 그대로 두고 이 부분만 추가
    document.addEventListener('change', function(e) {
        if (e.target.id === 'aiFileInput') {
            handleFileUpload(e.target.files);
        }
    });
});

// 파일 업로드 처리
async function handleFileUpload(files) {
    const statusElement = document.getElementById('uploadStatus');
    statusElement.textContent = '📤 파일 처리 중...';
    
    try {
        const allData = [];
        
        for (let file of files) {
            const fileData = await parseFile(file);
            allData.push(...fileData);
        }
        
        uploadedData = allData;
        filteredData = [...uploadedData];
        
        statusElement.textContent = `✅ ${uploadedData.length}개 레코드 업로드 완료!`;
        
        // UI 업데이트
        updateFilterOptions();
        displayDataTable();
        showDataSections();
        showSuggestedQuestions();
        
        // AI에게 데이터 업로드 알림
        addMessage('ai', `🎉 데이터가 성공적으로 업로드되었습니다!<br>
        <strong>총 ${uploadedData.length}개의 레코드</strong>가 로드되었어요.<br>
        이제 데이터에 대해 자유롭게 질문해 보세요! 📊`);
        
    } catch (error) {
        statusElement.textContent = `❌ 업로드 실패: ${error.message}`;
    }
}

// 파일 파싱
async function parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'csv':
            return await parseCSV(file);
        case 'json':
            return await parseJSON(file);
        case 'xlsx':
        case 'xls':
            return await parseExcel(file);
        default:
            throw new Error('지원하지 않는 파일 형식입니다.');
    }
}

// CSV 파싱
function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.trim());
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        data.push(row);
                    }
                }
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}

// JSON 파싱
function parseJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                resolve(Array.isArray(json) ? json : [json]);
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}

// Excel 파싱 (기본적인 CSV 변환)
async function parseExcel(file) {
    // 실제 환경에서는 SheetJS 라이브러리 사용 권장
    // 여기서는 간단한 알림만
    alert('Excel 파일은 CSV로 변환 후 업로드해 주세요.');
    return [];
}

// ============ 필터링 함수들 ============

// 필터 옵션 업데이트
function updateFilterOptions() {
    if (uploadedData.length === 0) return;
    
    // 부서 옵션 업데이트
    const departments = [...new Set(uploadedData.map(row => 
        row.부서 || row.department || row.팀 || ''
    ).filter(Boolean))];
    
    const departmentSelect = document.getElementById('departmentFilter');
    departmentSelect.innerHTML = '<option value="">전체 부서</option>';
    departments.forEach(dept => {
        departmentSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
    });
}

// 필터 적용
function applyFilters() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const department = document.getElementById('departmentFilter').value;
    const name = document.getElementById('nameFilter').value.toLowerCase();
    
    filteredData = uploadedData.filter(row => {
        // 날짜 필터
        if (startDate || endDate) {
            const rowDate = row.일자 || row.date || row.날짜 || '';
            if (rowDate) {
                const date = new Date(rowDate);
                if (startDate && date < new Date(startDate)) return false;
                if (endDate && date > new Date(endDate)) return false;
            }
        }
        
        // 부서 필터
        if (department) {
            const rowDept = row.부서 || row.department || row.팀 || '';
            if (!rowDept.includes(department)) return false;
        }
        
        // 이름 필터
        if (name) {
            const rowName = (row.성명 || row.name || row.이름 || '').toLowerCase();
            if (!rowName.includes(name)) return false;
        }
        
        return true;
    });
    
    displayDataTable();
}

// 필터 초기화
function clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('nameFilter').value = '';
    
    filteredData = [...uploadedData];
    displayDataTable();
}

// ============ 테이블 표시 함수들 ============

// 데이터 테이블 표시
function displayDataTable() {
    if (filteredData.length === 0) return;
    
    const recordCount = document.getElementById('recordCount');
    recordCount.textContent = `${filteredData.length}개 레코드`;
    
    // 테이블 헤더 생성
    const headers = Object.keys(filteredData[0]);
    const tableHead = document.getElementById('tableHead');
    tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    
    // 테이블 바디 생성 (최대 100개만 표시)
    const tableBody = document.getElementById('tableBody');
    const displayData = filteredData.slice(0, 100);
    
    tableBody.innerHTML = displayData.map(row => 
        '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>'
    ).join('');
}

// 데이터 섹션들 표시
function showDataSections() {
    document.getElementById('filterPanel').style.display = 'block';
    document.getElementById('dataTableContainer').style.display = 'block';
}

// 추천 질문 표시
function showSuggestedQuestions() {
    document.getElementById('suggestedQuestions').style.display = 'block';
}

// ============ AI 채팅 개선 함수들 ============

// Enter 키 처리
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 추천 질문 전송
function sendSuggestedMessage(message) {
    document.getElementById('chatInput').value = message;
    sendMessage();
}

// AI 채팅용 메시지 전송 함수 (중복 제거)

// 데이터 기반 AI 응답 생성
function generateDataBasedResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (filteredData.length === 0) {
        return '📋 먼저 데이터를 업로드해 주세요. 그러면 더 정확한 분석을 도와드릴 수 있어요!';
    }
    
    // 총 개수 질문
    if (message.includes('총') && (message.includes('명') || message.includes('개수'))) {
        return `📊 현재 필터링된 데이터에는 <strong>총 ${filteredData.length}명</strong>의 직원 정보가 있습니다.`;
    }
    
    // 부서 관련 질문
    if (message.includes('부서')) {
        const departments = [...new Set(filteredData.map(row => 
            row.부서 || row.department || row.팀 || '미분류'
        ))];
        
        if (message.includes('평균') && message.includes('급여')) {
            return calculateDepartmentAverageSalary();
        } else {
            return `🏢 현재 데이터의 부서는 다음과 같습니다:<br><strong>${departments.join(', ')}</strong><br>총 ${departments.length}개 부서입니다.`;
        }
    }
    
    // 급여 관련 질문
    if (message.includes('급여') || message.includes('연봉') || message.includes('월급')) {
        if (message.includes('최고') || message.includes('최대') || message.includes('높은')) {
            return calculateSalaryStats('max');
        } else if (message.includes('최저') || message.includes('최소') || message.includes('낮은')) {
            return calculateSalaryStats('min');
        } else if (message.includes('평균')) {
            return calculateSalaryStats('avg');
        } else {
            return calculateSalaryStats('summary');
        }
    }
    
    // 인건비 관련 질문
    if (message.includes('인건비') || message.includes('총액')) {
        return calculateTotalLaborCost();
    }
    
    // 기본 응답
    const availableFields = filteredData.length > 0 ? Object.keys(filteredData[0]).join(', ') : '';
    return `🤖 현재 ${filteredData.length}개의 데이터가 있습니다.<br><br>
    <strong>사용 가능한 필드:</strong> ${availableFields}<br><br>
    <strong>다음과 같은 질문을 해보세요:</strong><br>
    • "총 몇 명의 직원이 있어?"<br>
    • "부서별 평균 급여를 알려줘"<br>
    • "가장 높은 급여는 얼마야?"<br>
    • "이번 달 총 인건비는?"`;
}

// ============ 데이터 분석 함수들 ============

// 부서별 평균 급여 계산
function calculateDepartmentAverageSalary() {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없습니다. 데이터에 급여, 연봉, 월급 등의 컬럼이 있는지 확인해 주세요.';
    }
    
    const deptSalaries = {};
    filteredData.forEach(row => {
        const dept = row.부서 || row.department || row.팀 || '미분류';
        const salary = parseFloat(row[salaryField]) || 0;
        
        if (!deptSalaries[dept]) {
            deptSalaries[dept] = { total: 0, count: 0 };
        }
        deptSalaries[dept].total += salary;
        deptSalaries[dept].count += 1;
    });
    
    let result = '📊 <strong>부서별 평균 급여</strong><br><br>';
    Object.entries(deptSalaries).forEach(([dept, data]) => {
        const avg = (data.total / data.count).toLocaleString();
        result += `🏢 <strong>${dept}</strong>: ${avg}원 (${data.count}명)<br>`;
    });
    
    return result;
}

// 급여 통계 계산
function calculateSalaryStats(type) {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없습니다.';
    }
    
    const salaries = filteredData
        .map(row => parseFloat(row[salaryField]) || 0)
        .filter(salary => salary > 0);
    
    if (salaries.length === 0) {
        return '📊 급여 데이터가 없습니다.';
    }
    
    const max = Math.max(...salaries);
    const min = Math.min(...salaries);
    const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    
    switch (type) {
        case 'max':
            return `💰 <strong>최고 급여:</strong> ${max.toLocaleString()}원`;
        case 'min':
            return `💰 <strong>최저 급여:</strong> ${min.toLocaleString()}원`;
        case 'avg':
            return `💰 <strong>평균 급여:</strong> ${avg.toLocaleString()}원`;
        default:
            return `📊 <strong>급여 통계</strong><br>
            • 최고 급여: ${max.toLocaleString()}원<br>
            • 최저 급여: ${min.toLocaleString()}원<br>
            • 평균 급여: ${avg.toLocaleString()}원<br>
            • 급여 데이터: ${salaries.length}건`;
    }
}

// 총 인건비 계산
function calculateTotalLaborCost() {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없습니다.';
    }
    
    const totalSalary = filteredData.reduce((total, row) => {
        return total + (parseFloat(row[salaryField]) || 0);
    }, 0);
    
    return `💼 <strong>총 인건비:</strong> ${totalSalary.toLocaleString()}원<br>
    📊 대상 인원: ${filteredData.length}명<br>
    📈 1인 평균: ${(totalSalary / filteredData.length).toLocaleString()}원`;
}

// 급여 필드 찾기
function findSalaryField() {
    if (filteredData.length === 0) return null;
    
    const fields = Object.keys(filteredData[0]);
    const salaryKeywords = ['급여', '연봉', '월급', 'salary', 'pay', '기본급'];
    
    return fields.find(field => 
        salaryKeywords.some(keyword => 
            field.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}

// 기존 addMessage 함수 수정 (아바타 추가)
function addMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


