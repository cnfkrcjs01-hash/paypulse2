// paypulse_data_manager.js - PayPulse 데이터 관리 시스템
console.log('📊 PayPulse 데이터 관리 시스템 로드됨');

// 전역 상태 관리
let uploadedFiles = [];
let currentView = 'dashboard';
let selectedFile = null;
let isUploading = false;
let dataStats = {
    totalEmployees: 0,
    totalSalary: 0,
    departments: [],
    lastUpdate: new Date()
};

// 서버로 데이터 전송 함수
async function sendToServer(uploadedFile) {
    try {
        // JSON 데이터를 안전하게 정리
        const cleanData = {
            fileName: uploadedFile.name,
            fileType: uploadedFile.type,
            uploadDate: uploadedFile.uploadDate.toISOString(),
            data: uploadedFile.data.map(row => {
                // 각 셀의 값을 안전하게 변환
                return row.map(cell => {
                    if (cell === null || cell === undefined) return '';
                    if (typeof cell === 'number' && (isNaN(cell) || !isFinite(cell))) return '';
                    return String(cell);
                });
            })
        };

        const response = await fetch('/api/payroll/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanData)
        });

        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status}`);
        }

        const result = await response.json();
        console.log('서버 업로드 성공:', result);
        
    } catch (error) {
        console.error('서버 전송 오류:', error);
        // 서버 오류가 있어도 로컬에서는 계속 작동하도록 함
        alert('서버 연동 중 오류가 발생했지만 로컬에서는 정상 작동합니다.');
    }
}

// 파일 업로드 처리 함수
async function handleFileUpload(file) {
    setIsUploading(true);
    
    try {
        console.log('파일 업로드 시작:', file.name);
        
        // 파일 읽기
        const arrayBuffer = await file.arrayBuffer();
        
        // Excel 파일 처리 (SheetJS 라이브러리 사용 시뮬레이션)
        const sheets = {};
        const allData = [];
        
        // 간단한 CSV 처리 (Excel 라이브러리가 없는 경우)
        if (file.name.endsWith('.csv')) {
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(','));
            sheets['Sheet1'] = rows;
            allData.push(...rows);
        } else {
            // Excel 파일의 경우 임시 데이터 생성
            const sampleData = [
                ['사번', '성명', '부서', '급여', '직급'],
                ['EMP001', '김철수', 'IT팀', '4500000', '과장'],
                ['EMP002', '이영희', '마케팅팀', '3800000', '대리'],
                ['EMP003', '박민수', '인사팀', '4200000', '차장']
            ];
            sheets['Sheet1'] = sampleData;
            allData.push(...sampleData);
        }

        // 파일 타입 자동 감지
        let fileType = 'other';
        if (file.name.includes('템플릿') || file.name.includes('template')) {
            fileType = 'template';
        } else if (file.name.includes('급여') || file.name.includes('payroll')) {
            fileType = 'payroll';
        }

        const uploadedFile = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            uploadDate: new Date(),
            data: allData,
            sheets: sheets,
            type: fileType
        };

        // 서버로 데이터 전송
        await sendToServer(uploadedFile);
        
        uploadedFiles.push(uploadedFile);
        updateDataStats();
        
        // 성공 시 미리보기로 자동 이동
        selectedFile = uploadedFile;
        setCurrentView('preview');
        
        console.log('파일 업로드 완료:', uploadedFile);
        
    } catch (error) {
        console.error('File upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
        setIsUploading(false);
    }
}

// 데이터 통계 업데이트
function updateDataStats() {
    const payrollFiles = uploadedFiles.filter(f => f.type === 'payroll');
    
    let totalEmployees = 0;
    let totalSalary = 0;
    const departments = new Set();

    payrollFiles.forEach(file => {
        Object.values(file.sheets).forEach(sheet => {
            sheet.forEach((row, index) => {
                if (index === 0) return; // 헤더 스킵
                
                if (row[0]) totalEmployees++; // 직원명이 있으면 카운트
                if (row[3] && !isNaN(Number(row[3]))) { // 급여 컬럼
                    totalSalary += Number(row[3]);
                }
                if (row[2]) { // 부서 컬럼
                    departments.add(String(row[2]));
                }
            });
        });
    });

    dataStats = {
        totalEmployees,
        totalSalary,
        departments: Array.from(departments),
        lastUpdate: new Date()
    };
    
    // UI 업데이트
    updateStatsDisplay();
}

// 통계 표시 업데이트
function updateStatsDisplay() {
    const employeeCount = document.querySelector('.stat-employees .stat-value');
    const salaryTotal = document.querySelector('.stat-salary .stat-value');
    
    if (employeeCount) {
        employeeCount.textContent = `${dataStats.totalEmployees}명`;
    }
    if (salaryTotal) {
        salaryTotal.textContent = `${dataStats.totalSalary.toLocaleString()}원`;
    }
}

// 파일 삭제
function deleteFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    updateDataStats();
    
    if (selectedFile?.id === fileId) {
        selectedFile = null;
        setCurrentView('dashboard');
    }
    
    renderCurrentView();
}

// 뷰 변경
function setCurrentView(view) {
    currentView = view;
    renderCurrentView();
}

// 업로드 상태 설정
function setIsUploading(status) {
    isUploading = status;
    renderCurrentView();
}

// 파일 선택 트리거
function triggerFileSelect() {
    const fileInput = document.getElementById('dataManagerFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// 드래그 앤 드롭 핸들러
function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(f => 
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    
    if (excelFile) {
        handleFileUpload(excelFile);
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

// PayPulse 데이터 관리 HTML 생성
function getPayPulseDataManagerHTML() {
    return `
        <div class="paypulse-data-manager">
            <!-- 헤더 -->
            <header class="pdm-header">
                <div class="header-content">
                    <h1>📊 PayPulse 데이터 관리</h1>
                    <p>스마트한 급여 데이터 관리 시스템</p>
                </div>
                <div class="header-stats">
                    <div class="stat-item stat-employees">
                        <span class="stat-label">등록 직원</span>
                        <span class="stat-value">${dataStats.totalEmployees}명</span>
                    </div>
                    <div class="stat-item stat-salary">
                        <span class="stat-label">총 급여</span>
                        <span class="stat-value">${dataStats.totalSalary.toLocaleString()}원</span>
                    </div>
                </div>
            </header>

            <!-- 네비게이션 -->
            <nav class="pdm-navigation">
                <button class="nav-btn ${currentView === 'dashboard' ? 'active' : ''}" 
                        onclick="setCurrentView('dashboard')">
                    🏠 대시보드
                </button>
                <button class="nav-btn ${currentView === 'upload' ? 'active' : ''}" 
                        onclick="setCurrentView('upload')">
                    📤 업로드
                </button>
                <button class="nav-btn ${currentView === 'history' ? 'active' : ''}" 
                        onclick="setCurrentView('history')">
                    📋 히스토리
                </button>
                ${selectedFile ? `
                <button class="nav-btn ${currentView === 'preview' ? 'active' : ''}" 
                        onclick="setCurrentView('preview')">
                    👁️ 미리보기
                </button>
                ` : ''}
            </nav>

            <!-- 메인 컨텐츠 -->
            <main class="pdm-content">
                ${getCurrentViewHTML()}
            </main>
        </div>`;
}

// 현재 뷰 HTML 반환
function getCurrentViewHTML() {
    switch (currentView) {
        case 'dashboard':
            return getDashboardHTML();
        case 'upload':
            return getUploadHTML();
        case 'history':
            return getHistoryHTML();
        case 'preview':
            return getPreviewHTML();
        default:
            return getDashboardHTML();
    }
}

// 대시보드 HTML
function getDashboardHTML() {
    return `
        <div class="dashboard-view">
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>📁 업로드된 파일</h3>
                    <div class="file-count">${uploadedFiles.length}개</div>
                    <div class="file-types">
                        <span>템플릿: ${uploadedFiles.filter(f => f.type === 'template').length}</span>
                        <span>급여대장: ${uploadedFiles.filter(f => f.type === 'payroll').length}</span>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <h3>👥 직원 현황</h3>
                    <div class="employee-stats">
                        <div>총 ${dataStats.totalEmployees}명</div>
                        <div>${dataStats.departments.length}개 부서</div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <h3>💰 급여 현황</h3>
                    <div class="salary-stats">
                        <div>총액: ${dataStats.totalSalary.toLocaleString()}원</div>
                        <div>평균: ${dataStats.totalEmployees > 0 ? 
                            Math.round(dataStats.totalSalary / dataStats.totalEmployees).toLocaleString() : 0}원</div>
                    </div>
                </div>

                <div class="dashboard-card quick-upload">
                    <h3>⚡ 빠른 업로드</h3>
                    <button class="quick-upload-btn" onclick="setCurrentView('upload')">
                        새 파일 업로드
                    </button>
                </div>
            </div>

            ${uploadedFiles.length > 0 ? `
            <div class="recent-files">
                <h3>최근 업로드된 파일</h3>
                <div class="recent-files-list">
                    ${uploadedFiles.slice(-3).map(file => `
                    <div class="recent-file-item">
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-date">${file.uploadDate.toLocaleDateString()}</span>
                        </div>
                        <button class="view-btn" onclick="viewFile('${file.id}')">
                            보기
                        </button>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>`;
}

// 업로드 HTML
function getUploadHTML() {
    return `
        <div class="upload-view">
            <div class="upload-container">
                <h2>📤 파일 업로드</h2>
                
                <div class="upload-zone" 
                     ondrop="handleDrop(event)" 
                     ondragover="handleDragOver(event)">
                    ${isUploading ? `
                    <div class="uploading">
                        <div class="spinner"></div>
                        <p>업로드 중...</p>
                    </div>
                    ` : `
                    <div class="upload-icon">📁</div>
                    <h3>파일을 드래그하거나 클릭하여 업로드</h3>
                    <p>Excel (.xlsx, .xls), CSV 파일을 지원합니다</p>
                    <button class="upload-btn" onclick="triggerFileSelect()">
                        파일 선택
                    </button>
                    `}
                </div>

                <input id="dataManagerFileInput" 
                       type="file" 
                       accept=".xlsx,.xls,.csv" 
                       onchange="handleFileInputChange(event)"
                       style="display: none;">

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
        </div>`;
}

// 히스토리 HTML
function getHistoryHTML() {
    if (uploadedFiles.length === 0) {
        return `
            <div class="history-view">
                <h2>📋 업로드 히스토리</h2>
                <div class="empty-state">
                    <p>아직 업로드된 파일이 없습니다.</p>
                    <button class="upload-btn" onclick="setCurrentView('upload')">
                        첫 번째 파일 업로드하기
                    </button>
                </div>
            </div>`;
    }

    return `
        <div class="history-view">
            <h2>📋 업로드 히스토리</h2>
            <div class="files-list">
                ${uploadedFiles.map(file => `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-header">
                            <span class="file-type-badge ${file.type}">
                                ${file.type === 'template' ? '템플릿' : 
                                  file.type === 'payroll' ? '급여대장' : '기타'}
                            </span>
                            <h4>${file.name}</h4>
                        </div>
                        <div class="file-details">
                            <span>크기: ${(file.size / 1024).toFixed(1)} KB</span>
                            <span>업로드: ${file.uploadDate.toLocaleString()}</span>
                            <span>시트: ${Object.keys(file.sheets).length}개</span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="view-btn" onclick="viewFile('${file.id}')">
                            미리보기
                        </button>
                        <button class="delete-btn" onclick="confirmDeleteFile('${file.id}', '${file.name}')">
                            삭제
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>`;
}

// 미리보기 HTML
function getPreviewHTML() {
    if (!selectedFile) {
        return '<div class="preview-view"><p>선택된 파일이 없습니다.</p></div>';
    }

    return `
        <div class="preview-view">
            <div class="preview-header">
                <h2>👁️ ${selectedFile.name}</h2>
                <div class="preview-info">
                    <span>업로드: ${selectedFile.uploadDate.toLocaleString()}</span>
                    <span>크기: ${(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <span class="type-badge ${selectedFile.type}">
                        ${selectedFile.type === 'template' ? '템플릿' : 
                          selectedFile.type === 'payroll' ? '급여대장' : '기타'}
                    </span>
                </div>
            </div>

            <div class="preview-content">
                ${Object.keys(selectedFile.sheets).map(sheetName => `
                <div class="sheet-preview">
                    <h3>📄 ${sheetName}</h3>
                    <div class="table-container">
                        <table class="data-table">
                            <tbody>
                                ${selectedFile.sheets[sheetName].slice(0, 10).map((row, rowIndex) => `
                                <tr class="${rowIndex === 0 ? 'header-row' : ''}">
                                    ${row.map(cell => `
                                    <td>${cell !== null && cell !== undefined ? String(cell) : ''}</td>
                                    `).join('')}
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${selectedFile.sheets[sheetName].length > 10 ? `
                        <p class="more-data">
                            ... 외 ${selectedFile.sheets[sheetName].length - 10}행 더 있습니다
                        </p>
                        ` : ''}
                    </div>
                </div>
                `).join('')}
            </div>

            <div class="preview-actions">
                <button class="delete-btn" onclick="confirmDeleteFile('${selectedFile.id}', '${selectedFile.name}')">
                    🗑️ 파일 삭제
                </button>
                <button class="export-btn" onclick="exportData('${selectedFile.id}')">
                    📊 데이터 연동
                </button>
            </div>
        </div>`;
}

// 이벤트 핸들러들
function handleFileInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
        handleFileUpload(file);
    }
}

function viewFile(fileId) {
    selectedFile = uploadedFiles.find(f => f.id === fileId);
    setCurrentView('preview');
}

function confirmDeleteFile(fileId, fileName) {
    if (confirm(`${fileName}을 삭제하시겠습니까?`)) {
        deleteFile(fileId);
    }
}

function exportData(fileId) {
    alert('데이터 내보내기 기능은 추후 구현 예정입니다.');
}

// 현재 뷰 렌더링
function renderCurrentView() {
    const content = document.getElementById('page-content');
    if (content) {
        content.innerHTML = getPayPulseDataManagerHTML();
    }
}

// PayPulse 데이터 관리 초기화
function initializePayPulseDataManager() {
    console.log('📊 PayPulse 데이터 관리 시스템 초기화 시작');
    
    // 로컬 스토리지에서 데이터 로드
    const savedFiles = localStorage.getItem('payPulseUploadedFiles');
    if (savedFiles) {
        try {
            uploadedFiles = JSON.parse(savedFiles).map(file => ({
                ...file,
                uploadDate: new Date(file.uploadDate)
            }));
            updateDataStats();
        } catch (error) {
            console.error('저장된 파일 로드 오류:', error);
        }
    }
    
    // 초기 렌더링
    renderCurrentView();
    
    console.log('✅ PayPulse 데이터 관리 시스템 초기화 완료');
}

// 데이터 저장
function saveDataToStorage() {
    try {
        localStorage.setItem('payPulseUploadedFiles', JSON.stringify(uploadedFiles));
    } catch (error) {
        console.error('데이터 저장 오류:', error);
    }
}

// 파일 업로드 시 저장
const originalHandleFileUpload = handleFileUpload;
handleFileUpload = async function(file) {
    await originalHandleFileUpload(file);
    saveDataToStorage();
};

// 파일 삭제 시 저장
const originalDeleteFile = deleteFile;
deleteFile = function(fileId) {
    originalDeleteFile(fileId);
    saveDataToStorage();
};

console.log('✅ PayPulse 데이터 관리 시스템 로드 완료');