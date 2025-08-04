// 전역 데이터 저장소 (기존 코드 맨 위에 추가)
let persistentData = {
    uploadedData: [],
    uploadHistory: [],
    lastUploadDate: null,
    dataSource: null
};

// SafeJSONParser 클래스 - NaN, undefined, Infinity 등을 안전하게 처리
class SafeJSONParser {
    /**
     * NaN, undefined, Infinity 등을 안전하게 처리하는 JSON 파서
     */
    static parse(jsonString) {
        try {
            // NaN을 null로 변환
            const cleanedJson = jsonString
                .replace(/:\s*NaN/g, ': null')
                .replace(/:\s*undefined/g, ': null')
                .replace(/:\s*Infinity/g, ': null')
                .replace(/:\s*-Infinity/g, ': null')
                .replace(/,\s*}/g, '}')  // 마지막 쉼표 제거
                .replace(/,\s*]/g, ']'); // 배열 마지막 쉼표 제거
            
            return JSON.parse(cleanedJson);
        } catch (error) {
            // 더 상세한 오류 분석
            const errorInfo = this.analyzeJSONError(jsonString, error);
            throw new Error(`JSON 파싱 오류: ${errorInfo}`);
        }
    }

    /**
     * JSON 오류 분석 및 위치 찾기
     */
    static analyzeJSONError(jsonString, error) {
        const errorMessage = error.message || '';
        
        // SyntaxError에서 위치 정보 추출
        const positionMatch = errorMessage.match(/position (\d+)/);
        if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const beforeError = jsonString.substring(Math.max(0, position - 50), position);
            const afterError = jsonString.substring(position, Math.min(jsonString.length, position + 50));
            
            return `${errorMessage}\n문제 위치 근처: "${beforeError}[여기]${afterError}"`;
        }
        
        // 일반적인 문제 패턴 확인
        if (errorMessage.includes('Unexpected token')) {
            const commonIssues = [
                { pattern: /NaN/g, issue: 'NaN 값' },
                { pattern: /undefined/g, issue: 'undefined 값' },
                { pattern: /Infinity/g, issue: 'Infinity 값' },
                { pattern: /,\s*}/g, issue: '마지막 쉼표' },
                { pattern: /,\s*]/g, issue: '배열 마지막 쉼표' }
            ];
            
            for (const { pattern, issue } of commonIssues) {
                if (pattern.test(jsonString)) {
                    return `${errorMessage} (${issue} 문제로 추정)`;
                }
            }
        }
        
        return errorMessage;
    }

    /**
     * 스트리밍 방식으로 대용량 JSON 처리
     */
    static parseStream(jsonString, chunkSize = 1024 * 1024) {
        // 1MB씩 청크로 나누어 처리
        if (jsonString.length <= chunkSize) {
            return this.parse(jsonString);
        }
        
        // 대용량 파일은 청크 단위로 전처리 후 파싱
        let processedJson = '';
        
        for (let i = 0; i < jsonString.length; i += chunkSize) {
            const chunk = jsonString.substring(i, i + chunkSize);
            // 각 청크에서 NaN 등을 null로 변환
            const cleanedChunk = chunk
                .replace(/:\s*NaN/g, ': null')
                .replace(/:\s*undefined/g, ': null')
                .replace(/:\s*Infinity/g, ': null')
                .replace(/:\s*-Infinity/g, ': null');
            
            processedJson += cleanedChunk;
        }
        
        return JSON.parse(processedJson);
    }
}

// checkDataConnection 함수 정의
function checkDataConnection() {
    console.log('데이터 연결 상태 확인');
    // 데이터 연결 확인 로직 구현
}

// 페이지별 초기화 함수
function initializePage(pageName) {
    console.log('페이지 초기화:', pageName);
    
    switch(pageName) {
        case 'ai-chat':
            checkDataConnection();
            break;
            
        case 'employee':
            // 통합 데이터 업로드 페이지 초기화
            initializeUnifiedUpload();
            break;
            
        case 'upload-history':
            // 업로드 내역 페이지 초기화
            loadUploadHistory();
            break;
    }
}

// 디버그 로그 시스템
let uploadDebugLog = [];
let currentProcessingStep = '';

// 디버그 로그 추가 함수
function addUploadLog(message, isError = false) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(logMessage);
    uploadDebugLog.push({ message: logMessage, isError });
    
    if (!isError) {
        currentProcessingStep = message;
    }
    
    // 디버그 로그 UI 업데이트
    updateDebugLogDisplay();
}

// 디버그 로그 화면 업데이트
function updateDebugLogDisplay() {
    const logContainer = document.getElementById('uploadDebugLog');
    if (logContainer && uploadDebugLog.length > 0) {
        const logHtml = uploadDebugLog.map(log => 
            `<div class="debug-log-item ${log.isError ? 'error' : ''}">${log.message}</div>`
        ).join('');
        
        logContainer.innerHTML = `
            <div class="debug-log-header">
                <h3>처리 로그</h3>
                <button onclick="clearUploadLog()" class="btn-clear-log">지우기</button>
            </div>
            <div class="debug-log-content">${logHtml}</div>
        `;
        logContainer.style.display = 'block';
    }
}

// 로그 지우기
function clearUploadLog() {
    uploadDebugLog = [];
    const logContainer = document.getElementById('uploadDebugLog');
    if (logContainer) {
        logContainer.style.display = 'none';
    }
}

// 파일 전처리 함수 (NaN 값 처리)
function preprocessFileContent(content) {
    addUploadLog('파일 내용 전처리 시작');
    
    let processed = content;
    
    // 1. NaN 값을 null로 변환
    const nanCount = (processed.match(/:\s*NaN/g) || []).length;
    if (nanCount > 0) {
        processed = processed.replace(/:\s*NaN/g, ': null');
        addUploadLog(`NaN 값 ${nanCount}개를 null로 변환`);
    }
    
    // 2. undefined 값 처리
    const undefinedCount = (processed.match(/:\s*undefined/g) || []).length;
    if (undefinedCount > 0) {
        processed = processed.replace(/:\s*undefined/g, ': null');
        addUploadLog(`undefined 값 ${undefinedCount}개를 null로 변환`);
    }
    
    // 3. Infinity 값 처리
    const infinityCount = (processed.match(/:\s*Infinity/g) || []).length;
    if (infinityCount > 0) {
        processed = processed.replace(/:\s*Infinity/g, ': null');
        processed = processed.replace(/:\s*-Infinity/g, ': null');
        addUploadLog(`Infinity 값 ${infinityCount}개를 null로 변환`);
    }
    
    // 4. 잘못된 쉼표 제거
    processed = processed.replace(/,(\s*[}\]])/g, '$1');
    
    addUploadLog('파일 내용 전처리 완료');
    return processed;
}

// 진행률 표시 함수
function updateUploadProgress(progress, message = '') {
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');
    const stepText = document.getElementById('uploadStepText');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        if (progress > 10) {
            progressBar.innerHTML = `<span class="progress-percentage">${progress}%</span>`;
        }
    }
    
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
    
    if (stepText && message) {
        stepText.textContent = message;
        currentProcessingStep = message;
    }
}

// 통합 데이터 업로드 초기화
function initializeUnifiedUpload() {
    console.log('통합 업로드 페이지 초기화 (PayrollFileUploader 모드)');
    addUploadLog('PayrollFileUploader 시스템 초기화');
    
    // PayrollFileUploader 인스턴스 생성
    if (!globalPayrollUploader) {
        globalPayrollUploader = new PayrollFileUploader();
        console.log('✅ PayrollFileUploader 인스턴스 생성 완료');
        
        // 페이지가 동적으로 로드된 후 data-action 버튼들 재초기화
        setTimeout(() => {
            globalPayrollUploader.initializeEventListeners();
            console.log('✅ data-action 버튼들 재초기화 완료');
        }, 100);
    }
    
    // 파일 input 이벤트 리스너 등록
    const unifiedFileInput = document.getElementById('unifiedFileInput');
    if (unifiedFileInput) {
        unifiedFileInput.removeEventListener('change', handleUnifiedFileUpload);
        unifiedFileInput.addEventListener('change', function(event) {
            console.log('파일 선택됨:', event.target.files);
            addUploadLog(`파일 선택됨: ${event.target.files[0]?.name}`);
            
            if (event.target.files[0]) {
                globalPayrollUploader.processFile(event.target.files[0]);
            }
            
            // 입력 필드 초기화 (같은 파일 재선택 가능하도록)
            event.target.value = '';
        });
        console.log('✅ 파일 input 이벤트 리스너 등록 완료');
    }
    
    // 드롭존 이벤트 리스너 등록
    const unifiedDropZone = document.getElementById('unifiedDropZone');
    if (unifiedDropZone) {
        // 드래그 이벤트 처리
        unifiedDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.add('drag-active');
        });
        
        unifiedDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.remove('drag-active');
        });
        
        unifiedDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.remove('drag-active');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                addUploadLog(`드래그 드롭으로 파일 선택: ${files[0].name}`);
                globalPayrollUploader.processFile(files[0]);
            }
        });
        
        unifiedDropZone.addEventListener('click', function() {
            console.log('드롭존 클릭됨');
            addUploadLog('파일 선택 대화상자 열기');
            document.getElementById('unifiedFileInput').click();
        });
        
        console.log('✅ 드롭존 이벤트 리스너 등록 완료');
    }
    
    // payrollDataLoaded 커스텀 이벤트 리스너 등록
    window.addEventListener('payrollDataLoaded', function(event) {
        console.log('🎉 payrollDataLoaded 이벤트 수신:', event.detail);
        addUploadLog('payrollDataLoaded 커스텀 이벤트 발생');
        
        // 추가 처리 로직
        handlePayrollDataLoaded(event.detail);
    });
    
    // 디버그 로그 컨테이너 추가
    addDebugLogContainer();
}

// payrollDataLoaded 이벤트 핸들러
function handlePayrollDataLoaded(result) {
    console.log('📊 급여 데이터 로드 완료 처리:', result);
    
    // 업로드 내역에 추가
    if (globalPayrollUploader.currentFile && result.data) {
        addUploadHistoryItem(
            globalPayrollUploader.currentFile, 
            result.data.length, 
            'success'
        );
    }
    
    // 데이터 미리보기 표시
    if (result.data) {
        displayUnifiedDataPreview(result.data);
        performUnifiedDataAnalysis(result.data, globalPayrollUploader.currentFile?.name || 'uploaded_data');
        saveUnifiedDataToStorage(result.data, globalPayrollUploader.currentFile?.name || 'uploaded_data');
    }
    
    // 다른 컴포넌트들에게 알림
    updateDashboardWithNewData(result);
}

// 디버그 로그 컨테이너 추가
function addDebugLogContainer() {
    const existingLog = document.getElementById('uploadDebugLog');
    if (existingLog) return;
    
    const container = document.querySelector('.data-upload-center');
    if (container) {
        const debugLogDiv = document.createElement('div');
        debugLogDiv.id = 'uploadDebugLog';
        debugLogDiv.className = 'upload-debug-log';
        debugLogDiv.style.display = 'none';
        container.appendChild(debugLogDiv);
    }
}

// PayrollFileUploader 클래스 (모듈화된 버전)
class PayrollFileUploader {
    constructor() {
        this.currentFile = null;
        this.isProcessing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // data-action="select-file" 버튼들에 이벤트 리스너 추가
        const fileSelectBtns = document.querySelectorAll('[data-action="select-file"]');
        fileSelectBtns.forEach(btn => {
            btn.addEventListener('click', () => this.triggerFileSelect());
        });
        
        console.log('PayrollFileUploader 초기화 완료');
    }

    triggerFileSelect() {
        if (this.isProcessing) {
            this.showMessage('현재 파일을 처리 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
            return;
        }
        
        const fileInput = document.getElementById('unifiedFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    async processFile(file) {
        if (this.isProcessing) {
            this.showMessage('현재 파일을 처리 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
            return;
        }
        
        this.isProcessing = true;
        this.currentFile = file;
        this.showProcessingState(true);
        this.clearMessages();

        try {
            console.log('📁 PayrollFileUploader 파일 처리 시작:', file.name);
            
            // 기존 handleEnhancedFileUpload 로직 재사용
            await this.processFileInternal(file);
            
        } catch (error) {
            console.error('💥 PayrollFileUploader 예상치 못한 오류:', error);
            const diagnostics = diagnoseUploadError(file, error);
            this.handleError('예상치 못한 오류가 발생했습니다.', diagnostics);
            
        } finally {
            this.isProcessing = false;
            this.showProcessingState(false);
        }
    }

    async processFileInternal(file) {
        try {
            // 강화된 파일 업로드 함수 사용
            const result = await this.handleFileUploadFixed(file);
            
            if (result && result.length > 0) {
                // 성공 처리
                this.handleUploadSuccess(result, file.name);
                return result;
            } else {
                throw new Error('파일 처리 결과가 비어있습니다.');
            }
            
        } catch (error) {
            // 구체적 오류 처리
            this.handleSpecificError(error, file);
            throw error;
        }
    }

    // 🚀 강화된 파일 업로드 시스템
    async handleFileUploadFixed(file) {
        console.log('🚀 강화된 파일 업로드 시작:', file.name);
        
        try {
            // 1단계: 파일 검증
            if (!file) {
                throw new Error('파일이 선택되지 않았습니다.');
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB
                throw new Error('파일 크기가 10MB를 초과합니다.');
            }
            
            // 2단계: 메모리 효율적 파일 읽기
            const content = await this.readFileWithProgress(file);
            
            // 3단계: 안전한 JSON 파싱
            const jsonData = await this.parseJSONSafely(content);
            
            // 4단계: 데이터 검증
            this.validatePayrollData(jsonData);
            
            // 성공 처리
            console.log(`✅ ${jsonData.length}개의 데이터가 성공적으로 로드되었습니다.`);
            
            // 전역 변수에 저장
            window.uploadedPayrollData = jsonData;
            
            return jsonData;
            
        } catch (error) {
            console.error('❌ 파일 업로드 오류:', error);
            throw error;
        }
    }

    // 진행률과 함께 파일 읽기
    readFileWithProgress(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            // 진행률 표시
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    this.updateProgressBar(progress, '파일 읽는 중...');
                }
            };
            
            reader.onload = (e) => {
                this.updateProgressBar(100, '파일 읽기 완료');
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('파일 읽기 실패: 파일이 손상되었거나 접근할 수 없습니다.'));
            };
            
            reader.onabort = () => {
                reject(new Error('파일 읽기가 사용자에 의해 중단되었습니다.'));
            };
            
            // UTF-8로 읽기 시작
            reader.readAsText(file, 'utf-8');
        });
    }

    // 대용량 JSON 안전 파싱
    async parseJSONSafely(content) {
        try {
            this.updateProgressBar(20, 'JSON 파싱 준비 중...');
            
            // 빈 콘텐츠 체크
            if (!content || content.trim() === '') {
                throw new Error('파일이 비어있습니다.');
            }
            
            // BOM 제거
            const cleanContent = content.replace(/^\uFEFF/, '');
            
            this.updateProgressBar(40, 'JSON 구조 분석 중...');
            
            // 대용량 파일 처리
            if (cleanContent.length > 3 * 1024 * 1024) { // 3MB 이상
                return await this.parseJSONInChunks(cleanContent);
            }
            
            this.updateProgressBar(60, 'JSON 파싱 중...');
            
            // 일반 파싱
            const result = JSON.parse(cleanContent);
            
            this.updateProgressBar(80, 'JSON 파싱 완료');
            
            return result;
            
        } catch (error) {
            if (error instanceof SyntaxError) {
                // JSON 구문 오류 상세 분석
                const errorPosition = this.extractErrorPosition(error.message);
                const contextInfo = this.getErrorContext(content, errorPosition);
                
                throw new Error(`JSON 형식 오류가 발생했습니다.\n${error.message}\n${contextInfo}`);
            }
            
            throw new Error(`JSON 파싱 실패: ${error.message}`);
        }
    }

    // 대용량 JSON 청크 파싱
    async parseJSONInChunks(content) {
        return new Promise((resolve, reject) => {
            this.updateProgressBar(50, '대용량 파일 처리 중...');
            
            // 백그라운드 처리를 위한 지연
            setTimeout(() => {
                try {
                    this.updateProgressBar(70, '메모리 최적화 파싱 중...');
                    
                    // 메모리 사용량을 줄이기 위한 파싱
                    const result = JSON.parse(content);
                    
                    this.updateProgressBar(90, '파싱 완료, 검증 중...');
                    resolve(result);
                    
                } catch (error) {
                    reject(error);
                }
            }, 100); // 100ms 지연으로 UI 블로킹 방지
        });
    }

    // 급여 데이터 검증
    validatePayrollData(data) {
        this.updateProgressBar(95, '데이터 유효성 검사 중...');
        
        if (!Array.isArray(data)) {
            throw new Error('JSON 데이터는 배열 형태여야 합니다.');
        }
        
        if (data.length === 0) {
            throw new Error('업로드된 파일에 데이터가 없습니다.');
        }
        
        // 첫 번째 레코드 구조 검증
        const firstRecord = data[0];
        if (!firstRecord || typeof firstRecord !== 'object') {
            throw new Error('데이터 구조가 올바르지 않습니다.');
        }
        
        // 필수 필드 확인
        const requiredFields = ['사번', '성명'];
        const availableFields = Object.keys(firstRecord);
        
        const missingFields = requiredFields.filter(field => 
            !availableFields.includes(field) || 
            firstRecord[field] === null || 
            firstRecord[field] === undefined ||
            firstRecord[field] === ''
        );
        
        if (missingFields.length > 0) {
            throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
        }
        
        console.log(`✅ ${data.length}개 급여 데이터 검증 완료`);
        console.log(`📊 사용 가능한 필드: ${availableFields.slice(0, 10).join(', ')}...`);
    }

    // 구체적인 오류 처리
    handleSpecificError(error, file) {
        const errorMessage = error.message.toLowerCase();
        
        let userFriendlyMessage = '';
        let solution = '';
        
        if (errorMessage.includes('json') && errorMessage.includes('syntax')) {
            userFriendlyMessage = 'JSON 파일 형식에 오류가 있습니다.';
            solution = '파일을 텍스트 에디터로 열어 JSON 형식을 확인해주세요.';
            
        } else if (errorMessage.includes('memory') || errorMessage.includes('maximum')) {
            userFriendlyMessage = '파일이 너무 커서 메모리 부족이 발생했습니다.';
            solution = '브라우저를 새로고침하고 다른 탭을 닫은 후 다시 시도해주세요.';
            
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            userFriendlyMessage = '네트워크 연결에 문제가 있습니다.';
            solution = '인터넷 연결을 확인하고 다시 시도해주세요.';
            
        } else if (file && file.size > 5 * 1024 * 1024) {
            userFriendlyMessage = '파일 크기가 너무 큽니다.';
            solution = '파일 크기를 5MB 이하로 줄이거나 데이터를 분할해주세요.';
            
        } else {
            userFriendlyMessage = '파일 처리 중 알 수 없는 오류가 발생했습니다.';
            solution = '파일 형식을 확인하고 브라우저를 새로고침한 후 다시 시도해주세요.';
        }
        
        this.showErrorMessage(userFriendlyMessage, solution, error.message);
    }

    // 오류 위치 추출
    extractErrorPosition(errorMessage) {
        const match = errorMessage.match(/position (\d+)/i);
        return match ? parseInt(match[1]) : null;
    }

    // 오류 컨텍스트 정보
    getErrorContext(content, position) {
        if (!position || !content) return '';
        
        const start = Math.max(0, position - 100);
        const end = Math.min(content.length, position + 100);
        const context = content.slice(start, end);
        
        return `오류 발생 위치 근처:\n"${context}"`;
    }

    // 진행률 표시 함수
    updateProgressBar(percentage, message) {
        // 기존 진행률 바가 있다면 업데이트
        let progressContainer = document.getElementById('payroll-upload-progress');
        
        if (!progressContainer) {
            progressContainer = this.createProgressBar();
        }
        
        const progressBar = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${message} (${percentage}%)`;
        }
        
        // 완료 시 잠시 후 숨김
        if (percentage === 100) {
            setTimeout(() => {
                if (progressContainer && progressContainer.parentNode) {
                    progressContainer.style.display = 'none';
                }
            }, 2000);
        } else {
            progressContainer.style.display = 'block';
        }
    }

    // 진행률 바 생성
    createProgressBar() {
        const container = document.createElement('div');
        container.id = 'payroll-upload-progress';
        container.className = 'payroll-progress-overlay';
        container.innerHTML = `
            <div class="payroll-progress-modal">
                <div class="payroll-progress-header">
                    <i class="fas fa-file-upload"></i>
                    <h3>파일 처리 중...</h3>
                </div>
                <div class="progress-text">파일 처리 준비 중...</div>
                <div class="payroll-progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="payroll-progress-details">
                    <small>처리 중인 동안 페이지를 새로고침하지 마세요</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        return container;
    }

    // 업로드 성공 처리
    handleUploadSuccess(data, fileName) {
        console.log('🎉 업로드 성공:', fileName, data.length, '개 레코드');
        
        // 진행률 바 완료
        this.updateProgressBar(100, '완료!');
        
        // 성공 토스트 메시지
        this.showToastMessage(
            `${data.length}개의 급여 데이터가 성공적으로 로드되었습니다.`, 
            'success'
        );
        
        // 커스텀 이벤트 발송
        this.dispatchPayrollEvent('payrollDataLoaded', {
            data: data,
            fileName: fileName,
            recordCount: data.length
        });
        
        // API로 전송
        setTimeout(async () => {
            try {
                await sendToPayrollAPI(data, fileName);
            } catch (error) {
                console.error('API 전송 오류:', error);
                this.showToastMessage('데이터 저장 중 오류가 발생했습니다.', 'error');
            }
        }, 1000);
    }

    // 오류 메시지 표시
    showErrorMessage(userMessage, solution, technicalDetails) {
        // 진행률 바 숨김
        const progressContainer = document.getElementById('payroll-upload-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
        
        // 토스트 메시지로 사용자 친화적 오류 표시
        this.showToastMessage(userMessage, 'error');
        
        // 상세한 오류 정보는 콘솔에 로그
        console.error('🔧 상세 오류 정보:', {
            userMessage,
            solution,
            technicalDetails
        });
        
        // 개발자 모드에서는 상세 정보도 표시
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const fullMessage = `❌ ${userMessage}\n\n💡 해결 방법:\n${solution}\n\n🔧 기술적 세부사항:\n${technicalDetails}`;
            
            // 약간의 지연 후 상세 정보 표시
            setTimeout(() => {
                if (confirm('개발자 모드: 상세한 오류 정보를 확인하시겠습니까?')) {
                    alert(fullMessage);
                }
            }, 2000);
        }
    }

    handleSuccess(result) {
        console.log('✅ PayrollFileUploader 파일 처리 성공:', result);
        
        this.showMessage(
            `${result.recordCount || result.length}개의 급여 데이터가 성공적으로 로드되었습니다.`, 
            'success'
        );
        
        // 데이터를 전역 변수에 저장
        window.payrollData = result.data || result;
        
        // 다음 단계 UI 활성화
        this.enableNextSteps();
        
        // 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent('payrollDataLoaded', {
            detail: result
        }));
    }

    handleError(errorMessage, diagnostics) {
        console.error('❌ PayrollFileUploader 파일 처리 실패:', errorMessage);
        console.error('🔍 PayrollFileUploader 진단 정보:', diagnostics);
        
        this.showMessage(errorMessage, 'error');
        
        if (diagnostics?.solution) {
            this.showMessage(diagnostics.solution, 'info');
        }
        
        if (diagnostics?.technicalDetails) {
            console.error('기술적 세부사항:', diagnostics.technicalDetails);
        }

        // 진단 모달 표시
        if (diagnostics) {
            showDiagnosticsModal(diagnostics);
        }
    }

    showProcessingState(isProcessing) {
        // 기존 showUploadProgress 함수 사용
        showUploadProgress(isProcessing);
        
        const fileSelectBtns = document.querySelectorAll('[data-action="select-file"], .upload-drop-zone button');
        
        fileSelectBtns.forEach(btn => {
            if (isProcessing) {
                btn.disabled = true;
                btn.classList.add('processing');
                if (btn.textContent.includes('파일')) {
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('processing');
                if (btn.textContent.includes('처리')) {
                    btn.innerHTML = '<i class="fas fa-upload"></i> 파일 선택';
                }
            }
        });
    }

    showMessage(message, type = 'info') {
        // 기존 showUploadMessage 함수 사용
        showUploadMessage(message, type);
        
        // 추가로 고급 토스트 메시지도 표시
        this.showToastMessage(message, type);
    }

    showToastMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getMessageIcon(type)}</span>
            <span class="toast-text">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // 토스트 컨테이너 찾기 또는 생성
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // 애니메이션 효과
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 자동 제거 (에러는 수동으로만)
        if (type !== 'error') {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 5000);
        }
    }

    getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    clearMessages() {
        // 기존 메시지 제거
        removeUploadMessage();
        
        // 토스트 메시지 제거
        const toastContainer = document.querySelector('.toast-container');
        if (toastContainer) {
            toastContainer.innerHTML = '';
        }
    }

    enableNextSteps() {
        // 다음 단계 버튼들 활성화
        const nextButtons = document.querySelectorAll('[data-requires="payroll-data"]');
        nextButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        
        // 업로드 상태 업데이트
        const statusBadge = document.getElementById('unifiedUploadStatus');
        if (statusBadge) {
            statusBadge.textContent = '완료';
            statusBadge.className = 'upload-status-badge success';
        }
    }
}

// 글로벌 PayrollFileUploader 인스턴스
let globalPayrollUploader = null;

// 향상된 파일 업로드 처리
async function handleEnhancedFileUpload(files) {
    if (!files || files.length === 0) {
        showUploadMessage('파일이 선택되지 않았습니다.', 'error');
        return;
    }

    const file = files[0];
    addUploadLog(`파일 처리 시작: ${file.name} (${Math.round(file.size / 1024)}KB)`);
    
    // 업로드 UI 상태 변경
    showUploadProgress(true);
    updateUploadProgress(0, '파일 검증 중...');
    
    try {
        // 파일 크기 검증 (50MB로 증가)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`파일이 너무 큽니다. 최대 크기: ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
        
        updateUploadProgress(10, '파일 크기 검증 완료');
        addUploadLog('파일 크기 검증 통과');
        
        // 파일 타입 검증
        const allowedTypes = ['.json', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            addUploadLog(`지원하지 않는 파일 형식: ${fileExtension}`, true);
            throw new Error(`지원하지 않는 파일 형식입니다. 허용된 형식: ${allowedTypes.join(', ')}`);
        }
        
        updateUploadProgress(20, '파일 형식 검증 완료');
        addUploadLog('파일 형식 검증 통과');
        
        // 파일 읽기
        updateUploadProgress(30, '파일 읽기 중...');
        const fileContent = await readFileWithEncoding(file);
        
        updateUploadProgress(50, '파일 내용 전처리 중...');
        addUploadLog(`파일 읽기 완료: ${fileContent.length.toLocaleString()} 문자`);
        
        // 파일 전처리
        const processedContent = preprocessFileContent(fileContent);
        
        updateUploadProgress(70, 'JSON 파싱 중...');
        addUploadLog('SafeJSONParser로 파싱 시작');
        
        // 안전한 JSON 파싱
        let data;
        try {
            if (processedContent.length > 5 * 1024 * 1024) { // 5MB 이상
                addUploadLog('대용량 파일로 스트리밍 파싱 적용');
                data = SafeJSONParser.parseStream(processedContent);
            } else {
                data = SafeJSONParser.parse(processedContent);
            }
            addUploadLog('JSON 파싱 성공');
        } catch (parseError) {
            const errorMsg = parseError.message || '알 수 없는 파싱 오류';
            addUploadLog(`JSON 파싱 실패: ${errorMsg}`, true);
            throw new Error(`JSON 파싱 실패: ${errorMsg}`);
        }
        
        updateUploadProgress(90, '데이터 검증 중...');
        
        // 데이터 검증
        if (!Array.isArray(data)) {
            if (typeof data === 'object' && data !== null) {
                addUploadLog('단일 객체를 배열로 변환');
                data = [data];
            } else {
                throw new Error('데이터가 올바른 형식이 아닙니다.');
            }
        }
        
        if (data.length === 0) {
            throw new Error('빈 데이터 배열입니다.');
        }
        
        addUploadLog(`데이터 검증 완료: ${data.length.toLocaleString()}개 레코드`);
        
        // 기본 필드 존재 확인
        const firstRecord = data[0];
        const recommendedFields = ['사번', '성명', '급여영역'];
        const existingFields = recommendedFields.filter(field => field in firstRecord);
        
        if (existingFields.length > 0) {
            addUploadLog(`권장 필드 확인: ${existingFields.join(', ')} 존재`);
        }
        
        updateUploadProgress(95, '서버 전송 중...');
        
        // 서버로 전송
        try {
            const apiResult = await sendToPayrollAPI(data, file.name);
            addUploadLog('서버 업로드 성공');
        } catch (apiError) {
            addUploadLog(`서버 업로드 실패: ${apiError.message}`, true);
            // 서버 실패해도 로컬 처리는 계속
        }
        
        // 성공 처리
        updateUploadProgress(100, '모든 처리 완료');
        addUploadLog('파일 업로드 및 처리 성공!');
        
        // 데이터 표시
        displayUnifiedDataPreview(data);
        performUnifiedDataAnalysis(data, file.name);
        saveUnifiedDataToStorage(data, file.name);
        addUploadHistoryItem(file, data.length, 'success');
        
        // 성공 메시지
        setTimeout(() => {
            showUploadMessage(`업로드 성공! ${data.length}개의 레코드가 처리되었습니다.`, 'success');
            hideUploadProgress();
            
            // payrollDataLoaded 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent('payrollDataLoaded', {
                detail: {
                    data: data,
                    recordCount: data.length,
                    fileName: file.name,
                    success: true
                }
            }));
        }, 500);
        
    } catch (error) {
        const errorMsg = error.message || '알 수 없는 오류';
        addUploadLog(`처리 실패: ${errorMsg}`, true);
        updateUploadProgress(0, '처리 실패');
        
        // 오류 진단 실행
        const diagnostics = diagnoseUploadError(file, error);
        
        setTimeout(() => {
            showUploadMessage(`업로드 실패: ${errorMsg}`, 'error');
            hideUploadProgress();
            
            // 진단 모달 표시
            showDiagnosticsModal(diagnostics);
        }, 1000);
    }
}

