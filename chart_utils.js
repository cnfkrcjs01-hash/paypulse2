// PayPulse 공통 차트 유틸리티
// 모든 메뉴에서 사용할 수 있는 표준화된 차트 초기화 시스템

// 차트 초기화 대기열
window.chartInitQueue = [];
window.chartLibraryLoaded = false;

// Chart.js 로딩 상태 확인
function checkChartLibrary() {
    if (typeof Chart !== 'undefined') {
        window.chartLibraryLoaded = true;
        console.log('✅ Chart.js 라이브러리 로드 완료');
        
        // 대기열에 있는 모든 차트 초기화
        processChartQueue();
        return true;
    }
    return false;
}

// 차트 초기화 대기열 처리
function processChartQueue() {
    console.log(`📊 차트 초기화 대기열 처리: ${window.chartInitQueue.length}개`);
    
    while (window.chartInitQueue.length > 0) {
        const chartInit = window.chartInitQueue.shift();
        try {
            console.log(`🔧 차트 초기화: ${chartInit.name}`);
            chartInit.fn();
        } catch (error) {
            console.error(`❌ 차트 초기화 실패 (${chartInit.name}):`, error);
        }
    }
}

// 안전한 차트 초기화 함수
function safeInitChart(chartName, initFunction, maxRetries = 10) {
    console.log(`🔄 안전한 차트 초기화 시도: ${chartName}`);
    
    if (window.chartLibraryLoaded || checkChartLibrary()) {
        // Chart.js가 로드되었으면 즉시 실행
        try {
            console.log(`✅ 즉시 차트 초기화: ${chartName}`);
            initFunction();
        } catch (error) {
            console.error(`❌ 차트 초기화 실패 (${chartName}):`, error);
        }
    } else {
        // 대기열에 추가
        console.log(`⏳ 차트 초기화 대기열에 추가: ${chartName}`);
        window.chartInitQueue.push({
            name: chartName,
            fn: initFunction
        });
        
        // Chart.js 로딩 재시도
        const retryCount = maxRetries;
        const checkInterval = setInterval(() => {
            if (checkChartLibrary()) {
                clearInterval(checkInterval);
            } else {
                maxRetries--;
                if (maxRetries <= 0) {
                    console.error(`❌ Chart.js 로딩 타임아웃: ${chartName}`);
                    clearInterval(checkInterval);
                }
            }
        }, 200);
    }
}

// 캔버스 요소 확인 및 준비
function prepareCanvas(canvasId, width = null, height = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ 캔버스를 찾을 수 없음: ${canvasId}`);
        return null;
    }
    
    // 캔버스 크기 설정
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
    } else {
        canvas.style.width = '100%';
        canvas.style.height = '300px';
    }
    
    console.log(`✅ 캔버스 준비 완료: ${canvasId}`);
    return canvas;
}

// 차트 인스턴스 안전 제거
function safeDestroyChart(chartInstance) {
    if (chartInstance && typeof chartInstance.destroy === 'function') {
        try {
            chartInstance.destroy();
            console.log('🗑️ 기존 차트 제거 완료');
        } catch (error) {
            console.error('❌ 차트 제거 중 오류:', error);
        }
    }
}

// 표준 차트 옵션
const standardChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'bottom'
        }
    },
    interaction: {
        intersect: false,
        mode: 'index'
    }
};

// 막대 차트 기본 옵션
const barChartOptions = {
    ...standardChartOptions,
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
};

// 선 차트 기본 옵션
const lineChartOptions = {
    ...standardChartOptions,
    scales: {
        y: {
            beginAtZero: false,
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
            }
        },
        x: {
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            }
        }
    },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 4,
            hoverRadius: 6
        }
    }
};

// 도넛 차트 기본 옵션
const doughnutChartOptions = {
    ...standardChartOptions,
    cutout: '60%',
    plugins: {
        ...standardChartOptions.plugins,
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        }
    }
};

// 공통 색상 팔레트
const colorPalettes = {
    primary: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ],
    borders: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    gradients: [
        '#FF6B6B',
        '#4ECDC4', 
        '#45B7D1',
        '#96CEB4',
        '#FECA57',
        '#FF9FF3'
    ]
};

// 차트 생성 헬퍼 함수
function createStandardChart(canvasId, chartType, data, customOptions = {}) {
    return safeInitChart(canvasId, () => {
        const canvas = prepareCanvas(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // 기본 옵션 선택
        let defaultOptions;
        switch (chartType) {
            case 'bar':
                defaultOptions = barChartOptions;
                break;
            case 'line':
                defaultOptions = lineChartOptions;
                break;
            case 'doughnut':
            case 'pie':
                defaultOptions = doughnutChartOptions;
                break;
            default:
                defaultOptions = standardChartOptions;
        }
        
        // 옵션 병합
        const finalOptions = {
            ...defaultOptions,
            ...customOptions
        };
        
        // 차트 생성
        const chart = new Chart(ctx, {
            type: chartType,
            data: data,
            options: finalOptions
        });
        
        console.log(`✅ 표준 차트 생성 완료: ${canvasId} (${chartType})`);
        return chart;
    });
}

// 전역 함수로 노출
window.safeInitChart = safeInitChart;
window.prepareCanvas = prepareCanvas;
window.safeDestroyChart = safeDestroyChart;
window.createStandardChart = createStandardChart;
window.colorPalettes = colorPalettes;
window.standardChartOptions = {
    bar: barChartOptions,
    line: lineChartOptions,
    doughnut: doughnutChartOptions
};

// 초기화
console.log('🔧 PayPulse 차트 유틸리티 로드 완료');

// Chart.js 로딩 상태 주기적 확인
const initCheckInterval = setInterval(() => {
    if (checkChartLibrary()) {
        clearInterval(initCheckInterval);
    }
}, 100);