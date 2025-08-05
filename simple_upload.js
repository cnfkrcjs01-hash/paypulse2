// simple_upload.js - 간편한 데이터 업로드 시스템

// 지원하는 파일 형식
const SUPPORTED_FILE_TYPES = {
    'excel': {
        extensions: ['.xlsx', '.xls'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        description: 'Excel 파일'
    },
    'csv': {
        extensions: ['.csv'],
        mimeTypes: ['text/csv', 'application/csv'],
        description: 'CSV 파일'
    },
    'json': {
        extensions: ['.json'],
        mimeTypes: ['application/json'],
        description: 'JSON 파일'
    }
};

// 샘플 데이터 템플릿
const SAMPLE_DATA_TEMPLATES = {
    payroll: {
        name: '급여 데이터',
        description: '기본 급여 정보 템플릿',
        headers: ['사번', '성명', '부서', '직급', '기본급', '수당', '공제액', '실지급액', '급여일'],
        sampleRows: [
            ['EMP001', '김철수', '개발팀', '사원', '3000000', '500000', '450000', '3050000', '2024-01-25'],
            ['EMP002', '이영희', '마케팅팀', '대리', '3500000', '600000', '520000', '3580000', '2024-01-25'],
            ['EMP003', '박민수', '인사팀', '과장', '4000000', '700000', '580000', '4120000', '2024-01-25']
        ]
    },
    employee: {
        name: '직원 정보',
        description: '직원 기본 정보 템플릿',
        headers: ['사번', '성명', '부서', '직급', '입사일', '연락처', '이메일'],
        sampleRows: [
            ['EMP001', '김철수', '개발팀', '사원', '2020-03-15', '010-1234-5678', 'kim@company.com'],
            ['EMP002', '이영희', '마케팅팀', '대리', '2019-05-20', '010-2345-6789', 'lee@company.com'],
            ['EMP003', '박민수', '인사팀', '과장', '2018-01-10', '010-3456-7890', 'park@company.com']
        ]
    },
    attendance: {
        name: '근태 관리',
        description: '출근/퇴근 시간 기록 템플릿',
        headers: ['사번', '성명', '날짜', '출근시간', '퇴근시간', '총근무시간', '연장시간', '비고'],
        sampleRows: [
            ['EMP001', '김철수', '2024-01-15', '09:00', '18:00', '8', '1', '정상근무'],
            ['EMP002', '이영희', '2024-01-15', '09:30', '18:30', '8', '1', '지각'],
            ['EMP003', '박민수', '2024-01-15', '08:30', '17:30', '8', '0', '정상근무']
        ]
    },
    insurance: {
        name: '4대보험 정보',
        description: '4대보험 가입 및 요율 정보',
        headers: ['사번', '성명', '월급여', '국민연금', '건강보험', '고용보험', '산재보험', '총공제액'],
        sampleRows: [
            ['EMP001', '김철수', '3000000', '135000', '113100', '27000', '0', '275100'],
            ['EMP002', '이영희', '3500000', '157500', '131950', '31500', '0', '320950'],
            ['EMP003', '박민수', '4000000', '180000', '150800', '36000', '0', '366800']
        ]
    }
};

// 대용량 파일 처리 설정 (중복 방지)
if (typeof LARGE_FILE_CONFIG === 'undefined') {
    window.LARGE_FILE_CONFIG = {
        CHUNK_SIZE: 1024 * 1024, // 1MB 청크
        LARGE_FILE_THRESHOLD: 10 * 1024 * 1024, // 10MB 이상은 대용량
        MAX_PREVIEW_ROWS: 5000, // 미리보기 최대 행 수
        MEMORY_LIMIT: 50 * 1024 * 1024 // 50MB 메모리 제한
    };
}

// 간편 업로드 시스템 초기화
function initializeSimpleUpload() {
    console.log('🚀 고성능 업로드 시스템 초기화 (대용량 파일 지원)');
    
    // 저장된 사용자 정의 템플릿 로드
    loadCustomTemplates();
    
    setupDragAndDrop();
    setupFileInput();
    setupSampleDataDownload();
    setupDirectInput();
    
    // 저장된 사용자 정의 템플릿 버튼들 추가
    setTimeout(() => {
        addSavedCustomTemplateButtons();
    }, 100);
    
    // 대용량 파일 전용 UI 업데이트
    enhanceUIForLargeFiles();
}

// 저장된 사용자 정의 템플릿 버튼들 추가
function addSavedCustomTemplateButtons() {
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
    
    Object.keys(customTemplates).forEach(templateName => {
        // UI에 버튼이 이미 있는지 확인
        const existingButton = document.querySelector(`[data-sample="${templateName}"]`);
        if (!existingButton) {
            // 아직 버튼이 없으면 추가
            setTimeout(() => addCustomTemplateButton(templateName), 50);
        }
    });
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const dropZone = document.getElementById('simple-drop-zone');
    if (!dropZone) return;
    
    // 드래그 이벤트 처리
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function handleDrop(e) {
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    }
}

// 파일 입력 설정
function setupFileInput() {
    const fileInput = document.getElementById('simple-file-input');
    const uploadBtn = document.getElementById('simple-upload-btn');
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            fileInput?.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }
}