// UTF-8으로 파일 읽기 (인코딩 자동 감지)
function readFileWithEncoding(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target?.result;
            if (!content) {
                reject(new Error('파일 내용이 비어있습니다.'));
                return;
            }
            resolve(content);
        };
        
        reader.onerror = function() {
            reject(new Error('파일 읽기 실패'));
        };
        
        // UTF-8로 시도
        try {
            reader.readAsText(file, 'utf-8');
        } catch (error) {
            // 실패 시 기본 인코딩으로 시도
            reader.readAsText(file);
        }
    });
}

// 업로드 진행 표시/숨김
function showUploadProgress(show = true) {
    const progressContainer = document.getElementById('uploadProgressContainer');
    if (progressContainer) {
        progressContainer.style.display = show ? 'block' : 'none';
    }
}

function hideUploadProgress() {
    showUploadProgress(false);
}

// 파일 업로드 오류 진단 시스템
function diagnoseUploadError(file, error) {
    const diagnostics = {
        fileInfo: {
            name: file?.name || 'Unknown',
            size: file?.size || 0,
            type: file?.type || 'Unknown',
            lastModified: file?.lastModified || null
        },
        errorType: null,
        solution: null,
        technicalDetails: null,
        recommendations: []
    };

    addUploadLog(`오류 진단 시작: ${error?.message || '알 수 없는 오류'}`, true);

    // 파일 크기 검사
    if (file?.size > 50 * 1024 * 1024) { // 50MB
        diagnostics.errorType = 'FILE_TOO_LARGE';
        diagnostics.solution = '파일 크기를 50MB 이하로 줄여주세요.';
        diagnostics.recommendations.push('파일을 여러 개로 분할하여 업로드');
        diagnostics.recommendations.push('불필요한 데이터 제거');
    }
    
    // 파일 형식 검사
    else if (file && !isValidJSONFile(file)) {
        diagnostics.errorType = 'INVALID_FILE_TYPE';
        diagnostics.solution = 'JSON 파일(.json) 또는 텍스트 파일(.txt)만 업로드 가능합니다.';
        diagnostics.recommendations.push('파일 확장자를 .json으로 변경');
        diagnostics.recommendations.push('파일 내용이 JSON 형식인지 확인');
    }
    
    // JSON 파싱 오류
    else if (error?.message?.includes('JSON') || error?.message?.includes('파싱')) {
        diagnostics.errorType = 'JSON_PARSE_ERROR';
        diagnostics.solution = 'JSON 파일 형식이 올바르지 않습니다.';
        diagnostics.technicalDetails = error.message;
        diagnostics.recommendations.push('JSON 유효성 검사 도구 사용');
        diagnostics.recommendations.push('NaN, undefined 값 제거');
        diagnostics.recommendations.push('마지막 쉼표 제거');
    }
    
    // 배열 형태 오류
    else if (error?.message?.includes('배열') || error?.message?.includes('Array')) {
        diagnostics.errorType = 'ARRAY_FORMAT_ERROR';
        diagnostics.solution = 'JSON 파일이 배열 형태가 아닙니다. 데이터를 [ ] 배열로 감싸주세요.';
        diagnostics.technicalDetails = error.message;
        diagnostics.recommendations.push('파일 내용을 배열 형태로 변경: [{"필드": "값"}]');
        diagnostics.recommendations.push('단일 객체인 경우 배열로 감싸기');
    }
    
    // 메모리 오류
    else if (error?.message?.includes('memory') || error?.message?.includes('Maximum')) {
        diagnostics.errorType = 'MEMORY_ERROR';
        diagnostics.solution = '파일이 너무 커서 메모리 부족이 발생했습니다.';
        diagnostics.recommendations.push('브라우저 새로고침 후 재시도');
        diagnostics.recommendations.push('파일을 더 작은 단위로 분할');
        diagnostics.recommendations.push('다른 브라우저 사용');
    }
    
    // 네트워크 오류
    else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        diagnostics.errorType = 'NETWORK_ERROR';
        diagnostics.solution = '네트워크 연결 문제가 발생했습니다.';
        diagnostics.recommendations.push('인터넷 연결 상태 확인');
        diagnostics.recommendations.push('서버 상태 확인');
        diagnostics.recommendations.push('잠시 후 다시 시도');
    }
    
    // 인코딩 오류
    else if (error?.message?.includes('encoding') || error?.message?.includes('인코딩')) {
        diagnostics.errorType = 'ENCODING_ERROR';
        diagnostics.solution = '파일 인코딩 문제가 발생했습니다.';
        diagnostics.recommendations.push('파일을 UTF-8로 저장');
        diagnostics.recommendations.push('텍스트 에디터에서 다시 저장');
    }
    
    // 일반 오류
    else {
        diagnostics.errorType = 'UNKNOWN_ERROR';
        diagnostics.solution = '알 수 없는 오류가 발생했습니다.';
        diagnostics.technicalDetails = error?.message || '세부 정보 없음';
        diagnostics.recommendations.push('페이지 새로고침 후 재시도');
        diagnostics.recommendations.push('다른 파일로 테스트');
        diagnostics.recommendations.push('브라우저 개발자 도구 확인');
    }

    // 진단 결과 로그
    addUploadLog(`진단 완료: ${diagnostics.errorType}`, true);
    addUploadLog(`해결책: ${diagnostics.solution}`, true);
    
    if (diagnostics.recommendations.length > 0) {
        addUploadLog(`권장사항: ${diagnostics.recommendations.join(', ')}`, false);
    }

    return diagnostics;
}

