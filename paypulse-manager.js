// PayPulse 데이터 관리자
class PayPulseDataManager {
    constructor() {
        this.uploadedFiles = [];
        this.currentView = 'dashboard';
        this.selectedFile = null;
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateUI();
    }

    setupEventListeners() {
        // 네비게이션 버튼
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // 업로드 관련 버튼들
        const quickUploadBtn = document.getElementById('quickUploadBtn');
        if (quickUploadBtn) {
            quickUploadBtn.addEventListener('click', () => {
                this.switchView('upload');
            });
        }

        const selectFileBtn = document.getElementById('selectFileBtn');
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', () => {
                this.selectFile();
            });
        }

        const emptyUploadBtn = document.getElementById('emptyUploadBtn');
        if (emptyUploadBtn) {
            emptyUploadBtn.addEventListener('click', () => {
                this.switchView('upload');
            });
        }

        const analysisBtn = document.getElementById('analysisBtn');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', () => {
                this.switchView('history');
            });
        }

        // 파일 입력
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // 드래그 앤 드롭
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.addEventListener('click', () => {
                this.selectFile();
            });

            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                const excelFile = files.find(f => 
                    f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
                );
                
                if (excelFile) {
                    this.handleFileUpload(excelFile);
                }
            });
        }

        // 미리보기 액션 버튼들
        const deleteCurrentBtn = document.getElementById('deleteCurrentBtn');
        if (deleteCurrentBtn) {
            deleteCurrentBtn.addEventListener('click', () => {
                this.deleteCurrentFile();
            });
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToPayPulse();
            });
        }
    }

    // 뷰 전환
    switchView(viewName) {
        // 모든 뷰 숨기기
        document.querySelectorAll('.view-container').forEach(view => {
            view.style.display = 'none';
        });

        // 모든 네비게이션 버튼 비활성화
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 선택된 뷰 표시
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.style.display = 'block';
        }

        // 선택된 버튼 활성화
        const targetBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        this.currentView = viewName;
    }

    // 파일 선택
    selectFile() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    // 파일 업로드 처리
    async handleFileUpload(file) {
        const indicator = document.getElementById('uploadingIndicator');
        const content = document.querySelector('.upload-content');
        
        // 업로드 표시
        if (indicator) indicator.style.display = 'block';
        if (content) content.style.display = 'none';

        try {
            // XLSX 라이브러리 확인
            if (typeof XLSX === 'undefined') {
                throw new Error('XLSX 라이브러리가 로드되지 않았습니다.');
            }

            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            const sheets = {};
            const allData = [];
            
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                sheets[sheetName] = jsonData;
                allData.push(...jsonData);
            });

            // 파일 타입 자동 감지
            let fileType = 'other';
            if (file.name.includes('템플릿') || file.name.includes('template')) {
                fileType = 'template';
            } else if (file.name.includes('급여') || file.name.includes('payroll') || file.name.includes('더미')) {
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

            this.uploadedFiles.push(uploadedFile);
            this.selectedFile = uploadedFile;
            
            // 데이터 저장
            this.saveData();
            this.updateUI();
            
            // 미리보기로 자동 이동
            const previewBtn = document.getElementById('previewBtn');
            if (previewBtn) previewBtn.style.display = 'inline-block';
            this.switchView('preview');
            this.showPreview(uploadedFile);

            this.showNotification('파일이 성공적으로 업로드되었습니다! 🎉', 'success');

        } catch (error) {
            console.error('File upload error:', error);
            this.showNotification('파일 업로드 중 오류가 발생했습니다: ' + error.message, 'error');
        } finally {
            // 업로드 표시 숨기기
            if (indicator) indicator.style.display = 'none';
            if (content) content.style.display = 'block';
        }
    }

    // UI 업데이트
    updateUI() {
        // 헤더
        const fileCountHeader = document.getElementById('fileCountHeader');
        if (fileCountHeader) {
            fileCountHeader.textContent = this.uploadedFiles.length + '개';
        }
        
        const lastUploadDate = this.uploadedFiles.length > 0 ? 
            this.uploadedFiles[this.uploadedFiles.length - 1].uploadDate.toLocaleDateString() : '-';
        const lastUploadDateEl = document.getElementById('lastUploadDate');
        if (lastUploadDateEl) {
            lastUploadDateEl.textContent = lastUploadDate;
        }

        // 대시보드
        const fileCount = document.getElementById('fileCount');
        if (fileCount) {
            fileCount.textContent = this.uploadedFiles.length + '개';
        }

        const templateCount = document.getElementById('templateCount');
        if (templateCount) {
            templateCount.textContent = this.uploadedFiles.filter(f => f.type === 'template').length;
        }

        const payrollCount = document.getElementById('payrollCount');
        if (payrollCount) {
            payrollCount.textContent = this.uploadedFiles.filter(f => f.type === 'payroll').length;
        }

        this.updateRecentFiles();
        this.updateHistory();
    }

    // 최근 파일 업데이트
    updateRecentFiles() {
        const recentFiles = document.getElementById('recentFiles');
        const recentFilesList = document.getElementById('recentFilesList');

        if (!recentFiles || !recentFilesList) return;

        if (this.uploadedFiles.length === 0) {
            recentFiles.style.display = 'none';
            return;
        }

        recentFiles.style.display = 'block';
        recentFilesList.innerHTML = '';

        this.uploadedFiles.slice(-3).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'recent-file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-date">${file.uploadDate.toLocaleDateString()}</span>
                </div>
                <button class="view-btn">보기</button>
            `;
            
            fileItem.querySelector('.view-btn').addEventListener('click', () => {
                this.viewFile(file.id);
            });
            
            recentFilesList.appendChild(fileItem);
        });
    }

    // 히스토리 업데이트
    updateHistory() {
        const emptyState = document.getElementById('emptyState');
        const filesList = document.getElementById('filesList');

        if (!emptyState || !filesList) return;

        if (this.uploadedFiles.length === 0) {
            emptyState.style.display = 'block';
            filesList.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        filesList.style.display = 'block';
        filesList.innerHTML = '';

        this.uploadedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const typeText = file.type === 'template' ? '템플릿' : 
                           file.type === 'payroll' ? '급여대장' : '기타';

            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-header">
                        <span class="file-type-badge ${file.type}">${typeText}</span>
                        <h4>${file.name}</h4>
                    </div>
                    <div class="file-details">
                        <span>크기: ${(file.size / 1024).toFixed(1)} KB</span>
                        <span>업로드: ${file.uploadDate.toLocaleString()}</span>
                        <span>시트: ${Object.keys(file.sheets).length}개</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="view-btn">미리보기</button>
                    <button class="delete-btn">삭제</button>
                </div>
            `;
            
            fileItem.querySelector('.view-btn').addEventListener('click', () => {
                this.viewFile(file.id);
            });
            
            fileItem.querySelector('.delete-btn').addEventListener('click', () => {
                this.confirmDelete(file.id);
            });
            
            filesList.appendChild(fileItem);
        });
    }

    // 파일 보기
    viewFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (file) {
            this.selectedFile = file;
            const previewBtn = document.getElementById('previewBtn');
            if (previewBtn) previewBtn.style.display = 'inline-block';
            this.switchView('preview');
            this.showPreview(file);
        }
    }

    // 미리보기 표시
    showPreview(file) {
        const title = document.getElementById('previewTitle');
        const info = document.getElementById('previewInfo');
        const content = document.getElementById('previewContent');

        if (!title || !info || !content) return;

        title.textContent = `👁️ ${file.name}`;
        
        const typeText = file.type === 'template' ? '템플릿' : 
                        file.type === 'payroll' ? '급여대장' : '기타';

        info.innerHTML = `
            <span>업로드: ${file.uploadDate.toLocaleString()}</span>
            <span>크기: ${(file.size / 1024).toFixed(1)} KB</span>
            <span class="file-type-badge ${file.type}">${typeText}</span>
        `;

        content.innerHTML = '';

        Object.keys(file.sheets).forEach(sheetName => {
            const sheetDiv = document.createElement('div');
            sheetDiv.className = 'sheet-preview';

            const sheetData = file.sheets[sheetName];
            const maxRows = Math.min(25, sheetData.length); // 25행까지 표시

            let tableHTML = `
                <h3 style="margin: 0; padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #e0e0e0;">📄 ${sheetName}</h3>
                <div style="overflow: auto; max-height: 500px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                        <tbody>
            `;

            for (let i = 0; i < maxRows; i++) {
                const row = sheetData[i] || [];
                const rowClass = i === 0 ? 'style="background: #f8f9fa; font-weight: 600;"' : '';
                tableHTML += `<tr ${rowClass}>`;
                
                const maxCols = Math.min(10, row.length);
                for (let j = 0; j < maxCols; j++) {
                    const cell = row[j] !== null && row[j] !== undefined ? String(row[j]) : '';
                    tableHTML += `<td style="padding: 0.5rem; border-bottom: 1px solid #f0f0f0; white-space: nowrap;">${cell}</td>`;
                }
                tableHTML += '</tr>';
            }

            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            if (sheetData.length > maxRows) {
                tableHTML += `<p style="padding: 1rem; text-align: center; color: #666; margin: 0;">... 외 ${sheetData.length - maxRows}행 더 있습니다 (총 ${sheetData.length}행)</p>`;
            }

            sheetDiv.innerHTML = tableHTML;
            sheetDiv.style.cssText = 'background: white; margin-bottom: 2rem; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
            content.appendChild(sheetDiv);
        });
    }

    // 파일 삭제 확인
    confirmDelete(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (file && confirm(`${file.name}을 삭제하시겠습니까?`)) {
            this.deleteFile(fileId);
        }
    }

    // 현재 파일 삭제
    deleteCurrentFile() {
        if (this.selectedFile && confirm(`${this.selectedFile.name}을 삭제하시겠습니까?`)) {
            this.deleteFile(this.selectedFile.id);
        }
    }

    // 파일 삭제
    deleteFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
        
        if (this.selectedFile && this.selectedFile.id === fileId) {
            this.selectedFile = null;
            const previewBtn = document.getElementById('previewBtn');
            if (previewBtn) previewBtn.style.display = 'none';
            this.switchView('dashboard');
        }

        this.saveData();
        this.updateUI();
        this.showNotification('파일이 삭제되었습니다.', 'info');
    }

    // PayPulse 연동
    exportToPayPulse() {
        if (!this.selectedFile) return;

        const exportData = {
            fileName: this.selectedFile.name,
            type: this.selectedFile.type,
            sheets: this.selectedFile.sheets,
            uploadDate: this.selectedFile.uploadDate
        };

        const paypulseData = JSON.parse(localStorage.getItem('paypulse_integrated_data') || '[]');
        paypulseData.push({
            ...exportData,
            exportDate: new Date(),
            status: 'integrated'
        });
        localStorage.setItem('paypulse_integrated_data', JSON.stringify(paypulseData));

        this.showNotification('데이터가 PayPulse 시스템에 연동되었습니다! 🚀', 'success');
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 데이터 저장
    saveData() {
        try {
            localStorage.setItem('paypulse_uploaded_files', JSON.stringify(this.uploadedFiles));
        } catch (error) {
            console.error('데이터 저장 오류:', error);
        }
    }

    // 데이터 로드
    loadSavedData() {
        try {
            const savedFiles = localStorage.getItem('paypulse_uploaded_files');

            if (savedFiles) {
                this.uploadedFiles = JSON.parse(savedFiles).map(file => ({
                    ...file,
                    uploadDate: new Date(file.uploadDate)
                }));
            }

            if (this.uploadedFiles.length > 0) {
                const previewBtn = document.getElementById('previewBtn');
                if (previewBtn) previewBtn.style.display = 'inline-block';
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            this.uploadedFiles = [];
        }
    }
}

// 전역 함수들 (HTML onclick에서 호출용)
function showUploadView() {
    if (window.dataManager) {
        window.dataManager.switchView('upload');
    }
}

function selectFile() {
    if (window.dataManager) {
        window.dataManager.selectFile();
    }
}

function deleteCurrentFile() {
    if (window.dataManager) {
        window.dataManager.deleteCurrentFile();
    }
}

function exportToPayPulse() {
    if (window.dataManager) {
        window.dataManager.exportToPayPulse();
    }
}