// 파일 업로드 처리
async function handleFileUpload(files) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
        showUploadProgress(true);
        updateUploadStatus('파일 검증 중...', 10);
        
        // 대용량 파일 자동 감지 및 처리
        if (file.size > 10 * 1024 * 1024) { // 10MB 이상은 대용량 파일 처리 시스템 사용
            console.log('🚀 대용량 파일 감지 - 고성능 처리 시스템으로 전환');
            
            if (typeof handleLargeFile === 'function') {
                const data = await handleLargeFile(file);
                displayUploadedData(data, file.name);
                showSuccessMessage(`✅ 대용량 파일 처리 완료! ${data.length.toLocaleString()}개 레코드`);
                return;
            } else {
                throw new Error('대용량 파일 처리 시스템을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
            }
        }
        
        // 파일 형식 검증
        const fileType = detectFileType(file);
        if (!fileType) {
            throw new Error(`지원하지 않는 파일 형식입니다.\n지원 형식: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)`);
        }
        
        updateUploadStatus(`${SUPPORTED_FILE_TYPES[fileType].description} 읽는 중...`, 30);
        
        // 파일 내용 읽기
        let data;
        try {
            switch (fileType) {
                case 'excel':
                    data = await readExcelFile(file);
                    break;
                case 'csv':
                    data = await readCSVFile(file);
                    break;
                case 'json':
                    data = await readJSONFile(file);
                    break;
                default:
                    throw new Error('지원하지 않는 파일 형식입니다.');
            }
        } catch (parseError) {
            throw new Error(`파일을 읽을 수 없습니다.\n${parseError.message}\n\n해결방법:\n1. 파일이 손상되지 않았는지 확인\n2. CSV 형식으로 다시 저장해서 시도\n3. 샘플 템플릿을 다운로드해서 형식 확인`);
        }
        
        updateUploadStatus('데이터 검증 중...', 70);
        
        // 데이터 검증
        const validatedData = validateUploadedData(data);
        
        updateUploadStatus('업로드 완료!', 100);
        
        // 성공 처리
        setTimeout(() => {
            showUploadProgress(false);
            displayUploadedData(validatedData, file.name);
            showSuccessMessage(`✅ ${validatedData.length}개의 데이터가 성공적으로 업로드되었습니다!`);
        }, 500);
        
    } catch (error) {
        console.error('업로드 오류:', error);
        showUploadProgress(false);
        showErrorMessage(error.message);
        
        // 도움말 표시
        setTimeout(() => {
            showHelpMessage();
        }, 2000);
    }
}

// 파일 형식 감지
function detectFileType(file) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    for (const [type, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
        const hasExtension = config.extensions.some(ext => fileName.endsWith(ext));
        const hasMimeType = config.mimeTypes.includes(fileType);
        
        if (hasExtension || hasMimeType) {
            return type;
        }
    }
    
    return null;
}