// 유효한 JSON 파일 검사
function isValidJSONFile(file) {
    const validTypes = ['application/json', 'text/plain', 'text/json'];
    const validExtensions = ['.json', '.txt'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// 진단 결과 UI 표시
function showDiagnosticsModal(diagnostics) {
    const modal = document.createElement('div');
    modal.className = 'diagnostics-modal';
    modal.innerHTML = `
        <div class="diagnostics-content">
            <div class="diagnostics-header">
                <h3><i class="fas fa-exclamation-triangle"></i> 업로드 오류 진단</h3>
                <button class="close-diagnostics" onclick="closeDiagnosticsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="diagnostics-body">
                <div class="file-info-section">
                    <h4><i class="fas fa-file"></i> 파일 정보</h4>
                    <div class="file-details">
                        <p><strong>파일명:</strong> ${diagnostics.fileInfo.name}</p>
                        <p><strong>크기:</strong> ${Math.round(diagnostics.fileInfo.size / 1024).toLocaleString()}KB</p>
                        <p><strong>타입:</strong> ${diagnostics.fileInfo.type}</p>
                    </div>
                </div>
                
                <div class="error-info-section">
                    <h4><i class="fas fa-bug"></i> 오류 유형</h4>
                    <div class="error-type">${diagnostics.errorType}</div>
                    <div class="error-solution">${diagnostics.solution}</div>
                </div>
                
                ${diagnostics.recommendations.length > 0 ? `
                <div class="recommendations-section">
                    <h4><i class="fas fa-lightbulb"></i> 해결 방법</h4>
                    <ul class="recommendations-list">
                        ${diagnostics.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${diagnostics.technicalDetails ? `
                <div class="technical-details-section">
                    <h4><i class="fas fa-code"></i> 기술적 세부사항</h4>
                    <div class="technical-details">${diagnostics.technicalDetails}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="diagnostics-footer">
                <button class="btn btn-primary" onclick="closeDiagnosticsModal()">
                    확인
                </button>
                <button class="btn btn-secondary" onclick="retryUpload()">
                    다시 시도
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 진단 모달 닫기
function closeDiagnosticsModal() {
    const modal = document.querySelector('.diagnostics-modal');
    if (modal) {
        modal.remove();
    }
}

// 업로드 재시도
function retryUpload() {
    closeDiagnosticsModal();
    const fileInput = document.getElementById('unifiedFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// 샘플 JSON 다운로드 함수
function downloadSampleJSON() {
    console.log('샘플 JSON 다운로드 시작');
    addUploadLog('샘플 JSON 파일 생성 중');
    
    const sampleData = [
        {
            "급여일_급여유형": "2024.01.25 급여_정기급여",
            "급여영역": "(주)샘플회사",
            "사번": "E2024001",
            "성명": "홍길동",
            "입사일": 20240101,
            "그룹입사일": 20240101,
            "성별": "남",
            "조직": "인사팀",
            "직책": "팀원",
            "직급": "대리",
            "호봉": "3급",
            "기본급": 3000000,
            "직책급": 200000,
            "식대": 100000,
            "교통비": 150000,
            "실지급액": 2800000,
            "연도": 2024
        },
        {
            "급여일_급여유형": "2024.01.25 급여_정기급여",
            "급여영역": "(주)샘플회사",
            "사번": "E2024002",
            "성명": "김영희",
            "입사일": 20230315,
            "그룹입사일": 20230315,
            "성별": "여",
            "조직": "개발팀",
            "직책": "팀원",
            "직급": "과장",
            "호봉": "5급",
            "기본급": 3500000,
            "직책급": 300000,
            "식대": 100000,
            "교통비": 150000,
            "실지급액": 3200000,
            "연도": 2024
        },
        {
            "급여일_급여유형": "2024.01.25 급여_정기급여",
            "급여영역": "(주)샘플회사",
            "사번": "E2024003",
            "성명": "박민수",
            "입사일": 20220601,
            "그룹입사일": 20220601,
            "성별": "남",
            "조직": "마케팅팀",
            "직책": "팀장",
            "직급": "차장",
            "호봉": "7급",
            "기본급": 4000000,
            "직책급": 500000,
            "식대": 100000,
            "교통비": 150000,
            "실지급액": 3800000,
            "연도": 2024
        }
    ];
    
    try {
        const blob = new Blob([JSON.stringify(sampleData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'paypulse_sample_payroll.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addUploadLog('샘플 JSON 파일 다운로드 완료');
        
        // 성공 토스트 메시지
        if (globalPayrollUploader) {
            globalPayrollUploader.showToastMessage(
                '샘플 JSON 파일이 다운로드되었습니다. 이 파일을 참고하여 업로드할 파일을 준비하세요.', 
                'success'
            );
        } else {
            showUploadMessage('샘플 JSON 파일 다운로드 완료', 'success');
        }
        
    } catch (error) {
        console.error('샘플 JSON 다운로드 오류:', error);
        addUploadLog('샘플 JSON 다운로드 실패', true);
        
        if (globalPayrollUploader) {
            globalPayrollUploader.showToastMessage(
                '샘플 파일 다운로드 중 오류가 발생했습니다.', 
                'error'
            );
        } else {
            showUploadMessage('샘플 JSON 다운로드 실패', 'error');
        }
    }
}

// 로컬 스토리지 키
const STORAGE_KEY = 'paypulse_persistent_data';

// 전역 데이터 저장소 확장
let globalUploadedData = [];
let filteredData = [];
let uploadHistory = []; // 업로드 내역 저장
let currentFilters = {
    dateRange: { start: null, end: null },
    department: '',
    items: [],
    name: ''
};

// 페이지 전환 함수
function switchPage(pageName) {
    console.log('페이지 전환 시도:', pageName); // 디버깅용
    
    // 모든 메뉴 아이템 비활성화
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 선택된 메뉴 아이템 활성화
    const selectedMenuItem = document.querySelector(`[data-page="${pageName}"]`);
    if (selectedMenuItem) {
        selectedMenuItem.classList.add('active');
        console.log('메뉴 아이템 활성화됨:', pageName);
    } else {
        console.log('메뉴 아이템을 찾을 수 없음:', pageName);
    }
    
    // 페이지 콘텐츠 로드
    loadPageContent(pageName);
}

// 페이지 콘텐츠 로드
function loadPageContent(pageName) {
    console.log('페이지 콘텐츠 로드 시도:', pageName); // 디버깅용
    
    const pageContent = document.getElementById('page-content');
    const mainDashboard = document.getElementById('main-dashboard');
    
    if (!pageContent) {
        console.log('page-content 요소를 찾을 수 없음');
        return;
    }
    
    if (!mainDashboard) {
        console.log('main-dashboard 요소를 찾을 수 없음');
        return;
    }
    
    if (pageName === 'dashboard') {
        mainDashboard.style.display = 'grid';
        pageContent.innerHTML = '';
        console.log('대시보드로 전환됨');
    } else {
        mainDashboard.style.display = 'none';
        const content = getPageContent(pageName);
        pageContent.innerHTML = content;
        console.log('페이지 콘텐츠 로드됨:', pageName);
        
        // 페이지별 초기화
            setTimeout(() => {
            initializePage(pageName);
            }, 100);
    }
}

// 페이지 콘텐츠 반환
function getPageContent(pageName) {
    const pages = {
        'employee': `
            <div class="page-header">
                <h2><i class="fas fa-database"></i> 통합 데이터 업로드</h2>
                <p>Excel, CSV, JSON 파일을 업로드하여 데이터를 관리하세요</p>
            </div>
                    
                    <div class="step-indicator">
                        <div class="step-item" id="uploadStep">
                            <i class="fas fa-file-upload"></i>
                            <span>업로드</span>
                        </div>
                        <div class="step-item" id="dashboardStep">
                            <i class="fas fa-chart-bar"></i>
                            <span>분석</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 업로드 단계 -->
            <div class="payroll-step" id="uploadSection">
                <div class="step-content">
                    <div class="step-intro">
                        <h2>급여 데이터 파일 업로드</h2>
                        <p>JSON 형태의 급여 데이터를 업로드하면 자동으로 분석하여 시각적인 대시보드를 제공합니다.</p>
                    </div>

                    <!-- 통합 업로드 섹션 재사용 -->
                    <div class="unified-upload-section">
                        <div class="upload-drop-zone" id="payrollDropZone">
                    <i class="fas fa-cloud-upload-alt"></i>
                            <p>급여 파일을 여기로 드래그하거나 클릭하여 선택하세요</p>
                            <span class="supported-formats">지원 형식: JSON, CSV, Excel</span>
                        </div>
                        <div class="upload-buttons">
                            <button class="btn upload-btn" data-action="select-payroll-file">
                                <i class="fas fa-upload"></i> 📁 파일 선택
                            </button>
                            <button class="btn btn-secondary" onclick="loadSamplePayrollData()">
                                <i class="fas fa-flask"></i> 샘플 데이터
                            </button>
                            <button class="btn btn-outline sample-btn" onclick="downloadSampleJSON()">
                                <i class="fas fa-download"></i> 📄 샘플 JSON 다운로드
                            </button>
                        </div>
                        
                        <!-- 파일 입력 (숨김) -->
                        <input type="file" id="payrollFileInput" accept=".json,.csv,.xlsx,.xls" style="display: none;">
                    </div>

                    <!-- 업로드 진행률 (동적으로 생성됨) -->
                    
                    <!-- 오류 메시지 -->
                    <div class="upload-error" id="uploadError" style="display: none;">
                        <h3>업로드 오류</h3>
                        <p id="errorMessage"></p>
                    </div>
                </div>
            </div>

            <!-- 대시보드 단계 -->
            <div class="payroll-step" id="dashboardSection" style="display: none;">
                <div class="step-content">
                    <div class="step-intro">
                        <h2>급여 데이터 분석 대시보드</h2>
                        <p id="dataDescription">0개의 급여 데이터를 분석한 결과입니다.</p>
                    </div>

                    <!-- 대시보드 컨테이너 (기존 대시보드 재사용) -->
                    <div class="payroll-dashboard-container">
                        <!-- 필터 및 컨트롤 -->
                        <div class="dashboard-controls">
                            <div class="filter-section">
                                <div class="filter-header">
                                    <i class="fas fa-filter"></i>
                                    <span>시각적 분석 필터</span>
                                </div>
                                <select id="systemYearFilter" class="filter-select">
                                    <option value="">전체 연도</option>
                                </select>
                                <select id="systemCompanyFilter" class="filter-select">
                                    <option value="">전체 회사</option>
                                </select>
                            </div>
                            <button id="systemDownloadCSV" class="dashboard-btn">
                                <i class="fas fa-download"></i>
                                CSV 다운로드
                            </button>
                        </div>

                        <!-- 주요 통계 카드 -->
                        <div class="stats-grid">
                            <div class="stat-card stat-employees">
                                <div class="stat-content">
                                    <div class="stat-text">
                                        <p class="stat-label">총 직원수</p>
                                        <p class="stat-value" id="systemTotalEmployees">0</p>
                                    </div>
                                    <i class="fas fa-users stat-icon"></i>
                                </div>
                            </div>
                            <div class="stat-card stat-payroll">
                                <div class="stat-content">
                                    <div class="stat-text">
                                        <p class="stat-label">총 급여액</p>
                                        <p class="stat-value" id="systemTotalPayroll">0억</p>
                                    </div>
                                    <i class="fas fa-chart-line stat-icon"></i>
                                </div>
                            </div>
                            <div class="stat-card stat-average">
                                <div class="stat-content">
                                    <div class="stat-text">
                                        <p class="stat-label">평균 급여</p>
                                        <p class="stat-value" id="systemAvgPayroll">0만</p>
                                    </div>
                                    <i class="fas fa-calendar stat-icon"></i>
                                </div>
                            </div>
                            <div class="stat-card stat-companies">
                                <div class="stat-content">
                                    <div class="stat-text">
                                        <p class="stat-label">회사수</p>
                                        <p class="stat-value" id="systemTotalCompanies">0</p>
                                    </div>
                                    <i class="fas fa-building stat-icon"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 차트 영역 -->
                        <div class="charts-grid">
                            <div class="chart-container">
                                <h3 class="chart-title">📊 부서별 현황 (Top 10)</h3>
                                <div class="chart-wrapper">
                                    <canvas id="systemDepartmentChart"></canvas>
                                </div>
                            </div>
                            
                            <div class="chart-container">
                                <h3 class="chart-title">💰 급여 구간별 분포</h3>
                                <div class="chart-wrapper">
                                    <canvas id="systemSalaryChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- 상세 테이블 -->
                        <div class="detailed-table-container">
                            <div class="table-header">
                                <h3>📋 상세 데이터</h3>
                                <p id="systemTableDescription">0명의 급여 정보</p>
                            </div>
                            <div class="table-wrapper">
                                <table class="payroll-table" id="systemPayrollTable">
                                    <thead>
                                        <tr>
                                            <th>사번</th>
                                            <th>성명</th>
                                            <th>회사</th>
                                            <th>부서</th>
                                            <th>직급</th>
                                            <th>실지급액</th>
                                            <th>연도</th>
                                        </tr>
                                    </thead>
                                    <tbody id="systemPayrollTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'data-center': `
            <div class="page-header">
                <h2><i class="fas fa-chart-line"></i> 종합 인건비</h2>
                <p>모든 데이터 업로드를 한 곳에서 관리하세요</p>
            </div>
            
            <div class="data-upload-center">
                <!-- 급여/상여 대장 업로드 -->
                <div class="upload-section-card">
                    <div class="upload-card-header">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <h3>급여/상여 대장 업로드</h3>
                        <span class="upload-status-badge" id="salaryUploadStatus">대기중</span>
                    </div>
                    <p>급여명세서, 상여금 지급 내역 등을 업로드하여 AI 분석에 활용합니다.</p>
                    <div class="upload-actions">
                        <input type="file" id="salaryFileInput" accept=".xlsx,.csv,.json" style="display: none;">
                        <button class="btn" onclick="document.getElementById('salaryFileInput').click()">
                        <i class="fas fa-upload"></i> 파일 선택
                    </button>
                        <button class="btn btn-secondary" onclick="loadSampleSalaryData()">
                            <i class="fas fa-flask"></i> 샘플 데이터
                        </button>
                    </div>
                    <div class="upload-progress" id="salaryUploadProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="salaryProgressFill"></div>
                        </div>
                        <span class="progress-text" id="salaryProgressText">업로드 중...</span>
                    </div>
                </div>
                
                <!-- 전문분석 데이터 업로드 -->
                <div class="upload-section-card">
                    <div class="upload-card-header">
                        <i class="fas fa-chart-pie"></i>
                        <h3>전문분석 데이터 업로드</h3>
                        <span class="upload-status-badge" id="analysisUploadStatus">대기중</span>
                    </div>
                    <p>인건비, 도급사, 개인사업자, 대행업체 데이터를 업로드하여 전문분석을 수행합니다.</p>
                    <div class="upload-actions">
                        <input type="file" id="analysisFileInput" accept=".xlsx,.csv" style="display: none;">
                        <button class="btn" onclick="document.getElementById('analysisFileInput').click()">
                            <i class="fas fa-upload"></i> 파일 선택
                        </button>
                        <button class="btn btn-secondary" onclick="loadProfessionalTestTemplate()">
                            <i class="fas fa-flask"></i> 테스트 템플릿
                        </button>
                    </div>
                    <div class="upload-progress" id="analysisUploadProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="analysisProgressFill"></div>
                        </div>
                        <span class="progress-text" id="analysisProgressText">분석 중...</span>
                    </div>
                </div>

                <!-- 직원 정보 업로드 -->
                <div class="upload-section-card">
                    <div class="upload-card-header">
                        <i class="fas fa-users"></i>
                        <h3>직원 정보 업로드</h3>
                        <span class="upload-status-badge" id="employeeUploadStatus">대기중</span>
                    </div>
                    <p>직원 기본 정보, 부서, 직급, 입사일 등의 정보를 업로드합니다.</p>
                    <div class="upload-actions">
                        <input type="file" id="employeeFileInput" accept=".xlsx,.csv" style="display: none;">
                        <button class="btn" onclick="document.getElementById('employeeFileInput').click()">
                            <i class="fas fa-upload"></i> 파일 선택
                        </button>
                        <button class="btn btn-secondary" onclick="loadSampleEmployeeData()">
                            <i class="fas fa-flask"></i> 샘플 데이터
                        </button>
                    </div>
                    <div class="upload-progress" id="employeeUploadProgress" style="display: none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="employeeProgressFill"></div>
                        </div>
                        <span class="progress-text" id="employeeProgressText">업로드 중...</span>
                    </div>
                </div>

                <!-- 업로드된 데이터 요약 -->
                <div class="upload-summary" id="uploadSummary" style="display: none;">
                    <h3><i class="fas fa-clipboard-list"></i> 업로드된 데이터 요약</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">급여 데이터</span>
                            <span class="summary-value" id="salaryDataCount">0건</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">분석 데이터</span>
                            <span class="summary-value" id="analysisDataCount">0건</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">직원 정보</span>
                            <span class="summary-value" id="employeeDataCount">0건</span>
                        </div>
                    </div>
                    <div class="summary-actions">
                        <button class="btn btn-primary" onclick="switchPage('ai-chat')">
                                <i class="fas fa-robot"></i> AI 분석 시작
                            </button>
                        <button class="btn btn-secondary" onclick="switchPage('hc-roi')">
                            <i class="fas fa-chart-pie"></i> 전문가 분석&예측 보기
                            </button>
                        </div>
                    </div>
                    </div>
        `,
        'upload': `
            <div class="page-header">
                <h2><i class="fas fa-arrow-right"></i> 종합 인건비로 이동</h2>
                <p>업로드 기능이 종합 인건비 센터로 이동되었습니다</p>
            </div>
            
            <div class="redirect-section">
                <div class="redirect-box">
                    <i class="fas fa-chart-line"></i>
                    <h3>종합 인건비 센터</h3>
                    <p>모든 업로드 기능을 한 곳에서 관리하세요</p>
                    <button class="btn btn-primary" onclick="switchPage('data-center')">
                        <i class="fas fa-arrow-right"></i> 통합 업로드 센터로 이동
                    </button>
                </div>
            </div>
        `,
        'ai-chat': `
    <div class="page-header">
        <h2><i class="fas fa-robot"></i> AI 어시스턴트</h2>
        <p>HR 전문 컨설팅부터 데이터 분석까지, 똑똑한 AI 동료와 함께하세요</p>
    </div>
    
    <!-- 필터링 패널 (데이터 있을 때만 표시) -->
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
        <div class="filter-result">
            <span class="filter-count" id="filterCount">전체 데이터 표시 중</span>
        </div>
    </div>
    
    <!-- 급여 대시보드 영역 -->
    <div class="payroll-dashboard" id="payrollDashboard" style="display: none;">
        <!-- 필터 및 컨트롤 -->
        <div class="dashboard-controls">
            <div class="filter-section">
                <div class="filter-header">
                    <i class="fas fa-filter"></i>
                    <span>시각적 분석 필터</span>
                </div>
                <select id="yearFilter" class="filter-select">
                    <option value="">전체 연도</option>
                </select>
                <select id="companyFilter" class="filter-select">
                    <option value="">전체 회사</option>
                </select>
            </div>
            <button id="downloadCSV" class="dashboard-btn">
                <i class="fas fa-download"></i>
                CSV 다운로드
            </button>
        </div>

        <!-- 주요 통계 카드 -->
        <div class="stats-grid">
            <div class="stat-card stat-employees">
                <div class="stat-content">
                    <div class="stat-text">
                        <p class="stat-label">총 직원수</p>
                        <p class="stat-value" id="totalEmployees">0</p>
                    </div>
                    <i class="fas fa-users stat-icon"></i>
                </div>
            </div>
            <div class="stat-card stat-payroll">
                <div class="stat-content">
                    <div class="stat-text">
                        <p class="stat-label">총 급여액</p>
                        <p class="stat-value" id="totalPayroll">0억</p>
                    </div>
                    <i class="fas fa-chart-line stat-icon"></i>
                </div>
            </div>
            <div class="stat-card stat-average">
                <div class="stat-content">
                    <div class="stat-text">
                        <p class="stat-label">평균 급여</p>
                        <p class="stat-value" id="avgPayroll">0만</p>
                    </div>
                    <i class="fas fa-calendar stat-icon"></i>
                </div>
            </div>
            <div class="stat-card stat-companies">
                <div class="stat-content">
                    <div class="stat-text">
                        <p class="stat-label">회사수</p>
                        <p class="stat-value" id="totalCompanies">0</p>
                    </div>
                    <i class="fas fa-building stat-icon"></i>
                </div>
            </div>
        </div>

        <!-- 차트 영역 -->
        <div class="charts-grid">
            <!-- 부서별 현황 차트 -->
            <div class="chart-container">
                <h3 class="chart-title">📊 부서별 현황 (Top 10)</h3>
                <div class="chart-wrapper">
                    <canvas id="departmentChart"></canvas>
                </div>
            </div>
            
            <!-- 급여 구간별 분포 차트 -->
            <div class="chart-container">
                <h3 class="chart-title">💰 급여 구간별 분포</h3>
                <div class="chart-wrapper">
                    <canvas id="salaryChart"></canvas>
                </div>
            </div>
        </div>

        <!-- 상세 테이블 -->
        <div class="detailed-table-container">
            <div class="table-header">
                <h3>📋 상세 데이터</h3>
                <p id="tableDescription">0명의 급여 정보</p>
            </div>
            <div class="table-wrapper">
                <table class="payroll-table" id="payrollTable">
                    <thead>
                        <tr>
                            <th>사번</th>
                            <th>성명</th>
                            <th>회사</th>
                            <th>부서</th>
                            <th>직급</th>
                            <th>실지급액</th>
                            <th>연도</th>
                        </tr>
                    </thead>
                    <tbody id="payrollTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- 데이터 테이블 (필터링 결과) -->
    <div class="data-table-container" id="dataTableContainer" style="display: none;">
        <div class="table-header">
            <h3><i class="fas fa-table"></i> 필터링된 데이터</h3>
            <span class="record-count" id="recordCount">0개 레코드</span>
        </div>
        <div class="table-wrapper">
            <table id="dataTable">
                <thead id="tableHead"></thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
    </div>

    <!-- AI 채팅 영역 -->
    <div class="ai-chat-container">
        <!-- 채팅 헤더 -->
        <div class="chat-header">
            <div class="chat-header-avatar">🤖</div>
            <div class="chat-header-info">
                <h3>PayPulse AI</h3>
                <p>당신의 HR 전문 파트너</p>
            </div>
            <div class="chat-status" id="chatStatus">온라인</div>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content" id="initialMessage">
                    안녕하세요! 저는 PayPulse AI입니다! 😊<br><br>
                    <strong>🎯 제가 도와드릴 수 있는 일들:</strong><br>
                    • 📊 업로드된 데이터 분석 & 인사이트<br>
                    • 💼 HR 트렌드 및 업계 동향<br>
                    • 📈 급여 벤치마킹 & 시장 분석<br>
                    • 🔍 인사제도 개선 컨설팅<br>
                    • ⚖️ 노동법 및 규정 문의<br><br>
                    편하게 말걸어 주세요! 동료처럼 대화해요 🤗
                </div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        
        <div class="chat-input-area">
            <textarea id="chatInput" placeholder="궁금한 것을 편하게 물어보세요! (Shift+Enter로 줄바꿈)" onkeypress="handleEnter(event)" rows="1"></textarea>
            <button id="sendButton" onclick="sendMessage()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
        
        <!-- 추천 질문 -->
        <div class="suggested-questions" id="suggestedQuestions">
            <h4>💡 이런 질문들은 어때요?</h4>
            <div class="question-buttons">
                <button class="question-btn" onclick="sendSuggestedMessage('우리 회사 급여 수준이 시장 대비 어떤가요?')">
                    💰 급여 벤치마킹
                </button>
                <button class="question-btn" onclick="sendSuggestedMessage('최근 HR 트렌드나 동향이 궁금해요')">
                    📈 HR 트렌드
                </button>
                <button class="question-btn" onclick="sendSuggestedMessage('직원 만족도 향상을 위한 방법은?')">
                    😊 직원 만족도
                </button>
                <button class="question-btn" onclick="sendSuggestedMessage('데이터 기반으로 우리 조직을 분석해줘')">
                    📊 조직 분석
                </button>
                <button class="question-btn" onclick="sendSuggestedMessage('인사 평가 제도 개선 아이디어가 있을까?')">
                    🎯 평가 제도
                </button>
                <button class="question-btn" onclick="sendSuggestedMessage('근무 형태별 급여 차이는 어떻게 될까?')">
                    🏢 근무 형태
                </button>
            </div>
        </div>
    </div>
`,
        'data-history': `
    <div class="page-header">
        <h2><i class="fas fa-history"></i> 업로드 내역 관리</h2>
        <p>업로드된 파일들의 내역을 확인하고 AI 분석을 받아보세요</p>
    </div>
    
    <!-- 업로드 내역 목록 -->
    <div class="upload-history-container">
        <div class="history-header">
            <h3><i class="fas fa-list"></i> 업로드 내역</h3>
            <div class="history-actions">
                <button class="btn btn-outline" onclick="clearUploadHistory()">
                    <i class="fas fa-trash"></i> 전체 내역 삭제
                </button>
                <button class="btn" onclick="refreshHistoryView()">
                    <i class="fas fa-sync"></i> 새로고침
                </button>
            </div>
        </div>
        
        <div class="history-list" id="historyList">
            <div class="no-history" id="noHistoryMessage">
                <i class="fas fa-inbox"></i>
                <h3>업로드 내역이 없습니다</h3>
                <p>데이터 관리 → 통합 데이터 업로드에서 파일을 업로드해 보세요.</p>
                <button class="btn btn-outline" onclick="switchPage('data-center')">
                    <i class="fas fa-database"></i> 통합 업로드 센터로 이동
                </button>
            </div>
        </div>
    </div>
    
    <!-- 선택된 데이터 상세 정보 -->
    <div class="selected-data-container" id="selectedDataContainer" style="display: none;">
        <div class="data-detail-header">
            <h3><i class="fas fa-database"></i> 선택된 데이터 상세</h3>
            <div class="detail-actions">
                <button class="btn" onclick="generateAIAnalysis()">
                    <i class="fas fa-brain"></i> AI 분석 생성
                </button>
                <button class="btn btn-secondary" onclick="generateSummaryReport()">
                    <i class="fas fa-file-alt"></i> 요약 보고서
                </button>
                <button class="btn btn-outline" onclick="exportSelectedData()">
                    <i class="fas fa-download"></i> 데이터 내보내기
                </button>
            </div>
        </div>
        
        <!-- 데이터 요약 정보 -->
        <div class="data-summary-cards">
            <div class="summary-card">
                <div class="card-icon"><i class="fas fa-users"></i></div>
                <div class="card-content">
                    <h4>총 직원 수</h4>
                    <span class="card-value" id="totalEmployees">0명</span>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon"><i class="fas fa-building"></i></div>
                <div class="card-content">
                    <h4>부서 수</h4>
                    <span class="card-value" id="totalDepartments">0개</span>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon"><i class="fas fa-won-sign"></i></div>
                <div class="card-content">
                    <h4>총 인건비</h4>
                    <span class="card-value" id="totalSalary">0원</span>
                </div>
            </div>
            <div class="summary-card">
                <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                <div class="card-content">
                    <h4>평균 급여</h4>
                    <span class="card-value" id="avgSalary">0원</span>
                </div>
            </div>
        </div>
        
        <!-- 데이터 테이블 미리보기 -->
        <div class="data-preview">
            <h4><i class="fas fa-table"></i> 데이터 미리보기 (최대 20개)</h4>
            <div class="preview-table-wrapper">
                <table id="selectedDataTable">
                    <thead id="selectedTableHead"></thead>
                    <tbody id="selectedTableBody"></tbody>
                </table>
            </div>
        </div>
        
        <!-- AI 분석 결과 -->
        <div class="ai-analysis-container" id="aiAnalysisContainer" style="display: none;">
            <h4><i class="fas fa-robot"></i> AI 분석 결과</h4>
            <div class="analysis-content" id="analysisContent">
                <div class="loading-analysis">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>AI가 데이터를 분석 중입니다...</p>
                </div>
            </div>
        </div>
        
        <!-- 요약 보고서 -->
        <div class="summary-report-container" id="summaryReportContainer" style="display: none;">
            <h4><i class="fas fa-file-alt"></i> 요약 보고서</h4>
            <div class="report-content" id="reportContent">
                <div class="loading-report">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>보고서를 생성 중입니다...</p>
                </div>
            </div>
        </div>
    </div>
`,
        'hc-roi': `
            <div class="expert-analysis-container">
                <div class="expert-header">
                    <h2><i class="fas fa-chart-line"></i> 전문가 분석&예측</h2>
                    <p>AI 기반 인력 비용 최적화 및 ROI 분석</p>
            </div>
            
                <div class="expert-tab-navigation">
                    <button class="expert-tab-btn active" onclick="switchExpertTab('dashboard')">
                        <i class="fas fa-tachometer-alt"></i> 임원 대시보드
                        </button>
                    <button class="expert-tab-btn" onclick="switchExpertTab('ai-analysis')">
                        <i class="fas fa-brain"></i> AI 분석
                        </button>
                    <button class="expert-tab-btn" onclick="switchExpertTab('hc-roi')">
                        <i class="fas fa-calculator"></i> HC ROI
                    </button>
                    </div>
                
                <!-- 임원 대시보드 탭 -->
                <div id="expert-dashboard-tab" class="expert-tab-content active">
                    <div class="expert-metrics-grid">
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="metric-content">
                                <h3>총 인력</h3>
                                <p class="metric-value">247명</p>
                                <p class="metric-change positive">+12% vs 전년</p>
                </div>
            </div>
            
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="metric-content">
                                <h3>월 인건비</h3>
                                <p class="metric-value">1.2억원</p>
                                <p class="metric-change negative">-8% vs 전년</p>
                            </div>
                        </div>
                        
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="metric-content">
                                <h3>생산성 지수</h3>
                                <p class="metric-value">87.3</p>
                                <p class="metric-change positive">+5.2% vs 전년</p>
                            </div>
                        </div>
                        
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <div class="metric-content">
                                <h3>ROI</h3>
                                <p class="metric-value">142%</p>
                                <p class="metric-change positive">+18% vs 전년</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="expert-charts-container">
                        <div class="expert-chart-section">
                            <h3><i class="fas fa-chart-bar"></i> 부서별 인건비 분포</h3>
                            <div class="chart-placeholder">
                                <div class="chart-bar" style="height: 80%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                    <span>개발팀</span>
                                </div>
                                <div class="chart-bar" style="height: 65%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                    <span>마케팅팀</span>
                                </div>
                                <div class="chart-bar" style="height: 45%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                                    <span>영업팀</span>
                                </div>
                                <div class="chart-bar" style="height: 35%; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                                    <span>관리팀</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="expert-chart-section">
                            <h3><i class="fas fa-chart-pie"></i> 고용 형태별 비율</h3>
                            <div class="expert-pie-chart">
                                <div class="pie-segment" style="--percentage: 60; --color: #667eea;">
                                    <span>정규직 60%</span>
                                </div>
                                <div class="pie-segment" style="--percentage: 25; --color: #f093fb;">
                                    <span>계약직 25%</span>
                                </div>
                                <div class="pie-segment" style="--percentage: 15; --color: #4facfe;">
                                    <span>외주 15%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- AI 분석 탭 -->
                <div id="expert-ai-analysis-tab" class="expert-tab-content">
                    <div class="expert-ai-insights">
                        <h3><i class="fas fa-lightbulb"></i> AI 인사이트</h3>
                        <div class="expert-insight-cards">
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-arrow-up"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>생산성 향상 기회</h4>
                                    <p>개발팀의 AI 도구 도입으로 23% 생산성 향상 예상</p>
                                </div>
                            </div>
                            
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>비용 최적화</h4>
                                    <p>마케팅팀 외주 비용을 내부 인력으로 전환 시 15% 절약</p>
                                </div>
                            </div>
                            
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>인력 재배치</h4>
                                    <p>영업팀 인력 일부를 고객지원팀으로 이동하여 효율성 증대</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="expert-productivity-analysis">
                        <h3><i class="fas fa-tachometer-alt"></i> 생산성 분석</h3>
                        <div class="productivity-metrics">
                            <div class="productivity-item">
                                <span class="metric-label">개발팀 생산성</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 78%;"></div>
                                </div>
                                <span class="metric-value">78%</span>
                            </div>
                            <div class="productivity-item">
                                <span class="metric-label">마케팅팀 ROI</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 92%;"></div>
                                </div>
                                <span class="metric-value">92%</span>
                            </div>
                            <div class="productivity-item">
                                <span class="metric-label">영업팀 성과</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%;"></div>
                                </div>
                                <span class="metric-value">65%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- HC ROI 탭 -->
                <div id="expert-hc-roi-tab" class="expert-tab-content">
                    <div class="expert-hcroi-header">
                        <h3><i class="fas fa-calculator"></i> HC ROI 분석</h3>
                        <p>인력 투자 대비 수익률을 분석하여 최적의 인력 구성 방안을 제시합니다.</p>
                        <button class="expert-analyze-btn" onclick="runExpertAnalysis()">
                            <i class="fas fa-play"></i> AI 분석 실행
                        </button>
                    </div>
                    
                    <div id="expert-loading-animation" class="expert-loading-animation" style="display: none;">
                        <div class="expert-spinner"></div>
                        <p>AI가 데이터를 분석하고 있습니다...</p>
                    </div>
                    
                    <div id="expert-hcroi-results" class="expert-hcroi-results" style="display: none;">
                        <div class="expert-roi-highlight">
                            <div class="expert-roi-main">
                                <h4>예상 ROI</h4>
                                <div class="expert-roi-value">142%</div>
                                <div class="expert-risk-level">낮은 위험도</div>
                            </div>
                        </div>
                        
                        <div class="expert-roi-breakdown">
                            <h4>부서별 ROI 분석</h4>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">개발팀</span>
                                <span class="roi-value positive">+167%</span>
                                <span class="roi-reason">AI 도구 도입 효과</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">마케팅팀</span>
                                <span class="roi-value positive">+134%</span>
                                <span class="roi-reason">디지털 전환 성과</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">영업팀</span>
                                <span class="roi-value positive">+98%</span>
                                <span class="roi-reason">고객 접점 최적화</span>
                            </div>
                        </div>
                        
                        <div class="expert-recommendations">
                            <h4>AI 추천사항</h4>
                            <ul>
                                <li>개발팀에 AI 코딩 도구 도입 (예상 ROI: +23%)</li>
                                <li>마케팅팀 외주 비용을 내부 인력으로 전환 (예상 절약: 15%)</li>
                                <li>영업팀 고객지원 인력 증원 (예상 ROI: +18%)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'data-center': `
                        <div class="expert-insight-cards">
                            <div class="expert-insight-card critical">
                                <h4>⚠️ 중요 발견사항</h4>
                                <p>개발팀 생산성이 95%로 최고 수준이나, 인건비 대비 아웃풋 효율성 개선 여지 존재</p>
                            </div>
                            <div class="expert-insight-card opportunity">
                                <h4>💡 기회 요소</h4>
                                <p>마케팅팀 ROI 개선 시 전체 HC ROI 15% 이상 향상 가능</p>
                            </div>
                            <div class="expert-insight-card prediction">
                                <h4>🔮 예측 모델</h4>
                                <p>현재 추세 유지 시 Q3 HC ROI 190% 달성 예상</p>
                            </div>
                        </div>
                    </div>

                    <div class="expert-productivity-analysis">
                        <h3>부서별 생산성 분석</h3>
                        <div class="expert-pie-chart">
                            <div class="pie-segment" style="--percentage: 25; --color: #0088FE;">개발팀 95%</div>
                            <div class="pie-segment" style="--percentage: 20; --color: #00C49F;">마케팅팀 88%</div>
                            <div class="pie-segment" style="--percentage: 22; --color: #FFBB28;">영업팀 92%</div>
                            <div class="pie-segment" style="--percentage: 18; --color: #FF8042;">인사팀 85%</div>
                            <div class="pie-segment" style="--percentage: 15; --color: #8884D8;">재무팀 90%</div>
                        </div>
                    </div>
                </div>

                <div id="expert-hcroi" class="expert-tab-content">
                    <div class="expert-hcroi-header">
                        <h2>💎 HC ROI 전문가 분석</h2>
                        <button class="expert-analyze-btn" onclick="runExpertAnalysis()" id="expertAnalyzeBtn">
                            🚀 최신 HC ROI 분석 실행
                        </button>
                    </div>

                    <div id="expert-loading" class="expert-loading-animation" style="display: none;">
                        <div class="expert-spinner"></div>
                        <p>AI가 최신 데이터를 분석하고 있습니다...</p>
                    </div>

                    <div id="expert-results" class="expert-hcroi-results" style="display: none;">
                        <div class="expert-roi-highlight">
                            <div class="expert-roi-main">
                                <h3>최종 HC ROI</h3>
                                <div class="expert-roi-value" id="expertRoiValue">0%</div>
                                <div class="expert-risk-level" id="expertRiskLevel">리스크: LOW</div>
                            </div>
                        </div>

                        <div class="expert-roi-breakdown">
                            <div class="expert-breakdown-item">
                                <span>총 인건비</span>
                                <span id="expertTotalCost">₩0억</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span>총 인원수</span>
                                <span id="expertTotalHeadcount">0명</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span>평균 생산성</span>
                                <span id="expertAvgProductivity">0%</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span>예측 매출</span>
                                <span id="expertPredictedRevenue">₩0억</span>
                            </div>
                        </div>

                        <div class="expert-recommendations">
                            <h4>🎯 전문가 추천사항</h4>
                            <ul id="expertRecommendations">
                                <li>개발팀 생산성 향상을 위한 AI 도구 도입 검토</li>
                                <li>마케팅팀 ROI 최적화를 위한 디지털 전환 가속화</li>
                                <li>인력 재배치를 통한 부서별 효율성 극대화</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'hc-roi': `
            <div class="expert-analysis-container">
                <div class="expert-header">
                    <h2><i class="fas fa-chart-line"></i> 전문가 분석&예측</h2>
                    <p>AI 기반 인력 비용 최적화 및 ROI 분석</p>
                </div>
                
                <div class="expert-tab-navigation">
                    <button class="expert-tab-btn active" onclick="switchExpertTab('dashboard')">
                        <i class="fas fa-tachometer-alt"></i> 임원 대시보드
                    </button>
                    <button class="expert-tab-btn" onclick="switchExpertTab('ai-analysis')">
                        <i class="fas fa-brain"></i> AI 분석
                    </button>
                    <button class="expert-tab-btn" onclick="switchExpertTab('hc-roi')">
                        <i class="fas fa-calculator"></i> HC ROI
                    </button>
                </div>
                
                <!-- 임원 대시보드 탭 -->
                <div id="expert-dashboard-tab" class="expert-tab-content active">
                    <div class="expert-metrics-grid">
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="metric-content">
                                <h3>총 인력</h3>
                                <p class="metric-value">247명</p>
                                <p class="metric-change positive">+12% vs 전년</p>
                            </div>
                        </div>
                        
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="metric-content">
                                <h3>월 인건비</h3>
                                <p class="metric-value">1.2억원</p>
                                <p class="metric-change negative">-8% vs 전년</p>
                            </div>
                        </div>
                        
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="metric-content">
                                <h3>생산성 지수</h3>
                                <p class="metric-value">87.3</p>
                                <p class="metric-change positive">+5.2% vs 전년</p>
                            </div>
                        </div>
                        
                        <div class="expert-metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <div class="metric-content">
                                <h3>ROI</h3>
                                <p class="metric-value">142%</p>
                                <p class="metric-change positive">+18% vs 전년</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="expert-charts-container">
                        <div class="expert-chart-section">
                            <h3><i class="fas fa-chart-bar"></i> 부서별 인건비 분포</h3>
                            <div class="chart-placeholder">
                                <div class="chart-bar" style="height: 80%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                    <span>개발팀</span>
                                </div>
                                <div class="chart-bar" style="height: 65%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                                    <span>마케팅팀</span>
                                </div>
                                <div class="chart-bar" style="height: 45%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                                    <span>영업팀</span>
                                </div>
                                <div class="chart-bar" style="height: 35%; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                                    <span>관리팀</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="expert-chart-section">
                            <h3><i class="fas fa-chart-pie"></i> 고용 형태별 비율</h3>
                            <div class="expert-pie-chart">
                                <div class="pie-segment" style="--percentage: 60; --color: #667eea;">
                                    <span>정규직 60%</span>
                                </div>
                                <div class="pie-segment" style="--percentage: 25; --color: #f093fb;">
                                    <span>계약직 25%</span>
                                </div>
                                <div class="pie-segment" style="--percentage: 15; --color: #4facfe;">
                                    <span>외주 15%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- AI 분석 탭 -->
                <div id="expert-ai-analysis-tab" class="expert-tab-content">
                    <div class="expert-ai-insights">
                        <h3><i class="fas fa-lightbulb"></i> AI 인사이트</h3>
                        <div class="expert-insight-cards">
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-arrow-up"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>생산성 향상 기회</h4>
                                    <p>개발팀의 AI 도구 도입으로 23% 생산성 향상 예상</p>
                                </div>
                            </div>
                            
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>비용 최적화</h4>
                                    <p>마케팅팀 외주 비용을 내부 인력으로 전환 시 15% 절약</p>
                                </div>
                            </div>
                            
                            <div class="expert-insight-card">
                                <div class="insight-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="insight-content">
                                    <h4>인력 재배치</h4>
                                    <p>영업팀 인력 일부를 고객지원팀으로 이동하여 효율성 증대</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="expert-productivity-analysis">
                        <h3><i class="fas fa-tachometer-alt"></i> 생산성 분석</h3>
                        <div class="productivity-metrics">
                            <div class="productivity-item">
                                <span class="metric-label">개발팀 생산성</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 78%;"></div>
                                </div>
                                <span class="metric-value">78%</span>
                            </div>
                            <div class="productivity-item">
                                <span class="metric-label">마케팅팀 ROI</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 92%;"></div>
                                </div>
                                <span class="metric-value">92%</span>
                            </div>
                            <div class="productivity-item">
                                <span class="metric-label">영업팀 성과</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 65%;"></div>
                                </div>
                                <span class="metric-value">65%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- HC ROI 탭 -->
                <div id="expert-hc-roi-tab" class="expert-tab-content">
                    <div class="expert-hcroi-header">
                        <h3><i class="fas fa-calculator"></i> HC ROI 분석</h3>
                        <p>인력 투자 대비 수익률을 분석하여 최적의 인력 구성 방안을 제시합니다.</p>
                        <button class="expert-analyze-btn" onclick="runExpertAnalysis()">
                            <i class="fas fa-play"></i> AI 분석 실행
                        </button>
                    </div>
                    
                    <div id="expert-loading-animation" class="expert-loading-animation" style="display: none;">
                        <div class="expert-spinner"></div>
                        <p>AI가 데이터를 분석하고 있습니다...</p>
                    </div>
                    
                    <div id="expert-hcroi-results" class="expert-hcroi-results" style="display: none;">
                        <div class="expert-roi-highlight">
                            <div class="expert-roi-main">
                                <h4>예상 ROI</h4>
                                <div class="expert-roi-value">142%</div>
                                <div class="expert-risk-level">낮은 위험도</div>
                            </div>
                        </div>
                        
                        <div class="expert-roi-breakdown">
                            <h4>부서별 ROI 분석</h4>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">개발팀</span>
                                <span class="roi-value positive">+167%</span>
                                <span class="roi-reason">AI 도구 도입 효과</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">마케팅팀</span>
                                <span class="roi-value positive">+134%</span>
                                <span class="roi-reason">디지털 전환 성과</span>
                            </div>
                            <div class="expert-breakdown-item">
                                <span class="dept-name">영업팀</span>
                                <span class="roi-value positive">+98%</span>
                                <span class="roi-reason">고객 접점 최적화</span>
                            </div>
                        </div>
                        
                        <div class="expert-recommendations">
                            <h4>AI 추천사항</h4>
                            <ul>
                                <li>개발팀에 AI 코딩 도구 도입 (예상 ROI: +23%)</li>
                                <li>마케팅팀 외주 비용을 내부 인력으로 전환 (예상 절약: 15%)</li>
                                <li>영업팀 고객지원 인력 증원 (예상 ROI: +18%)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'data-center': `
                    <div class="analysis-card blue modern-card" data-card="cost-efficiency">
                        <div class="card-header">
                            <i class="fas fa-trending-up"></i>
                            <h3>비용 효율성</h3>
                        </div>
                        <div class="card-content">
                            <p class="card-main" id="costEfficiencyMain">최고: 개인사업자</p>
                            <p class="card-sub" id="costEfficiencySub">평균 월비용: 6,500,000원</p>
                        </div>
                    </div>
                    
                    <div class="analysis-card yellow modern-card" data-card="risk-assessment">
                        <div class="card-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>리스크 평가</h3>
                        </div>
                        <div class="card-content">
                            <p class="card-main" id="riskAssessmentMain">최저위험: 정규직</p>
                            <p class="card-sub" id="riskAssessmentSub">고위험: 개인사업자</p>
                        </div>
                    </div>
                    
                    <div class="analysis-card green modern-card" data-card="quality-metrics">
                        <div class="card-header">
                            <i class="fas fa-chart-bar"></i>
                            <h3>품질 지표</h3>
                        </div>
                        <div class="card-content">
                            <p class="card-main" id="qualityMetricsMain">X대행업체 (90점)</p>
                            <p class="card-sub" id="qualityMetricsSub">계약직 교육 프로그램 필요</p>
                        </div>
                    </div>
                    
                    <div class="analysis-card purple modern-card" data-card="uploaded-file">
                        <div class="card-header">
                            <i class="fas fa-chart-pie"></i>
                            <h3>업로드된 파일</h3>
                        </div>
                        <div class="card-content">
                            <p class="card-main" id="uploadedFileName">test_template.xlsx</p>
                        </div>
                    </div>
                </div>
                
                <!-- 상세 분석 테이블 -->
                <div class="analysis-table-container modern-table">
                    <div class="table-header">
                        <h3><i class="fas fa-table"></i> 상세 비교 분석</h3>
                    </div>
                    <div class="table-wrapper">
                        <table class="analysis-table modern-table">
                            <thead>
                                <tr>
                                    <th>구분</th>
                                    <th>월 비용</th>
                                    <th>효율성</th>
                                    <th>리스크</th>
                                    <th>추천도</th>
                                </tr>
                            </thead>
                            <tbody id="professionalAnalysisTable">
                                <tr>
                                    <td>정규직</td>
                                    <td>5,700,000원</td>
                                    <td><span class="badge yellow modern-badge">중간</span></td>
                                    <td><span class="badge green modern-badge">낮음</span></td>
                                    <td>⭐⭐⭐⭐</td>
                                </tr>
                                <tr>
                                    <td>개인사업자</td>
                                    <td>8,800,000원</td>
                                    <td><span class="badge green">높음</span></td>
                                    <td><span class="badge red">높음</span></td>
                                    <td>⭐⭐⭐</td>
                                </tr>
                                <tr>
                                    <td>도급사</td>
                                    <td>8,000,000원</td>
                                    <td><span class="badge yellow">중간</span></td>
                                    <td><span class="badge yellow">중간</span></td>
                                    <td>⭐⭐⭐</td>
                                </tr>
                                <tr>
                                    <td>대행업체</td>
                                    <td>15,000,000원</td>
                                    <td><span class="badge green">높음</span></td>
                                    <td><span class="badge green">낮음</span></td>
                                    <td>⭐⭐⭐⭐</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- 추천사항 -->
                <div class="recommendations-container">
                    <h3><i class="fas fa-lightbulb"></i> 🎯 최적화 제안</h3>
                    <ul id="professionalRecommendations" class="recommendations-list">
                        <li>도급사 계약조건 재검토</li>
                        <li>개인사업자 세무 리스크 관리</li>
                        <li>계약직 교육 프로그램 도입</li>
                        <li>대행업체 성과 관리 체계 구축</li>
                    </ul>
                </div>
            </div>
        `,
        'upload-history': `
            <div class="page-header">
                <h2><i class="fas fa-history"></i> 업로드 화면</h2>
                <p>업로드한 파일 내역을 확인하고 관리하세요</p>
            </div>
            
            <div class="upload-history-container">
                <!-- 업로드 통계 -->
                <div class="upload-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-file"></i>
                        </div>
                        <div class="stat-content">
                            <h3>총 업로드 파일</h3>
                            <p class="stat-number" id="totalUploadedFiles">0</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>성공</h3>
                            <p class="stat-number" id="successfulUploads">0</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>실패</h3>
                            <p class="stat-number" id="failedUploads">0</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="stat-content">
                            <h3>총 레코드</h3>
                            <p class="stat-number" id="totalRecordsUploaded">0</p>
                        </div>
                    </div>
                </div>

                <!-- 파일 목록 -->
                <div class="upload-files-section">
                    <div class="section-header">
                        <h3><i class="fas fa-list"></i> 업로드 파일 목록</h3>
                        <div class="section-controls">
                            <button class="btn btn-secondary" onclick="refreshUploadHistory()">
                                <i class="fas fa-sync"></i> 새로고침
                            </button>
                            <button class="btn btn-outline" onclick="clearUploadHistory()">
                                <i class="fas fa-trash"></i> 내역 삭제
                            </button>
                        </div>
                    </div>
                    
                    <div class="upload-files-table" id="uploadFilesTable">
                        <div class="table-header">
                            <div class="table-col">파일명</div>
                            <div class="table-col">타입</div>
                            <div class="table-col">크기</div>
                            <div class="table-col">레코드 수</div>
                            <div class="table-col">업로드 일시</div>
                            <div class="table-col">상태</div>
                            <div class="table-col">액션</div>
                        </div>
                        <div class="table-body" id="uploadFilesTableBody">
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>업로드된 파일이 없습니다</p>
                                <button class="btn" onclick="switchPage('data-center')">
                                    <i class="fas fa-upload"></i> 파일 업로드하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 파일 상세 정보 모달 -->
                <div class="file-detail-modal" id="fileDetailModal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3><i class="fas fa-file-alt"></i> 파일 상세 정보</h3>
                            <button class="modal-close" onclick="closeFileDetailModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="fileDetailContent">
                            <!-- 파일 상세 정보가 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>
            </div>
        `,
        'direct-labor': `
            <div class="page-header">
                <h2><i class="fas fa-hard-hat"></i> 직접 인건비</h2>
                <p>제품 생산에 직접적으로 기여하는 인력의 비용을 관리합니다</p>
            </div>
            
            <div class="labor-cost-container">
                <div class="cost-overview">
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-industry"></i>
                        </div>
                        <div class="cost-content">
                            <h3>생산직 인건비</h3>
                            <p class="cost-amount">₩ 2,450,000,000</p>
                            <p class="cost-period">2024년 1월</p>
                        </div>
                    </div>
                    
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-tools"></i>
                        </div>
                        <div class="cost-content">
                            <h3>기술직 인건비</h3>
                            <p class="cost-amount">₩ 1,850,000,000</p>
                            <p class="cost-period">2024년 1월</p>
                        </div>
                    </div>
                    
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="cost-content">
                            <h3>직접 인건비 비율</h3>
                            <p class="cost-amount">68.5%</p>
                            <p class="cost-period">총 인건비 대비</p>
                        </div>
                    </div>
                </div>
                
                <div class="cost-analysis">
                    <h3><i class="fas fa-analytics"></i> 직접 인건비 분석</h3>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <h4>인원 현황</h4>
                            <ul>
                                <li>생산직: 156명</li>
                                <li>기술직: 89명</li>
                                <li>총 직접 인력: 245명</li>
                            </ul>
                        </div>
                        <div class="analysis-item">
                            <h4>평균 급여</h4>
                            <ul>
                                <li>생산직: ₩3,200,000</li>
                                <li>기술직: ₩4,150,000</li>
                                <li>직접 인력 평균: ₩3,550,000</li>
                            </ul>
                        </div>
                        <div class="analysis-item">
                            <h4>추세 분석</h4>
                            <ul>
                                <li>전월 대비: +2.3%</li>
                                <li>전년 동월 대비: +8.7%</li>
                                <li>예상 증가율: +3.2%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'indirect-labor': `
            <div class="page-header">
                <h2><i class="fas fa-briefcase"></i> 간접 인건비</h2>
                <p>제품 생산을 지원하는 간접 인력의 비용을 관리합니다</p>
            </div>
            
            <div class="labor-cost-container">
                <div class="cost-overview">
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-users-cog"></i>
                        </div>
                        <div class="cost-content">
                            <h3>관리직 인건비</h3>
                            <p class="cost-amount">₩ 1,200,000,000</p>
                            <p class="cost-period">2024년 1월</p>
                        </div>
                    </div>
                    
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div class="cost-content">
                            <h3>사무직 인건비</h3>
                            <p class="cost-amount">₩ 850,000,000</p>
                            <p class="cost-period">2024년 1월</p>
                        </div>
                    </div>
                    
                    <div class="cost-card">
                        <div class="cost-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="cost-content">
                            <h3>간접 인건비 비율</h3>
                            <p class="cost-amount">31.5%</p>
                            <p class="cost-period">총 인건비 대비</p>
                        </div>
                    </div>
                </div>
                
                <div class="cost-analysis">
                    <h3><i class="fas fa-analytics"></i> 간접 인건비 분석</h3>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <h4>인원 현황</h4>
                            <ul>
                                <li>관리직: 45명</li>
                                <li>사무직: 67명</li>
                                <li>총 간접 인력: 112명</li>
                            </ul>
                        </div>
                        <div class="analysis-item">
                            <h4>평균 급여</h4>
                            <ul>
                                <li>관리직: ₩5,300,000</li>
                                <li>사무직: ₩3,800,000</li>
                                <li>간접 인력 평균: ₩4,250,000</li>
                            </ul>
                        </div>
                        <div class="analysis-item">
                            <h4>추세 분석</h4>
                            <ul>
                                <li>전월 대비: +1.8%</li>
                                <li>전년 동월 대비: +6.2%</li>
                                <li>예상 증가율: +2.5%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `,
        'employee': `
            <div class="page-header">
                <h2><i class="fas fa-database"></i> 통합 데이터 업로드</h2>
                <p>Excel, CSV, JSON 파일을 업로드하여 데이터를 관리하세요</p>
            </div>
            
            <div class="data-upload-center">
                <!-- 통합 파일 업로드 -->
                <div class="upload-section-card">
                    <div class="upload-card-header">
                        <i class="fas fa-file-upload"></i>
                        <h3>파일 업로드</h3>
                        <span class="upload-status-badge" id="unifiedUploadStatus">대기중</span>
                    </div>
                    <p>Excel(.xlsx, .xls), CSV(.csv), JSON(.json) 파일을 업로드하여 데이터를 분석하고 관리합니다.</p>
                    <div class="upload-actions">
                        <input type="file" id="unifiedFileInput" accept=".xlsx,.xls,.csv,.json" style="display: none;">
                        <div class="upload-drop-zone" id="unifiedDropZone">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>파일을 여기로 드래그하거나 클릭하여 선택하세요</p>
                            <span class="supported-formats">지원 형식: CSV, JSON, Excel</span>
                        </div>
                        <div class="upload-buttons">
                            <button class="btn upload-btn" data-action="select-file">
                                <i class="fas fa-upload"></i> 📁 파일 선택
                            </button>
                            <button class="btn btn-secondary" onclick="loadSampleUnifiedData()">
                                <i class="fas fa-flask"></i> 샘플 데이터
                            </button>
                            <button class="btn btn-outline sample-btn" onclick="downloadSampleJSON()">
                                <i class="fas fa-download"></i> 📄 샘플 JSON 다운로드
                            </button>
                        </div>
                    </div>
                    <!-- 향상된 업로드 진행률 표시 -->
                    <div class="upload-progress-container" id="uploadProgressContainer" style="display: none;">
                        <div class="upload-status">
                            <div class="status-icon">
                                <i class="fas fa-sync fa-spin"></i>
                            </div>
                            <span class="status-text">파일 처리 중...</span>
                        </div>
                        <div class="progress-wrapper">
                            <div class="progress-bar-bg">
                                <div class="progress-bar" id="uploadProgressBar"></div>
                            </div>
                            <div class="progress-info">
                                <span class="progress-percentage" id="uploadProgressText">0%</span>
                                <span class="progress-step" id="uploadStepText">준비 중...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 파일 형식 가이드 -->
                <div class="upload-section-card">
                    <div class="upload-card-header">
                        <i class="fas fa-info-circle"></i>
                        <h3>지원 파일 형식</h3>
                    </div>
                    <div class="file-format-guide">
                        <div class="format-item">
                            <div class="format-icon excel">
                                <i class="fas fa-file-excel"></i>
                            </div>
                            <div class="format-info">
                                <h4>Excel 파일</h4>
                                <p>.xlsx, .xls 형식 지원</p>
                                <small>최대 10MB, 첫 번째 시트의 데이터를 읽습니다</small>
                            </div>
                        </div>
                        <div class="format-item">
                            <div class="format-icon csv">
                                <i class="fas fa-file-csv"></i>
                            </div>
                            <div class="format-info">
                                <h4>CSV 파일</h4>
                                <p>.csv 형식 지원</p>
                                <small>UTF-8 인코딩, 쉼표로 구분된 데이터</small>
                            </div>
                        </div>
                        <div class="format-item">
                            <div class="format-icon json">
                                <i class="fas fa-file-code"></i>
                            </div>
                            <div class="format-info">
                                <h4>JSON 파일</h4>
                                <p>.json 형식 지원</p>
                                <small>배열 형태의 객체 데이터</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 업로드된 데이터 미리보기 -->
                <div class="upload-section-card" id="dataPreviewSection" style="display: none;">
                    <div class="upload-card-header">
                        <i class="fas fa-table"></i>
                        <h3>데이터 미리보기</h3>
                    </div>
                    <div class="data-preview-content">
                        <div class="preview-info">
                            <span id="previewFileName">파일명</span>
                            <span id="previewRecordCount">0개 레코드</span>
                        </div>
                        <div class="preview-table-wrapper">
                            <table id="unifiedDataTable">
                                <thead id="unifiedTableHead"></thead>
                                <tbody id="unifiedTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- 업로드 성공 시 데이터 확인 -->
                <div class="upload-section-card" id="uploadSuccessSection" style="display: none;">
                    <div class="upload-card-header">
                        <i class="fas fa-check-circle" style="color: #28a745;"></i>
                        <h3>업로드 성공! 📊</h3>
                        <div class="success-actions">
                            <button class="btn btn-small" onclick="clearUploadedData()">
                                <i class="fas fa-trash"></i> 데이터 지우기
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="downloadUploadedData()">
                                <i class="fas fa-download"></i> 다운로드
                            </button>
                        </div>
                    </div>
                    <div class="upload-success-content">
                        <!-- 기본 정보 -->
                        <div class="success-summary">
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <span class="stat-label">파일명</span>
                                    <span class="stat-value" id="successFileName">-</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">레코드 수</span>
                                    <span class="stat-value" id="successRecordCount">0</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">업로드 시간</span>
                                    <span class="stat-value" id="successUploadTime">-</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">필드 수</span>
                                    <span class="stat-value" id="successFieldCount">0</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 데이터 미리보기 -->
                        <div class="data-preview-section">
                            <h4>📋 데이터 미리보기</h4>
                            <div class="preview-controls">
                                <button class="btn btn-small" onclick="showAllFields()" id="showAllFieldsBtn">
                                    <i class="fas fa-expand"></i> 모든 필드 보기
                                </button>
                                <button class="btn btn-small" onclick="showLessFields()" id="showLessFieldsBtn" style="display: none;">
                                    <i class="fas fa-compress"></i> 간단히 보기
                                </button>
                            </div>
                            <div class="preview-table-container">
                                <table class="preview-table" id="successPreviewTable">
                                    <thead id="successTableHead"></thead>
                                    <tbody id="successTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- 필드 정보 -->
                        <div class="fields-info-section">
                            <h4>🏷️ 필드 정보</h4>
                            <div class="fields-list" id="successFieldsList">
                                <!-- 필드 목록이 여기에 생성됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 데이터 분석 결과 -->
                <div class="upload-section-card" id="analysisSection" style="display: none;">
                    <div class="upload-card-header">
                        <i class="fas fa-chart-bar"></i>
                        <h3>데이터 분석</h3>
                    </div>
                    <div class="analysis-content" id="unifiedAnalysisContent">
                        <div class="analysis-summary">
                            <div class="summary-item">
                                <span class="summary-label">총 레코드</span>
                                <span class="summary-value" id="totalRecords">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">컬럼 수</span>
                                <span class="summary-value" id="totalColumns">0</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">데이터 타입</span>
                                <span class="summary-value" id="dataType">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return pages[pageName] || `
        <div class="page-header">
            <h2>🚧 준비 중</h2>
            <p>${pageName} 페이지가 곧 완성됩니다!</p>
        </div>
    `;
}

// DOM 로드 완료 후 이것들 실행 (기존 함수에 추가)
document.addEventListener('DOMContentLoaded', function() {
    // 🔥 저장된 데이터 자동 로드
    loadPersistentData();
    
    // 기존 이벤트 리스너들...
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            switchPage(pageName);
            
            if (pageName === 'ai-chat') {
                setTimeout(updateAIDataConnectionStatus, 100);
                // 필터 패널 접기 기능 추가
                setTimeout(initializeCollapsiblePanels, 200);
            } else if (pageName === 'data-history') {
                setTimeout(displayUploadHistory, 100);
            } else if (pageName === 'upload-history') {
                setTimeout(loadUploadHistory, 100);
            }
        });
    });
    
    // 파일 업로드 이벤트
    document.addEventListener('change', function(e) {
        if (e.target.id === 'mainFileInput') {
            handleMainFileUpload(e.target.files);
        }
    });
    
    // 채팅 입력창 자동 크기 조절
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // 통합 데이터 업로드 센터 파일 업로드
    const unifiedFileInput = document.getElementById('unifiedFileInput');
    if (unifiedFileInput) {
        unifiedFileInput.addEventListener('change', function(event) {
            handleUnifiedFileUpload(event.target.files);
        });
    }
    
    // 드래그 앤 드롭 이벤트 설정
    const unifiedDropZone = document.getElementById('unifiedDropZone');
    if (unifiedDropZone) {
        // 드롭 존 클릭 시 파일 선택
        unifiedDropZone.addEventListener('click', function() {
            document.getElementById('unifiedFileInput').click();
        });
        
        // 드래그 이벤트 처리
        unifiedDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.add('drag-over');
        });
        
        unifiedDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.remove('drag-over');
        });
        
        unifiedDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            unifiedDropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleUnifiedFileUpload(files);
            }
        });
    }
});



