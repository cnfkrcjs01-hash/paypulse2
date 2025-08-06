// 직접 인건비 관리 시스템
console.log('💼 직접 인건비 시스템 로드됨');

// 직접 인건비 HTML 콘텐츠 생성
function getDirectLaborHTML() {
    return `
        <div class="page-header">
            <h2><i class="fas fa-users-cog"></i> 직접 인건비 관리</h2>
            <p>생산활동에 직접 투입되는 인력 비용 관리</p>
        </div>
        
        <div class="direct-labor-container">
            <!-- 실시간 통계 카드 -->
            <div class="stats-grid">
                <div class="stat-card orange">
                    <div class="stat-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="stat-content">
                        <h3>총 직접인건비</h3>
                        <p class="stat-value" id="total-direct-labor">₩89,200,000</p>
                        <span class="stat-change positive">+12.5% vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card blue">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>총 직원수</h3>
                        <p class="stat-value" id="total-employees">42명</p>
                        <span class="stat-change positive">+2명 vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card green">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3>연장근무비</h3>
                        <p class="stat-value" id="overtime-cost">₩12,800,000</p>
                        <span class="stat-change positive">+8.3% vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card purple">
                    <div class="stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-content">
                        <h3>성과급</h3>
                        <p class="stat-value" id="bonus-amount">₩8,500,000</p>
                        <span class="stat-change positive">+15.2% vs 전월</span>
                    </div>
                </div>
            </div>
            
            <!-- 검색 및 필터 섹션 -->
            <div class="search-filter-section">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="employee-search" placeholder="직원명, 부서, 직급으로 검색...">
                </div>
                
                <div class="filter-controls">
                    <select id="department-filter">
                        <option value="">전체 부서</option>
                        <option value="IT개발팀">IT개발팀</option>
                        <option value="영업팀">영업팀</option>
                        <option value="마케팅팀">마케팅팀</option>
                        <option value="생산팀">생산팀</option>
                    </select>
                    
                    <select id="position-filter">
                        <option value="">전체 직급</option>
                        <option value="사원">사원</option>
                        <option value="주임">주임</option>
                        <option value="선임">선임</option>
                        <option value="과장">과장</option>
                    </select>
                    
                    <select id="period-filter">
                        <option value="2024-08">2024년 8월</option>
                        <option value="2024-07">2024년 7월</option>
                        <option value="2024-06">2024년 6월</option>
                    </select>
                    
                    <button class="export-btn" id="export-direct-labor">
                        <i class="fas fa-download"></i> Excel 내보내기
                    </button>
                </div>
            </div>
            
            <!-- 직원 데이터 테이블 -->
            <div class="data-table-section">
                <div class="table-header">
                    <h3><i class="fas fa-table"></i> 직접 인건비 상세 현황</h3>
                    <div class="table-actions">
                        <button class="refresh-btn" id="refresh-data">
                            <i class="fas fa-sync-alt"></i> 새로고침
                        </button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="direct-labor-table">
                        <thead>
                            <tr>
                                <th>직원정보</th>
                                <th>기본급</th>
                                <th>연장근무수당</th>
                                <th>성과급</th>
                                <th>총 직접인건비</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody id="direct-labor-tbody">
                            <!-- 데이터가 여기에 로드됩니다 -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination">
                    <div class="pagination-info">
                        총 <span id="total-records">42</span>건 중 1-10건 표시
                    </div>
                    <div class="pagination-controls">
                        <button class="page-btn" id="prev-page">이전</button>
                        <span class="page-numbers">
                            <button class="page-btn active">1</button>
                            <button class="page-btn">2</button>
                            <button class="page-btn">3</button>
                        </span>
                        <button class="page-btn" id="next-page">다음</button>
                    </div>
                </div>
            </div>
            
            <!-- 차트 섹션 -->
            <div class="charts-section">
                <div class="chart-row">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-pie"></i> 부서별 직접인건비 분포</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="departmentDistributionChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-line"></i> 월별 직접인건비 추이</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="monthlyTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 분석 요약 섹션 -->
            <div class="analysis-summary">
                <h3><i class="fas fa-lightbulb"></i> 💡 직접인건비 분석 요약</h3>
                <div class="summary-cards">
                    <div class="summary-card blue">
                        <h4><i class="fas fa-chart-bar"></i> 현황 분석</h4>
                        <ul>
                            <li>• 총 직접인건비: ₩89,200,000</li>
                            <li>• 월 평균 1인당: ₩2,124,000</li>
                            <li>• 연장근무비 비율: 14.3%</li>
                        </ul>
                    </div>
                    
                    <div class="summary-card green">
                        <h4><i class="fas fa-check-circle"></i> 긍정 요소</h4>
                        <ul>
                            <li>• 성과급 15.2% 증가</li>
                            <li>• 생산성 지표 개선</li>
                            <li>• 직원 만족도 상승</li>
                        </ul>
                    </div>
                    
                    <div class="summary-card purple">
                        <h4><i class="fas fa-target"></i> 개선 제안</h4>
                        <ul>
                            <li>• 연장근무 최적화 방안 검토</li>
                            <li>• 성과급 체계 재정비</li>
                            <li>• 생산성 향상 프로그램 도입</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 직접 인건비 시스템 초기화
function initializeDirectLabor() {
    console.log('🚀 직접 인건비 시스템 초기화 시작');
    
    // 샘플 데이터 로드
    loadDirectLaborData();
    
    // 이벤트 리스너 설정
    setupDirectLaborEvents();
    
    // 차트 초기화
    setTimeout(() => {
        initializeDirectLaborCharts();
    }, 500);
    
    console.log('✅ 직접 인건비 시스템 초기화 완료');
}

// 샘플 데이터
const directLaborData = [
    {
        id: 1,
        name: '김철수',
        department: 'IT개발팀',
        position: '선임',
        basicSalary: 4500000,
        overtime: 800000,
        bonus: 300000,
        total: 5600000
    },
    {
        id: 2,
        name: '박영희',
        department: 'IT개발팀',
        position: '주임',
        basicSalary: 3800000,
        overtime: 600000,
        bonus: 200000,
        total: 4600000
    },
    {
        id: 3,
        name: '이민수',
        department: '생산팀',
        position: '과장',
        basicSalary: 5200000,
        overtime: 900000,
        bonus: 400000,
        total: 6500000
    },
    {
        id: 4,
        name: '최지영',
        department: '영업팀',
        position: '대리',
        basicSalary: 4200000,
        overtime: 500000,
        bonus: 350000,
        total: 5050000
    },
    {
        id: 5,
        name: '정현우',
        department: 'IT개발팀',
        position: '사원',
        basicSalary: 3200000,
        overtime: 400000,
        bonus: 150000,
        total: 3750000
    },
    {
        id: 6,
        name: '한소희',
        department: '마케팅팀',
        position: '주임',
        basicSalary: 3600000,
        overtime: 300000,
        bonus: 200000,
        total: 4100000
    }
];

// 직접 인건비 데이터 로드
function loadDirectLaborData() {
    const tbody = document.getElementById('direct-labor-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    directLaborData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-dept">${employee.department} · ${employee.position}</div>
                    </div>
                </div>
            </td>
            <td class="amount">₩${employee.basicSalary.toLocaleString()}</td>
            <td class="amount">₩${employee.overtime.toLocaleString()}</td>
            <td class="amount">₩${employee.bonus.toLocaleString()}</td>
            <td class="amount total">₩${employee.total.toLocaleString()}</td>
            <td>
                <button class="action-btn detail-btn" onclick="showEmployeeDetail(${employee.id})">
                    <i class="fas fa-eye"></i> 상세보기
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 이벤트 리스너 설정
function setupDirectLaborEvents() {
    // 검색 기능
    const searchInput = document.getElementById('employee-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterDirectLaborData);
    }
    
    // 필터 기능
    const departmentFilter = document.getElementById('department-filter');
    const positionFilter = document.getElementById('position-filter');
    if (departmentFilter) departmentFilter.addEventListener('change', filterDirectLaborData);
    if (positionFilter) positionFilter.addEventListener('change', filterDirectLaborData);
    
    // Excel 내보내기
    const exportBtn = document.getElementById('export-direct-labor');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDirectLaborData);
    }
    
    // 데이터 새로고침
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDirectLaborData();
            showNotification('데이터가 새로고침되었습니다.', 'success');
        });
    }
}

// 데이터 필터링
function filterDirectLaborData() {
    const searchTerm = document.getElementById('employee-search')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('department-filter')?.value || '';
    const positionFilter = document.getElementById('position-filter')?.value || '';
    
    const filteredData = directLaborData.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm) ||
                             employee.department.toLowerCase().includes(searchTerm) ||
                             employee.position.toLowerCase().includes(searchTerm);
        const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
        const matchesPosition = !positionFilter || employee.position === positionFilter;
        
        return matchesSearch && matchesDepartment && matchesPosition;
    });
    
    // 필터된 데이터로 테이블 업데이트
    updateDirectLaborTable(filteredData);
}

// 테이블 업데이트
function updateDirectLaborTable(data) {
    const tbody = document.getElementById('direct-labor-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${employee.name.charAt(0)}</div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-dept">${employee.department} · ${employee.position}</div>
                    </div>
                </div>
            </td>
            <td class="amount">₩${employee.basicSalary.toLocaleString()}</td>
            <td class="amount">₩${employee.overtime.toLocaleString()}</td>
            <td class="amount">₩${employee.bonus.toLocaleString()}</td>
            <td class="amount total">₩${employee.total.toLocaleString()}</td>
            <td>
                <button class="action-btn detail-btn" onclick="showEmployeeDetail(${employee.id})">
                    <i class="fas fa-eye"></i> 상세보기
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 레코드 수 업데이트
    const totalRecords = document.getElementById('total-records');
    if (totalRecords) {
        totalRecords.textContent = data.length;
    }
}

// Excel 내보내기
function exportDirectLaborData() {
    const csvData = [
        ['직원명', '부서', '직급', '기본급', '연장근무수당', '성과급', '총 직접인건비']
    ];
    
    directLaborData.forEach(employee => {
        csvData.push([
            employee.name,
            employee.department,
            employee.position,
            employee.basicSalary,
            employee.overtime,
            employee.bonus,
            employee.total
        ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '직접인건비_2024-08.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('직접인건비 데이터가 Excel로 내보내졌습니다.', 'success');
}

// 직원 상세 정보 보기
function showEmployeeDetail(employeeId) {
    const employee = directLaborData.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    alert(`직원 상세 정보\n\n이름: ${employee.name}\n부서: ${employee.department}\n직급: ${employee.position}\n기본급: ₩${employee.basicSalary.toLocaleString()}\n연장근무수당: ₩${employee.overtime.toLocaleString()}\n성과급: ₩${employee.bonus.toLocaleString()}\n총 직접인건비: ₩${employee.total.toLocaleString()}`);
}

// 차트 초기화
function initializeDirectLaborCharts() {
    console.log('📊 직접 인건비 차트 초기화 시작');
    
    // Chart.js 로드 확인
    if (typeof Chart === 'undefined') {
        console.log('⚠️ Chart.js가 로드되지 않음');
        return;
    }
    
    // 부서별 분포 차트
    const deptCtx = document.getElementById('departmentDistributionChart');
    if (deptCtx) {
        const departmentStats = {};
        directLaborData.forEach(emp => {
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = 0;
            }
            departmentStats[emp.department] += emp.total;
        });
        
        new Chart(deptCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(departmentStats),
                datasets: [{
                    data: Object.values(departmentStats),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // 월별 추이 차트
    const trendCtx = document.getElementById('monthlyTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08'],
                datasets: [{
                    label: '직접인건비',
                    data: [75000000, 78000000, 82000000, 79000000, 85000000, 89200000],
                    borderColor: '#FF5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₩' + (value / 1000000).toFixed(0) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }
    
    console.log('✅ 직접 인건비 차트 초기화 완료');
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림이 있다면 제거
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

console.log('✅ 직접 인건비 시스템 로드 완료');