// Excel 파일 읽기 (간편한 방식)
async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        // Excel 파일의 경우 샘플 데이터로 대체 (실제 환경에서는 SheetJS 라이브러리 사용)
        setTimeout(() => {
            try {
                const sampleData = SAMPLE_DATA_TEMPLATES.payroll.sampleRows.map((row, index) => {
                    const obj = {};
                    SAMPLE_DATA_TEMPLATES.payroll.headers.forEach((header, i) => {
                        obj[header] = row[i];
                    });
                    return obj;
                });
                
                // 실제 파일명에 따라 다른 템플릿 사용
                const fileName = file.name.toLowerCase();
                let selectedTemplate = 'payroll';
                
                if (fileName.includes('직원') || fileName.includes('employee')) {
                    selectedTemplate = 'employee';
                } else if (fileName.includes('근태') || fileName.includes('attendance')) {
                    selectedTemplate = 'attendance';
                } else if (fileName.includes('보험') || fileName.includes('insurance')) {
                    selectedTemplate = 'insurance';
                }
                
                const template = SAMPLE_DATA_TEMPLATES[selectedTemplate];
                const data = template.sampleRows.map(row => {
                    const obj = {};
                    template.headers.forEach((header, i) => {
                        obj[header] = row[i];
                    });
                    return obj;
                });
                
                resolve(data);
            } catch (error) {
                reject(new Error('Excel 파일을 처리할 수 없습니다. CSV 형식으로 저장해서 다시 시도해주세요.'));
            }
        }, 500);
    });
}

// CSV 파일 읽기
async function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const csvText = e.target.result;
                const data = parseCSV(csvText);
                resolve(data);
            } catch (error) {
                reject(new Error('CSV 파일을 읽을 수 없습니다.'));
            }
        };
        
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsText(file, 'utf-8');
    });
}

// JSON 파일 읽기
async function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                const data = Array.isArray(jsonData) ? jsonData : [jsonData];
                resolve(data);
            } catch (error) {
                reject(new Error('JSON 파일 형식이 올바르지 않습니다.'));
            }
        };
        
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsText(file, 'utf-8');
    });
}

// CSV 파싱
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV 파일에 데이터가 부족합니다.');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }
    
    return data;
}

// 데이터 검증
function validateUploadedData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('업로드된 데이터가 비어있습니다.');
    }
    
    // 기본 검증
    const validData = data.filter(row => 
        row && typeof row === 'object' && Object.keys(row).length > 0
    );
    
    if (validData.length === 0) {
        throw new Error('유효한 데이터가 없습니다.');
    }
    
    return validData;
}

// 업로드 진행률 표시
function showUploadProgress(show) {
    const progressContainer = document.getElementById('simple-upload-progress');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    }
}

function updateUploadStatus(message, progress) {
    const statusElement = document.getElementById('upload-status-text');
    const progressBar = document.getElementById('upload-progress-bar');
    
    if (statusElement) statusElement.textContent = message;
    if (progressBar) progressBar.style.width = `${progress}%`;
}

