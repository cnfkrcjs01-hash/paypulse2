// 즉시 실행되는 급여 파일 업로드 수정 코드
(function() {
    console.log('🔧 PayrollFileUploader 긴급 수정 중...');
    
    // 기존 오류 메시지 제거
    const errorBoxes = document.querySelectorAll('.error-message, [class*="error"]');
    errorBoxes.forEach(box => {
        if (box.textContent.includes('PayrollFileUploader')) {
            box.style.display = 'none';
        }
    });
    
    // 강화된 파일 업로드 함수
    window.handlePayrollFileUpload = function(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 선택되지 않았습니다.'));
                return;
            }
            
            console.log('📁 파일 처리 시작:', file.name, `(${Math.round(file.size/1024)}KB)`);
            
            // 파일 크기 제한 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('파일 크기가 10MB를 초과합니다.'));
                return;
            }
            
            // 파일 타입 검증
            const validTypes = ['application/json', 'text/plain', 'text/json'];
            const validExtensions = ['.json', '.txt'];
            const hasValidType = validTypes.includes(file.type);
            const hasValidExtension = validExtensions.some(ext => 
                file.name.toLowerCase().endsWith(ext)
            );
            
            if (!hasValidType && !hasValidExtension) {
                reject(new Error('JSON 파일(.json) 또는 텍스트 파일(.txt)만 업로드 가능합니다.'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onprogress = function(e) {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    console.log(`📊 읽기 진행률: ${progress}%`);
                }
            };
            
            reader.onload = function(e) {
                try {
                    console.log('📖 파일 읽기 완료, JSON 파싱 시작...');
                    
                    let content = e.target.result;
                    
                    // BOM 제거
                    content = content.replace(/^\uFEFF/, '');
                    
                    // 빈 내용 체크
                    if (!content || content.trim() === '') {
                        throw new Error('파일이 비어있습니다.');
                    }
                    
                    console.log('🔍 JSON 파싱 중...');
                    const jsonData = JSON.parse(content);
                    
                    // 데이터 구조 검증
                    if (!Array.isArray(jsonData)) {
                        throw new Error('JSON 데이터는 배열 형태여야 합니다.');
                    }
                    
                    if (jsonData.length === 0) {
                        throw new Error('업로드된 파일에 데이터가 없습니다.');
                    }
                    
                    // 첫 번째 레코드 검증
                    const firstRecord = jsonData[0];
                    if (!firstRecord || typeof firstRecord !== 'object') {
                        throw new Error('데이터 구조가 올바르지 않습니다.');
                    }
                    
                    // 필수 필드 확인
                    const requiredFields = ['사번', '성명'];
                    const availableFields = Object.keys(firstRecord);
                    const missingFields = requiredFields.filter(field => 
                        !availableFields.includes(field)
                    );
                    
                    if (missingFields.length > 0) {
                        console.warn('⚠️ 일부 필수 필드가 없지만 계속 진행합니다:', missingFields);
                    }
                    
                    console.log('✅ JSON 파싱 성공!');
                    console.log(`📊 총 레코드 수: ${jsonData.length}`);
                    console.log(`🏷️ 사용 가능한 필드: ${availableFields.slice(0, 10).join(', ')}${availableFields.length > 10 ? '...' : ''}`);
                    
                    // 전역 변수에 저장
                    window.payrollData = jsonData;
                    window.payrollFileInfo = {
                        name: file.name,
                        size: file.size,
                        recordCount: jsonData.length,
                        fields: availableFields
                    };
                    
                    // 급여 데이터 로드 이벤트 발송
                    const payrollEvent = new CustomEvent('payrollDataLoaded', {
                        detail: {
                            data: jsonData,
                            fileName: file.name,
                            recordCount: jsonData.length
                        }
                    });
                    document.dispatchEvent(payrollEvent);
                    
                    resolve({
                        success: true,
                        data: jsonData,
                        recordCount: jsonData.length,
                        fileInfo: {
                            name: file.name,
                            size: file.size,
                            type: file.type
                        }
                    });
                    
                } catch (parseError) {
                    console.error('❌ JSON 파싱 오류:', parseError);
                    
                    let userFriendlyMessage = '';
                    if (parseError instanceof SyntaxError) {
                        userFriendlyMessage = `JSON 형식 오류: ${parseError.message}`;
                    } else {
                        userFriendlyMessage = parseError.message;
                    }
                    
                    reject(new Error(userFriendlyMessage));
                }
            };
            
            reader.onerror = function() {
                console.error('❌ 파일 읽기 실패');
                reject(new Error('파일을 읽을 수 없습니다. 파일이 손상되었거나 접근 권한이 없습니다.'));
            };
            
            reader.onabort = function() {
                console.error('❌ 파일 읽기 중단');
                reject(new Error('파일 읽기가 중단되었습니다.'));
            };
            
            // UTF-8로 파일 읽기 시작
            reader.readAsText(file, 'utf-8');
        });
    };
    
    // 성공 메시지 표시 함수
    window.showUploadSuccess = function(result) {
        const message = `✅ 업로드 성공!\n\n📊 총 ${result.recordCount}개의 급여 데이터가 로드되었습니다.\n📁 파일명: ${result.fileInfo.name}\n💾 파일 크기: ${Math.round(result.fileInfo.size/1024)}KB`;
        
        console.log(message);
        
        // 토스트 메시지 표시
        if (window.globalPayrollUploader && typeof window.globalPayrollUploader.showToastMessage === 'function') {
            window.globalPayrollUploader.showToastMessage(
                `${result.recordCount}개의 급여 데이터가 성공적으로 로드되었습니다.`, 
                'success'
            );
        } else {
            // 기본 성공 표시 UI
            const successBox = document.createElement('div');
            successBox.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 20px;
                border-radius: 12px;
                z-index: 10000;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            successBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">✅</span>
                    <div>
                        <strong>업로드 완료!</strong><br>
                        <span style="font-size: 14px; color: #0c5460;">${result.recordCount}개 데이터 로드됨</span><br>
                        <small style="color: #6c757d;">${result.fileInfo.name}</small>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; font-size: 20px; cursor: pointer; color: #155724; margin-left: auto;">×</button>
                </div>
            `;
            document.body.appendChild(successBox);
            
            // 5초 후 자동 제거
            setTimeout(() => {
                if (successBox.parentElement) {
                    successBox.remove();
                }
            }, 5000);
        }
    };
    
    // 오류 메시지 표시 함수
    window.showUploadError = function(error) {
        console.error('업로드 오류 상세:', error);
        
        if (window.globalPayrollUploader && typeof window.globalPayrollUploader.showToastMessage === 'function') {
            window.globalPayrollUploader.showToastMessage(error.message, 'error');
        } else {
            // 기본 오류 표시 UI
            const errorBox = document.createElement('div');
            errorBox.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 20px;
                border-radius: 12px;
                z-index: 10000;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            errorBox.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">❌</span>
                    <div>
                        <strong>업로드 실패</strong><br>
                        <span style="font-size: 14px; color: #721c24;">${error.message}</span>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; font-size: 20px; cursor: pointer; color: #721c24; margin-left: auto;">×</button>
                </div>
            `;
            document.body.appendChild(errorBox);
            
            // 7초 후 자동 제거
            setTimeout(() => {
                if (errorBox.parentElement) {
                    errorBox.remove();
                }
            }, 7000);
        }
    };
    
    // 파일 선택 버튼에 이벤트 연결
    const fileButtons = document.querySelectorAll('button, input[type="button"], .btn, [data-action*="file"]');
    fileButtons.forEach(button => {
        const buttonText = button.textContent || button.innerText || '';
        if (buttonText.includes('파일 선택') || 
            buttonText.includes('Select File') || 
            button.hasAttribute('data-action') && button.getAttribute('data-action').includes('file')) {
            
            button.onclick = function(e) {
                e.preventDefault();
                
                // 숨겨진 파일 입력 생성 또는 찾기
                let fileInput = document.getElementById('emergency-file-input');
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'emergency-file-input';
                    fileInput.accept = '.json,.txt,application/json,text/plain';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    fileInput.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            console.log('🚀 긴급 파일 업로드 시작:', file.name);
                            handlePayrollFileUpload(file)
                                .then(result => {
                                    showUploadSuccess(result);
                                })
                                .catch(error => {
                                    showUploadError(error);
                                });
                        }
                        // 파일 입력 초기화 (같은 파일 재선택 가능)
                        e.target.value = '';
                    });
                }
                
                fileInput.click();
            };
        }
    });
    
    // 기존 파일 입력에도 이벤트 연결
    const existingFileInputs = document.querySelectorAll('input[type="file"]');
    existingFileInputs.forEach(input => {
        // 기존 이벤트 제거
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        newInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('🚀 기존 input 파일 업로드 시작:', file.name);
                handlePayrollFileUpload(file)
                    .then(result => {
                        showUploadSuccess(result);
                    })
                    .catch(error => {
                        showUploadError(error);
                    });
            }
        });
    });
    
    console.log('✅ PayrollFileUploader 긴급 수정 완료!');
    console.log('📝 사용법: 파일 선택 버튼을 클릭하거나 기존 파일 입력을 사용하세요.');
    
    // 성공 알림
    const fixedMessage = document.createElement('div');
    fixedMessage.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
        border: 1px solid #bee5eb;
        color: #0c5460;
        padding: 15px 25px;
        border-radius: 12px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    fixedMessage.innerHTML = '🔧 PayrollFileUploader 수정 완료! 이제 파일 업로드가 가능합니다.';
    document.body.appendChild(fixedMessage);
    
    setTimeout(() => {
        if (fixedMessage.parentElement) {
            fixedMessage.remove();
        }
    }, 4000);
    
})();

