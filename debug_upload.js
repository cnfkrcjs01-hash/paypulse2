// PayPulse 업로드 디버깅 스크립트
console.log('🚀 디버깅 스크립트 로드됨');

// 기존 함수를 래핑해서 디버깅 추가
(function() {
    // 파일 입력 요소들 확인
    setTimeout(() => {
        console.log('📁 파일 입력 요소 검사:');
        
        const fileInputs = [
            'unifiedExcelFile',
            'unifiedCsvFile', 
            'unifiedJsonFile'
        ];
        
        fileInputs.forEach(id => {
            const element = document.getElementById(id);
            console.log(`  ${id}:`, element ? '✅ 존재' : '❌ 없음');
            
            if (element) {
                // 기존 이벤트 리스너 제거하고 새로 추가
                element.removeEventListener('change', handleUnifiedFileUpload);
                
                element.addEventListener('change', function(e) {
                    console.log(`🎯 ${id} 파일 선택 이벤트:`, e.target.files);
                    
                    if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        console.log('📄 선택된 파일:', {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: new Date(file.lastModified).toISOString()
                        });
                        
                        // 실제 업로드 함수 호출
                        if (typeof handleUnifiedFileUpload === 'function') {
                            console.log('📤 업로드 함수 호출 시작');
                            handleUnifiedFileUpload(e.target);
                        } else {
                            console.error('❌ handleUnifiedFileUpload 함수를 찾을 수 없음');
                        }
                    } else {
                        console.log('❌ 파일이 선택되지 않음');
                    }
                });
                
                console.log(`  ${id} 이벤트 리스너 추가됨`);
            }
        });
        
        // 드래그&드롭 영역도 확인
        const dropZone = document.getElementById('unifiedDropZone');
        console.log('🎯 드롭존:', dropZone ? '✅ 존재' : '❌ 없음');
        
        if (dropZone) {
            dropZone.addEventListener('drop', function(e) {
                console.log('📥 드롭 이벤트:', e.dataTransfer.files);
                e.preventDefault();
                
                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    console.log('📄 드롭된 파일:', file.name);
                    
                    // 가짜 파일 입력 요소 생성
                    const fakeInput = document.createElement('input');
                    fakeInput.type = 'file';
                    fakeInput.files = e.dataTransfer.files;
                    
                    if (typeof handleUnifiedFileUpload === 'function') {
                        handleUnifiedFileUpload(fakeInput);
                    }
                }
            });
        }
        
    }, 1000); // 1초 후 실행
    
    // 전역 오류 캐치
    window.addEventListener('error', function(e) {
        console.error('🚨 전역 오류:', e.error);
    });
    
    // 전역 Promise 거부 캐치
    window.addEventListener('unhandledrejection', function(e) {
        console.error('🚨 처리되지 않은 Promise 거부:', e.reason);
    });
    
})();

// 테스트 함수
window.testFileUpload = function(testData) {
    console.log('🧪 파일 업로드 테스트 시작');
    
    const jsonString = JSON.stringify(testData || [
        {
            "급여일_급여유형": "2024-01-정기급여",
            "급여영역": "본사",
            "사번": "TEST001",
            "성명": "테스트직원",
            "조직": "테스트팀",
            "직급": "사원",
            "기본급": 3000000,
            "실지급액": 2700000
        }
    ], null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'test_payroll.json', { type: 'application/json' });
    
    const fakeInput = document.createElement('input');
    fakeInput.type = 'file';
    
    // FileList를 시뮬레이션
    Object.defineProperty(fakeInput, 'files', {
        value: [file],
        writable: false
    });
    
    console.log('🎯 테스트 파일 생성됨:', file);
    
    if (typeof handleUnifiedFileUpload === 'function') {
        handleUnifiedFileUpload(fakeInput);
    } else {
        console.error('❌ handleUnifiedFileUpload 함수를 찾을 수 없음');
    }
};

console.log('💡 사용법: testFileUpload() 함수를 콘솔에서 실행해보세요');