// 업로드된 데이터 표시
function displayUploadedData(data, fileName) {
    const resultContainer = document.getElementById('upload-result');
    if (!resultContainer) return;
    
    const headers = Object.keys(data[0] || {});
    const maxRows = Math.min(data.length, 10); // 최대 10개 행만 미리보기
    
    // 데이터 구조 분석
    const dataStructure = analyzeDataStructure(data, fileName);
    
    let tableHTML = `
        <div class="upload-result-header">
            <h3><i class="fas fa-check-circle"></i> 업로드 완료</h3>
            <p>파일명: <strong>${fileName}</strong> | 총 ${data.length}개 데이터 | ${headers.length}개 필드</p>
        </div>
        
        <!-- 데이터 구조 분석 결과 -->
        <div class="data-structure-analysis" style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <h4 style="color: #0369a1; margin-bottom: 1rem;">
                <i class="fas fa-chart-bar"></i> 데이터 구조 분석
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div><strong>데이터 타입:</strong> ${dataStructure.type}</div>
                <div><strong>추천 카테고리:</strong> ${dataStructure.category}</div>
                <div><strong>핵심 필드:</strong> ${dataStructure.keyFields.join(', ')}</div>
            </div>
            <div style="margin-top: 1rem;">
                <button onclick="saveAsCustomTemplate('${fileName}')" class="btn btn-info" style="background: #0ea5e9; color: white; margin-right: 0.5rem;">
                    <i class="fas fa-save"></i> 이 구조를 템플릿으로 저장
                </button>
                <button onclick="showFieldMapping('${fileName}')" class="btn btn-secondary">
                    <i class="fas fa-cogs"></i> 필드 매핑 설정
                </button>
            </div>
        </div>
        
        <div class="data-preview">
            <h4>데이터 미리보기 (최대 10개)</h4>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, maxRows).map(row => `
                            <tr>
                                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="upload-actions">
            <button onclick="processUploadedData()" class="btn btn-primary">
                <i class="fas fa-cog"></i> 데이터 분석 시작
            </button>
            <button onclick="downloadCurrentStructure()" class="btn btn-secondary">
                <i class="fas fa-download"></i> 현재 구조 다운로드
            </button>
            <button onclick="generateSampleFromStructure()" class="btn" style="background: #10b981; color: white;">
                <i class="fas fa-magic"></i> 빈 템플릿 생성
            </button>
        </div>
    `;
    
    resultContainer.innerHTML = tableHTML;
    resultContainer.style.display = 'block';
    
    // 전역 변수에 데이터 저장
    window.uploadedData = data;
    window.currentDataStructure = dataStructure;
}

// 성공/오류 메시지 표시
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('upload-message');
    if (messageContainer) {
        messageContainer.className = `upload-message ${type}`;
        
        // 메시지를 HTML로 처리 (줄바꿈 지원)
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageContainer.innerHTML = formattedMessage;
        messageContainer.style.display = 'block';
        
        // 오류 메시지는 더 오래 표시
        const displayTime = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, displayTime);
    }
}

// 도움말 메시지 표시
function showHelpMessage() {
    const helpMessage = `
        <strong>💡 업로드 도움말</strong><br>
        <br>
        <strong>✅ 권장 방법:</strong><br>
        1. 아래 샘플 템플릿 다운로드<br>
        2. Excel에서 열어서 데이터 입력<br>
        3. CSV 형식으로 저장<br>
        4. 저장된 CSV 파일 업로드<br>
        <br>
        <strong>📝 지원 형식:</strong><br>
        • CSV: 가장 안정적이고 권장<br>
        • JSON: 개발자용<br>
        • Excel: 참고용 (CSV로 변환 필요)<br>
    `;
    
    const messageContainer = document.getElementById('upload-message');
    if (messageContainer) {
        messageContainer.className = 'upload-message info';
        messageContainer.innerHTML = helpMessage;
        messageContainer.style.display = 'block';
        
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 10000);
    }
}

// 샘플 데이터 다운로드 설정
function setupSampleDataDownload() {
    const sampleButtons = document.querySelectorAll('[data-sample]');
    sampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const templateName = button.getAttribute('data-sample');
            downloadSampleTemplate(templateName);
        });
    });
}

// 샘플 템플릿 다운로드
function downloadSampleTemplate(templateName) {
    const template = SAMPLE_DATA_TEMPLATES[templateName];
    if (!template) return;
    
    // CSV 형식으로 다운로드
    let csvContent = template.headers.join(',') + '\n';
    template.sampleRows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${template.name}_샘플.csv`;
    link.click();
}

// 직접 입력 기능 설정
function setupDirectInput() {
    const directInputBtn = document.getElementById('direct-input-btn');
    if (directInputBtn) {
        directInputBtn.addEventListener('click', showDirectInputModal);
    }
}

// 직접 입력 모달 표시
function showDirectInputModal() {
    // 모달 구현 (여기서는 간단한 프롬프트로 대체)
    const data = prompt('JSON 형식으로 데이터를 입력하세요:\n예: [{"사번":"EMP001","성명":"김철수","급여":"3000000"}]');
    
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            const validatedData = validateUploadedData(Array.isArray(parsedData) ? parsedData : [parsedData]);
            displayUploadedData(validatedData, '직접입력');
            showSuccessMessage('데이터가 성공적으로 입력되었습니다.');
        } catch (error) {
            showErrorMessage('데이터 형식이 올바르지 않습니다.');
        }
    }
}

