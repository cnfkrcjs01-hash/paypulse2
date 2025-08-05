// 🚀 대용량 파일 처리 전용 시스템
// 73MB+ 파일을 효율적으로 처리하기 위한 청크 기반 시스템

// 대용량 파일 처리 설정 (simple_upload.js에서 이미 정의됨)

// 대용량 파일 청크 처리기
class LargeFileProcessor {
    constructor(file) {
        this.file = file;
        this.isLargeFile = file.size > LARGE_FILE_CONFIG.LARGE_FILE_THRESHOLD;
        this.chunkSize = LARGE_FILE_CONFIG.CHUNK_SIZE;
        this.totalChunks = Math.ceil(file.size / this.chunkSize);
        this.processedRows = [];
        this.headers = null;
        this.cancelled = false;
        this.totalLines = 0;
    }

    async processFile() {
        console.log(`📊 파일 처리 시작: ${this.file.name} (${(this.file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        if (!this.isLargeFile) {
            return this.processSmallFile();
        }

        return this.processLargeFileInChunks();
    }

    async processSmallFile() {
        const text = await this.readFileAsText(this.file);
        return this.parseCSVContent(text);
    }

    async processLargeFileInChunks() {
        console.log(`🔧 대용량 파일 청크 처리: ${this.totalChunks}개 청크`);
        
        // 메모리 최적화 활성화
        if (typeof enableMemoryOptimizationForLargeFiles === 'function') {
            enableMemoryOptimizationForLargeFiles();
        }
        
        let offset = 0;
        let remainingText = '';
        let processedLines = 0;
        const startTime = Date.now();

        // 향상된 진행률 업데이트 함수
        const updateProgress = (chunkIndex, status = '') => {
            const progress = Math.round((chunkIndex / this.totalChunks) * 90) + 5; // 5-95%
            const elapsedTime = Date.now() - startTime;
            const avgTimePerChunk = elapsedTime / (chunkIndex + 1);
            const remainingChunks = this.totalChunks - chunkIndex - 1;
            const estimatedTimeLeft = remainingChunks * avgTimePerChunk;
            
            // 상세한 진행률 메시지
            let message = status;
            if (!status) {
                const mbProcessed = (offset / 1024 / 1024).toFixed(1);
                const totalMB = (this.file.size / 1024 / 1024).toFixed(1);
                const speed = offset / 1024 / 1024 / (elapsedTime / 1000); // MB/s
                const eta = estimatedTimeLeft > 0 ? this.formatTime(estimatedTimeLeft) : '완료';
                
                message = `청크 ${chunkIndex + 1}/${this.totalChunks} | ${mbProcessed}/${totalMB}MB | ${speed.toFixed(1)}MB/s | ETA: ${eta}`;
            }
            
            // simple_upload.js의 함수 호출
            if (typeof updateUploadStatus === 'function') {
                updateUploadStatus(message, progress);
            }
            
            console.log(`📈 ${message} (${progress}%)`);
        };
        
        // 성능 통계 업데이트 함수
        const updateStats = () => {
            const stats = {
                processedLines: this.totalLines,
                extractedRecords: this.processedRows.length,
                memoryUsage: typeof memoryOptimizer !== 'undefined' ? memoryOptimizer.getMemoryStats() : null
            };
            
            console.log('📊 처리 통계:', stats);
        };

        for (let chunkIndex = 0; chunkIndex < this.totalChunks; chunkIndex++) {
            if (this.cancelled) {
                throw new Error('❌ 사용자에 의해 취소됨');
            }

            updateProgress(chunkIndex);

            // 청크 읽기
            const chunk = this.file.slice(offset, offset + this.chunkSize);
            const chunkText = await this.readFileAsText(chunk);
            
            // 이전 청크의 남은 텍스트와 합치기
            const fullText = remainingText + chunkText;
            
            // 완전한 라인들 추출
            const lines = fullText.split('\n');
            remainingText = lines.pop() || ''; // 마지막 불완전한 라인 보관

            // 첫 번째 청크에서 헤더 추출
            if (chunkIndex === 0 && lines.length > 0) {
                this.headers = this.parseCSVLine(lines[0]);
                lines.shift(); // 헤더 제거
                console.log(`📋 헤더 감지: ${this.headers.length}개 필드`, this.headers.slice(0, 5));
                
                updateProgress(chunkIndex, `헤더 추출 완료 (${this.headers.length}개 필드)`);
            }

            // 라인들 처리
            for (const line of lines) {
                if (line.trim()) {
                    this.totalLines++;
                    
                    if (this.processedRows.length < LARGE_FILE_CONFIG.MAX_PREVIEW_ROWS) {
                        const values = this.parseCSVLine(line);
                        if (values.length >= this.headers.length - 3) { // 일부 필드 누락 허용
                            const row = {};
                            this.headers.forEach((header, index) => {
                                row[header] = values[index] || '';
                            });
                            this.processedRows.push(row);
                        }
                    }
                }
            }

            offset += this.chunkSize;

            // 메모리 관리 - 주기적으로 UI 업데이트 허용
            if (chunkIndex % 5 === 0) {
                await this.sleep(20); // 20ms 대기로 UI 반응성 확보
                
                // 중간 진행 상황 표시
                updateProgress(chunkIndex, `${this.processedRows.length.toLocaleString()}개 레코드 처리됨`);
            }
        }

        // 마지막 남은 텍스트 처리
        if (remainingText.trim() && this.processedRows.length < LARGE_FILE_CONFIG.MAX_PREVIEW_ROWS) {
            const values = this.parseCSVLine(remainingText);
            if (values.length >= this.headers.length - 3) {
                const row = {};
                this.headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                this.processedRows.push(row);
            }
        }

        const totalTime = Date.now() - startTime;
        const avgSpeed = this.file.size / 1024 / 1024 / (totalTime / 1000); // MB/s
        
        console.log(`✅ 대용량 파일 처리 완료!`);
        console.log(`📊 최종 통계:
        • 처리 시간: ${this.formatTime(totalTime)}
        • 파일 크기: ${(this.file.size / 1024 / 1024).toFixed(2)}MB
        • 평균 속도: ${avgSpeed.toFixed(2)}MB/s
        • 총 라인 수: ${this.totalLines.toLocaleString()}개
        • 추출된 레코드: ${this.processedRows.length.toLocaleString()}개
        • 청크 수: ${this.totalChunks}개`);
        
        // 메모리 최적화 비활성화
        if (typeof disableMemoryOptimization === 'function') {
            setTimeout(() => {
                disableMemoryOptimization();
            }, 3000); // 3초 후 비활성화
        }
        
        if (typeof updateUploadStatus === 'function') {
            updateUploadStatus(`완료! ${this.totalLines.toLocaleString()}줄 스캔, ${this.processedRows.length.toLocaleString()}개 레코드 (${this.formatTime(totalTime)})`, 100);
        }
        
        return this.processedRows;
    }

    parseCSVLine(line) {
        // 고급 CSV 파싱 (따옴표, 콤마 처리)
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // 이스케이프된 따옴표
                    current += '"';
                    i++; // 다음 따옴표 건너뛰기
                } else {
                    inQuotes = !inQuotes;
                }
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

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    parseCSVContent(content) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length && i <= LARGE_FILE_CONFIG.MAX_PREVIEW_ROWS; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= headers.length - 2) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }

        return data;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatTime(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}초`;
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}분 ${seconds}초`;
    }

    cancel() {
        this.cancelled = true;
        console.log('🛑 대용량 파일 처리 취소됨');
    }
}

// 대용량 파일 감지 및 자동 처리
async function handleLargeFile(file) {
    console.log(`🔍 파일 크기 체크: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    if (file.size > LARGE_FILE_CONFIG.LARGE_FILE_THRESHOLD) {
        console.log('🚀 대용량 파일 감지 - 고성능 처리 모드 활성화');
        
        // 대용량 파일 전용 UI 표시
        showLargeFileWarning(file);
        
        const processor = new LargeFileProcessor(file);
        
        // 취소 버튼 추가
        addCancelButton(() => processor.cancel());
        
        try {
            const data = await processor.processFile();
            
            // 처리 결과 통계 표시
            showProcessingStats(processor);
            
            return data;
        } catch (error) {
            console.error('❌ 대용량 파일 처리 실패:', error);
            throw error;
        }
    } else {
        console.log('📁 일반 파일 - 표준 처리');
        const processor = new LargeFileProcessor(file);
        return await processor.processFile();
    }
}

// 대용량 파일 경고 표시
function showLargeFileWarning(file) {
    const message = document.getElementById('upload-message');
    if (message) {
        message.style.display = 'block';
        message.className = 'upload-message info';
        message.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-rocket" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                <h4>대용량 파일 고성능 처리 모드</h4>
                <p><strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)}MB)</p>
                <p>청크 기반 스트리밍으로 안전하게 처리합니다</p>
                <div style="margin-top: 1rem;">
                    <span style="background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                        <i class="fas fa-memory"></i> 메모리 최적화
                    </span>
                    <span style="background: #f0fdf4; color: #166534; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">
                        <i class="fas fa-gauge-high"></i> 고속 처리
                    </span>
                </div>
            </div>
        `;
    }
}

// 취소 버튼 추가
function addCancelButton(cancelCallback) {
    const progressContainer = document.getElementById('simple-upload-progress');
    if (progressContainer && !document.getElementById('cancel-upload-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-upload-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> 취소';
        cancelBtn.style.cssText = `
            background: #ef4444; color: white; border: none; 
            padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
            margin-top: 0.5rem; font-size: 0.9rem;
        `;
        cancelBtn.onclick = () => {
            cancelCallback();
            cancelBtn.remove();
        };
        progressContainer.appendChild(cancelBtn);
    }
}

// 처리 통계 표시
function showProcessingStats(processor) {
    console.log(`📊 처리 통계:
    • 파일 크기: ${(processor.file.size / 1024 / 1024).toFixed(2)}MB
    • 총 라인 수: ${processor.totalLines.toLocaleString()}개
    • 추출된 레코드: ${processor.processedRows.length.toLocaleString()}개
    • 청크 수: ${processor.totalChunks}개
    • 헤더 필드: ${processor.headers ? processor.headers.length : 0}개`);
}

// 전역 함수로 노출
window.handleLargeFile = handleLargeFile;
window.LargeFileProcessor = LargeFileProcessor;

console.log('🚀 대용량 파일 처리 시스템 로드 완료');