// 메인 파일 업로드 처리 (자동 저장 기능 추가)
async function handleMainFileUpload(files) {
    // 통합 데이터 업로드 센터로 리다이렉트
    switchPage('data-center');
}

// 파일 파싱 (개선된 버전)
async function parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해 주세요.');
    }
    
    switch (extension) {
        case 'csv':
            return await parseCSV(file);
        case 'json':
            return await parseJSON(file);
        case 'xlsx':
        case 'xls':
            // Excel 파일은 CSV로 변환 후 업로드 안내
            throw new Error('Excel 파일은 CSV 형식으로 변환 후 업로드해 주세요.');
        default:
            throw new Error(`지원하지 않는 파일 형식입니다. (${extension})\n지원 형식: CSV, JSON`);
    }
}

// CSV 파싱 (개선된 버전)
function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n').filter(line => line.trim()); // 빈 줄 제거
                
                if (lines.length < 2) {
                    throw new Error('CSV 파일에 데이터가 없습니다.');
                }
                
                // 헤더 처리
                const headers = lines[0]
                    .split(',')
                    .map(h => h.trim().replace(/^["']|["']$/g, '')); // 따옴표 제거
                
                const data = [];
                
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue; // 빈 줄 건너뛰기
                    
                    // CSV 파싱 (따옴표 처리)
                    const values = [];
                    let current = '';
                    let inQuotes = false;
                    
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        
                        if (char === '"' && !inQuotes) {
                            inQuotes = true;
                        } else if (char === '"' && inQuotes) {
                            inQuotes = false;
                        } else if (char === ',' && !inQuotes) {
                            values.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    values.push(current.trim()); // 마지막 값 추가
                    
                    // 데이터 객체 생성
                    const row = {};
                    headers.forEach((header, index) => {
                        let value = values[index] || '';
                        
                        // 숫자 변환 시도
                        if (value && !isNaN(value) && value !== '') {
                            const num = parseFloat(value);
                            if (!isNaN(num) && isFinite(num)) {
                                row[header] = num;
                            } else {
                                row[header] = value;
                            }
                        } else {
                            row[header] = value;
                        }
                    });
                    
                    data.push(row);
                }
                
                if (data.length === 0) {
                    throw new Error('파싱할 수 있는 데이터가 없습니다.');
                }
                
                resolve(data);
                
            } catch (error) {
                console.error('CSV 파싱 에러:', error);
                reject(new Error(`CSV 파일 처리 실패: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsText(file, 'utf-8');
    });
}

// JSON 파싱 (개선된 버전)
function parseJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let jsonText = e.target.result;
                
                // NaN, undefined, Infinity 등을 처리
                jsonText = jsonText
                    .replace(/:\s*NaN/g, ': null')           // NaN -> null
                    .replace(/:\s*undefined/g, ': null')     // undefined -> null
                    .replace(/:\s*Infinity/g, ': null')      // Infinity -> null
                    .replace(/:\s*-Infinity/g, ': null')     // -Infinity -> null
                    .replace(/,(\s*[}\]])/g, '$1');         // 마지막 콤마 제거
                
                const json = JSON.parse(jsonText);
                const dataArray = Array.isArray(json) ? json : [json];
                
                // 데이터 정리 (null 값들을 빈 문자열로 변경)
                const cleanedData = dataArray.map(row => {
                    const cleanedRow = {};
                    Object.keys(row).forEach(key => {
                        const value = row[key];
                        if (value === null || value === undefined || 
                            (typeof value === 'number' && isNaN(value))) {
                            cleanedRow[key] = '';  // 빈 문자열로 변경
                        } else {
                            cleanedRow[key] = value;
                        }
                    });
                    return cleanedRow;
                });
                
                resolve(cleanedData);
                
            } catch (error) {
                console.error('JSON 파싱 에러:', error);
                reject(new Error(`JSON 파일 형식이 올바르지 않습니다: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsText(file, 'utf-8'); // UTF-8 인코딩 명시
    });
}

// 필터 옵션 업데이트
function updateFilterOptions() {
    if (globalUploadedData.length === 0) return;
    
    const departments = [...new Set(globalUploadedData.map(row => 
        row.부서 || row.department || row.팀 || ''
    ).filter(Boolean))];
    
    const departmentSelect = document.getElementById('departmentFilter');
    if (departmentSelect) {
        departmentSelect.innerHTML = '<option value="">전체 부서</option>';
        departments.forEach(dept => {
            departmentSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
        });
    }
}

// 필터 적용
function applyFilters() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const department = document.getElementById('departmentFilter')?.value;
    const name = document.getElementById('nameFilter')?.value.toLowerCase();
    
    filteredData = globalUploadedData.filter(row => {
        if (startDate || endDate) {
            const rowDate = row.일자 || row.date || row.날짜 || '';
            if (rowDate) {
                const date = new Date(rowDate);
                if (startDate && date < new Date(startDate)) return false;
                if (endDate && date > new Date(endDate)) return false;
            }
        }
        
        if (department) {
            const rowDept = row.부서 || row.department || row.팀 || '';
            if (!rowDept.includes(department)) return false;
        }
        
        if (name) {
            const rowName = (row.성명 || row.name || row.이름 || '').toLowerCase();
            if (!rowName.includes(name)) return false;
        }
        
        return true;
    });
    
    displayDataTable();
    updateFilterCount();
}

// 필터 초기화
function clearFilters() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const departmentFilter = document.getElementById('departmentFilter');
    const nameFilter = document.getElementById('nameFilter');
    
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    if (departmentFilter) departmentFilter.value = '';
    if (nameFilter) nameFilter.value = '';
    
    filteredData = [...globalUploadedData];
    displayDataTable();
    updateFilterCount();
}

// AI 채팅용 데이터 테이블 표시
function displayDataTable() {
    if (filteredData.length === 0) return;
    
    const recordCount = document.getElementById('recordCount');
    if (recordCount) {
        recordCount.textContent = `${filteredData.length}개 레코드`;
    }
    
    const headers = Object.keys(filteredData[0]);
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    if (tableHead) {
        tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    }
    
    if (tableBody) {
        const displayData = filteredData.slice(0, 100);
        tableBody.innerHTML = displayData.map(row => 
            '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>'
        ).join('');
    }
}

// 메인 업로드 페이지용 데이터 미리보기 표시
function displayMainDataPreview() {
    if (globalUploadedData.length === 0) return;
    
    const previewContainer = document.getElementById('uploadedDataPreview');
    const recordCount = document.getElementById('mainRecordCount');
    
    if (previewContainer) {
        previewContainer.style.display = 'block';
    }
    
    if (recordCount) {
        recordCount.textContent = `${globalUploadedData.length}개 레코드`;
    }
    
    const headers = Object.keys(globalUploadedData[0]);
    const tableHead = document.getElementById('mainTableHead');
    const tableBody = document.getElementById('mainTableBody');
    
    if (tableHead) {
        tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    }
    
    if (tableBody) {
        const displayData = globalUploadedData.slice(0, 50); // 미리보기는 50개만 표시
        tableBody.innerHTML = displayData.map(row => 
            '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>'
        ).join('');
    }
}



// 필터 카운트 업데이트
function updateFilterCount() {
    const filterCount = document.getElementById('filterCount');
    if (filterCount) {
        if (filteredData.length === globalUploadedData.length) {
            filterCount.textContent = '전체 데이터 표시 중';
        } else {
            filterCount.textContent = `${filteredData.length}개 레코드 필터링됨`;
        }
    }
}

// 데이터 요약 표시
function showDataSummary() {
    if (globalUploadedData.length === 0) return;
    
    const summary = `
        📊 <strong>데이터 요약</strong><br><br>
        • 총 레코드: <strong>${globalUploadedData.length}개</strong><br>
        • 부서 수: <strong>${[...new Set(globalUploadedData.map(row => row.부서 || row.department || row.팀 || '미분류'))].length}개</strong><br>
        • 직급 수: <strong>${[...new Set(globalUploadedData.map(row => row.직급 || row.position || row.직책 || '미분류'))].length}개</strong><br>
        • 급여 필드: <strong>${findSalaryField() || '없음'}</strong><br><br>
        <strong>어떤 분석을 원하시나요?</strong>
    `;
    
    addMessage('ai', summary);
}



// 추천 질문 표시
function showSuggestedQuestions() {
    const suggestedQuestions = document.getElementById('suggestedQuestions');
    if (suggestedQuestions) {
        suggestedQuestions.style.display = 'block';
    }
}

// Enter 키 처리 개선
function handleEnter(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Shift+Enter: 줄바꿈
            return true;
        } else {
            // Enter: 메시지 전송
            event.preventDefault();
            sendMessage();
            return false;
        }
    }
}

// 추천 질문 전송
function sendSuggestedMessage(message) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = message;
        sendMessage();
    }
}

// 개선된 메시지 전송
function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // 사용자 메시지 추가
    addMessageWithTyping('user', message);
    input.value = '';
    
    // 입력창 높이 초기화
    input.style.height = 'auto';
    
    // AI 응답 생성 (타이핑 효과와 함께)
    setTimeout(() => {
        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            const aiResponse = generateDataBasedResponse(message);
            addMessageWithTyping('ai', aiResponse);
        }, 1500 + Math.random() * 1000); // 1.5-2.5초 랜덤 딜레이
    }, 300);
}

// 타이핑 효과와 함께 메시지 추가
function addMessageWithTyping(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${message}</div>
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 타이핑 인디케이터 표시
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="typing-indicator">
            <span>AI가 답변을 작성하고 있어요</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 타이핑 인디케이터 숨기기
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}



// ============ 메인 업로드 기능 ============

// DOM 로드 완료 후 이벤트 등록 (기존 함수에 추가)
document.addEventListener('DOMContentLoaded', function() {
    // 기존 메뉴 클릭 이벤트는 그대로 두고 이 부분만 추가
    document.addEventListener('change', function(e) {
        if (e.target.id === 'mainFileInput') {
            handleMainFileUpload(e.target.files);
        }
    });
    
    // AI 어시스턴트 페이지 로드 시 데이터 연동 상태 확인
    setTimeout(checkDataConnection, 500);
});



// 메인 데이터 테이블 표시
function displayMainDataTable() {
    if (globalUploadedData.length === 0) return;
    
    const recordCount = document.getElementById('mainRecordCount');
    if (recordCount) {
        recordCount.textContent = `${globalUploadedData.length}개 레코드`;
    }
    
    const headers = Object.keys(globalUploadedData[0]);
    const tableHead = document.getElementById('mainTableHead');
    const tableBody = document.getElementById('mainTableBody');
    
    if (tableHead) {
        tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    }
    
    if (tableBody) {
        const displayData = globalUploadedData.slice(0, 10); // 미리보기는 10개만
        tableBody.innerHTML = displayData.map(row => 
            '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>'
        ).join('');
    }
}

// 업로드된 데이터 미리보기 표시
function showUploadedDataPreview() {
    const preview = document.getElementById('uploadedDataPreview');
    if (preview) {
        preview.style.display = 'block';
    }
}

// AI 데이터 연동 상태 업데이트 (수정)
function updateAIDataConnectionStatus() {
    const initialMessage = document.getElementById('initialMessage');
    
    if (globalUploadedData.length > 0) {
        const latestUpload = uploadHistory.length > 0 ? uploadHistory[uploadHistory.length - 1] : null;
        const uploadInfo = latestUpload ? 
            `<br><small>📅 마지막 업로드: ${latestUpload.uploadDate.toLocaleString()}</small>` : '';
        
        if (initialMessage) {
            initialMessage.innerHTML = `🎉 ${globalUploadedData.length}개의 데이터가 연동되었습니다!${uploadInfo}<br><br>
            <strong>🎯 제가 도와드릴 수 있는 일들:</strong><br>
            • 📊 업로드된 데이터 분석 & 인사이트<br>
            • 💼 HR 트렌드 및 업계 동향<br>
            • 📈 급여 벤치마킹 & 시장 분석<br>
            • 🔍 인사제도 개선 컨설팅<br><br>
            궁금한 것을 질문해 보세요! 💡`;
        }
        
        // 필터링 및 테이블 설정
        filteredData = [...globalUploadedData];
        updateFilterOptions();
        displayDataTable();
        
        const filterPanel = document.getElementById('filterPanel');
        const dataTableContainer = document.getElementById('dataTableContainer');
        
        if (filterPanel) filterPanel.style.display = 'block';
        if (dataTableContainer) dataTableContainer.style.display = 'block';
        
    } else {
        if (initialMessage) {
            initialMessage.innerHTML = `안녕하세요! 저는 PayPulse AI입니다! 😊<br><br>
            <strong>🎯 제가 도와드릴 수 있는 일들:</strong><br>
            • 📊 업로드된 데이터 분석 & 인사이트<br>
            • 💼 HR 트렌드 및 업계 동향<br>
            • 📈 급여 벤치마킹 & 시장 분석<br>
            • 🔍 인사제도 개선 컨설팅<br>
            • ⚖️ 노동법 및 규정 문의<br><br>
            <strong>💾 데이터를 한 번 업로드하면 자동으로 저장되어<br>다음에 접속해도 그대로 유지됩니다!</strong><br><br>
            편하게 말걸어 주세요! 동료처럼 대화해요 🤗`;
        }
    }
}





// 데이터 요약 표시
function showDataSummary() {
    if (globalUploadedData.length === 0) return;
    
    const headers = Object.keys(globalUploadedData[0]);
    const departments = [...new Set(globalUploadedData.map(row => 
        row.부서 || row.department || row.팀 || '미분류'
    ))];
    
    const summaryMessage = `📊 <strong>데이터 요약 정보</strong><br><br>
    • 총 레코드 수: <strong>${globalUploadedData.length}개</strong><br>
    • 데이터 필드: <strong>${headers.length}개</strong> (${headers.slice(0, 5).join(', ')}${headers.length > 5 ? ' 등' : ''})<br>
    • 부서 수: <strong>${departments.length}개</strong> (${departments.slice(0, 3).join(', ')}${departments.length > 3 ? ' 등' : ''})<br><br>
    이제 구체적인 질문을 해보세요! 💡`;
    
    addMessage('ai', summaryMessage);
}

// 기존 필터 및 분석 함수들 수정 (globalUploadedData 사용)
function applyFilters() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const department = document.getElementById('departmentFilter')?.value;
    const name = document.getElementById('nameFilter')?.value.toLowerCase();
    
    filteredData = globalUploadedData.filter(row => {
        if (startDate || endDate) {
            const rowDate = row.일자 || row.date || row.날짜 || '';
            if (rowDate) {
                const date = new Date(rowDate);
                if (startDate && date < new Date(startDate)) return false;
                if (endDate && date > new Date(endDate)) return false;
            }
        }
        
        if (department) {
            const rowDept = row.부서 || row.department || row.팀 || '';
            if (!rowDept.includes(department)) return false;
        }
        
        if (name) {
            const rowName = (row.성명 || row.name || row.이름 || '').toLowerCase();
            if (!rowName.includes(name)) return false;
        }
        
        return true;
    });
    
    displayDataTable();
    updateFilterCount();
}

// 필터 결과 카운트 업데이트
function updateFilterCount() {
    const filterCount = document.getElementById('filterCount');
    if (filterCount) {
        if (filteredData.length === globalUploadedData.length) {
            filterCount.textContent = '전체 데이터 표시 중';
        } else {
            filterCount.textContent = `${filteredData.length}/${globalUploadedData.length}개 데이터 필터링됨`;
        }
    }
}

function updateFilterOptions() {
    if (globalUploadedData.length === 0) return;
    
    const departments = [...new Set(globalUploadedData.map(row => 
        row.부서 || row.department || row.팀 || ''
    ).filter(Boolean))];
    
    const departmentSelect = document.getElementById('departmentFilter');
    if (departmentSelect) {
        departmentSelect.innerHTML = '<option value="">전체 부서</option>';
        departments.forEach(dept => {
            departmentSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
        });
    }
}

function clearFilters() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const departmentFilter = document.getElementById('departmentFilter');
    const nameFilter = document.getElementById('nameFilter');
    
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    if (departmentFilter) departmentFilter.value = '';
    if (nameFilter) nameFilter.value = '';
    
    filteredData = [...globalUploadedData];
    displayDataTable();
    updateFilterCount();
}

// 개선된 AI 응답 생성 (이전 버전의 장점 + 개인별 조회 기능)
function generateDataBasedResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // 디버그 명령어
    if (message.includes('디버그') || message.includes('debug')) {
        showDataDebugInfo();
        return `🔧 <strong>데이터 디버그 정보</strong><br><br>
        브라우저 개발자 도구(F12) → Console 탭에서 자세한 정보를 확인하세요!<br><br>
        <strong>현재 상태:</strong><br>
        • 전체 데이터: ${globalUploadedData.length}개<br>
        • 필터링된 데이터: ${filteredData.length}개<br>
        • 급여 필드: ${findSalaryField() || '없음'}<br>
        • 첫 번째 레코드: ${filteredData.length > 0 ? Object.keys(filteredData[0]).join(', ') : '없음'}`;
    }
    
    // 인사말 응답
    if (message.includes('안녕') || message.includes('hi') || message.includes('hello')) {
        return `안녕하세요! 😊 반가워요!<br>
        오늘도 함께 데이터로 인사이트를 찾아볼까요? 뭐든 편하게 물어보세요! 🚀`;
    }
    
    // 데이터가 있는 경우의 분석
    if (globalUploadedData.length > 0) {
        
        // 개인별 급여 조회 (새로 추가!)
        if (message.includes('급여') && (message.includes('찾아') || message.includes('알려') || message.includes('보여') || message.includes('조회'))) {
            return handleIndividualSalaryQuery(message);
        }
        
        // 특정 인물 검색
        if (message.includes('누구') || message.includes('찾아') || message.includes('검색')) {
            return handlePersonSearch(message);
        }
        
        // HR 트렌드 관련
        if (message.includes('트렌드') || message.includes('동향') || message.includes('최근')) {
            return `📈 <strong>2024년 주요 HR 트렌드</strong><br><br>
            <strong>🔥 핫한 키워드들:</strong><br>
            • <strong>하이브리드 워크</strong>: 재택+출근 혼합 근무 확산<br>
            • <strong>웰빙 경영</strong>: 직원 정신건강 지원 프로그램<br>
            • <strong>스킬 기반 채용</strong>: 학력보다 실무능력 중심<br>
            • <strong>DEI (다양성·형평성·포용성)</strong>: 조직문화의 핵심<br>
            • <strong>AI 활용</strong>: 채용~퇴사까지 전 과정 디지털화<br><br>
            <strong>💡 우리 조직에 적용해볼 만한 건:</strong><br>
            어떤 트렌드가 가장 관심 있으신가요? 더 자세히 설명해드릴게요! 😉`;
        }
        
        // 급여 벤치마킹 관련
        if (message.includes('벤치마킹') || message.includes('시장') || message.includes('급여 수준')) {
            return `💰 <strong>급여 벤치마킹 분석</strong><br><br>
            <strong>🎯 일반적인 시장 기준:</strong><br>
            • <strong>대기업 vs 중소기업</strong>: 평균 20-30% 차이<br>
            • <strong>지역별 격차</strong>: 수도권 vs 지방 약 15-25% 차이<br>
            • <strong>직급별 인상률</strong>: 연 3-7% (성과에 따라)<br>
            • <strong>복리후생 포함</strong>: 급여의 20-30% 추가 가치<br><br>
            ${globalUploadedData.length > 0 ? `
            <strong>📊 우리 데이터 기준:</strong><br>
            • 평균 급여: ${calculateAverageSalary()}원<br>
            • 부서별 편차: ${calculateSalaryVariance()}<br><br>
            ` : ''}
            <strong>💡 제안:</strong><br>
            구체적인 직무나 직급별 벤치마킹이 필요하시면 알려주세요! 더 정확한 분석해드릴게요 👍`;
        }
        
        // 직원 만족도 관련
        if (message.includes('만족도') || message.includes('동기부여') || message.includes('복지')) {
            return `😊 <strong>직원 만족도 향상 전략</strong><br><br>
            <strong>🏆 효과적인 방법들:</strong><br>
            <strong>1. 소통 강화</strong><br>
            • 정기적인 1:1 면담<br>
            • 익명 피드백 시스템<br>
            • 타운홀 미팅 개최<br><br>
            <strong>2. 성장 기회 제공</strong><br>
            • 교육비 지원 확대<br>
            • 사내 멘토링 프로그램<br>
            • 횡적 이동 기회<br><br>
            <strong>3. 워라밸 개선</strong><br>
            • 유연근무제 도입<br>
            • 휴가 사용 장려<br>
            • 번아웃 방지 프로그램<br><br>
            <strong>4. 인정과 보상</strong><br>
            • 즉시 피드백 문화<br>
            • 성과 기반 인센티브<br>
            • 비금전적 보상 (포상휴가 등)<br><br>
            어떤 부분부터 시작해보고 싶으신가요? 🤔`;
        }
        
        // 데이터 분석 요청
        if (message.includes('분석') || message.includes('현황') || message.includes('조직')) {
            return `📊 <strong>우리 조직 데이터 분석 결과</strong><br><br>
            ${generateOrganizationAnalysis()}<br><br>
            <strong>💡 AI 인사이트:</strong><br>
            ${generateAIInsights()}<br><br>
            더 궁금한 부분이 있으면 언제든 물어보세요! 함께 해결해봐요 💪`;
        }
        
        if (message.includes('총') && (message.includes('명') || message.includes('개수'))) {
            return `👥 <strong>현재 데이터 현황</strong><br><br>
            • 총 직원 수: <strong>${filteredData.length}명</strong><br>
            • 전체 데이터: <strong>${globalUploadedData.length}명</strong><br><br>
            ${filteredData.length !== globalUploadedData.length ? 
                `<em>※ 현재 필터가 적용되어 ${filteredData.length}명만 표시 중이에요</em><br><br>` : ''}
            이 규모면 ${getOrganizationSizeComment(filteredData.length)} 조직이네요! 😊`;
        }
        
        if (message.includes('부서')) {
            const departments = [...new Set(filteredData.map(row => 
                row.부서 || row.department || row.팀 || '미분류'
            ))];
            
            if (message.includes('평균') && message.includes('급여')) {
                return generateDepartmentSalaryAnalysis();
            } else {
                return `🏢 <strong>부서 구성 현황</strong><br><br>
                • 총 부서 수: <strong>${departments.length}개</strong><br>
                • 부서별 분포:<br>
                ${departments.map((dept, index) => {
                    const count = filteredData.filter(row => 
                        (row.부서 || row.department || row.팀 || '미분류') === dept
                    ).length;
                    const percentage = ((count / filteredData.length) * 100).toFixed(1);
                    return `  ${index + 1}. <strong>${dept}</strong>: ${count}명 (${percentage}%)`;
                }).join('<br>')}<br><br>
                조직이 ${departments.length < 5 ? '단순하고 집중적' : '다양하고 복합적'}인 구조네요! 👍`;
            }
        }
        
        if (message.includes('급여') || message.includes('연봉') || message.includes('월급')) {
            return generateSalaryAnalysisWithAdvice();
        }
        
        if (message.includes('인건비') || message.includes('총액')) {
            return generateLaborCostAnalysis();
        }
    }
    
    // 노동법/규정 관련
    if (message.includes('노동법') || message.includes('법률') || message.includes('규정')) {
        return `⚖️ <strong>노동법 관련 안내</strong><br><br>
        <strong>주요 체크포인트:</strong><br>
        • <strong>근로시간</strong>: 주 52시간 상한제<br>
        • <strong>최저임금</strong>: 2024년 시급 9,860원<br>
        • <strong>연차휴가</strong>: 1년 근속 시 15일<br>
        • <strong>퇴직금</strong>: 1년 이상 근속 시 의무<br><br>
        구체적인 상황이나 궁금한 조항이 있으시면 더 자세히 설명해드릴게요! 🤝`;
    }
    
    // 일반적인 질문이나 데이터가 없는 경우
    if (globalUploadedData.length === 0) {
        return `아직 데이터가 업로드되지 않았지만, 그래도 도와드릴 수 있어요! 😊<br><br>
        <strong>💬 이런 것들 물어보세요:</strong><br>
        • HR 트렌드나 업계 동향<br>
        • 급여 벤치마킹 정보<br>
        • 인사제도 개선 아이디어<br>
        • 직원 만족도 향상 방법<br>
        • 노동법 관련 궁금증<br><br>
        <strong>💡 더 정확한 분석을 원하시면:</strong><br>
        데이터 관리 → 통합 데이터 업로드에서 파일을 업로드하시면<br>
        전문가 분석&예측에서 상세한 분석을 받아보실 수 있어요! 🚀`;
    }
    
    // 기본 응답
    return `음... 🤔 좀 더 구체적으로 말씀해주시면 더 정확한 답변을 드릴 수 있을 것 같아요!<br><br>
    <strong>🎯 이런 식으로 물어보시면 어떨까요?</strong><br>
    • "김철수 급여 알려줘"<br>
    • "우리 조직의 급여 분포는 어떤가요?"<br>
    • "부서별 인원 현황을 알려주세요"<br>
    • "최근 HR 트렌드가 궁금해요"<br>
    • "직원 복지 개선 아이디어 있을까요?"<br><br>
    무엇이든 편하게 물어보세요! 함께 해결해봐요 💪`;
}