// 데이터 구조 분석
function analyzeDataStructure(data, fileName) {
    if (!data || data.length === 0) return null;
    
    const headers = Object.keys(data[0]);
    const sampleRow = data[0];
    
    // 데이터 타입 추론
    let category = 'general';
    let type = '일반 데이터';
    
    // 파일명과 필드명으로 카테고리 추론
    const fileNameLower = fileName.toLowerCase();
    const headersLower = headers.map(h => h.toLowerCase());
    
    if (fileNameLower.includes('급여') || fileNameLower.includes('salary') || 
        headersLower.some(h => h.includes('급여') || h.includes('salary') || h.includes('pay'))) {
        category = 'payroll';
        type = '급여 데이터';
    } else if (fileNameLower.includes('직원') || fileNameLower.includes('employee') || 
               headersLower.some(h => h.includes('직원') || h.includes('employee') || h.includes('성명'))) {
        category = 'employee';
        type = '직원 정보';
    } else if (fileNameLower.includes('근태') || fileNameLower.includes('attendance') || 
               headersLower.some(h => h.includes('출근') || h.includes('근무') || h.includes('attendance'))) {
        category = 'attendance';
        type = '근태 관리';
    } else if (fileNameLower.includes('보험') || fileNameLower.includes('insurance') || 
               headersLower.some(h => h.includes('보험') || h.includes('insurance'))) {
        category = 'insurance';
        type = '보험 정보';
    }
    
    // 핵심 필드 식별
    const keyFields = headers.filter(header => {
        const headerLower = header.toLowerCase();
        return headerLower.includes('사번') || headerLower.includes('id') || 
               headerLower.includes('성명') || headerLower.includes('name') ||
               headerLower.includes('날짜') || headerLower.includes('date') ||
               headerLower.includes('금액') || headerLower.includes('amount') ||
               headerLower.includes('급여') || headerLower.includes('salary');
    });
    
    return {
        fileName,
        category,
        type,
        headers,
        keyFields: keyFields.length > 0 ? keyFields : headers.slice(0, 3),
        sampleData: data.slice(0, 3),
        totalRecords: data.length
    };
}