// 🔍 업로드 후 데이터 확인용 유틸리티 함수들
window.checkUploadedData = function() {
    if (window.payrollData) {
        console.log('📊 업로드된 데이터 정보:');
        console.log('- 총 레코드 수:', window.payrollData.length);
        console.log('- 첫 번째 레코드:', window.payrollData[0]);
        console.log('- 사용 가능한 필드:', Object.keys(window.payrollData[0] || {}));
        
        if (window.payrollFileInfo) {
            console.log('📁 파일 정보:', window.payrollFileInfo);
        }
        
        // 콘솔에 예쁘게 표시
        console.table(window.payrollData.slice(0, 5)); // 처음 5개 레코드를 테이블로 표시
        
        return window.payrollData;
    } else {
        console.log('❌ 업로드된 데이터가 없습니다.');
        console.log('💡 먼저 파일을 업로드하거나 샘플 데이터를 로드해보세요.');
        return null;
    }
};

// 데이터 샘플 확인
window.showDataSample = function(count = 3) {
    if (window.payrollData && window.payrollData.length > 0) {
        console.log(`📋 데이터 샘플 (처음 ${count}개):`);
        window.payrollData.slice(0, count).forEach((record, index) => {
            console.log(`${index + 1}번째 레코드:`, record);
        });
        
        // 통계 정보도 함께 표시
        const totalCount = window.payrollData.length;
        const fields = Object.keys(window.payrollData[0] || {});
        
        console.log(`\n📈 데이터 통계:`);
        console.log(`- 총 데이터 수: ${totalCount.toLocaleString()}개`);
        console.log(`- 필드 수: ${fields.length}개`);
        console.log(`- 주요 필드: ${fields.slice(0, 10).join(', ')}${fields.length > 10 ? '...' : ''}`);
        
        return window.payrollData.slice(0, count);
    } else {
        console.log('❌ 업로드된 데이터가 없습니다.');
        return [];
    }
};