// 개인별 급여 조회 처리 (새로 추가!)
function handleIndividualSalaryQuery(message) {
    // 이름 추출
    const nameMatch = message.match(/([가-힣]{2,4})/);
    if (!nameMatch) {
        return `누구의 급여를 찾으시나요?<br><br>
        <strong>예시:</strong><br>
        • "김철수 급여 알려줘"<br>
        • "박영희 급여 조회"<br>
        • "이민수 급여 보여줘"`;
    }
    
    const searchName = nameMatch[1];
    const nameField = findNameField();
    
    if (!nameField) {
        return `이름 필드를 찾을 수 없어요.<br>
        데이터에 '이름', 'name', '성명' 등의 컬럼이 있는지 확인해주세요.`;
    }
    
    // 해당 인물 찾기
    const person = filteredData.find(row => {
        const name = String(row[nameField] || '').trim();
        return name.includes(searchName) || searchName.includes(name);
    });
    
    if (!person) {
        return `"${searchName}"님을 찾을 수 없어요.<br><br>
        <strong>확인해보세요:</strong><br>
        • 이름이 정확한지<br>
        • 현재 필터에 포함되어 있는지<br>
        • 데이터에 해당 인물이 있는지`;
    }
    
    // 급여 정보
    const salaryField = findSalaryField();
    if (!salaryField) {
        return `급여 정보를 찾을 수 없어요.`;
    }
    
    const salary = extractNumericValue(person[salaryField]);
    const dept = person.부서 || person.department || person.팀 || '미분류';
    const position = person.직급 || person.position || person.직책 || '정보없음';
    
    return `👤 <strong>${person[nameField]}님 급여 정보</strong><br><br>
    <strong>기본 정보:</strong><br>
    • 부서: ${dept}<br>
    • 직급: ${position}<br>
    • 급여: ${formatCurrency(salary)}<br><br>
    <strong>비교 분석:</strong><br>
    ${generateIndividualSalaryComparison(salary, dept)}`;
}

// 인물 검색 처리
function handlePersonSearch(message) {
    const nameMatch = message.match(/([가-힣]{2,4})/);
    if (!nameMatch) {
        return `누구를 찾으시나요?<br>
        이름을 말씀해주세요.`;
    }
    
    const searchName = nameMatch[1];
    const nameField = findNameField();
    
    if (!nameField) {
        return `이름 필드를 찾을 수 없어요.`;
    }
    
    // 검색
    const matches = filteredData.filter(row => {
        const name = String(row[nameField] || '').trim();
        return name.includes(searchName) || searchName.includes(name);
    });
    
    if (matches.length === 0) {
        return `"${searchName}"과 일치하는 인물을 찾을 수 없어요.`;
    }
    
    if (matches.length === 1) {
        const person = matches[0];
        return `👤 <strong>${person[nameField]}님 정보</strong><br><br>
        ${generatePersonDetail(person)}`;
    }
    
    // 여러 명인 경우
    return `"${searchName}"과 일치하는 인물이 ${matches.length}명 있어요:<br><br>
    ${matches.map((person, index) => 
        `${index + 1}. ${person[nameField]} (${person.부서 || person.department || '부서미정'})`
    ).join('<br>')}<br><br>
    더 구체적으로 말씀해주세요.`;
}