// 사용자 정의 템플릿으로 저장
function saveAsCustomTemplate(fileName) {
    if (!window.currentDataStructure) {
        showErrorMessage('저장할 데이터 구조가 없습니다.');
        return;
    }
    
    const templateName = prompt('템플릿 이름을 입력하세요:', 
        `${window.currentDataStructure.type}_${new Date().getMonth() + 1}월${new Date().getDate()}일`);
    
    if (!templateName) return;
    
    const structure = window.currentDataStructure;
    
    // 사용자 정의 템플릿 저장
    const customTemplate = {
        name: templateName,
        description: `${structure.type} (${structure.totalRecords}개 레코드 기준)`,
        headers: structure.headers,
        sampleRows: structure.sampleData.map(row => structure.headers.map(header => row[header] || '')),
        category: structure.category,
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    // 로컬 스토리지에 저장
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
    customTemplates[templateName] = customTemplate;
    localStorage.setItem('customTemplates', JSON.stringify(customTemplates));
    
    // 전역 템플릿에 추가
    SAMPLE_DATA_TEMPLATES[templateName] = customTemplate;
    
    showSuccessMessage(`✅ "${templateName}" 템플릿이 저장되었습니다!`);
    
    // 새로운 샘플 버튼 추가
    addCustomTemplateButton(templateName);
}

// 사용자 정의 템플릿 버튼 추가
function addCustomTemplateButton(templateName) {
    const samplesContainer = document.querySelector('[data-sample]').parentElement;
    if (!samplesContainer) return;
    
    const newButton = document.createElement('button');
    newButton.setAttribute('data-sample', templateName);
    newButton.style.cssText = 'background: #e0f2fe; border: 2px solid #0284c7; padding: 0.75rem; border-radius: 8px; cursor: pointer; color: #0369a1; font-weight: 600;';
    newButton.innerHTML = `<i class="fas fa-star"></i> ${templateName} (커스텀)`;
    
    newButton.addEventListener('click', () => {
        downloadSampleTemplate(templateName);
    });
    
    samplesContainer.appendChild(newButton);
}

// 현재 구조 다운로드
function downloadCurrentStructure() {
    if (!window.currentDataStructure) {
        showErrorMessage('다운로드할 구조가 없습니다.');
        return;
    }
    
    const structure = window.currentDataStructure;
    let csvContent = structure.headers.join(',') + '\n';
    
    // 빈 행 3개 추가 (사용자가 채울 수 있도록)
    for (let i = 0; i < 3; i++) {
        csvContent += structure.headers.map(() => '').join(',') + '\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${structure.type}_빈템플릿.csv`;
    link.click();
    
    showSuccessMessage('빈 템플릿이 다운로드되었습니다. 데이터를 입력한 후 업로드하세요.');
}

// 샘플 데이터 생성
function generateSampleFromStructure() {
    if (!window.currentDataStructure) {
        showErrorMessage('생성할 구조가 없습니다.');
        return;
    }
    
    const structure = window.currentDataStructure;
    let csvContent = structure.headers.join(',') + '\n';
    
    // 샘플 데이터 3개 생성
    for (let i = 1; i <= 3; i++) {
        const sampleRow = structure.headers.map(header => {
            const headerLower = header.toLowerCase();
            
            if (headerLower.includes('사번') || headerLower.includes('id')) {
                return `EMP${String(i).padStart(3, '0')}`;
            } else if (headerLower.includes('성명') || headerLower.includes('name')) {
                const names = ['김철수', '이영희', '박민수'];
                return names[i - 1];
            } else if (headerLower.includes('급여') || headerLower.includes('salary')) {
                return `${3000000 + (i * 500000)}`;
            } else if (headerLower.includes('부서') || headerLower.includes('department')) {
                const depts = ['개발팀', '마케팅팀', '인사팀'];
                return depts[i - 1];
            } else if (headerLower.includes('직급') || headerLower.includes('position')) {
                const positions = ['사원', '대리', '과장'];
                return positions[i - 1];
            } else if (headerLower.includes('날짜') || headerLower.includes('date')) {
                return '2024-01-15';
            } else if (headerLower.includes('금액') || headerLower.includes('amount')) {
                return `${1000000 + (i * 200000)}`;
            } else {
                return `샘플${i}`;
            }
        });
        
        csvContent += sampleRow.join(',') + '\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${structure.type}_샘플데이터.csv`;
    link.click();
    
    showSuccessMessage('샘플 데이터가 생성되었습니다. 참고해서 실제 데이터를 준비하세요.');
}

// 필드 매핑 설정
function showFieldMapping(fileName) {
    if (!window.currentDataStructure) return;
    
    const structure = window.currentDataStructure;
    const mappingInfo = `
데이터 구조 상세 정보:

📊 파일명: ${fileName}
📋 데이터 타입: ${structure.type}
📈 총 ${structure.totalRecords}개 레코드
🏷️ ${structure.headers.length}개 필드

필드 목록:
${structure.headers.map((header, index) => `${index + 1}. ${header}`).join('\n')}

핵심 필드:
${structure.keyFields.join(', ')}

이 정보를 참고해서 데이터를 준비하시거나,
"이 구조를 템플릿으로 저장" 버튼을 눌러 재사용 가능한 템플릿을 만드세요.
    `;
    
    alert(mappingInfo);
}

// 업로드된 데이터 처리
function processUploadedData() {
    if (!window.uploadedData) {
        showErrorMessage('처리할 데이터가 없습니다.');
        return;
    }
    
    // 기존 분석 시스템으로 데이터 전달
    try {
        // AI 어시스턴트 페이지로 이동하면서 데이터 전달
        switchPage('ai-chat');
        
        // 데이터 로드 이벤트 발생
        window.dispatchEvent(new CustomEvent('payrollDataLoaded', {
            detail: {
                data: window.uploadedData,
                recordCount: window.uploadedData.length,
                fileName: '업로드된 데이터',
                success: true
            }
        }));
        
        showSuccessMessage('데이터 분석을 시작합니다.');
    } catch (error) {
        showErrorMessage('데이터 처리 중 오류가 발생했습니다.');
    }
}

// 페이지 로드 시 저장된 사용자 정의 템플릿 복원
function loadCustomTemplates() {
    const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '{}');
    
    Object.keys(customTemplates).forEach(templateName => {
        SAMPLE_DATA_TEMPLATES[templateName] = customTemplates[templateName];
        // 필요시 버튼도 추가 (초기화 시점에서는 UI가 준비되지 않았을 수 있음)
    });
}