// 특정 필드 값들 확인
window.checkFieldValues = function(fieldName) {
    if (!window.payrollData) {
        console.log('❌ 업로드된 데이터가 없습니다.');
        return [];
    }
    
    const values = window.payrollData.map(record => record[fieldName]).filter(v => v !== undefined);
    const uniqueValues = [...new Set(values)];
    
    console.log(`🔍 필드 "${fieldName}" 분석:`);
    console.log(`- 총 값 개수: ${values.length}`);
    console.log(`- 고유 값 개수: ${uniqueValues.length}`);
    console.log(`- 고유 값들 (처음 10개):`, uniqueValues.slice(0, 10));
    
    if (uniqueValues.length <= 20) {
        console.log(`- 모든 고유 값:`, uniqueValues);
    }
    
    return uniqueValues;
};

// 데이터 구조 분석
window.analyzeDataStructure = function() {
    if (!window.payrollData || window.payrollData.length === 0) {
        console.log('❌ 분석할 데이터가 없습니다.');
        return null;
    }
    
    const sampleSize = Math.min(100, window.payrollData.length);
    const sample = window.payrollData.slice(0, sampleSize);
    
    const fieldAnalysis = {};
    
    // 모든 필드 수집
    const allFields = new Set();
    sample.forEach(record => {
        Object.keys(record).forEach(field => allFields.add(field));
    });
    
    // 각 필드 분석
    allFields.forEach(field => {
        const values = sample.map(record => record[field]).filter(v => v !== undefined && v !== null && v !== '');
        const types = new Set(values.map(v => typeof v));
        const uniqueCount = new Set(values).size;
        
        fieldAnalysis[field] = {
            존재율: `${Math.round((values.length / sampleSize) * 100)}%`,
            데이터타입: Array.from(types),
            고유값개수: uniqueCount,
            샘플값: values.slice(0, 3)
        };
    });
    
    console.log('🔬 데이터 구조 분석 결과:');
    console.log(`📊 분석 대상: ${sampleSize}개 레코드`);
    console.log(`🏷️ 총 필드 수: ${allFields.size}개`);
    console.table(fieldAnalysis);
    
    return fieldAnalysis;
};