// 이름 필드 찾기
function findNameField() {
    if (filteredData.length === 0) return null;
    
    const fields = Object.keys(filteredData[0]);
    const nameKeywords = ['이름', '성명', 'name', '직원명', '사원명'];
    
    return fields.find(field => 
        nameKeywords.some(keyword => 
            field.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}

// 개인 급여 비교 분석
function generateIndividualSalaryComparison(salary, dept) {
    const avgSalary = calculateAverageSalary();
    const deptAvg = calculateDepartmentAverageSalary();
    
    let comparison = '';
    
    // 전체 평균과 비교
    if (avgSalary !== "정보 없음") {
        const avgNum = parseInt(avgSalary.replace(/[^\d]/g, ''));
        const ratio = (salary / avgNum * 100).toFixed(1);
        
        if (ratio > 120) {
            comparison += `• 전체 평균 대비 <strong>${ratio}%</strong> 높음 👍<br>`;
        } else if (ratio < 80) {
            comparison += `• 전체 평균 대비 <strong>${ratio}%</strong> 낮음 📈<br>`;
        } else {
            comparison += `• 전체 평균 대비 <strong>${ratio}%</strong> 적정 수준 😊<br>`;
        }
    }
    
    return comparison || '비교 데이터가 부족해요.';
}

// 인물 상세 정보 생성
function generatePersonDetail(person) {
    const nameField = findNameField();
    const salaryField = findSalaryField();
    
    let detail = '';
    
    // 기본 정보
    if (person.부서 || person.department) {
        detail += `• 부서: ${person.부서 || person.department}<br>`;
    }
    if (person.직급 || person.position) {
        detail += `• 직급: ${person.직급 || person.position}<br>`;
    }
    if (salaryField && person[salaryField]) {
        detail += `• 급여: ${formatCurrency(extractNumericValue(person[salaryField]))}<br>`;
    }
    if (person.입사일 || person.hire_date) {
        detail += `• 입사일: ${person.입사일 || person.hire_date}<br>`;
    }
    
    return detail || '상세 정보가 없어요.';
}

// 급여 필드 찾기
// 급여 필드 찾기 (개선된 버전)
function findSalaryField() {
    if (filteredData.length === 0) return null;
    
    const fields = Object.keys(filteredData[0]);
    const salaryKeywords = [
        '급여', '연봉', '월급', '기본급', '총급여', '실급여',
        'salary', 'pay', 'wage', 'income', 'compensation',
        '기본연봉', '월지급액', '지급총액'
    ];
    
    // 정확한 매칭 우선
    let salaryField = fields.find(field => 
        salaryKeywords.some(keyword => 
            field.toLowerCase() === keyword.toLowerCase()
        )
    );
    
    // 부분 매칭
    if (!salaryField) {
        salaryField = fields.find(field => 
            salaryKeywords.some(keyword => 
                field.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }
    
    return salaryField;
}

// ============ 업로드 내역 관리 기능 ============

let selectedHistoryId = null;

// 데이터 요약 생성
function generateDataSummary(data) {
    if (data.length === 0) return null;
    
    const departments = [...new Set(data.map(row => 
        row.부서 || row.department || row.팀 || '미분류'
    ))];
    
    const salaryField = findSalaryFieldFromData(data);
    let totalSalary = 0;
    let avgSalary = 0;
    
    if (salaryField) {
        const salaries = data.map(row => parseFloat(row[salaryField]) || 0);
        totalSalary = salaries.reduce((a, b) => a + b, 0);
        avgSalary = totalSalary / salaries.length;
    }
    
    return {
        totalEmployees: data.length,
        totalDepartments: departments.length,
        totalSalary: totalSalary,
        avgSalary: avgSalary,
        departments: departments,
        fields: Object.keys(data[0])
    };
}

// 업로드 내역 표시
function displayUploadHistory() {
    const historyList = document.getElementById('historyList');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    
    if (!historyList) return;
    
    if (uploadHistory.length === 0) {
        if (noHistoryMessage) noHistoryMessage.style.display = 'block';
        historyList.innerHTML = '<div class="no-history" id="noHistoryMessage"><i class="fas fa-inbox"></i><h3>업로드 내역이 없습니다</h3><p>데이터 관리 → 급여/상여 대장 업로드에서 파일을 업로드해 보세요.</p><button class="btn btn-outline" onclick="switchPage(\'upload\')"><i class="fas fa-upload"></i> 파일 업로드하기</button></div>';
        return;
    }
    
    if (noHistoryMessage) noHistoryMessage.style.display = 'none';
    
    const historyHTML = uploadHistory.map(entry => `
        <div class="history-item ${selectedHistoryId === entry.id ? 'selected' : ''}" onclick="selectHistoryItem(${entry.id})">
            <div class="history-icon">
                <i class="fas fa-file-excel"></i>
            </div>
            <div class="history-info">
                <div class="history-title">
                    <strong>${entry.fileNames.join(', ')}</strong>
                    ${selectedHistoryId === entry.id ? '<span class="current-badge">현재 활성</span>' : ''}
                </div>
                <div class="history-details">
                    <span><i class="fas fa-calendar"></i> ${entry.uploadDate.toLocaleString()}</span>
                    <span><i class="fas fa-users"></i> ${entry.recordCount}개 레코드</span>
                    ${entry.summary ? `<span><i class="fas fa-building"></i> ${entry.summary.totalDepartments}개 부서</span>` : ''}
                </div>
                ${entry.summary && entry.summary.totalSalary > 0 ? 
                    `<div class="history-summary">
                        <span class="salary-info">총 인건비: ${entry.summary.totalSalary.toLocaleString()}원</span>
                    </div>` : ''
                }
            </div>
            <div class="history-actions">
                <button class="btn btn-sm" onclick="event.stopPropagation(); loadHistoryData(${entry.id})" title="이 데이터 활성화">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); deleteHistoryItem(${entry.id})" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
}

// 내역 아이템 선택
function selectHistoryItem(id) {
    selectedHistoryId = id;
    displayUploadHistory();
    
    const selectedEntry = uploadHistory.find(entry => entry.id === id);
    if (selectedEntry) {
        displaySelectedDataDetail(selectedEntry);
    }
}

// 선택된 데이터 상세 표시
function displaySelectedDataDetail(entry) {
    const container = document.getElementById('selectedDataContainer');
    if (!container) return;
    
    container.style.display = 'block';
    
    // 요약 카드 업데이트
    if (entry.summary) {
        document.getElementById('totalEmployees').textContent = `${entry.summary.totalEmployees}명`;
        document.getElementById('totalDepartments').textContent = `${entry.summary.totalDepartments}개`;
        document.getElementById('totalSalary').textContent = `${entry.summary.totalSalary.toLocaleString()}원`;
        document.getElementById('avgSalary').textContent = `${Math.round(entry.summary.avgSalary).toLocaleString()}원`;
    }
    
    // 데이터 테이블 표시
    displaySelectedDataTable(entry.data);
    
    // 분석 결과 초기화
    document.getElementById('aiAnalysisContainer').style.display = 'none';
    document.getElementById('summaryReportContainer').style.display = 'none';
}

// 선택된 데이터 테이블 표시
function displaySelectedDataTable(data) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const tableHead = document.getElementById('selectedTableHead');
    const tableBody = document.getElementById('selectedTableBody');
    
    if (tableHead) {
        tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    }
    
    if (tableBody) {
        const displayData = data.slice(0, 20); // 최대 20개만 표시
        tableBody.innerHTML = displayData.map(row => 
            '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>'
        ).join('');
    }
}

// 내역 데이터 활성화
function loadHistoryData(id) {
    const entry = uploadHistory.find(entry => entry.id === id);
    if (!entry) return;
    
    globalUploadedData = [...entry.data];
    filteredData = [...globalUploadedData];
    
    // AI 어시스턴트에 알림
    updateAIDataConnectionStatus();
    
    alert(`${entry.fileNames.join(', ')} 데이터가 활성화되었습니다!\n${entry.recordCount}개 레코드가 AI 어시스턴트에서 사용 가능합니다.`);
}

// AI 분석 생성
function generateAIAnalysis() {
    if (!selectedHistoryId) {
        alert('먼저 분석할 데이터를 선택해 주세요.');
        return;
    }
    
    const entry = uploadHistory.find(entry => entry.id === selectedHistoryId);
    if (!entry) return;
    
    const container = document.getElementById('aiAnalysisContainer');
    const content = document.getElementById('analysisContent');
    
    container.style.display = 'block';
    content.innerHTML = `
        <div class="loading-analysis">
            <i class="fas fa-spinner fa-spin"></i>
            <p>AI가 데이터를 분석 중입니다...</p>
        </div>
    `;
    
    // AI 분석 시뮬레이션
    setTimeout(() => {
        const analysis = generateDetailedAnalysis(entry);
        content.innerHTML = analysis;
    }, 2000);
}

// 상세 분석 생성
function generateDetailedAnalysis(entry) {
    const data = entry.data;
    const summary = entry.summary;
    
    if (!summary) return '<p>분석할 수 있는 데이터가 부족합니다.</p>';
    
    // 부서별 분석
    const deptAnalysis = summary.departments.map(dept => {
        const deptData = data.filter(row => 
            (row.부서 || row.department || row.팀 || '미분류') === dept
        );
        const deptCount = deptData.length;
        const deptPercent = ((deptCount / data.length) * 100).toFixed(1);
        
        return `<li><strong>${dept}</strong>: ${deptCount}명 (${deptPercent}%)</li>`;
    }).join('');
    
    // 급여 분석
    const salaryField = findSalaryFieldFromData(data);
    let salaryAnalysis = '';
    
    if (salaryField) {
        const salaries = data.map(row => parseFloat(row[salaryField]) || 0).filter(s => s > 0);
        const maxSalary = Math.max(...salaries);
        const minSalary = Math.min(...salaries);
        const medianSalary = salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)];
        
        salaryAnalysis = `
            <div class="analysis-section">
                <h5><i class="fas fa-won-sign"></i> 급여 분석</h5>
                <ul>
                    <li><strong>최고 급여:</strong> ${maxSalary.toLocaleString()}원</li>
                    <li><strong>최저 급여:</strong> ${minSalary.toLocaleString()}원</li>
                    <li><strong>중간값:</strong> ${medianSalary.toLocaleString()}원</li>
                    <li><strong>급여 격차:</strong> ${(maxSalary - minSalary).toLocaleString()}원</li>
                </ul>
            </div>
        `;
    }
    
    return `
        <div class="analysis-result">
            <div class="analysis-section">
                <h5><i class="fas fa-chart-bar"></i> 전체 현황</h5>
                <ul>
                    <li><strong>총 직원 수:</strong> ${summary.totalEmployees}명</li>
                    <li><strong>부서 수:</strong> ${summary.totalDepartments}개</li>
                    <li><strong>데이터 필드:</strong> ${summary.fields.length}개</li>
                    <li><strong>업로드 일시:</strong> ${entry.uploadDate.toLocaleString()}</li>
                </ul>
            </div>
            
            <div class="analysis-section">
                <h5><i class="fas fa-building"></i> 부서별 분포</h5>
                <ul>
                    ${deptAnalysis}
                </ul>
            </div>
            
            ${salaryAnalysis}
            
            <div class="analysis-section">
                <h5><i class="fas fa-lightbulb"></i> AI 인사이트</h5>
                <div class="insights">
                    <div class="insight-item">
                        <strong>조직 구조:</strong> ${summary.totalDepartments}개 부서로 구성된 ${
                            summary.totalEmployees < 50 ? '소규모' : 
                            summary.totalEmployees < 200 ? '중간규모' : '대규모'
                        } 조직입니다.
                    </div>
                    ${summary.totalSalary > 0 ? `
                    <div class="insight-item">
                        <strong>인건비 현황:</strong> 월 총 인건비 ${summary.totalSalary.toLocaleString()}원, 
                        1인당 평균 ${Math.round(summary.avgSalary).toLocaleString()}원입니다.
                    </div>
                    ` : ''}
                    <div class="insight-item">
                        <strong>데이터 품질:</strong> ${summary.fields.length}개 필드로 구성된 양질의 데이터입니다.
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 요약 보고서 생성
function generateSummaryReport() {
    if (!selectedHistoryId) {
        alert('먼저 보고서를 생성할 데이터를 선택해 주세요.');
        return;
    }
    
    const entry = uploadHistory.find(entry => entry.id === selectedHistoryId);
    if (!entry) return;
    
    const container = document.getElementById('summaryReportContainer');
    const content = document.getElementById('reportContent');
    
    container.style.display = 'block';
    content.innerHTML = `
        <div class="loading-report">
            <i class="fas fa-spinner fa-spin"></i>
            <p>보고서를 생성 중입니다...</p>
        </div>
    `;
    
    // 보고서 생성 시뮬레이션
    setTimeout(() => {
        const report = generateFormattedReport(entry);
        content.innerHTML = report;
    }, 1500);
}

// 형식화된 보고서 생성
function generateFormattedReport(entry) {
    const today = new Date().toLocaleDateString();
    const data = entry.data;
    const summary = entry.summary;
    
    return `
        <div class="report-document">
            <div class="report-header">
                <h3>📊 인사 데이터 요약 보고서</h3>
                <div class="report-meta">
                    <p><strong>작성일:</strong> ${today}</p>
                    <p><strong>데이터 기준일:</strong> ${entry.uploadDate.toLocaleDateString()}</p>
                    <p><strong>파일명:</strong> ${entry.fileNames.join(', ')}</p>
                </div>
            </div>
            
            <div class="report-section">
                <h4>1. 개요</h4>
                <p>본 보고서는 ${entry.uploadDate.toLocaleDateString()}에 업로드된 인사 데이터를 바탕으로 작성되었습니다. 
                총 ${summary.totalEmployees}명의 직원 데이터를 ${summary.totalDepartments}개 부서별로 분석하였습니다.</p>
            </div>
            
            <div class="report-section">
                <h4>2. 주요 지표</h4>
                <div class="report-metrics">
                    <div class="metric-row">
                        <span class="metric-label">총 직원 수:</span>
                        <span class="metric-value">${summary.totalEmployees}명</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">부서 수:</span>
                        <span class="metric-value">${summary.totalDepartments}개</span>
                    </div>
                    ${summary.totalSalary > 0 ? `
                    <div class="metric-row">
                        <span class="metric-label">총 인건비:</span>
                        <span class="metric-value">${summary.totalSalary.toLocaleString()}원</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">평균 급여:</span>
                        <span class="metric-value">${Math.round(summary.avgSalary).toLocaleString()}원</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="report-section">
                <h4>3. 부서별 현황</h4>
                <div class="dept-breakdown">
                    ${summary.departments.map(dept => {
                        const deptData = data.filter(row => 
                            (row.부서 || row.department || row.팀 || '미분류') === dept
                        );
                        const deptCount = deptData.length;
                        const deptPercent = ((deptCount / data.length) * 100).toFixed(1);
                        
                        return `
                            <div class="dept-item">
                                <span class="dept-name">${dept}</span>
                                <span class="dept-count">${deptCount}명 (${deptPercent}%)</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h4>4. 데이터 구성</h4>
                <p>데이터는 다음 ${summary.fields.length}개 필드로 구성되어 있습니다:</p>
                <div class="fields-list">
                    ${summary.fields.map(field => `<span class="field-tag">${field}</span>`).join('')}
                </div>
            </div>
            
            <div class="report-footer">
                <p><em>본 보고서는 PayPulse AI 시스템에 의해 자동 생성되었습니다.</em></p>
                <button class="btn" onclick="printReport()">
                    <i class="fas fa-print"></i> 인쇄하기
                </button>
                <button class="btn btn-outline" onclick="exportReport()">
                    <i class="fas fa-download"></i> PDF 저장
                </button>
            </div>
        </div>
    `;
}

// 기타 유틸리티 함수들
function refreshHistoryView() {
    loadUploadHistoryFromStorage();
    displayUploadHistory();
}

function clearUploadHistory() {
    if (confirm('모든 업로드 내역을 삭제하시겠습니까?\n(현재 활성화된 데이터는 유지됩니다)')) {
        uploadHistory = [];
        selectedHistoryId = null;
        saveUploadHistoryToStorage();
        displayUploadHistory();
        document.getElementById('selectedDataContainer').style.display = 'none';
    }
}

function deleteHistoryItem(id) {
    if (confirm('이 내역을 삭제하시겠습니까?')) {
        uploadHistory = uploadHistory.filter(entry => entry.id !== id);
        if (selectedHistoryId === id) {
            selectedHistoryId = null;
            document.getElementById('selectedDataContainer').style.display = 'none';
        }
        saveUploadHistoryToStorage();
        displayUploadHistory();
    }
}

function exportSelectedData() {
    if (!selectedHistoryId) return;
    
    const entry = uploadHistory.find(entry => entry.id === selectedHistoryId);
    if (!entry) return;
    
    // CSV 내보내기
    const csvContent = [
        Object.keys(entry.data[0]).join(','),
        ...entry.data.map(row => 
            Object.values(row).map(value => 
                typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value
            ).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${entry.fileNames[0]}_exported_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printReport() {
    window.print();
}

function exportReport() {
    alert('PDF 내보내기 기능은 개발 중입니다.');
}

// 로컬 스토리지 관리
function saveUploadHistoryToStorage() {
    localStorage.setItem('paypulse_upload_history', JSON.stringify(uploadHistory));
}

function loadUploadHistoryFromStorage() {
    const stored = localStorage.getItem('paypulse_upload_history');
    if (stored) {
        uploadHistory = JSON.parse(stored).map(entry => ({
            ...entry,
            uploadDate: new Date(entry.uploadDate)
        }));
    }
}

function findSalaryFieldFromData(data) {
    if (data.length === 0) return null;
    
    const fields = Object.keys(data[0]);
    const salaryKeywords = ['급여', '연봉', '월급', 'salary', 'pay', '기본급'];
    
    return fields.find(field => 
        salaryKeywords.some(keyword => 
            field.toLowerCase().includes(keyword.toLowerCase())
        )
    );
}



// ============ AI 응답 보조 함수들 ============

// 조직 규모별 코멘트
function getOrganizationSizeComment(size) {
    if (size < 30) return "아담하고 효율적인";
    if (size < 100) return "중간 규모의 안정적인";
    if (size < 300) return "체계적이고 전문적인";
    return "대규모의 복합적인";
}



// 급여 분산 계산
function calculateSalaryVariance() {
    const salaryField = findSalaryFieldFromData(globalUploadedData);
    if (!salaryField) return "분석 불가";
    
    const departments = [...new Set(globalUploadedData.map(row => 
        row.부서 || row.department || row.팀 || '미분류'
    ))];
    
    if (departments.length < 2) return "단일 부서";
    
    const avgSalaries = departments.map(dept => {
        const deptData = globalUploadedData.filter(row => 
            (row.부서 || row.department || row.팀 || '미분류') === dept
        );
        const salaries = deptData.map(row => parseFloat(row[salaryField]) || 0)
                                 .filter(s => s > 0);
        return salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
    }).filter(avg => avg > 0);
    
    if (avgSalaries.length < 2) return "분석 불가";
    
    const maxAvg = Math.max(...avgSalaries);
    const minAvg = Math.min(...avgSalaries);
    const variance = ((maxAvg - minAvg) / minAvg * 100).toFixed(1);
    
    return `최대 ${variance}% 차이`;
}

// 조직 분석 생성
function generateOrganizationAnalysis() {
    const summary = generateDataSummary(globalUploadedData);
    if (!summary) return "분석할 데이터가 부족합니다.";
    
    return `<strong>🎯 조직 구조 분석</strong><br>
    • 총 인원: ${summary.totalEmployees}명<br>
    • 부서 수: ${summary.totalDepartments}개<br>
    • 평균 부서 규모: ${Math.round(summary.totalEmployees / summary.totalDepartments)}명<br>
    ${summary.totalSalary > 0 ? `• 월 총 인건비: ${summary.totalSalary.toLocaleString()}원<br>• 1인당 평균: ${Math.round(summary.avgSalary).toLocaleString()}원` : ''}`;
}

// AI 인사이트 생성
function generateAIInsights() {
    const summary = generateDataSummary(globalUploadedData);
    if (!summary) return "충분한 데이터가 필요해요.";
    
    const insights = [];
    
    if (summary.totalEmployees < 50) {
        insights.push("👥 <strong>소규모 조직</strong>의 장점을 살려 빠른 의사결정과 유연성을 활용해보세요");
    } else if (summary.totalEmployees > 200) {
        insights.push("🏢 <strong>대규모 조직</strong>인 만큼 체계적인 프로세스와 명확한 역할 분담이 중요해요");
    }
    
    if (summary.totalDepartments > 5) {
        insights.push("🔄 부서간 <strong>협업 체계</strong> 구축과 소통 프로세스 개선을 고려해보세요");
    }
    
    if (summary.totalSalary > 0) {
        const avgSalary = summary.avgSalary;
        if (avgSalary < 3000000) {
            insights.push("💰 시장 대비 급여 경쟁력 강화를 통한 <strong>인재 유치</strong> 전략이 필요할 수 있어요");
        } else if (avgSalary > 5000000) {
            insights.push("💎 높은 급여 수준만큼 <strong>성과 관리</strong>와 인재 활용 극대화에 집중해보세요");
        }
    }
    
    return insights.join('<br>');
}

// 부서별 급여 분석 (개선된 버전)
function generateDepartmentSalaryAnalysis() {
    const salaryField = findSalaryFieldFromData(filteredData);
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없습니다. 데이터에 급여, 연봉, 월급 등의 컬럼이 있는지 확인해 주세요.';
    }
    
    const deptSalaries = {};
    filteredData.forEach(row => {
        const dept = row.부서 || row.department || row.팀 || '미분류';
        const salary = parseFloat(row[salaryField]) || 0;
        
        if (!deptSalaries[dept]) {
            deptSalaries[dept] = { total: 0, count: 0, salaries: [] };
        }
        deptSalaries[dept].total += salary;
        deptSalaries[dept].count += 1;
        deptSalaries[dept].salaries.push(salary);
    });
    
    let result = '📊 <strong>부서별 급여 분석</strong><br><br>';
    
    // 전체 평균 계산
    const allSalaries = filteredData.map(row => parseFloat(row[salaryField]) || 0).filter(s => s > 0);
    const overallAvg = allSalaries.length > 0 ? allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length : 0;
    
    Object.entries(deptSalaries).forEach(([dept, data]) => {
        const avg = data.total / data.count;
        const percentage = overallAvg > 0 ? ((avg - overallAvg) / overallAvg * 100).toFixed(1) : 0;
        const trend = percentage > 0 ? '📈' : percentage < 0 ? '📉' : '➡️';
        
        result += `🏢 <strong>${dept}</strong>: ${Math.round(avg).toLocaleString()}원 (${data.count}명)<br>`;
        result += `   ${trend} 전체 평균 대비 ${percentage > 0 ? '+' : ''}${percentage}%<br><br>`;
    });
    
    result += `<strong>💡 인사이트:</strong><br>`;
    const sortedDepts = Object.entries(deptSalaries).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count));
    if (sortedDepts.length > 1) {
        const highest = sortedDepts[0];
        const lowest = sortedDepts[sortedDepts.length - 1];
        const gap = ((highest[1].total / highest[1].count) / (lowest[1].total / lowest[1].count) - 1) * 100;
        result += `• <strong>${highest[0]}</strong>이 가장 높은 급여 수준<br>`;
        result += `• 부서간 최대 ${gap.toFixed(1)}% 급여 격차<br>`;
        if (gap > 50) {
            result += `• 급여 격차가 큰 편이니 내부 형평성 검토 필요`;
        }
    }
    
    return result;
}

// 급여 분석 및 조언
function generateSalaryAnalysisWithAdvice() {
    const salaryField = findSalaryFieldFromData(filteredData);
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
    const median = salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)];
    
    let result = `💰 <strong>급여 현황 분석</strong><br><br>`;
    result += `• 최고 급여: <strong>${Math.round(max).toLocaleString()}원</strong><br>`;
    result += `• 최저 급여: <strong>${Math.round(min).toLocaleString()}원</strong><br>`;
    result += `• 평균 급여: <strong>${Math.round(avg).toLocaleString()}원</strong><br>`;
    result += `• 중간값: <strong>${Math.round(median).toLocaleString()}원</strong><br><br>`;
    
    // 급여 분포 분석
    const gap = ((max - min) / min * 100).toFixed(1);
    result += `<strong>📊 급여 분포:</strong><br>`;
    result += `• 최고/최저 격차: ${gap}%<br>`;
    
    if (gap > 200) {
        result += `• ⚠️ 급여 격차가 매우 큽니다<br>`;
        result += `• 💡 내부 형평성 개선 검토 필요<br>`;
    } else if (gap > 100) {
        result += `• ⚠️ 급여 격차가 큽니다<br>`;
        result += `• 💡 급여 체계 점검 권장<br>`;
    } else {
        result += `• ✅ 급여 분포가 비교적 균등합니다<br>`;
    }
    
    // 시장 대비 분석 (간단한 기준)
    if (avg < 3000000) {
        result += `<br><strong>💡 조언:</strong> 시장 대비 급여 경쟁력 강화를 고려해보세요<br>`;
    } else if (avg > 5000000) {
        result += `<br><strong>💡 조언:</strong> 높은 급여 수준만큼 성과 관리에 집중하세요<br>`;
    }
    
    return result;
}

// 인건비 분석
function generateLaborCostAnalysis() {
    const salaryField = findSalaryFieldFromData(filteredData);
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없습니다.';
    }
    
    const salaries = filteredData
        .map(row => parseFloat(row[salaryField]) || 0)
        .filter(salary => salary > 0);
    
    if (salaries.length === 0) {
        return '📊 급여 데이터가 없습니다.';
    }
    
    const total = salaries.reduce((a, b) => a + b, 0);
    const avg = total / salaries.length;
    
    let result = `💼 <strong>인건비 현황</strong><br><br>`;
    result += `• 월 총 인건비: <strong>${Math.round(total).toLocaleString()}원</strong><br>`;
    result += `• 1인당 평균: <strong>${Math.round(avg).toLocaleString()}원</strong><br>`;
    result += `• 대상 인원: <strong>${salaries.length}명</strong><br><br>`;
    
    // 연간 추정
    const annualTotal = total * 12;
    const annualAvg = avg * 12;
    result += `<strong>📅 연간 추정:</strong><br>`;
    result += `• 연 총 인건비: <strong>${Math.round(annualTotal).toLocaleString()}원</strong><br>`;
    result += `• 1인당 연봉: <strong>${Math.round(annualAvg).toLocaleString()}원</strong><br><br>`;
    
    // 비용 효율성 분석
    result += `<strong>💡 인사이트:</strong><br>`;
    if (avg < 2500000) {
        result += `• 인건비가 상대적으로 낮은 편입니다<br>`;
        result += `• 인재 유치/유지를 위한 급여 인상 검토 필요<br>`;
    } else if (avg > 4000000) {
        result += `• 인건비가 높은 편입니다<br>`;
        result += `• 생산성과 성과 관리 강화 권장<br>`;
    } else {
        result += `• 적정 수준의 인건비입니다<br>`;
        result += `• 현재 수준 유지하면서 성과 향상에 집중<br>`;
    }
    
    return result;
}

// ============ 데이터 영구 저장 기능 ============

// 데이터를 로컬 스토리지에 저장
function savePersistentData() {
    try {
        const dataToSave = {
            uploadedData: globalUploadedData,
            uploadHistory: uploadHistory,
            lastUploadDate: new Date().toISOString(),
            dataSource: getDataSourceInfo()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log('✅ 데이터가 영구 저장되었습니다.');
        
        // 저장 상태 표시
        showDataSavedNotification();
        
    } catch (error) {
        console.error('❌ 데이터 저장 실패:', error);
        alert('데이터 저장에 실패했습니다. 브라우저 저장소를 확인해 주세요.');
    }
}

// 로컬 스토리지에서 데이터 로드
function loadPersistentData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // 데이터 복원
            globalUploadedData = parsedData.uploadedData || [];
            filteredData = [...globalUploadedData];
            uploadHistory = parsedData.uploadHistory || [];
            
            // 날짜 객체 복원
            uploadHistory = uploadHistory.map(entry => ({
                ...entry,
                uploadDate: new Date(entry.uploadDate)
            }));
            
            console.log(`✅ 저장된 데이터를 불러왔습니다. (${globalUploadedData.length}개 레코드)`);
            
            // UI 업데이트
            if (globalUploadedData.length > 0) {
                updateAIDataConnectionStatus();
                showDataLoadedNotification(parsedData.lastUploadDate);
            }
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        return false;
    }
}

// 데이터 소스 정보 생성
function getDataSourceInfo() {
    if (uploadHistory.length === 0) return null;
    
    const latestUpload = uploadHistory[uploadHistory.length - 1];
    return {
        fileName: latestUpload.fileNames.join(', '),
        recordCount: latestUpload.recordCount,
        uploadDate: latestUpload.uploadDate
    };
}

// 저장 완료 알림 표시
function showDataSavedNotification() {
    const notification = document.createElement('div');
    notification.className = 'data-notification saved';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>데이터가 저장되었습니다!</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 데이터 로드 완료 알림 표시
function showDataLoadedNotification(lastUploadDate) {
    const uploadDate = new Date(lastUploadDate).toLocaleString();
    
    const notification = document.createElement('div');
    notification.className = 'data-notification loaded';
    notification.innerHTML = `
        <i class="fas fa-database"></i>
        <div>
            <strong>저장된 데이터를 불러왔습니다</strong>
            <small>마지막 업로드: ${uploadDate}</small>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// 저장된 데이터 삭제
function clearPersistentData() {
    if (confirm('저장된 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        try {
            localStorage.removeItem(STORAGE_KEY);
            
            // 전역 변수 초기화
            globalUploadedData = [];
            filteredData = [];
            uploadHistory = [];
            selectedHistoryId = null;
            
            // UI 업데이트
            updateAIDataConnectionStatus();
            if (document.querySelector('.menu-item.active')?.getAttribute('data-page') === 'data-history') {
                displayUploadHistory();
            }
            
            alert('모든 데이터가 삭제되었습니다.');
            
        } catch (error) {
            console.error('❌ 데이터 삭제 실패:', error);
            alert('데이터 삭제에 실패했습니다.');
        }
    }
}

// 데이터 상태 확인
function getDataStatus() {
    return {
        hasData: globalUploadedData.length > 0,
        recordCount: globalUploadedData.length,
        historyCount: uploadHistory.length,
        lastUpdate: uploadHistory.length > 0 ? uploadHistory[uploadHistory.length - 1].uploadDate : null
    };
}

// 필터 패널과 테이블 접기/펼치기 기능
function initializeCollapsiblePanels() {
    // 필터 패널 헤더 클릭 이벤트
    const filterPanel = document.getElementById('filterPanel');
    if (filterPanel) {
        const header = filterPanel.querySelector('h3');
        if (header) {
            header.style.cursor = 'pointer';
            header.innerHTML = `<i class="fas fa-filter"></i> 데이터 필터링 <i class="fas fa-chevron-up collapse-icon"></i>`;
            
            header.addEventListener('click', function() {
                filterPanel.classList.toggle('collapsed');
                const icon = header.querySelector('.collapse-icon');
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
            });
        }
    }
    
    // 데이터 테이블 헤더 클릭 이벤트
    const tableContainer = document.getElementById('dataTableContainer');
    if (tableContainer) {
        const header = tableContainer.querySelector('.table-header h3');
        if (header) {
            header.style.cursor = 'pointer';
            header.innerHTML = `<i class="fas fa-table"></i> 필터링된 데이터 <i class="fas fa-chevron-up collapse-icon"></i>`;
            
            header.addEventListener('click', function() {
                tableContainer.classList.toggle('collapsed');
                const icon = header.querySelector('.collapse-icon');
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
            });
        }
    }
}

// ============ 퀵 질문 스낵바 기능 ============

let quickQuestionsVisible = false;

// 퀵 질문 데이터
const quickQuestions = [
    {
        id: 'salary_benchmark',
        icon: 'fas fa-chart-line',
        text: '우리 급여 수준은 시장 대비 어때요?',
        category: 'data',
        answer: `💰 <strong>급여 벤치마킹 분석</strong><br><br>
        
        <strong>🎯 2024년 시장 기준:</strong><br>
        • <strong>신입사원</strong>: 2,800만~3,500만원<br>
        • <strong>경력 3년</strong>: 3,500만~4,500만원<br>
        • <strong>경력 5년</strong>: 4,500만~6,000만원<br>
        • <strong>팀장급</strong>: 6,000만~8,000만원<br><br>
        
        <strong>📊 업종별 차이:</strong><br>
        • IT/게임: 평균 +20%<br>
        • 금융/보험: 평균 +15%<br>
        • 제조업: 평균 기준<br>
        • 서비스업: 평균 -10%<br><br>
        
        ${globalUploadedData.length > 0 ? `
        <strong>🔍 우리 조직 현황:</strong><br>
        • 평균 급여: ${calculateAverageSalary()}원<br>
        • 시장 대비: ${getMarketComparison()}
        ` : '<strong>💡 팁:</strong> 데이터 관리 → 통합 데이터 업로드에서 파일을 업로드하시면 우리 조직의 정확한 벤치마킹을 제공해드려요!'}`,
        suggestions: [
            '부서별 급여 격차는 어떻게 돼?',
            '급여 인상 가이드라인이 있을까?',
            '성과급 비중은 적정할까?'
        ]
    },
    {
        id: 'hr_trends',
        icon: 'fas fa-trending-up',
        text: '최신 HR 트렌드가 궁금해요',
        category: 'trend',
        answer: `📈 <strong>2024년 핫한 HR 트렌드</strong><br><br>
        
        <strong>🔥 TOP 5 트렌드:</strong><br>
        <strong>1. 하이브리드 워크 정착</strong><br>
        • 80% 기업이 유연근무제 도입<br>
        • 출근 2-3일, 재택 2-3일 최적<br><br>
        
        <strong>2. 웰빙 경영 확산</strong><br>
        • 정신건강 지원 프로그램<br>
        • 번아웃 예방이 생산성 향상의 핵심<br><br>
        
        <strong>3. 스킬 기반 채용</strong><br>
        • 학력보다 실무 역량 중심<br>
        • 포트폴리오 & 실무 테스트 중시<br><br>
        
        <strong>4. AI 활용 확대</strong><br>
        • 채용 프로세스 자동화<br>
        • 성과 예측 및 맞춤형 교육<br><br>
        
        <strong>5. DEI (다양성·형평성·포용성)</strong><br>
        • 조직문화의 필수 요소<br>
        • MZ세대 인재 유치의 핵심`,
        suggestions: [
            '우리 조직에 적용할 만한 트렌드는?',
            'MZ세대 직원 관리 노하우는?',
            '리모트워크 도입 시 주의사항은?'
        ]
    },
    {
        id: 'employee_satisfaction',
        icon: 'fas fa-smile',
        text: '직원 만족도 향상 방법은?',
        category: 'expert',
        answer: `😊 <strong>직원 만족도 향상 전략</strong><br><br>
        
        <strong>🏆 즉시 실행 가능한 방법:</strong><br>
        <strong>1. 소통 개선</strong><br>
        • 월 1회 팀 타운홀 미팅<br>
        • 익명 피드백 채널 운영<br>
        • 경영진과의 직접 대화 시간<br><br>
        
        <strong>2. 성장 기회 제공</strong><br>
        • 연간 교육비 200만원 지원<br>
        • 내부 멘토링 프로그램<br>
        • 직무 순환 기회 제공<br><br>
        
        <strong>3. 워라밸 강화</strong><br>
        • 유연근무제 (코어타임: 10-15시)<br>
        • 연차 사용 독려 (최소 80% 이상)<br>
        • 장기휴가 제도 (5년마다 1주)<br><br>
        
        <strong>4. 인정과 보상</strong><br>
        • 실시간 칭찬 플랫폼<br>
        • 분기별 MVP 선정<br>
        • 성과 연동 스톡옵션`,
        suggestions: [
            '우리 조직 만족도 현황 체크하려면?',
            '퇴사율 줄이는 효과적인 방법은?',
            '신입사원 정착률 높이는 방법은?'
        ]
    },
    {
        id: 'org_analysis',
        icon: 'fas fa-users',
        text: '우리 조직 구조는 효율적일까?',
        category: 'data',
        answer: globalUploadedData.length > 0 ? generateOrganizationStructureAnalysis() : `📊 <strong>조직 구조 효율성 체크</strong><br><br>
        
        <strong>🎯 효율적인 조직의 특징:</strong><br>
        • <strong>적정 관리 범위</strong>: 팀장당 5-8명<br>
        • <strong>계층 구조</strong>: 3-4단계가 이상적<br>
        • <strong>의사결정 속도</strong>: 2단계 내 결정<br>
        • <strong>부서간 협업</strong>: 크로스 펑셔널 팀<br><br>
        
        <strong>🔍 셀프 체크 포인트:</strong><br>
        ✅ 보고 체계가 명확한가?<br>
        ✅ 권한과 책임이 분명한가?<br>
        ✅ 의사소통이 원활한가?<br>
        ✅ 업무 중복이 없는가?<br><br>
        
        <strong>💡 데이터 관리 → 통합 데이터 업로드에서 파일을 업로드하시면 우리 조직의 정확한 구조 분석을 제공해드려요!</strong>`,
        suggestions: [
            '관리 스팬은 적정할까?',
            '부서 통폐합이 필요할까?',
            '신규 조직 신설 기준은?'
        ]
    },
    {
        id: 'labor_law',
        icon: 'fas fa-gavel',
        text: '최신 노동법 변경사항은?',
        category: 'expert',
        answer: `⚖️ <strong>2024년 노동법 주요 변경사항</strong><br><br>
        
        <strong>🆕 새로 바뀐 것들:</strong><br>
        <strong>1. 최저임금</strong><br>
        • 2024년: 시급 9,860원 (2.5% 인상)<br>
        • 월급 환산: 약 206만원<br><br>
        
        <strong>2. 육아휴직 급여</strong><br>
        • 첫 3개월: 월 300만원으로 인상<br>
        • 아빠 육휴 보너스: +100만원<br><br>
        
        <strong>3. 주 52시간 적용 확대</strong><br>
        • 5인 이상 모든 사업장 적용<br>
        • 위반 시 2년 이하 징역 또는 2천만원 이하 벌금<br><br>
        
        <strong>4. 직장 내 괴롭힘 금지법 강화</strong><br>
        • 신고 의무화<br>
        • 가해자 징계 의무<br><br>
        
        <strong>⚠️ 주의사항:</strong><br>
        • 취업규칙 변경 신고 필수<br>
        • 근로계약서 업데이트 필요`,
        suggestions: [
            '우리 회사 규정 점검이 필요할까?',
            '연장근무 관리 방법은?',
            '휴가 제도 개선 방안은?'
        ]
    },
    {
        id: 'performance_eval',
        icon: 'fas fa-star',
        text: '성과평가 제도 개선 아이디어는?',
        category: 'expert',
        answer: `🎯 <strong>성과평가 제도 혁신 가이드</strong><br><br>
        
        <strong>🔄 최신 트렌드:</strong><br>
        <strong>1. OKR (목표-핵심결과) 도입</strong><br>
        • 분기별 목표 설정<br>
        • 투명한 목표 공유<br>
        • 상시 피드백 문화<br><br>
        
        <strong>2. 360도 피드백</strong><br>
        • 상사, 동료, 부하직원 평가<br>
        • 다면적 관점 수집<br>
        • 개발 영역 명확화<br><br>
        
        <strong>3. 연속적 성과관리</strong><br>
        • 연 1회 → 분기별/월별<br>
        • 실시간 코칭<br>
        • 목표 수정의 유연성<br><br>
        
        <strong>🎨 평가 기준 개선:</strong><br>
        • 결과 70% : 과정 30%<br>
        • 개인 성과 + 팀 기여도<br>
        • 역량 평가 + 문화 적합성<br><br>
        
        <strong>💡 차세대 도구:</strong><br>
        • AI 기반 성과 예측<br>
        • 실시간 피드백 플랫폼<br>
        • 데이터 기반 승진 추천`,
        suggestions: [
            'MZ세대에 맞는 평가 방법은?',
            '상대평가 vs 절대평가 어떤 게 좋을까?',
            '평가 결과 활용 방안은?'
        ]
    }
];

// 퀵 질문 UI 생성
function createQuickQuestionsUI() {
    // 토글 버튼 생성
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'quick-questions-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-question"></i>';
    toggleBtn.onclick = toggleQuickQuestions;
    
    // 퀵 질문 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'quick-questions-container';
    container.id = 'quickQuestionsContainer';
    container.style.display = 'none';
    
    // 퀵 질문 버튼들 생성
    quickQuestions.forEach(question => {
        const btn = document.createElement('button');
        btn.className = `quick-question-fab ${question.category}-question-fab`;
        btn.innerHTML = `
            <i class="${question.icon}"></i>
            <span>${question.text}</span>
        `;
        btn.onclick = () => showQuickAnswer(question);
        container.appendChild(btn);
    });
    
    document.body.appendChild(toggleBtn);
    document.body.appendChild(container);
    
    // 모달 생성
    createQuickAnswerModal();
}

// 퀵 질문 토글
function toggleQuickQuestions() {
    const container = document.getElementById('quickQuestionsContainer');
    const toggleBtn = document.querySelector('.quick-questions-toggle');
    
    quickQuestionsVisible = !quickQuestionsVisible;
    
    if (quickQuestionsVisible) {
        container.style.display = 'flex';
        toggleBtn.classList.add('active');
        
        // 애니메이션 효과
        const buttons = container.querySelectorAll('.quick-question-fab');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.transform = 'translateX(0)';
                btn.style.opacity = '1';
            }, index * 100);
        });
    } else {
        const buttons = container.querySelectorAll('.quick-question-fab');
        buttons.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.transform = 'translateX(100px)';
                btn.style.opacity = '0';
            }, index * 50);
        });
        
        setTimeout(() => {
            container.style.display = 'none';
        }, buttons.length * 50 + 200);
        
        toggleBtn.classList.remove('active');
    }
}

// 퀵 답변 모달 생성
function createQuickAnswerModal() {
    const modal = document.createElement('div');
    modal.className = 'quick-answer-modal';
    modal.id = 'quickAnswerModal';
    modal.innerHTML = `
        <div class="quick-answer-content">
            <div class="quick-answer-header">
                <h3 id="quickAnswerTitle">
                    <i class="fas fa-lightbulb"></i>
                    빠른 답변
                </h3>
                <button class="close-modal-btn" onclick="closeQuickAnswer()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="quick-answer-body" id="quickAnswerBody">
                <!-- 답변 내용이 여기에 표시됩니다 -->
            </div>
            <div class="quick-answer-actions">
                <button class="ask-more-btn" onclick="askMoreInChat()">
                    <i class="fas fa-comments"></i>
                    AI 채팅에서 더 자세히 물어보기
                </button>
            </div>
            <div id="quickSuggestions" style="margin-top: 1rem;">
                <!-- 추천 질문들이 여기에 표시됩니다 -->
            </div>
        </div>
    `;
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeQuickAnswer();
        }
    });
    
    document.body.appendChild(modal);
}

// 퀵 답변 표시
function showQuickAnswer(question) {
    const modal = document.getElementById('quickAnswerModal');
    const title = document.getElementById('quickAnswerTitle');
    const body = document.getElementById('quickAnswerBody');
    const suggestions = document.getElementById('quickSuggestions');
    
    title.innerHTML = `<i class="${question.icon}"></i> ${question.text}`;
    body.innerHTML = question.answer;
    
    // 추천 질문 생성
    if (question.suggestions && question.suggestions.length > 0) {
        suggestions.innerHTML = `
            <h4 style="margin-bottom: 0.75rem; color: #666; font-size: 0.9rem;">
                <i class="fas fa-lightbulb"></i> 이런 것도 궁금하지 않나요?
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${question.suggestions.map(suggestion => `
                    <button class="question-btn" onclick="sendSuggestedMessage('${suggestion}')" style="
                        background: rgba(102, 126, 234, 0.1);
                        border: 1px solid rgba(102, 126, 234, 0.2);
                        border-radius: 15px;
                        padding: 0.5rem 1rem;
                        color: #667eea;
                        font-size: 0.85rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: left;
                    " onmouseover="this.style.background='rgba(102, 126, 234, 0.2)'" 
                       onmouseout="this.style.background='rgba(102, 126, 234, 0.1)'">
                        <i class="fas fa-arrow-right" style="margin-right: 0.5rem; font-size: 0.7rem;"></i>
                        ${suggestion}
                    </button>
                `).join('')}
            </div>
        `;
    } else {
        suggestions.innerHTML = '';
    }
    
    // 현재 질문 저장
    window.currentQuickQuestion = question;
    
    modal.classList.add('show');
}

// 퀵 답변 닫기
function closeQuickAnswer() {
    const modal = document.getElementById('quickAnswerModal');
    modal.classList.remove('show');
}

// AI 채팅에서 더 자세히 물어보기
function askMoreInChat() {
    if (window.currentQuickQuestion) {
        // AI 어시스턴트 페이지로 이동
        switchPage('ai-chat');
        
        // 모달 닫기
        closeQuickAnswer();
        
        // 퀵 질문 숨기기
        if (quickQuestionsVisible) {
            toggleQuickQuestions();
        }
        
        // 채팅에 질문 자동 입력
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = window.currentQuickQuestion.text + ' (자세히 알려주세요)';
                chatInput.focus();
            }
        }, 500);
    }
}

// 조직 구조 분석 생성 (데이터가 있을 때)
function generateOrganizationStructureAnalysis() {
    const summary = generateDataSummary(globalUploadedData);
    if (!summary) return "분석할 데이터가 부족합니다.";
    
    const avgTeamSize = Math.round(summary.totalEmployees / summary.totalDepartments);
    const efficiencyScore = calculateOrganizationEfficiency(summary);
    
    return `📊 <strong>우리 조직 구조 분석 결과</strong><br><br>
    
    <strong>📈 현재 상태:</strong><br>
    • 총 인원: ${summary.totalEmployees}명<br>
    • 부서 수: ${summary.totalDepartments}개<br>
    • 평균 팀 규모: ${avgTeamSize}명<br>
    • 효율성 점수: ${efficiencyScore}/100점<br><br>
    
    <strong>💡 분석 결과:</strong><br>
    ${generateOrganizationInsights(summary, avgTeamSize, efficiencyScore)}<br><br>
    
    <strong>🎯 개선 제안:</strong><br>
    ${generateOrganizationRecommendations(summary, avgTeamSize)}`;
}

// 조직 효율성 점수 계산
function calculateOrganizationEfficiency(summary) {
    let score = 70; // 기본 점수
    
    const avgTeamSize = summary.totalEmployees / summary.totalDepartments;
    
    // 팀 크기 적정성 (+/- 20점)
    if (avgTeamSize >= 5 && avgTeamSize <= 8) {
        score += 20;
    } else if (avgTeamSize >= 3 && avgTeamSize <= 12) {
        score += 10;
    } else {
        score -= 10;
    }
    
    // 조직 규모 (+/- 10점)
    if (summary.totalEmployees >= 30 && summary.totalEmployees <= 200) {
        score += 10;
    } else if (summary.totalEmployees > 200) {
        score += 5;
    }
    
    return Math.min(Math.max(score, 0), 100);
}

// 조직 인사이트 생성
function generateOrganizationInsights(summary, avgTeamSize, score) {
    const insights = [];
    
    if (score >= 80) {
        insights.push("✅ <strong>매우 효율적인 조직 구조</strong>를 가지고 있어요!");
    } else if (score >= 60) {
        insights.push("👍 <strong>양호한 조직 구조</strong>지만 개선의 여지가 있어요");
    } else {
        insights.push("⚠️ <strong>조직 구조 개선이 필요</strong>한 상황이에요");
    }
    
    if (avgTeamSize > 10) {
        insights.push("📊 팀 규모가 큰 편이라 의사소통에 어려움이 있을 수 있어요");
    } else if (avgTeamSize < 3) {
        insights.push("👥 팀 규모가 작아 업무 부담이 클 수 있어요");
    } else {
        insights.push("👥 적정한 팀 규모를 유지하고 있어요");
    }
    
    return insights.join('<br>');
}

// 조직 개선 추천사항 생성
function generateOrganizationRecommendations(summary, avgTeamSize) {
    const recommendations = [];
    
    if (avgTeamSize > 10) {
        recommendations.push("• 대규모 팀을 2-3개 소팀으로 분할 검토");
        recommendations.push("• 팀 내 소그룹 리더 역할 신설");
    } else if (avgTeamSize < 3) {
        recommendations.push("• 유사 업무 팀간 통합 검토");
        recommendations.push("• 크로스 펑셔널 팀 운영 고려");
    }
    
    if (summary.totalDepartments > 8) {
        recommendations.push("• 유사 기능 부서 통폐합 검토");
        recommendations.push("• 매트릭스 조직 구조 도입 고려");
    }
    
    recommendations.push("• 정기적인 조직 진단 및 개편 계획 수립");
    recommendations.push("• 직원 만족도 조사를 통한 조직 효과성 측정");
    
    return recommendations.join('<br>');
}

// 시장 비교 함수
function getMarketComparison() {
    const avgSalary = calculateAverageSalary();
    if (avgSalary === "정보 없음") return "분석 불가";
    
    const avgNum = parseInt(avgSalary.replace(/,/g, ''));
    const marketAvg = 4200000; // 시장 평균 가정
    
    const ratio = (avgNum / marketAvg) * 100;
    
    if (ratio >= 110) {
        return "시장 대비 높은 수준 👍";
    } else if (ratio >= 90) {
        return "시장 평균 수준 😊";
    } else {
        return "시장 대비 낮은 수준 📈";
    }
}

// 페이지 로드 시 퀵 질문 UI 생성
document.addEventListener('DOMContentLoaded', function() {
    // 기존 DOMContentLoaded 내용은 그대로 두고 이것만 추가
    setTimeout(() => {
        createQuickQuestionsUI();
        
        // CSS 스타일 동적 추가 (초기 상태)
        const buttons = document.querySelectorAll('.quick-question-fab');
        buttons.forEach(btn => {
            btn.style.transform = 'translateX(100px)';
            btn.style.opacity = '0';
            btn.style.transition = 'all 0.3s ease';
        });
    }, 1000);
});

// 숫자 추출 및 정리 (단위 처리 포함)
function extractNumericValue(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    let strValue = String(value).trim();
    
    // 한글 단위 처리
    const units = {
        '억': 100000000,
        '천만': 10000000,
        '만': 10000,
        '천': 1000
    };
    
    for (const [unit, multiplier] of Object.entries(units)) {
        if (strValue.includes(unit)) {
            const numPart = strValue.replace(unit, '').replace(/[^0-9.]/g, '');
            const num = parseFloat(numPart);
            return isNaN(num) ? 0 : num * multiplier;
        }
    }
    
    // 일반 숫자 처리 (콤마, 원화 기호 등 제거)
    const cleanValue = strValue.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanValue);
    
    return isNaN(num) ? 0 : num;
}

// 10원 단위 반올림
function roundToTen(number) {
    return Math.round(number / 10) * 10;
}

// 숫자 포맷팅 (10원 단위로 표시)
function formatCurrency(number) {
    if (number === 0) return '0원';
    
    const rounded = roundToTen(number);
    return rounded.toLocaleString() + '원';
}

// 평균 급여 계산 (정확한 버전)
function calculateAverageSalary() {
    const salaryField = findSalaryField();
    if (!salaryField) return "정보 없음";
    
    const salaries = filteredData
        .map(row => extractNumericValue(row[salaryField]))
        .filter(salary => salary > 0);
    
    if (salaries.length === 0) return "급여 데이터 없음";
    
    const sum = salaries.reduce((a, b) => a + b, 0);
    const avg = sum / salaries.length;
    
    console.log(`급여 계산: ${salaries.length}명, 총합: ${sum}, 평균: ${avg}`);
    
    return formatCurrency(avg);
}

// 급여 통계 계산 (정확한 버전)
function calculateSalaryStats(type) {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없어요.<br><br>' +
               '<strong>🔍 지원하는 필드명:</strong><br>급여, 연봉, 월급, 기본급, salary, pay 등<br><br>' +
               '데이터의 컬럼명을 확인해주세요!';
    }
    
    const salaries = filteredData
        .map(row => extractNumericValue(row[salaryField]))
        .filter(salary => salary > 0);
    
    if (salaries.length === 0) {
        return `📊 <strong>${salaryField}</strong> 필드에 유효한 급여 데이터가 없어요.<br><br>` +
               '데이터 형식을 확인해주세요. (예: 3500000, 350만, 3,500,000원 등)';
    }
    
    // 정렬
    const sortedSalaries = [...salaries].sort((a, b) => a - b);
    const max = sortedSalaries[sortedSalaries.length - 1];
    const min = sortedSalaries[0];
    const sum = salaries.reduce((a, b) => a + b, 0);
    const avg = sum / salaries.length;
    const median = sortedSalaries[Math.floor(sortedSalaries.length / 2)];
    
    // 디버그 로그
    console.log(`급여 통계 - 필드: ${salaryField}, 데이터 수: ${salaries.length}`);
    console.log(`최대: ${max}, 최소: ${min}, 평균: ${avg}, 중간값: ${median}`);
    
    switch (type) {
        case 'max':
            return `💰 <strong>최고 급여:</strong> ${formatCurrency(max)}<br>` +
                   `📊 전체 ${salaries.length}명 중 최고 수준이에요!`;
        case 'min':
            return `💰 <strong>최저 급여:</strong> ${formatCurrency(min)}<br>` +
                   `📊 전체 ${salaries.length}명 중 최저 수준이에요.`;
        case 'avg':
            return `💰 <strong>평균 급여:</strong> ${formatCurrency(avg)}<br>` +
                   `📊 ${salaries.length}명 기준 평균값이에요.`;
        default:
            const range = max - min;
            return `📊 <strong>급여 현황 종합 분석</strong><br><br>
            <strong>📈 기본 통계:</strong><br>
            • 최고 급여: ${formatCurrency(max)}<br>
            • 최저 급여: ${formatCurrency(min)}<br>
            • 평균 급여: ${formatCurrency(avg)}<br>
            • 중간값: ${formatCurrency(median)}<br><br>
            <strong>📊 급여 분포:</strong><br>
            • 급여 격차: ${formatCurrency(range)}<br>
            • 분석 대상: ${salaries.length}명<br>
            • 데이터 필드: ${salaryField}<br><br>
            <strong>💡 인사이트:</strong><br>
            ${generateSalaryInsight(min, max, avg, median)}`;
    }
}

// 총 인건비 계산 (정확한 버전)
function calculateTotalLaborCost() {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없어요.<br>컬럼명을 확인해주세요!';
    }
    
    const salaries = filteredData
        .map(row => extractNumericValue(row[salaryField]))
        .filter(salary => salary > 0);
    
    if (salaries.length === 0) {
        return '📊 계산할 수 있는 급여 데이터가 없어요.';
    }
    
    const totalSalary = salaries.reduce((a, b) => a + b, 0);
    const avgSalary = totalSalary / salaries.length;
    const validCount = salaries.length;
    const totalCount = filteredData.length;
    
    console.log(`인건비 계산 - 총액: ${totalSalary}, 평균: ${avgSalary}, 대상: ${validCount}명`);
    
    return `💼 <strong>총 인건비 분석</strong><br><br>
    <strong>💰 현재 기준:</strong><br>
    • 월 총 인건비: ${formatCurrency(totalSalary)}<br>
    • 연 추정 인건비: ${formatCurrency(totalSalary * 12)}<br><br>
    <strong>📊 인원 현황:</strong><br>
    • 급여 데이터 보유: ${validCount}명<br>
    • 전체 데이터: ${totalCount}명<br>
    • 1인 평균 급여: ${formatCurrency(avgSalary)}<br><br>
    <strong>💡 분석 결과:</strong><br>
    ${generateLaborCostInsight(totalSalary, avgSalary, validCount)}`;
}

// 부서별 평균 급여 계산 (정확한 버전)
function calculateDepartmentAverageSalary() {
    const salaryField = findSalaryField();
    if (!salaryField) {
        return '💰 급여 관련 필드를 찾을 수 없어요.';
    }
    
    // 부서별 데이터 수집
    const deptSalaries = {};
    
    filteredData.forEach(row => {
        const dept = row.부서 || row.department || row.팀 || '미분류';
        const salary = extractNumericValue(row[salaryField]);
        
        if (salary > 0) {
            if (!deptSalaries[dept]) {
                deptSalaries[dept] = [];
            }
            deptSalaries[dept].push(salary);
        }
    });
    
    if (Object.keys(deptSalaries).length === 0) {
        return '📊 부서별 급여 데이터가 없어요.';
    }
    
    let result = '📊 <strong>부서별 급여 현황</strong><br><br>';
    
    // 부서별 통계 계산
    const deptStats = [];
    Object.entries(deptSalaries).forEach(([dept, salaries]) => {
        const sum = salaries.reduce((a, b) => a + b, 0);
        const avg = sum / salaries.length;
        const max = Math.max(...salaries);
        const min = Math.min(...salaries);
        
        deptStats.push({
            name: dept,
            avg: avg,
            count: salaries.length,
            max: max,
            min: min
        });
        
        result += `🏢 <strong>${dept}</strong><br>`;
        result += `&nbsp;&nbsp;• 평균: ${formatCurrency(avg)} (${salaries.length}명)<br>`;
        result += `&nbsp;&nbsp;• 범위: ${formatCurrency(min)} ~ ${formatCurrency(max)}<br><br>`;
    });
    
    // 부서간 비교 분석
    if (deptStats.length > 1) {
        const avgs = deptStats.map(d => d.avg);
        const maxDept = deptStats.find(d => d.avg === Math.max(...avgs));
        const minDept = deptStats.find(d => d.avg === Math.min(...avgs));
        
        result += `<strong>📈 부서간 분석:</strong><br>`;
        result += `• 최고 평균: <strong>${maxDept.name}</strong> ${formatCurrency(maxDept.avg)}<br>`;
        result += `• 최저 평균: <strong>${minDept.name}</strong> ${formatCurrency(minDept.avg)}<br>`;
        result += `• 부서간 격차: ${formatCurrency(maxDept.avg - minDept.avg)}<br>`;
    }
    
    return result;
}

// 급여 인사이트 생성
function generateSalaryInsight(min, max, avg, median) {
    const insights = [];
    
    // 급여 격차 분석
    const range = max - min;
    const avgRatio = range / avg;
    
    if (avgRatio > 2) {
        insights.push("급여 격차가 큰 편이에요. 공정성 검토가 필요할 수 있어요.");
    } else if (avgRatio < 0.5) {
        insights.push("급여 구조가 균등한 편이에요. 성과 차별화 여지가 있어요.");
    } else {
        insights.push("적정한 급여 격차를 유지하고 있어요.");
    }
    
    // 평균 vs 중간값 비교
    const medianRatio = avg / median;
    if (medianRatio > 1.2) {
        insights.push("고액 급여자가 평균을 끌어올리고 있어요.");
    } else if (medianRatio < 0.8) {
        insights.push("저액 급여자가 평균을 낮추고 있어요.");
    }
    
    return insights.join('<br>');
}

// 인건비 인사이트 생성
function generateLaborCostInsight(total, avg, count) {
    const insights = [];
    
    // 규모별 분석
    if (count < 10) {
        insights.push("소규모 팀 단위로 인건비 관리가 용이해요.");
    } else if (count < 50) {
        insights.push("중간 규모로 체계적인 급여 관리가 필요해요.");
    } else {
        insights.push("대규모 조직으로 정교한 급여 체계가 중요해요.");
    }
    
    // 평균 급여 수준 코멘트
    if (avg < 3000000) {
        insights.push("시장 대비 경쟁력 있는 급여 수준 검토가 필요해요.");
    } else if (avg > 6000000) {
        insights.push("높은 급여 수준으로 성과 관리에 집중해보세요.");
    } else {
        insights.push("적정한 급여 수준을 유지하고 있어요.");
    }
    
    return insights.join('<br>');
}

// 데이터 디버그 정보 표시 (개발용)
function showDataDebugInfo() {
    if (filteredData.length === 0) {
        console.log('❌ 필터링된 데이터가 없습니다.');
        return;
    }
    
    const salaryField = findSalaryField();
    console.log('🔍 급여 필드:', salaryField);
    
    if (salaryField) {
        const rawValues = filteredData.map(row => row[salaryField]);
        const numericValues = filteredData.map(row => extractNumericValue(row[salaryField]));
        
        console.log('📊 원본 급여 데이터 (처음 5개):', rawValues.slice(0, 5));
        console.log('🔢 변환된 숫자 데이터 (처음 5개):', numericValues.slice(0, 5));
        console.log('✅ 유효한 급여 데이터 개수:', numericValues.filter(v => v > 0).length);
    }
    
    console.log('📋 전체 데이터 샘플:', filteredData[0]);
}

// ============ 전문분석 기능 ============

// 테스트 템플릿 데이터
const professionalTestTemplate = {
    laborCost: [
        { category: '정규직', monthlyCost: 4500000, benefits: 1200000, total: 5700000 },
        { category: '계약직', monthlyCost: 3200000, benefits: 400000, total: 3600000 }
    ],
    contractors: [
        { name: 'A도급사', monthlyFee: 8000000, quality: 85, risk: 'Low' },
        { name: 'B도급사', monthlyFee: 7200000, quality: 78, risk: 'Medium' }
    ],
    freelancers: [
        { type: '개발자', dailyRate: 400000, efficiency: 92, tax: '3.3%' },
        { type: '디자이너', dailyRate: 300000, efficiency: 88, tax: '3.3%' }
    ],
    agencies: [
        { name: 'X대행업체', serviceFee: 15000000, performance: 90, satisfaction: 4.2 },
        { name: 'Y대행업체', serviceFee: 12000000, performance: 82, satisfaction: 3.8 }
    ]
};

// 전문분석 테스트 템플릿 로드
function loadProfessionalTestTemplate() {
    const statusElement = document.getElementById('professionalUploadStatus');
    const resultsElement = document.getElementById('professionalAnalysisResults');
    const testTemplateBtn = document.getElementById('testTemplateBtn');
    const testTemplateText = document.getElementById('testTemplateText');
    
    // 버튼 비활성화 및 로딩 상태
    if (testTemplateBtn) {
        testTemplateBtn.disabled = true;
        testTemplateBtn.className = 'btn btn-secondary modern-btn loading';
    }
    
    if (testTemplateText) {
        testTemplateText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
    }
    
    if (statusElement) {
        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 테스트 데이터 분석 중...';
        statusElement.className = 'upload-status processing';
    }
    
    setTimeout(() => {
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 테스트 템플릿 분석 완료!';
            statusElement.className = 'upload-status success';
        }
        
        if (resultsElement) {
            resultsElement.style.display = 'block';
            // 애니메이션 효과 추가
            resultsElement.style.opacity = '0';
            resultsElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                resultsElement.style.transition = 'all 0.5s ease';
                resultsElement.style.opacity = '1';
                resultsElement.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // 버튼 상태 복원
        if (testTemplateBtn) {
            testTemplateBtn.disabled = false;
            testTemplateBtn.className = 'btn btn-secondary modern-btn';
        }
        
        if (testTemplateText) {
            testTemplateText.textContent = '테스트 템플릿 사용';
        }
        
        // 분석 결과 업데이트
        updateProfessionalAnalysisResults(professionalTestTemplate);
        
    }, 2000);
}

// 전문분석 결과 생성
function generateProfessionalAnalysis(data) {
    return {
        costEfficiency: {
            mostEfficient: '개인사업자',
            leastEfficient: 'A도급사',
            avgCostPerMonth: 6500000
        },
        riskAssessment: {
            lowest: '정규직',
            highest: '개인사업자',
            recommendations: [
                '도급사 계약조건 재검토',
                '개인사업자 세무 리스크 관리',
                '계약직 교육 프로그램 도입',
                '대행업체 성과 관리 체계 구축'
            ]
        },
        qualityMetrics: {
            highest: 'X대행업체 (90점)',
            improvement: '계약직 교육 프로그램 필요'
        }
    };
}

// 전문분석 결과 업데이트
function updateProfessionalAnalysisResults(data) {
    const analysis = generateProfessionalAnalysis(data);
    
    // 카드 업데이트
    const costEfficiencyMain = document.getElementById('costEfficiencyMain');
    const costEfficiencySub = document.getElementById('costEfficiencySub');
    const riskAssessmentMain = document.getElementById('riskAssessmentMain');
    const riskAssessmentSub = document.getElementById('riskAssessmentSub');
    const qualityMetricsMain = document.getElementById('qualityMetricsMain');
    const qualityMetricsSub = document.getElementById('qualityMetricsSub');
    
    if (costEfficiencyMain) {
        costEfficiencyMain.textContent = `최고: ${analysis.costEfficiency.mostEfficient}`;
    }
    if (costEfficiencySub) {
        costEfficiencySub.textContent = `평균 월비용: ${analysis.costEfficiency.avgCostPerMonth.toLocaleString()}원`;
    }
    if (riskAssessmentMain) {
        riskAssessmentMain.textContent = `최저위험: ${analysis.riskAssessment.lowest}`;
    }
    if (riskAssessmentSub) {
        riskAssessmentSub.textContent = `고위험: ${analysis.riskAssessment.highest}`;
    }
    if (qualityMetricsMain) {
        qualityMetricsMain.textContent = analysis.qualityMetrics.highest;
    }
    if (qualityMetricsSub) {
        qualityMetricsSub.textContent = analysis.qualityMetrics.improvement;
    }
    
    // 추천사항 업데이트
    const recommendationsList = document.getElementById('professionalRecommendations');
    if (recommendationsList) {
        recommendationsList.innerHTML = '';
        analysis.riskAssessment.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }
}

// 전문분석 파일 업로드 처리 (통합 데이터 업로드 센터로 리다이렉트)
function handleProfessionalFileUpload(files) {
    // 통합 데이터 업로드 센터로 리다이렉트
    switchPage('data-center');
}

// DOM 로드 시 파일 업로드 이벤트 추가
document.addEventListener('DOMContentLoaded', function() {
    // 통합 데이터 업로드 센터 파일 업로드
    const salaryFileInput = document.getElementById('salaryFileInput');
    if (salaryFileInput) {
        salaryFileInput.addEventListener('change', function(event) {
            handleSalaryFileUpload(event.target.files);
        });
    }
    
    const analysisFileInput = document.getElementById('analysisFileInput');
    if (analysisFileInput) {
        analysisFileInput.addEventListener('change', function(event) {
            handleAnalysisFileUpload(event.target.files);
        });
    }
    
    const employeeFileInput = document.getElementById('employeeFileInput');
    if (employeeFileInput) {
        employeeFileInput.addEventListener('change', function(event) {
            handleEmployeeFileUpload(event.target.files);
        });
    }
});

// 급여 데이터 업로드 처리
function handleSalaryFileUpload(files) {
    if (files.length === 0) return;
    
    const statusElement = document.getElementById('salaryUploadStatus');
    const progressElement = document.getElementById('salaryUploadProgress');
    const progressFill = document.getElementById('salaryProgressFill');
    const progressText = document.getElementById('salaryProgressText');
    
    if (statusElement) {
        statusElement.textContent = '처리중';
        statusElement.className = 'upload-status-badge processing';
    }
    
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    // 진행률 애니메이션
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `업로드 중... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            if (statusElement) {
                statusElement.textContent = '완료';
                statusElement.className = 'upload-status-badge success';
            }
            if (progressText) progressText.textContent = '업로드 완료!';
            updateUploadSummary();
        }
    }, 200);
}

// 분석 데이터 업로드 처리
function handleAnalysisFileUpload(files) {
    if (files.length === 0) return;
    
    const statusElement = document.getElementById('analysisUploadStatus');
    const progressElement = document.getElementById('analysisUploadProgress');
    const progressFill = document.getElementById('analysisProgressFill');
    const progressText = document.getElementById('analysisProgressText');
    
    if (statusElement) {
        statusElement.textContent = '처리중';
        statusElement.className = 'upload-status-badge processing';
    }
    
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    // 진행률 애니메이션
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `분석 중... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            if (statusElement) {
                statusElement.textContent = '완료';
                statusElement.className = 'upload-status-badge success';
            }
            if (progressText) progressText.textContent = '분석 완료!';
            updateUploadSummary();
        }
    }, 200);
}

// 직원 데이터 업로드 처리
function handleEmployeeFileUpload(files) {
    if (files.length === 0) return;
    
    const statusElement = document.getElementById('employeeUploadStatus');
    const progressElement = document.getElementById('employeeUploadProgress');
    const progressFill = document.getElementById('employeeProgressFill');
    const progressText = document.getElementById('employeeProgressText');
    
    if (statusElement) {
        statusElement.textContent = '처리중';
        statusElement.className = 'upload-status-badge processing';
    }
    
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    // 진행률 애니메이션
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `업로드 중... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            if (statusElement) {
                statusElement.textContent = '완료';
                statusElement.className = 'upload-status-badge success';
            }
            if (progressText) progressText.textContent = '업로드 완료!';
            updateUploadSummary();
        }
    }, 200);
}

