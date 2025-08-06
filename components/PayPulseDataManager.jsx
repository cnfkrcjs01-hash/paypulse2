import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import './PayPulseDataManager.css';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
  data: any[][];
  sheets: { [key: string]: any[][] };
  type: 'template' | 'payroll' | 'other';
}

interface DataStats {
  totalEmployees: number;
  totalSalary: number;
  departments: string[];
  lastUpdate: Date;
}

const PayPulseDataManager: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'history' | 'preview'>('dashboard');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dataStats, setDataStats] = useState<DataStats>({
    totalEmployees: 0,
    totalSalary: 0,
    departments: [],
    lastUpdate: new Date()
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: { [key: string]: any[][] } = {};
      const allData: any[][] = [];
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        sheets[sheetName] = jsonData as any[][];
        allData.push(...jsonData as any[][]);
      });

      // 파일 타입 자동 감지
      let fileType: 'template' | 'payroll' | 'other' = 'other';
      if (file.name.includes('템플릿') || file.name.includes('template')) {
        fileType = 'template';
      } else if (file.name.includes('급여') || file.name.includes('payroll')) {
        fileType = 'payroll';
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadDate: new Date(),
        data: allData,
        sheets,
        type: fileType
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      updateDataStats([...uploadedFiles, uploadedFile]);
      
      // 성공 시 미리보기로 자동 이동
      setSelectedFile(uploadedFile);
      setCurrentView('preview');
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles]);

  // 데이터 통계 업데이트
  const updateDataStats = useCallback((files: UploadedFile[]) => {
    const payrollFiles = files.filter(f => f.type === 'payroll');
    
    let totalEmployees = 0;
    let totalSalary = 0;
    const departments = new Set<string>();

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

    setDataStats({
      totalEmployees,
      totalSalary,
      departments: Array.from(departments),
      lastUpdate: new Date()
    });
  }, []);

  // 파일 삭제
  const deleteFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      updateDataStats(updated);
      return updated;
    });
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setCurrentView('dashboard');
    }
  }, [selectedFile, updateDataStats]);

  // 파일 선택 트리거
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(f => 
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    
    if (excelFile) {
      handleFileUpload(excelFile);
    }
  }, [handleFileUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="paypulse-data-manager">
      {/* 헤더 */}
      <header className="pdm-header">
        <div className="header-content">
          <h1>📊 PayPulse 데이터 관리</h1>
          <p>스마트한 급여 데이터 관리 시스템</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">등록 직원</span>
            <span className="stat-value">{dataStats.totalEmployees}명</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">총 급여</span>
            <span className="stat-value">
              {dataStats.totalSalary.toLocaleString()}원
            </span>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <nav className="pdm-navigation">
        <button 
          className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          🏠 대시보드
        </button>
        <button 
          className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentView('upload')}
        >
          📤 업로드
        </button>
        <button 
          className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          📋 히스토리
        </button>
        {selectedFile && (
          <button 
            className={`nav-btn ${currentView === 'preview' ? 'active' : ''}`}
            onClick={() => setCurrentView('preview')}
          >
            👁️ 미리보기
          </button>
        )}
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="pdm-content">
        {/* 대시보드 */}
        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>📁 업로드된 파일</h3>
                <div className="file-count">{uploadedFiles.length}개</div>
                <div className="file-types">
                  <span>템플릿: {uploadedFiles.filter(f => f.type === 'template').length}</span>
                  <span>급여대장: {uploadedFiles.filter(f => f.type === 'payroll').length}</span>
                </div>
              </div>
              
              <div className="dashboard-card">
                <h3>👥 직원 현황</h3>
                <div className="employee-stats">
                  <div>총 {dataStats.totalEmployees}명</div>
                  <div>{dataStats.departments.length}개 부서</div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3>💰 급여 현황</h3>
                <div className="salary-stats">
                  <div>총액: {dataStats.totalSalary.toLocaleString()}원</div>
                  <div>평균: {dataStats.totalEmployees > 0 ? 
                    Math.round(dataStats.totalSalary / dataStats.totalEmployees).toLocaleString() : 0}원</div>
                </div>
              </div>

              <div className="dashboard-card quick-upload">
                <h3>⚡ 빠른 업로드</h3>
                <button className="quick-upload-btn" onClick={() => setCurrentView('upload')}>
                  새 파일 업로드
                </button>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="recent-files">
                <h3>최근 업로드된 파일</h3>
                <div className="recent-files-list">
                  {uploadedFiles.slice(-3).map(file => (
                    <div key={file.id} className="recent-file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-date">
                          {file.uploadDate.toLocaleDateString()}
                        </span>
                      </div>
                      <button 
                        className="view-btn"
                        onClick={() => {
                          setSelectedFile(file);
                          setCurrentView('preview');
                        }}
                      >
                        보기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 업로드 */}
        {currentView === 'upload' && (
          <div className="upload-view">
            <div className="upload-container">
              <h2>📤 파일 업로드</h2>
              
              <div 
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {isUploading ? (
                  <div className="uploading">
                    <div className="spinner"></div>
                    <p>업로드 중...</p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📁</div>
                    <h3>파일을 드래그하거나 클릭하여 업로드</h3>
                    <p>Excel (.xlsx, .xls), CSV 파일을 지원합니다</p>
                    <button 
                      className="upload-btn"
                      onClick={triggerFileSelect}
                    >
                      파일 선택
                    </button>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                style={{ display: 'none' }}
              />

              <div className="upload-guide">
                <h4>📋 업로드 가이드</h4>
                <ul>
                  <li>Excel 파일(.xlsx, .xls) 또는 CSV 파일을 업로드할 수 있습니다</li>
                  <li>파일명에 "템플릿"이 포함되면 템플릿으로 자동 분류됩니다</li>
                  <li>파일명에 "급여"가 포함되면 급여대장으로 자동 분류됩니다</li>
                  <li>업로드된 파일은 즉시 미리보기에서 확인할 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 히스토리 */}
        {currentView === 'history' && (
          <div className="history-view">
            <h2>📋 업로드 히스토리</h2>
            
            {uploadedFiles.length === 0 ? (
              <div className="empty-state">
                <p>아직 업로드된 파일이 없습니다.</p>
                <button 
                  className="upload-btn"
                  onClick={() => setCurrentView('upload')}
                >
                  첫 번째 파일 업로드하기
                </button>
              </div>
            ) : (
              <div className="files-list">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <div className="file-header">
                        <span className={`file-type-badge ${file.type}`}>
                          {file.type === 'template' ? '템플릿' : 
                           file.type === 'payroll' ? '급여대장' : '기타'}
                        </span>
                        <h4>{file.name}</h4>
                      </div>
                      <div className="file-details">
                        <span>크기: {(file.size / 1024).toFixed(1)} KB</span>
                        <span>업로드: {file.uploadDate.toLocaleString()}</span>
                        <span>시트: {Object.keys(file.sheets).length}개</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="view-btn"
                        onClick={() => {
                          setSelectedFile(file);
                          setCurrentView('preview');
                        }}
                      >
                        미리보기
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => {
                          if (confirm(`${file.name}을 삭제하시겠습니까?`)) {
                            deleteFile(file.id);
                          }
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 미리보기 */}
        {currentView === 'preview' && selectedFile && (
          <div className="preview-view">
            <div className="preview-header">
              <h2>👁️ {selectedFile.name}</h2>
              <div className="preview-info">
                <span>업로드: {selectedFile.uploadDate.toLocaleString()}</span>
                <span>크기: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                <span className={`type-badge ${selectedFile.type}`}>
                  {selectedFile.type === 'template' ? '템플릿' : 
                   selectedFile.type === 'payroll' ? '급여대장' : '기타'}
                </span>
              </div>
            </div>

            <div className="preview-content">
              {Object.keys(selectedFile.sheets).map(sheetName => (
                <div key={sheetName} className="sheet-preview">
                  <h3>📄 {sheetName}</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <tbody>
                        {selectedFile.sheets[sheetName].slice(0, 10).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex === 0 ? 'header-row' : ''}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex}>
                                {cell !== null && cell !== undefined ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedFile.sheets[sheetName].length > 10 && (
                      <p className="more-data">
                        ... 외 {selectedFile.sheets[sheetName].length - 10}행 더 있습니다
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-actions">
              <button 
                className="delete-btn"
                onClick={() => {
                  if (confirm(`${selectedFile.name}을 삭제하시겠습니까?`)) {
                    deleteFile(selectedFile.id);
                  }
                }}
              >
                🗑️ 파일 삭제
              </button>
              <button 
                className="export-btn"
                onClick={() => {
                  // 추후 데이터 내보내기 기능
                  alert('데이터 내보내기 기능은 추후 구현 예정입니다.');
                }}
              >
                📊 데이터 연동
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PayPulseDataManager;