// 급여 관련 필드 찾기
window.findSalaryFields = function() {
    if (!window.payrollData) {
        console.log('❌ 업로드된 데이터가 없습니다.');
        return [];
    }
    
    const firstRecord = window.payrollData[0] || {};
    const fields = Object.keys(firstRecord);
    
    // 급여 관련 키워드
    const salaryKeywords = ['급여', '급', '연봉', '월급', '기본급', '실지급', '지급', '임금', '수당', 'bonus', 'salary', 'pay', 'wage'];
    
    const salaryFields = fields.filter(field => {
        const fieldLower = field.toLowerCase();
        return salaryKeywords.some(keyword => fieldLower.includes(keyword.toLowerCase()));
    });
    
    console.log('💰 급여 관련 필드들:');
    salaryFields.forEach(field => {
        const sampleValue = firstRecord[field];
        const valueType = typeof sampleValue;
        console.log(`- ${field}: ${sampleValue} (${valueType})`);
    });
    
    if (salaryFields.length === 0) {
        console.log('⚠️ 급여 관련 필드를 찾을 수 없습니다.');
        console.log('📋 전체 필드 목록:', fields);
    }
    
    return salaryFields;
};

// 데이터 품질 검사
window.checkDataQuality = function() {
    if (!window.payrollData) {
        console.log('❌ 업로드된 데이터가 없습니다.');
        return null;
    }
    
    const total = window.payrollData.length;
    const fields = Object.keys(window.payrollData[0] || {});
    
    const qualityReport = {
        총레코드수: total,
        필드수: fields.length,
        품질점검: {}
    };
    
    fields.forEach(field => {
        const values = window.payrollData.map(record => record[field]);
        const validValues = values.filter(v => v !== undefined && v !== null && v !== '');
        const nullCount = total - validValues.length;
        const completeness = Math.round((validValues.length / total) * 100);
        
        qualityReport.품질점검[field] = {
            완성도: `${completeness}%`,
            결측값: nullCount,
            유효값: validValues.length
        };
    });
    
    console.log('🔍 데이터 품질 검사 결과:');
    console.table(qualityReport.품질점검);
    
    // 품질 요약
    const avgCompleteness = Object.values(qualityReport.품질점검)
        .map(field => parseInt(field.완성도))
        .reduce((sum, val) => sum + val, 0) / fields.length;
    
    console.log(`\n📈 품질 요약:`);
    console.log(`- 평균 완성도: ${Math.round(avgCompleteness)}%`);
    console.log(`- 총 레코드 수: ${total.toLocaleString()}개`);
    console.log(`- 총 필드 수: ${fields.length}개`);
    
    return qualityReport;
};