// 업로드 요약 업데이트
function updateUploadSummary() {
    const summaryElement = document.getElementById('uploadSummary');
    if (summaryElement) {
        summaryElement.style.display = 'block';
    }
    
    // 실제 데이터 개수는 나중에 구현
    const salaryCount = document.getElementById('salaryDataCount');
    const analysisCount = document.getElementById('analysisDataCount');
    const employeeCount = document.getElementById('employeeDataCount');
    
    if (salaryCount) salaryCount.textContent = '15건';
    if (analysisCount) analysisCount.textContent = '8건';
    if (employeeCount) employeeCount.textContent = '25건';
}

// 샘플 데이터 로드 함수들
function loadSampleSalaryData() {
    handleSalaryFileUpload([{name: 'sample_salary.xlsx'}]);
}

function loadSampleEmployeeData() {
    handleEmployeeFileUpload([{name: 'sample_employee.xlsx'}]);
}

// 통합 파일 업로드 처리
async function handleUnifiedFileUpload(files) {
    console.log('파일 업로드 시작:', files.length, '개 파일');
    
    if (files.length === 0) {
        console.warn('업로드할 파일이 없습니다');
        return;
    }
    
    const file = files[0];
    console.log('업로드 파일 정보:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
    });
    
    const statusElement = document.getElementById('unifiedUploadStatus');
    const progressElement = document.getElementById('unifiedUploadProgress');
    const progressFill = document.getElementById('unifiedProgressFill');
    const progressText = document.getElementById('unifiedProgressText');
    
    // 파일 확장자 및 MIME 타입 검증 강화
    const extension = file.name.split('.').pop().toLowerCase();
    const supportedExtensions = ['csv', 'json', 'xlsx', 'xls'];
    const supportedMimeTypes = [
        'application/json',
        'text/json', 
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    
    if (!supportedExtensions.includes(extension)) {
        const message = `지원하지 않는 파일 형식입니다: ${extension}\n지원 형식: ${supportedExtensions.join(', ')}`;
        console.error(message);
        alert(message);
        return;
    }
    
    // JSON 파일인 경우 MIME 타입도 검증
    if (extension === 'json' && file.type && !supportedMimeTypes.includes(file.type)) {
        console.warn('MIME 타입 경고:', file.type, '하지만 확장자가 .json이므로 계속 진행');
    }
    
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        const message = '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해 주세요.';
        console.error(message, 'File size:', file.size);
        alert(message);
        return;
    }
    
    // 빈 파일 검증
    if (file.size === 0) {
        const message = '빈 파일입니다. 데이터가 있는 파일을 업로드해 주세요.';
        console.error(message);
        alert(message);
        return;
    }
    
    // 상태 초기화
    console.log('업로드 상태 초기화');
    if (statusElement) {
        statusElement.textContent = '처리중';
        statusElement.className = 'upload-status-badge processing';
    }
    
    if (progressElement) {
        progressElement.style.display = 'block';
    }
    
    // 진행률 업데이트 함수
    const updateProgress = (percent, message) => {
        console.log(`진행률: ${percent}% - ${message}`);
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = message;
    };
    
    try {
        updateProgress(10, '파일 읽기 시작...');
        
        // 짧은 지연으로 UI 업데이트 허용
        await new Promise(resolve => setTimeout(resolve, 100));
        
        updateProgress(30, '파일 분석 중...');
        
        // 실제 파일 처리
        console.log('파일 처리 시작');
        await processUnifiedFile(file);
        
        updateProgress(100, '업로드 완료!');
        
        // 성공 상태 업데이트
        console.log('업로드 성공 완료');
        if (statusElement) {
            statusElement.textContent = '완료';
            statusElement.className = 'upload-status-badge success';
        }
        
        // React 스타일 성공 메시지 표시
        showUploadMessage('success', `${file.name} 파일이 성공적으로 업로드되었습니다.`);
        
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        console.error('오류 스택:', error.stack);
        
        updateProgress(0, '업로드 실패');
        
        if (statusElement) {
            statusElement.textContent = '실패';
            statusElement.className = 'upload-status-badge failed';
        }
        
        // React 스타일 오류 메시지 표시
        showUploadMessage('error', error.message, {
            fileName: file.name,
            fileSize: file.size,
            fileType: extension
        });
        
        // 진행률 바 숨기기
    setTimeout(() => {
            if (progressElement) {
                progressElement.style.display = 'none';
            }
        }, 3000);
    }
}

// 통합 파일 처리
async function processUnifiedFile(file) {
    console.log('파일 처리 함수 시작:', file.name);
    
    try {
        const extension = file.name.split('.').pop().toLowerCase();
        console.log('파일 확장자:', extension);
        
        let data;
        
        switch (extension) {
            case 'csv':
                console.log('CSV 파싱 시작');
                data = await parseUnifiedCSV(file);
                break;
            case 'json':
                console.log('JSON 파싱 시작');
                data = await parseUnifiedJSON(file);
                
                // JSON 파일의 경우 서버 API로도 전송
                try {
                    console.log('서버 API 전송 시작');
                    const apiResult = await sendToPayrollAPI(data, file.name);
                    console.log('API 업로드 성공:', apiResult);
                    
                    // API 성공 메시지는 handleUnifiedFileUpload에서 처리
                } catch (apiError) {
                    console.warn('API 업로드 실패, 로컬에서만 처리:', apiError);
                    // 경고 메시지는 표시하지 않고 로컬 처리 계속
                }
                break;
            case 'xlsx':
            case 'xls':
                console.log('Excel 파싱 시작');
                data = await parseUnifiedExcel(file);
                break;
            default:
                throw new Error(`지원하지 않는 파일 형식입니다. (${extension})\n지원 형식: CSV, JSON, Excel`);
        }
        
        console.log('파싱 완료, 데이터 검증 시작:', data?.length, '개 레코드');
        
        // 데이터 검증
        if (!data || data.length === 0) {
            throw new Error('파일에서 데이터를 읽을 수 없습니다. 파일 형식을 확인해주세요.');
        }
        
        console.log('데이터 검증 완료, 첫 번째 레코드:', data[0]);
        
        // 업로드 내역에 추가 (성공)
        console.log('업로드 내역 추가');
        addUploadHistoryItem(file.name, getFileTypeFromExtension(file.name), file.size, data.length, 'success', null, data.slice(0, 3));
        
        // 데이터 미리보기 표시
        console.log('미리보기 표시 시작');
        displayUnifiedDataPreview(file.name, data);
        
        // 데이터 분석 수행
        console.log('데이터 분석 시작');
        performUnifiedDataAnalysis(data);
        
        // 로컬 스토리지에 데이터 저장
        console.log('로컬 스토리지 저장 시작');
        saveUnifiedDataToStorage(file.name, data);
        
        console.log('파일 처리 완전 완료');
        
    } catch (error) {
        console.error('파일 처리 오류 상세:', {
            message: error.message,
            stack: error.stack,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });
        
        // 업로드 내역에 추가 (실패)
        addUploadHistoryItem(file.name, getFileTypeFromExtension(file.name), file.size, 0, 'failed', error.message);
        
        // 오류를 다시 throw하여 상위 함수에서 처리
        throw error;
    }
}

// 통합 데이터 미리보기 표시 (React 스타일로 개선)
function displayUnifiedDataPreview(fileName, data) {
    console.log('미리보기 표시 시작:', fileName, data.length, '개 레코드');
    
    const previewSection = document.getElementById('dataPreviewSection');
    const fileNameElement = document.getElementById('previewFileName');
    const recordCountElement = document.getElementById('previewRecordCount');
    const tableHead = document.getElementById('unifiedTableHead');
    const tableBody = document.getElementById('unifiedTableBody');
    
    if (previewSection) previewSection.style.display = 'block';
    if (fileNameElement) fileNameElement.textContent = fileName;
    if (recordCountElement) recordCountElement.textContent = `${data.length.toLocaleString()}개 레코드`;
    
    if (data.length > 0) {
        const allHeaders = Object.keys(data[0]);
        
        // 급여 데이터에 맞는 주요 컬럼 우선 표시
        const priorityColumns = [
            '사번', '성명', '조직', '부서', '직급', '급여영역',
            '기본급', '상여금', '수당', '실지급액', '총지급액',
            '급여일_급여유형', '입사일', 'name', 'salary', 'department'
        ];
        
        // 우선순위에 따라 헤더 정렬
        const sortedHeaders = [
            ...priorityColumns.filter(col => allHeaders.includes(col)),
            ...allHeaders.filter(col => !priorityColumns.includes(col))
        ].slice(0, 8); // 최대 8개 컬럼만 표시
        
        console.log('표시할 컬럼:', sortedHeaders);
        
        // 테이블 헤더 생성
        const headerRow = document.createElement('tr');
        sortedHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = getDisplayColumnName(header);
            th.title = header; // 원본 필드명을 툴팁으로
            headerRow.appendChild(th);
        });
        tableHead.innerHTML = '';
        tableHead.appendChild(headerRow);
        
        // 테이블 바디 생성 (최대 10개 행)
        tableBody.innerHTML = '';
        const maxRows = Math.min(data.length, 10);
        
        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement('tr');
            sortedHeaders.forEach(header => {
                const td = document.createElement('td');
                const value = data[i][header];
                
                // 값 포맷팅
                if (value !== null && value !== undefined) {
                    // 숫자 값 (급여, 금액 등) 포맷팅
                    if (typeof value === 'number' && (
                        header.includes('급여') || header.includes('금액') || 
                        header.includes('수당') || header.includes('상여') ||
                        header.includes('salary') || header.includes('pay')
                    )) {
                        td.textContent = value.toLocaleString() + '원';
                        td.className = 'amount-cell';
                    } 
                    // 날짜 값 포맷팅
                    else if (header.includes('일') || header.includes('date')) {
                        td.textContent = formatDateValue(value);
                        td.className = 'date-cell';
                    }
                    // 일반 값
                    else {
                        td.textContent = String(value);
                    }
                } else {
                    td.textContent = '-';
                    td.className = 'empty-cell';
                }
                
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        }
        
        // 더 많은 데이터가 있을 때 안내 메시지
        if (data.length > maxRows) {
            const moreRow = document.createElement('tr');
            const moreCell = document.createElement('td');
            moreCell.colSpan = sortedHeaders.length;
            moreCell.textContent = `외 ${(data.length - maxRows).toLocaleString()}개 항목...`;
            moreCell.className = 'more-data-cell';
            moreRow.appendChild(moreCell);
            tableBody.appendChild(moreRow);
        }
    }
}

// 컬럼명을 사용자 친화적으로 변환
function getDisplayColumnName(header) {
    const columnMap = {
        '사번': '사번',
        '성명': '성명',
        '조직': '조직',
        '부서': '부서',
        '직급': '직급',
        '급여영역': '급여영역',
        '기본급': '기본급',
        '상여금': '상여금',
        '수당': '수당',
        '실지급액': '실지급액',
        '총지급액': '총지급액',
        '급여일_급여유형': '급여유형',
        '입사일': '입사일',
        'name': '이름',
        'salary': '급여',
        'department': '부서',
        'position': '직급',
        'hire_date': '입사일',
        'emp_id': '사번',
        'employee_id': '사번'
    };
    
    return columnMap[header] || header;
}

// 날짜 값 포맷팅
function formatDateValue(value) {
    if (!value) return '-';
    
    try {
        // 이미 포맷된 날짜 문자열인 경우
        if (typeof value === 'string' && value.includes('-')) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('ko-KR');
            }
        }
        // 숫자나 다른 형식인 경우
        return String(value);
    } catch (error) {
        return String(value);
    }
}

// 통합 데이터 분석 수행 (React 컴포넌트 스타일로 개선)
function performUnifiedDataAnalysis(data) {
    console.log('데이터 분석 시작, 레코드 수:', data.length);
    
    const analysisSection = document.getElementById('analysisSection');
    const totalRecordsElement = document.getElementById('totalRecords');
    const totalColumnsElement = document.getElementById('totalColumns');
    const dataTypeElement = document.getElementById('dataType');
    
    if (analysisSection) analysisSection.style.display = 'block';
    if (totalRecordsElement) totalRecordsElement.textContent = data.length.toLocaleString();
    if (totalColumnsElement && data.length > 0) {
        totalColumnsElement.textContent = Object.keys(data[0]).length;
    }
    
    // 향상된 데이터 타입 분석
    if (dataTypeElement && data.length > 0) {
        const sampleRecord = data[0];
        const allKeys = Object.keys(sampleRecord);
        console.log('데이터 분석 - 전체 키:', allKeys);
        
        // 급여 관련 키워드
        const salaryKeywords = ['급여', 'salary', '지급', '기본급', '상여', '수당', 'pay', 'wage'];
        const employeeKeywords = ['직원', 'employee', '사원', '성명', 'name', '사번', 'emp_id', 'id'];
        const hrKeywords = ['부서', 'department', '직급', 'position', '입사일', 'hire_date'];
        
        const hasSalary = allKeys.some(key => 
            salaryKeywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))
        );
        const hasEmployee = allKeys.some(key => 
            employeeKeywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))
        );
        const hasHR = allKeys.some(key => 
            hrKeywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        let dataType = '일반 데이터';
        if (hasSalary && hasEmployee) {
            dataType = '💰 급여 데이터';
        } else if (hasEmployee && hasHR) {
            dataType = '👥 인사 정보';
        } else if (hasEmployee) {
            dataType = '👤 직원 정보';
        } else if (hasSalary) {
            dataType = '💳 지급 정보';
        }
        
        dataTypeElement.textContent = dataType;
        
        // 추가 정보 표시
        const analysisContent = document.getElementById('unifiedAnalysisContent');
        if (analysisContent) {
            // 기존 요약 정보 유지하고 추가 정보 표시
            const additionalInfo = document.createElement('div');
            additionalInfo.className = 'additional-analysis-info';
            additionalInfo.innerHTML = `
                <div class="analysis-details">
                    <h4><i class="fas fa-info-circle"></i> 데이터 상세 정보</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">주요 필드:</span>
                            <span class="detail-value">${allKeys.slice(0, 5).join(', ')}${allKeys.length > 5 ? '...' : ''}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">데이터 품질:</span>
                            <span class="detail-value">${getDataQualityScore(data)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">파일 크기:</span>
                            <span class="detail-value">${(JSON.stringify(data).length / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                </div>
            `;
            
            // 기존 추가 정보가 있으면 제거 후 새로 추가
            const existingAdditional = analysisContent.querySelector('.additional-analysis-info');
            if (existingAdditional) {
                existingAdditional.remove();
            }
            analysisContent.appendChild(additionalInfo);
        }
    }
    
    console.log('데이터 분석 완료');
}

// 데이터 품질 점수 계산
function getDataQualityScore(data) {
    if (!data || data.length === 0) return '❌ 데이터 없음';
    
    let score = 0;
    let checks = 0;
    
    // 1. 데이터 일관성 체크
    const firstKeys = Object.keys(data[0]).sort();
    const consistentRows = data.filter(item => {
        const currentKeys = Object.keys(item || {}).sort();
        return JSON.stringify(currentKeys) === JSON.stringify(firstKeys);
    });
    
    const consistencyRatio = consistentRows.length / data.length;
    score += consistencyRatio * 30;
    checks += 30;
    
    // 2. 빈 값 체크
    let totalFields = 0;
    let filledFields = 0;
    
    data.slice(0, Math.min(100, data.length)).forEach(row => {
        Object.values(row || {}).forEach(value => {
            totalFields++;
            if (value !== null && value !== undefined && value !== '') {
                filledFields++;
            }
        });
    });
    
    const fillRatio = totalFields > 0 ? filledFields / totalFields : 0;
    score += fillRatio * 30;
    checks += 30;
    
    // 3. 데이터 크기 적정성
    if (data.length >= 10) score += 20;
    else if (data.length >= 5) score += 15;
    else if (data.length >= 1) score += 10;
    checks += 20;
    
    // 4. 필드 개수 적정성
    const fieldCount = firstKeys.length;
    if (fieldCount >= 5) score += 20;
    else if (fieldCount >= 3) score += 15;
    else if (fieldCount >= 1) score += 10;
    checks += 20;
    
    const finalScore = Math.round((score / checks) * 100);
    
    if (finalScore >= 90) return '🟢 우수';
    if (finalScore >= 70) return '🟡 양호';
    if (finalScore >= 50) return '🟠 보통';
    return '🔴 개선 필요';
}

