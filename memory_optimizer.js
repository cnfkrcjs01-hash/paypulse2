// 🧠 메모리 최적화 및 모니터링 시스템
// 대용량 파일 처리 시 메모리 사용량을 효율적으로 관리

class MemoryOptimizer {
    constructor() {
        this.memoryUsage = [];
        this.maxMemoryUsage = 0;
        this.cleanupCallbacks = [];
        this.isMonitoring = false;
    }

    // 메모리 모니터링 시작
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('🧠 메모리 모니터링 시작');
        
        this.monitoringInterval = setInterval(() => {
            this.recordMemoryUsage();
        }, 1000); // 1초마다 체크
        
        this.displayMemoryWidget();
    }

    // 메모리 모니터링 중지
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        clearInterval(this.monitoringInterval);
        
        console.log('🧠 메모리 모니터링 중지');
        console.log(`📊 최대 메모리 사용량: ${this.formatBytes(this.maxMemoryUsage)}`);
        
        this.hideMemoryWidget();
    }

    // 메모리 사용량 기록
    recordMemoryUsage() {
        if (performance.memory) {
            const memInfo = {
                used: performance.memory.usedJSHeapSize,
                allocated: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
            
            this.memoryUsage.push(memInfo);
            this.maxMemoryUsage = Math.max(this.maxMemoryUsage, memInfo.used);
            
            // 최근 10개만 유지
            if (this.memoryUsage.length > 10) {
                this.memoryUsage.shift();
            }
            
            this.updateMemoryWidget(memInfo);
            
            // 메모리 사용량이 위험 수준이면 경고
            if (memInfo.used > memInfo.limit * 0.8) {
                this.triggerMemoryWarning(memInfo);
            }
        }
    }

    // 메모리 위젯 표시
    displayMemoryWidget() {
        const widget = document.createElement('div');
        widget.id = 'memory-widget';
        widget.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.75rem;
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.8rem;
            z-index: 10000;
            min-width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        widget.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <i class="fas fa-memory" style="margin-right: 0.5rem;"></i>
                <strong>메모리 모니터</strong>
            </div>
            <div id="memory-usage">모니터링 중...</div>
            <div id="memory-bar" style="background: #333; height: 4px; border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
                <div id="memory-fill" style="background: #10b981; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
        `;
        
        document.body.appendChild(widget);
    }

    // 메모리 위젯 업데이트
    updateMemoryWidget(memInfo) {
        const usageElement = document.getElementById('memory-usage');
        const fillElement = document.getElementById('memory-fill');
        
        if (usageElement && fillElement) {
            const usagePercent = (memInfo.used / memInfo.limit * 100).toFixed(1);
            const usedMB = this.formatBytes(memInfo.used);
            const limitMB = this.formatBytes(memInfo.limit);
            
            usageElement.textContent = `${usedMB} / ${limitMB} (${usagePercent}%)`;
            fillElement.style.width = `${usagePercent}%`;
            
            // 메모리 사용량에 따라 색상 변경
            if (usagePercent > 80) {
                fillElement.style.background = '#ef4444'; // 빨강
            } else if (usagePercent > 60) {
                fillElement.style.background = '#f59e0b'; // 주황
            } else {
                fillElement.style.background = '#10b981'; // 초록
            }
        }
    }

    // 메모리 위젯 숨기기
    hideMemoryWidget() {
        const widget = document.getElementById('memory-widget');
        if (widget) {
            widget.remove();
        }
    }

    // 메모리 경고 트리거
    triggerMemoryWarning(memInfo) {
        console.warn('⚠️ 메모리 사용량 경고!', {
            used: this.formatBytes(memInfo.used),
            limit: this.formatBytes(memInfo.limit),
            percentage: (memInfo.used / memInfo.limit * 100).toFixed(1) + '%'
        });
        
        // 자동 정리 시작
        this.forceCleanup();
    }

    // 강제 메모리 정리
    forceCleanup() {
        console.log('🧹 강제 메모리 정리 실행');
        
        // 등록된 정리 콜백 실행
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('메모리 정리 중 오류:', error);
            }
        });
        
        // 가비지 컬렉션 유도 (크롬에서만 동작)
        if (window.gc) {
            window.gc();
            console.log('🗑️ 가비지 컬렉션 실행됨');
        }
        
        // DOM 정리
        this.cleanupDOM();
    }

    // DOM 정리
    cleanupDOM() {
        // 숨겨진 요소들 제거
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        let removedCount = 0;
        
        hiddenElements.forEach(element => {
            if (!element.classList.contains('keep-hidden')) {
                element.remove();
                removedCount++;
            }
        });
        
        if (removedCount > 0) {
            console.log(`🗑️ ${removedCount}개의 숨겨진 DOM 요소 정리됨`);
        }
    }

    // 정리 콜백 등록
    registerCleanupCallback(callback) {
        this.cleanupCallbacks.push(callback);
    }

    // 바이트를 읽기 좋은 형식으로 변환
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 메모리 사용량 통계
    getMemoryStats() {
        if (this.memoryUsage.length === 0) return null;
        
        const latest = this.memoryUsage[this.memoryUsage.length - 1];
        const average = this.memoryUsage.reduce((sum, usage) => sum + usage.used, 0) / this.memoryUsage.length;
        
        return {
            current: this.formatBytes(latest.used),
            maximum: this.formatBytes(this.maxMemoryUsage),
            average: this.formatBytes(average),
            limit: this.formatBytes(latest.limit),
            usagePercent: (latest.used / latest.limit * 100).toFixed(1) + '%'
        };
    }
}

// 대용량 데이터 스토리지 최적화
class OptimizedDataStorage {
    constructor() {
        this.storage = new Map();
        this.accessCount = new Map();
        this.maxSize = 1000; // 최대 저장 항목 수
    }

    // 데이터 저장 (LRU 캐시 방식)
    store(key, data) {
        // 크기 제한 체크
        if (this.storage.size >= this.maxSize) {
            this.evictLeastUsed();
        }
        
        this.storage.set(key, data);
        this.accessCount.set(key, 0);
        
        console.log(`💾 데이터 저장: ${key} (${this.storage.size}/${this.maxSize})`);
    }

    // 데이터 조회
    get(key) {
        if (this.storage.has(key)) {
            const count = this.accessCount.get(key) || 0;
            this.accessCount.set(key, count + 1);
            return this.storage.get(key);
        }
        return null;
    }

    // 가장 적게 사용된 항목 제거
    evictLeastUsed() {
        let leastUsedKey = null;
        let minCount = Infinity;
        
        for (const [key, count] of this.accessCount) {
            if (count < minCount) {
                minCount = count;
                leastUsedKey = key;
            }
        }
        
        if (leastUsedKey) {
            this.storage.delete(leastUsedKey);
            this.accessCount.delete(leastUsedKey);
            console.log(`🗑️ 캐시 제거: ${leastUsedKey} (접근 횟수: ${minCount})`);
        }
    }

    // 스토리지 정리
    clear() {
        const size = this.storage.size;
        this.storage.clear();
        this.accessCount.clear();
        console.log(`🧹 스토리지 전체 정리: ${size}개 항목 제거`);
    }

    // 스토리지 통계
    getStats() {
        return {
            itemCount: this.storage.size,
            maxSize: this.maxSize,
            utilizationPercent: (this.storage.size / this.maxSize * 100).toFixed(1) + '%'
        };
    }
}

// 전역 인스턴스
const memoryOptimizer = new MemoryOptimizer();
const optimizedStorage = new OptimizedDataStorage();

// 대용량 파일 처리 시 메모리 최적화 자동 활성화
function enableMemoryOptimizationForLargeFiles() {
    memoryOptimizer.startMonitoring();
    
    // LargeFileProcessor에 메모리 정리 콜백 등록
    memoryOptimizer.registerCleanupCallback(() => {
        // 임시 데이터 정리
        if (window.tempProcessingData) {
            delete window.tempProcessingData;
        }
        
        // 처리된 청크 데이터 정리
        if (window.processedChunks) {
            window.processedChunks.length = 0;
        }
    });
    
    console.log('🧠 대용량 파일용 메모리 최적화 활성화');
}

// 메모리 최적화 비활성화
function disableMemoryOptimization() {
    memoryOptimizer.stopMonitoring();
    console.log('🧠 메모리 최적화 비활성화');
}

// 전역 함수로 노출
window.memoryOptimizer = memoryOptimizer;
window.optimizedStorage = optimizedStorage;
window.enableMemoryOptimizationForLargeFiles = enableMemoryOptimizationForLargeFiles;
window.disableMemoryOptimization = disableMemoryOptimization;

console.log('🧠 메모리 최적화 시스템 로드 완료');