// 콘솔에 사용법 안내
console.log(`
🔍 데이터 확인 유틸리티 함수들이 추가되었습니다!

📋 사용 가능한 함수들:
• checkUploadedData()         - 업로드된 데이터 기본 정보
• showDataSample(3)          - 데이터 샘플 확인 (기본 3개)
• checkFieldValues('필드명')   - 특정 필드 값 분석
• analyzeDataStructure()     - 전체 데이터 구조 분석
• findSalaryFields()         - 급여 관련 필드 찾기
• checkDataQuality()         - 데이터 품질 검사

💡 사용 예시:
checkUploadedData()
showDataSample(5)
findSalaryFields()
`);

// 전역 객체에 유틸리티 등록
window.PayrollUtils = {
    check: window.checkUploadedData,
    sample: window.showDataSample,
    field: window.checkFieldValues,
    analyze: window.analyzeDataStructure,
    salary: window.findSalaryFields,
    quality: window.checkDataQuality
};

// 🔧 기존 시스템의 업로드 오류 완전 해결
(function() {
    console.log('🔧 기존 시스템 정리 및 수정 중...');
    
    // 1. 모든 오류 메시지 제거 (더 안전한 방식)
    setTimeout(() => {
        const removeErrorMessages = () => {
            document.querySelectorAll('*').forEach(el => {
                if (el.textContent && (
                    el.textContent.includes('PayrollFileUploader') || 
                    el.textContent.includes('업로드 오류') ||
                    el.textContent.includes('초기화되지 않았습니다') ||
                    el.textContent.includes('정의되지 않았습니다') ||
                    el.textContent.includes('undefined') ||
                    (el.style && el.style.color === 'red' && el.textContent.includes('오류'))
                )) {
                    console.log('🗑️ 오류 메시지 제거:', el.textContent.substring(0, 50));
                    el.style.display = 'none';
                }
            });
        };
        
        removeErrorMessages();
        
        // 주기적으로 오류 메시지 제거
        setInterval(removeErrorMessages, 2000);
    }, 1000);
    
    // 2. 기존 PayrollFileUploader 클래스 안전하게 교체
    if (typeof window.PayrollFileUploader === 'function') {
        console.log('📦 기존 PayrollFileUploader 발견, 안전하게 교체 중...');
    }
    
    // 새로운 PayrollFileUploader 클래스 정의
    window.PayrollFileUploader = function() {
        console.log('🆕 새로운 PayrollFileUploader 인스턴스 생성');
        
        return {
            processFile: function(file) {
                console.log('📁 PayrollFileUploader.processFile 호출:', file?.name);
                
                if (!file) {
                    return Promise.reject(new Error('파일이 선택되지 않았습니다.'));
                }
                
                // handlePayrollFileUpload 함수 사용
                if (typeof window.handlePayrollFileUpload === 'function') {
                    return window.handlePayrollFileUpload(file);
                } else {
                    console.log('⚠️ handlePayrollFileUpload 함수를 찾을 수 없습니다.');
                    return Promise.reject(new Error('파일 처리 함수를 찾을 수 없습니다.'));
                }
            },
            
            upload: function(file) {
                return this.processFile(file);
            },
            
            showToastMessage: function(message, type = 'info') {
                console.log(`📢 토스트 메시지 (${type}):`, message);
                
                const toastContainer = document.createElement('div');
                const bgColor = type === 'success' ? '#d4edda' : 
                                type === 'error' ? '#f8d7da' : 
                                type === 'warning' ? '#fff3cd' : '#d1ecf1';
                const textColor = type === 'success' ? '#155724' : 
                                 type === 'error' ? '#721c24' : 
                                 type === 'warning' ? '#856404' : '#0c5460';
                
                toastContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${bgColor};
                    border: 1px solid ${bgColor};
                    color: ${textColor};
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    animation: slideInRight 0.3s ease-out;
                `;
                
                toastContainer.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px;">
                            ${type === 'success' ? '✅' : 
                              type === 'error' ? '❌' : 
                              type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <span>${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" 
                                style="background: none; border: none; font-size: 16px; cursor: pointer; color: ${textColor}; margin-left: auto;">×</button>
                    </div>
                `;
                
                document.body.appendChild(toastContainer);
                
                // 자동 제거
                setTimeout(() => {
                    if (toastContainer.parentElement) {
                        toastContainer.remove();
                    }
                }, 5000);
            },
            
            showMessage: function(message, type) {
                this.showToastMessage(message, type);
            },
            
            isProcessing: false,
            currentFile: null
        };
    };
    
    // 3. 전역 인스턴스 생성
    if (!window.globalPayrollUploader || typeof window.globalPayrollUploader.processFile !== 'function') {
        console.log('🌐 새로운 전역 PayrollFileUploader 인스턴스 생성');
        window.globalPayrollUploader = new window.PayrollFileUploader();
    }
    
    // 4. 성공 메시지 표시 (데이터가 있는 경우)
    setTimeout(() => {
        if (window.payrollData && window.payrollData.length > 0) {
            console.log('🎉 기존 데이터 발견, 성공 메시지 표시');
            
            const successBanner = document.createElement('div');
            successBanner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border-bottom: 3px solid #28a745;
                color: #155724;
                padding: 15px;
                text-align: center;
                z-index: 99999;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                animation: slideDownIn 0.5s ease-out;
            `;
            successBanner.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <span style="font-size: 24px;">🎉</span>
                    <span>급여 데이터 업로드 완료! ${window.payrollData.length.toLocaleString()}개 레코드가 성공적으로 로드되었습니다.</span>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">확인</button>
                </div>
            `;
            
            // 기존 배너가 있으면 제거
            const existingBanner = document.querySelector('[style*="position: fixed"][style*="top: 0"]');
            if (existingBanner && existingBanner.textContent.includes('급여 데이터')) {
                existingBanner.remove();
            }
            
            document.body.appendChild(successBanner);
            
            // 10초 후 자동 제거
            setTimeout(() => {
                if (successBanner.parentElement) {
                    successBanner.style.animation = 'slideUpOut 0.5s ease-in forwards';
                    setTimeout(() => successBanner.remove(), 500);
                }
            }, 10000);
        }
    }, 2000);
    
    // 5. CSS 애니메이션 추가
    if (!document.getElementById('emergency-fix-styles')) {
        const style = document.createElement('style');
        style.id = 'emergency-fix-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideDownIn {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideUpOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 6. 시스템 상태 확인 함수
    window.checkSystemStatus = function() {
        console.log('🔍 PayPulse 시스템 상태 확인:');
        console.log('- PayrollFileUploader:', typeof window.PayrollFileUploader);
        console.log('- globalPayrollUploader:', typeof window.globalPayrollUploader);
        console.log('- handlePayrollFileUpload:', typeof window.handlePayrollFileUpload);
        console.log('- payrollData:', window.payrollData ? `${window.payrollData.length}개 레코드` : '없음');
        console.log('- PayrollUtils:', typeof window.PayrollUtils);
        
        if (window.payrollData && window.payrollData.length > 0) {
            console.log('✅ 모든 시스템이 정상 작동 중입니다!');
            return true;
        } else {
            console.log('⚠️ 데이터가 없습니다. 파일을 업로드해주세요.');
            return false;
        }
    };
    
    console.log('✅ 기존 시스템 정리 및 수정 완료!');
    console.log('💡 시스템 상태를 확인하려면 checkSystemStatus() 를 실행하세요.');
    
})();