// 샘플 통합 데이터 로드
function loadSampleUnifiedData() {
    console.log('샘플 데이터 로드 시작');
    
    const sampleData = [
        {
            "사번": "EMP001",
            "성명": "김철수",
            "부서": "개발팀",
            "직급": "사원",
            "급여": 3500000,
            "입사일": "2020-03-15"
        },
        {
            "사번": "EMP002",
            "성명": "이영희",
            "부서": "마케팅팀",
            "직급": "대리",
            "급여": 4200000,
            "입사일": "2018-07-22"
        },
        {
            "사번": "EMP003",
            "성명": "박민수",
            "부서": "개발팀",
            "직급": "팀장",
            "급여": 5500000,
            "입사일": "2015-11-08"
        }
    ];
    
    // 샘플 데이터로 미리보기 표시
    displayUnifiedDataPreview('sample_data.json', sampleData);
    performUnifiedDataAnalysis(sampleData);
    
    // 상태 업데이트
    const statusElement = document.getElementById('unifiedUploadStatus');
    if (statusElement) {
        statusElement.textContent = '완료';
        statusElement.className = 'upload-status-badge success';
    }
    
    // 업로드 내역에 추가
    addUploadHistoryItem('sample_data.json', 'JSON', 2048, 3, 'success', null, sampleData.slice(0, 2));
    
    console.log('샘플 데이터 로드 완료');
}

// 테스트용 JSON 파일 다운로드 함수 (실제 급여 데이터 형식)
function downloadSampleJSON() {
    const sampleData = [
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "본사",
            "사번": "EMP001",
            "성명": "김철수",
            "조직": "IT개발팀",
            "직급": "사원",
            "기본급": 3000000,
            "상여금": 800000,
            "수당": 500000,
            "총지급액": 4300000,
            "공제액": 400000,
            "실지급액": 3900000,
            "입사일": "2020-03-15"
        },
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "본사",
            "사번": "EMP002",
            "성명": "이영희",
            "조직": "마케팅팀",
            "직급": "대리",
            "기본급": 3800000,
            "상여금": 1000000,
            "수당": 600000,
            "총지급액": 5400000,
            "공제액": 540000,
            "실지급액": 4860000,
            "입사일": "2018-07-22"
        },
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "본사",
            "사번": "EMP003",
            "성명": "박민수",
            "조직": "IT개발팀",
            "직급": "팀장",
            "기본급": 5000000,
            "상여금": 1500000,
            "수당": 800000,
            "총지급액": 7300000,
            "공제액": 730000,
            "실지급액": 6570000,
            "입사일": "2015-11-08"
        },
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "지점",
            "사번": "EMP004",
            "성명": "정지원",
            "조직": "영업팀",
            "직급": "과장",
            "기본급": 4200000,
            "상여금": 1200000,
            "수당": 700000,
            "총지급액": 6100000,
            "공제액": 610000,
            "실지급액": 5490000,
            "입사일": "2019-09-01"
        },
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "본사",
            "사번": "EMP005",
            "성명": "최현우",
            "조직": "인사팀",
            "직급": "차장",
            "기본급": 4800000,
            "상여금": 1400000,
            "수당": 900000,
            "총지급액": 7100000,
            "공제액": 710000,
            "실지급액": 6390000,
            "입사일": "2017-02-14"
        }
    ];
    
    const jsonString = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_employee_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('샘플 JSON 파일 다운로드 시작');
}

// 통합 CSV 파싱
function parseUnifiedCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n').filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    throw new Error('CSV 파일에 데이터가 부족합니다. 헤더와 최소 1개의 데이터 행이 필요합니다.');
                }
                
                // 헤더 파싱
                const headers = lines[0].split(',').map(header => header.trim().replace(/['"]/g, ''));
                
                // 데이터 파싱
                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length !== headers.length) {
                        console.warn(`Line ${i + 1}: 컬럼 수가 맞지 않습니다. 스킵합니다.`);
                        continue;
                    }
                    
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    data.push(row);
                }
                
                if (data.length === 0) {
                    throw new Error('유효한 데이터 행이 없습니다.');
                }
                
                resolve(data);
            } catch (error) {
                reject(new Error(`CSV 파싱 오류: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsText(file, 'UTF-8');
    });
}

// CSV 라인 파싱 (쉼표와 따옴표 처리)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// 통합 JSON 파싱 (React 컴포넌트 스타일로 개선)
function parseUnifiedJSON(file) {
    return new Promise((resolve, reject) => {
        console.log('JSON 파싱 시작, 파일 크기:', file.size);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('파일 읽기 완료, 텍스트 길이:', e.target.result?.length);
            
            try {
                const jsonText = e.target.result;
                
                // 빈 파일 체크
                if (!jsonText || jsonText.trim() === '') {
                    throw new Error('파일이 비어있습니다.');
                }
                
                console.log('JSON 파싱 시도, 첫 100자:', jsonText.substring(0, 100));
                
                // 대용량 파일 처리 최적화
                let data;
                if (jsonText.length > 5 * 1024 * 1024) { // 5MB 이상
                    console.log('대용량 파일 감지, 청크 방식으로 파싱');
                    data = SafeJSONParser.parseStream(jsonText);
                } else {
                    console.log('SafeJSONParser로 파싱 시도');
                    data = SafeJSONParser.parse(jsonText);
                }
                
                console.log('JSON 파싱 성공, 데이터 타입:', typeof data, Array.isArray(data) ? '배열' : '객체');
                
                // 배열이 아닌 경우 배열로 변환
                if (!Array.isArray(data)) {
                    if (typeof data === 'object' && data !== null) {
                        console.log('단일 객체를 배열로 변환');
                        data = [data];
                    } else {
                        throw new Error('JSON 파일은 객체 배열 형태여야 합니다. 현재 데이터 타입: ' + typeof data);
                    }
                }
                
                console.log('배열 변환 후 길이:', data.length);
                
                if (data.length === 0) {
                    throw new Error('JSON 파일에 데이터가 없습니다.');
                }
                
                // 첫 번째 항목이 유효한 객체인지 확인
                if (typeof data[0] !== 'object' || data[0] === null) {
                    throw new Error('JSON 배열의 첫 번째 항목이 올바른 객체가 아닙니다.');
                }
                
                // 필수 필드 검증 (급여 데이터 기준)
                const firstRecord = data[0];
                const possibleNameFields = ['성명', 'name', '이름', '직원명'];
                const possibleIdFields = ['사번', 'id', '직원번호', 'emp_id'];
                
                const hasNameField = possibleNameFields.some(field => field in firstRecord);
                const hasIdField = possibleIdFields.some(field => field in firstRecord);
                
                if (!hasNameField && !hasIdField) {
                    console.warn('권장 필드 누락: 성명 또는 사번 필드가 없습니다. 계속 진행합니다.');
                }
                
                // 모든 객체가 동일한 구조인지 확인
                const firstKeys = Object.keys(data[0]).sort();
                console.log('첫 번째 객체의 키:', firstKeys);
                
                const invalidRows = data.filter((item, index) => {
                    if (typeof item !== 'object' || item === null) {
                        if (index < 5) console.warn(`인덱스 ${index}: 객체가 아님`, item);
                        return true;
                    }
                    const currentKeys = Object.keys(item).sort();
                    const isValid = JSON.stringify(currentKeys) === JSON.stringify(firstKeys);
                    if (!isValid && index < 5) {
                        console.warn(`인덱스 ${index}: 키 구조 불일치`, currentKeys, 'vs', firstKeys);
                    }
                    return !isValid;
                });
                
                if (invalidRows.length > 0) {
                    console.warn(`${invalidRows.length}개의 행이 일관성 없는 구조를 가지고 있습니다.`);
                    if (invalidRows.length < 10) {
                        console.warn('문제 행들:', invalidRows);
                    }
                    
                    // 일관성 없는 행이 30% 이상이면 경고
                    if (invalidRows.length / data.length > 0.3) {
                        throw new Error(`데이터 일관성 부족: ${Math.round(invalidRows.length / data.length * 100)}%의 행이 다른 구조를 가지고 있습니다.`);
                    }
                }
                
                console.log('JSON 파싱 완료, 최종 데이터 길이:', data.length);
                console.log('첫 번째 레코드 샘플:', data[0]);
                
                resolve(data);
            } catch (error) {
                console.error('JSON 파싱 중 오류:', error);
                if (e.target.result && typeof e.target.result === 'string') {
                    console.error('원본 텍스트 샘플:', e.target.result.substring(0, 500));
                }
                reject(new Error(`JSON 파싱 오류: ${error.message}`));
            }
        };
        
        reader.onerror = (error) => {
            console.error('파일 읽기 오류:', error);
            reject(new Error('파일을 읽을 수 없습니다.'));
        };
        
        console.log('FileReader로 파일 읽기 시작');
        reader.readAsText(file, 'UTF-8');
    });
}

// 대용량 JSON 파일을 청크 단위로 파싱
function parseJSONInChunks(jsonText) {
    try {
        // 메모리 효율적인 파싱을 위해 여전히 JSON.parse 사용
        // 실제 스트리밍 파서는 복잡하므로 향후 개선 예정
        return JSON.parse(jsonText);
    } catch (error) {
        throw new Error('대용량 JSON 파싱 실패: ' + error.message);
    }
}

// 통합 Excel 파싱 (기본적인 구현)
function parseUnifiedExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Excel 파일의 기본적인 처리를 위해 CSV 변환을 권장
                reject(new Error('Excel 파일 지원을 위해서는 추가 라이브러리가 필요합니다.\nCSV 형식으로 변환 후 업로드해 주세요.\n\n변환 방법:\n1. Excel에서 파일 열기\n2. "다른 이름으로 저장" 클릭\n3. 파일 형식을 "CSV (쉼표로 분리)"로 선택\n4. 저장 후 업로드'));
            } catch (error) {
                reject(new Error(`Excel 파싱 오류: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsArrayBuffer(file);
    });
}

// 데이터를 로컬 스토리지에 저장
function saveUnifiedDataToStorage(fileName, data) {
    try {
        const timestamp = new Date().toISOString();
        const savedData = {
            fileName: fileName,
            data: data,
            uploadTime: timestamp,
            recordCount: data.length
        };
        
        // 최근 업로드 데이터 저장 (최대 5개)
        let recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
        recentUploads.unshift(savedData);
        recentUploads = recentUploads.slice(0, 5); // 최대 5개만 유지
        
        localStorage.setItem('recentUploads', JSON.stringify(recentUploads));
        localStorage.setItem(`uploadedData_${fileName}_${Date.now()}`, JSON.stringify(savedData));
        
        console.log(`데이터 저장 완료: ${fileName} (${data.length}개 레코드)`);
    } catch (error) {
        console.error('데이터 저장 오류:', error);
    }
}

// 저장된 데이터 목록 조회
function getSavedDataList() {
    try {
        return JSON.parse(localStorage.getItem('recentUploads') || '[]');
    } catch (error) {
        console.error('저장된 데이터 조회 오류:', error);
        return [];
    }
}

function getFileTypeFromExtension(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'xlsx':
        case 'xls':
            return 'Excel';
        case 'csv':
            return 'CSV';
        case 'json':
            return 'JSON';
        default:
            return 'Unknown';
    }
}

// React 스타일 메시지 시스템
function showUploadMessage(type, message, details = null) {
    // 기존 메시지 제거
    removeUploadMessage();
    
    const messageContainer = document.createElement('div');
    messageContainer.id = 'upload-message';
    messageContainer.className = `upload-message ${type}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const iconColor = type === 'success' ? '#10b981' : '#ef4444';
    const bgColor = type === 'success' ? '#ecfdf5' : '#fef2f2';
    const borderColor = type === 'success' ? '#d1fae5' : '#fecaca';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';
    
    messageContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        padding: 1rem;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    let messageHTML = `
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <i class="fas ${iconClass}" style="color: ${iconColor}; margin-top: 2px; font-size: 1.25rem;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: ${textColor}; margin-bottom: 0.25rem;">
                    ${type === 'success' ? '성공' : '오류'}
                </div>
                <div style="color: ${textColor}; font-size: 0.875rem; line-height: 1.4;">
                    ${message}
                </div>
    `;
    
    if (details) {
        messageHTML += `
                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid ${borderColor}; font-size: 0.75rem; color: ${textColor};">
                    <div>파일: ${details.fileName}</div>
                    <div>크기: ${Math.round(details.fileSize / 1024)}KB</div>
                    <div>형식: ${details.fileType}</div>
                </div>
        `;
    }
    
    messageHTML += `
            </div>
            <button onclick="removeUploadMessage()" style="
                background: none; 
                border: none; 
                color: ${textColor}; 
                cursor: pointer; 
                padding: 0.25rem;
                font-size: 1rem;
            ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    messageContainer.innerHTML = messageHTML;
    document.body.appendChild(messageContainer);
    
    // 5초 후 자동 제거
    setTimeout(removeUploadMessage, 5000);
}

function removeUploadMessage() {
    const existing = document.getElementById('upload-message');
    if (existing) {
        existing.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }
        }, 300);
    }
}

// CSS 애니메이션 추가
function addMessageAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 페이지 로드 시 애니메이션 CSS 추가
document.addEventListener('DOMContentLoaded', addMessageAnimations);

// TypeScript 스타일 파일 검증 클래스
class FileValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileValidationError';
    }
}

// 급여 파일 검증 함수
function validatePayrollFile(file) {
    console.log('파일 검증 시작:', file.name, file.type, file.size);
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/json', 'text/plain', 'text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.json', '.txt', '.csv', '.xlsx', '.xls'];

    if (file.size > maxSize) {
        throw new FileValidationError('파일 크기가 10MB를 초과합니다.');
    }

    const hasValidType = allowedTypes.includes(file.type) || file.type === '';
    const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
        throw new FileValidationError('지원하지 않는 파일 형식입니다. JSON, CSV, Excel 파일만 업로드 가능합니다.');
    }
    
    console.log('파일 검증 통과');
}

// 급여 데이터 검증 함수
function validatePayrollData(data) {
    console.log('데이터 검증 시작, 레코드 수:', data?.length);
    
    if (!Array.isArray(data)) {
        throw new FileValidationError('올바른 배열 형태가 아닙니다.');
    }

    if (data.length === 0) {
        throw new FileValidationError('빈 데이터입니다.');
    }

    const requiredFields = ['사번', '성명', '급여영역'];
    const alternativeFields = {
        '사번': ['사번', 'emp_id', 'employee_id', 'id'],
        '성명': ['성명', 'name', '이름', '직원명'],
        '급여영역': ['급여영역', 'payroll_area', '지역', 'area']
    };
    
    const firstRecord = data[0];
    const missingFields = [];
    
    for (const field of requiredFields) {
        const alternatives = alternativeFields[field] || [field];
        const hasField = alternatives.some(alt => firstRecord.hasOwnProperty(alt));
        
        if (!hasField) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        console.warn(`권장 필드 누락: ${missingFields.join(', ')}`);
        // 경고만 표시하고 계속 진행 (완전 차단하지 않음)
        showUploadMessage('warning', `권장 필드가 누락되었습니다: ${missingFields.join(', ')}\n계속 진행합니다.`);
    }
    
    console.log('데이터 검증 통과');
}

// 급여 API로 데이터 전송
async function sendToPayrollAPI(data, fileName) {
    console.log('API 전송 시작:', fileName, data.length, '개 레코드');
    console.log('전송할 데이터 타입:', typeof data, Array.isArray(data) ? '배열' : '비배열');
    console.log('전송할 데이터 샘플:', data.slice(0, 1));
    
    try {
        // 파일 이름과 데이터를 함께 전송
        const payload = {
            fileName: fileName,
            data: data
        };
        
        console.log('전송할 payload 구조:', {
            fileName: payload.fileName,
            dataType: typeof payload.data,
            isArray: Array.isArray(payload.data),
            dataLength: payload.data?.length
        });
        
        const payloadString = JSON.stringify(payload);
        console.log('JSON 문자열 길이:', payloadString.length);
        console.log('JSON 문자열 시작 100자:', payloadString.substring(0, 100));
        
        const response = await fetch('/api/payroll/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payloadString
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `서버 오류: ${response.status}`);
        }
        
        if (!result.success) {
            throw new Error(result.error || '업로드 실패');
        }
        
        console.log('API 전송 성공:', result);
        return result;
        
    } catch (error) {
        console.error('API 전송 오류:', error);
        throw error;
    }
}

// 서버에서 업로드된 파일 목록 가져오기
async function fetchServerFileList() {
    try {
        const response = await fetch('/api/payroll/list');
        const result = await response.json();
        
        if (result.success) {
            console.log('서버 파일 목록:', result.files);
            return result.files;
        } else {
            throw new Error(result.error || '파일 목록 조회 실패');
        }
    } catch (error) {
        console.error('서버 파일 목록 조회 오류:', error);
        return [];
    }
}

// 서버에서 파일 삭제
async function deleteServerFile(fileName) {
    try {
        const response = await fetch('/api/payroll/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('서버 파일 삭제 성공:', fileName);
            showUploadMessage('success', `${fileName} 파일이 서버에서 삭제되었습니다.`);
            return true;
        } else {
            throw new Error(result.error || '파일 삭제 실패');
        }
    } catch (error) {
        console.error('서버 파일 삭제 오류:', error);
        showUploadMessage('error', `서버 파일 삭제 실패: ${error.message}`);
        return false;
    }
}

// 업로드 화면 관리 함수들
function refreshUploadHistory() {
    loadUploadHistory();
}

function clearUploadHistory() {
    if (confirm('업로드 내역을 모두 삭제하시겠습니까?')) {
        localStorage.removeItem('uploadHistory');
        loadUploadHistory();
        alert('업로드 내역이 삭제되었습니다.');
    }
}

async function loadUploadHistory() {
    console.log('업로드 내역 로딩 시작 (서버 파일 포함)');
    
    // 로컬 스토리지에서 클라이언트 업로드 내역 가져오기
    let localHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    
    // 서버에서 파일 목록 가져오기
    const serverFiles = await fetchServerFileList();
    console.log('서버 파일 목록:', serverFiles.length, '개');
    
    // 서버 파일을 업로드 내역 형식으로 변환
    const serverHistory = serverFiles.map(file => ({
        id: 'server-' + file.fileName.replace(/[^a-zA-Z0-9]/g, '-'),
        fileName: file.fileName + ' 🌐',
        fileType: 'JSON (서버)',
        fileSize: file.size,
        recordCount: null, // 서버에서는 레코드 수를 알 수 없음
        uploadDate: file.uploadedAt,
        status: 'server',
        errorMessage: null,
        dataPreview: null,
        isServerFile: true
    }));
    
    // 빈 상태라면 샘플 데이터 추가 (로컬만)
    if (localHistory.length === 0) {
        localHistory = [
            {
                id: '1',
                fileName: 'sample_employee_data.csv',
                fileType: 'CSV',
                fileSize: 15680,
                recordCount: 50,
                uploadDate: new Date(Date.now() - 86400000).toISOString(),
                status: 'success',
                dataPreview: [
                    {"사번": "EMP001", "성명": "김철수", "부서": "개발팀", "급여": 3500000},
                    {"사번": "EMP002", "성명": "이영희", "부서": "마케팅팀", "급여": 4200000}
                ]
            },
            {
                id: '2',
                fileName: 'salary_data_2024_01.json',
                fileType: 'JSON',
                fileSize: 25430,
                recordCount: 120,
                uploadDate: new Date(Date.now() - 172800000).toISOString(),
                status: 'success'
            }
        ];
        localStorage.setItem('uploadHistory', JSON.stringify(localHistory));
    }
    
    // 로컬과 서버 파일 합치기
    const combinedHistory = [...localHistory, ...serverHistory];
    
    // 업로드 날짜 기준으로 정렬 (최신 순)
    combinedHistory.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    console.log('총 파일 수:', combinedHistory.length, '(로컬:', localHistory.length, ', 서버:', serverHistory.length, ')');
    
    // 통계 업데이트
    updateUploadStats(combinedHistory);
    
    // 파일 목록 업데이트
    updateUploadFilesList(combinedHistory);
}

function updateUploadStats(uploadHistory) {
    const totalFiles = uploadHistory.length;
    const successfulUploads = uploadHistory.filter(item => item.status === 'success').length;
    const failedUploads = uploadHistory.filter(item => item.status === 'failed').length;
    const totalRecords = uploadHistory.reduce((sum, item) => sum + (item.recordCount || 0), 0);
    
    const totalFilesElement = document.getElementById('totalUploadedFiles');
    const successfulElement = document.getElementById('successfulUploads');
    const failedElement = document.getElementById('failedUploads');
    const totalRecordsElement = document.getElementById('totalRecordsUploaded');
    
    if (totalFilesElement) totalFilesElement.textContent = totalFiles;
    if (successfulElement) successfulElement.textContent = successfulUploads;
    if (failedElement) failedElement.textContent = failedUploads;
    if (totalRecordsElement) totalRecordsElement.textContent = totalRecords.toLocaleString();
}

function updateUploadFilesList(uploadHistory) {
    const tableBody = document.getElementById('uploadFilesTableBody');
    if (!tableBody) return;
    
    if (uploadHistory.length === 0) {
        tableBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>업로드된 파일이 없습니다</p>
                <button class="btn" onclick="switchPage('data-center')">
                    <i class="fas fa-upload"></i> 파일 업로드하기
                </button>
            </div>
        `;
        return;
    }
    
    tableBody.innerHTML = uploadHistory.map(item => `
        <div class="table-row">
            <div class="table-col">
                <div class="file-info">
                    <i class="fas ${getFileIcon(item.fileName)}"></i>
                    <span>${item.fileName}</span>
                </div>
            </div>
            <div class="table-col">${item.fileType || 'Unknown'}</div>
            <div class="table-col">${formatFileSize(item.fileSize || 0)}</div>
            <div class="table-col">${(item.recordCount || 0).toLocaleString()}</div>
            <div class="table-col">${formatDate(item.uploadDate)}</div>
            <div class="table-col">
                <span class="status-badge ${item.status}">${getStatusText(item.status)}</span>
            </div>
            <div class="table-col">
                <button class="btn-icon" onclick="viewFileDetail('${item.id}')" title="상세보기">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon danger" onclick="deleteUploadItem('${item.id}')" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'xlsx':
        case 'xls':
            return 'fa-file-excel';
        case 'csv':
            return 'fa-file-csv';
        case 'json':
            return 'fa-file-code';
        default:
            return 'fa-file';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
}

function getStatusText(status) {
    switch (status) {
        case 'success':
            return '성공';
        case 'failed':
            return '실패';
        case 'processing':
            return '처리중';
        default:
            return '알 수 없음';
    }
}

function viewFileDetail(fileId) {
    const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    const fileItem = uploadHistory.find(item => item.id === fileId);
    
    if (!fileItem) {
        alert('파일 정보를 찾을 수 없습니다.');
        return;
    }
    
    const modal = document.getElementById('fileDetailModal');
    const content = document.getElementById('fileDetailContent');
    
    if (modal && content) {
        content.innerHTML = `
            <div class="file-detail-info">
                <div class="detail-row">
                    <strong>파일명:</strong> ${fileItem.fileName}
                </div>
                <div class="detail-row">
                    <strong>파일 타입:</strong> ${fileItem.fileType || 'Unknown'}
                </div>
                <div class="detail-row">
                    <strong>파일 크기:</strong> ${formatFileSize(fileItem.fileSize || 0)}
                </div>
                <div class="detail-row">
                    <strong>레코드 수:</strong> ${(fileItem.recordCount || 0).toLocaleString()}개
                </div>
                <div class="detail-row">
                    <strong>업로드 일시:</strong> ${formatDate(fileItem.uploadDate)}
                </div>
                <div class="detail-row">
                    <strong>상태:</strong> <span class="status-badge ${fileItem.status}">${getStatusText(fileItem.status)}</span>
                </div>
                ${fileItem.errorMessage ? `
                    <div class="detail-row">
                        <strong>오류 메시지:</strong> 
                        <div class="error-message">${fileItem.errorMessage}</div>
                    </div>
                ` : ''}
                ${fileItem.dataPreview ? `
                    <div class="detail-row">
                        <strong>데이터 미리보기:</strong>
                        <div class="data-preview-mini">
                            <pre>${JSON.stringify(fileItem.dataPreview, null, 2)}</pre>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        modal.style.display = 'block';
    }
}

function closeFileDetailModal() {
    const modal = document.getElementById('fileDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function deleteUploadItem(fileId) {
    if (confirm('이 업로드 내역을 삭제하시겠습니까?')) {
        const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        const updatedHistory = uploadHistory.filter(item => item.id !== fileId);
        localStorage.setItem('uploadHistory', JSON.stringify(updatedHistory));
        loadUploadHistory();
    }
}

function addUploadHistoryItem(fileName, fileType, fileSize, recordCount, status, errorMessage = null, dataPreview = null) {
    const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    const newItem = {
        id: Date.now().toString(),
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        recordCount: recordCount,
        uploadDate: new Date().toISOString(),
        status: status,
        errorMessage: errorMessage,
        dataPreview: dataPreview
    };
    uploadHistory.unshift(newItem); // 최신 항목을 앞에 추가
    localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
}

// 전문가 분석&예측 탭 전환 함수
function switchExpertTab(tabName) {
    console.log('전문가 탭 전환:', tabName); // 디버깅용
    
    // 모든 탭 버튼 비활성화
    const tabButtons = document.querySelectorAll('.expert-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // 모든 탭 콘텐츠 숨기기
    const tabContents = document.querySelectorAll('.expert-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    const selectedButton = document.querySelector(`[onclick="switchExpertTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
        console.log('탭 버튼 활성화됨:', tabName);
    } else {
        console.log('탭 버튼을 찾을 수 없음:', tabName);
    }
    
    // 선택된 탭 콘텐츠 표시
    const selectedContent = document.getElementById(`expert-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        console.log('탭 콘텐츠 활성화됨:', tabName);
    } else {
        console.log('탭 콘텐츠를 찾을 수 없음:', tabName);
    }
}

// 전문가 HC ROI 분석 실행 함수
function runExpertAnalysis() {
    const analyzeBtn = document.getElementById('expertAnalyzeBtn');
    const loadingDiv = document.getElementById('expert-loading');
    const resultsDiv = document.getElementById('expert-results');
    
    // 버튼 비활성화 및 로딩 표시
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '🔄 AI 분석 중...';
    }
    
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
    
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
    
    // AI 분석 시뮬레이션 (3초)
    setTimeout(() => {
        // 샘플 데이터
        const departmentCosts = [
            { name: '개발팀', cost: 450000000, headcount: 45, productivity: 95 },
            { name: '마케팅팀', cost: 280000000, headcount: 28, productivity: 88 },
            { name: '영업팀', cost: 320000000, headcount: 32, productivity: 92 },
            { name: '인사팀', cost: 180000000, headcount: 18, productivity: 85 },
            { name: '재무팀', cost: 150000000, headcount: 15, productivity: 90 }
        ];
        
        const totalCost = departmentCosts.reduce((sum, dept) => sum + dept.cost, 0);
        const totalHeadcount = departmentCosts.reduce((sum, dept) => sum + dept.headcount, 0);
        const avgProductivity = departmentCosts.reduce((sum, dept) => sum + dept.productivity, 0) / departmentCosts.length;
        
        const predictedRevenue = totalCost * (avgProductivity / 100) * 2.3; // AI 예측 모델
        const hcRoi = ((predictedRevenue - totalCost) / totalCost * 100).toFixed(2);
        const riskLevel = hcRoi > 80 ? 'LOW' : hcRoi > 50 ? 'MEDIUM' : 'HIGH';
        
        // 결과 업데이트
        const roiValue = document.getElementById('expertRoiValue');
        const riskLevelElement = document.getElementById('expertRiskLevel');
        const totalCostElement = document.getElementById('expertTotalCost');
        const totalHeadcountElement = document.getElementById('expertTotalHeadcount');
        const avgProductivityElement = document.getElementById('expertAvgProductivity');
        const predictedRevenueElement = document.getElementById('expertPredictedRevenue');
        
        if (roiValue) roiValue.textContent = hcRoi + '%';
        if (riskLevelElement) riskLevelElement.textContent = `리스크: ${riskLevel}`;
        if (totalCostElement) totalCostElement.textContent = `₩${(totalCost/100000000).toFixed(1)}억`;
        if (totalHeadcountElement) totalHeadcountElement.textContent = `${totalHeadcount}명`;
        if (avgProductivityElement) avgProductivityElement.textContent = `${avgProductivity.toFixed(1)}%`;
        if (predictedRevenueElement) predictedRevenueElement.textContent = `₩${(predictedRevenue/100000000).toFixed(1)}억`;
        
        // 로딩 숨기고 결과 표시
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
        }
        
        // 버튼 복원
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '🚀 최신 HC ROI 분석 실행';
        }
        
    }, 3000);
}

// DOM 로드 시 파일 업로드 이벤트 추가
document.addEventListener('DOMContentLoaded', function() {
    // 기존 전문분석 파일 업로드
    const professionalFileInput = document.getElementById('professionalFileInput');
    if (professionalFileInput) {
        professionalFileInput.addEventListener('change', function(event) {
            handleProfessionalFileUpload(event.target.files);
        });
    }
    
    // 통합 데이터 업로드 센터 파일 업로드
    const salaryFileInput = document.getElementById('salaryFileInput');
    if (salaryFileInput) {
        salaryFileInput.addEventListener('change', function(event) {
            handleSalaryFileUpload(event.target.files);
        });
    }
    
    const analysisFileInput = document.getElementById('analysisFileInput');
    if (analysisFileInput) {
        analysisFileInput.addEventListener('change', function(event) {
            handleAnalysisFileUpload(event.target.files);
        });
    }
    
    const employeeFileInput = document.getElementById('employeeFileInput');
    if (employeeFileInput) {
        employeeFileInput.addEventListener('change', function(event) {
            handleEmployeeFileUpload(event.target.files);
        });
    }
});



