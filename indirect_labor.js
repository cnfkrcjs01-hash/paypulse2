// 간접 인건비 관리 시스템
console.log('🏢 간접 인건비 시스템 로드됨');

// 간접 인건비 HTML 콘텐츠 생성
function getIndirectLaborHTML() {
    return `
        <div class="page-header">
            <h2><i class="fas fa-heart"></i> 간접 인건비 관리</h2>
            <p>복리후생 및 관리·지원 업무 관련 비용 관리</p>
        </div>
        
        <div class="indirect-labor-container">
            <!-- 실시간 통계 카드 -->
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-content">
                        <h3>총 간접인건비</h3>
                        <p class="stat-value" id="total-indirect-labor">₩35,300,000</p>
                        <span class="stat-change positive">+5.2% vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card green">
                    <div class="stat-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-content">
                        <h3>복리후생비</h3>
                        <p class="stat-value" id="welfare-cost">₩15,300,000</p>
                        <span class="stat-change positive">+3.1% vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card purple">
                    <div class="stat-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-content">
                        <h3>교육훈련비</h3>
                        <p class="stat-value" id="education-cost">₩8,600,000</p>
                        <span class="stat-change positive">+12.8% vs 전월</span>
                    </div>
                </div>
                
                <div class="stat-card orange">
                    <div class="stat-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="stat-content">
                        <h3>식대/교통비</h3>
                        <p class="stat-value" id="transport-meals-cost">₩11,400,000</p>
                        <span class="stat-change positive">+1.5% vs 전월</span>
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
                        <option value="인사팀">인사팀</option>
                        <option value="재무팀">재무팀</option>
                        <option value="관리팀">관리팀</option>
                        <option value="IT개발팀">IT개발팀</option>
                        <option value="마케팅팀">마케팅팀</option>
                    </select>
                    
                    <select id="cost-type-filter">
                        <option value="">전체 비용</option>
                        <option value="welfare">복리후생비</option>
                        <option value="education">교육훈련비</option>
                        <option value="transport">교통비</option>
                        <option value="meals">식대</option>
                    </select>
                    
                    <select id="period-filter">
                        <option value="2024-08">2024년 8월</option>
                        <option value="2024-07">2024년 7월</option>
                        <option value="2024-06">2024년 6월</option>
                    </select>
                    
                    <button class="export-btn" id="export-indirect-labor">
                        <i class="fas fa-download"></i> Excel 내보내기
                    </button>
                </div>
            </div>
            
            <!-- 직원 데이터 테이블 -->
            <div class="data-table-section">
                <div class="table-header">
                    <h3><i class="fas fa-table"></i> 간접 인건비 상세 현황</h3>
                    <div class="table-actions">
                        <button class="refresh-btn" id="refresh-data">
                            <i class="fas fa-sync-alt"></i> 새로고침
                        </button>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="indirect-labor-table">
                        <thead>
                            <tr>
                                <th>직원정보</th>
                                <th>복리후생비</th>
                                <th>교육훈련비</th>
                                <th>교통/식대</th>
                                <th>기타</th>
                                <th>총 간접인건비</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody id="indirect-labor-tbody">
                            <!-- 데이터가 여기에 로드됩니다 -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination">
                    <div class="pagination-info">
                        총 <span id="total-records">8</span>건 중 1-8건 표시
                    </div>
                    <div class="pagination-controls">
                        <button class="page-btn" id="prev-page">이전</button>
                        <span class="page-numbers">
                            <button class="page-btn active">1</button>
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
                            <h3><i class="fas fa-chart-pie"></i> 간접인건비 구성 비율</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="compositionChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-bar"></i> 부서별 간접인건비 분포</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="departmentChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 분석 요약 섹션 -->
            <div class="analysis-summary">
                <h3><i class="fas fa-lightbulb"></i> 💡 간접인건비 분석 요약</h3>
                <div class="summary-cards">
                    <div class="summary-card blue">
                        <h4><i class="fas fa-chart-bar"></i> 현황 분석</h4>
                        <ul>
                            <li>• 총 간접인건비: ₩35,300,000</li>
                            <li>• 월 평균 1인당: ₩4,412,500</li>
                            <li>• 복리후생비 비율: 43.3%</li>
                        </ul>
                    </div>
                    
                    <div class="summary-card green">
                        <h4><i class="fas fa-check-circle"></i> 긍정 요소</h4>
                        <ul>
                            <li>• 교육훈련비 12.8% 증가</li>
                            <li>• 직원 복리후생 개선</li>
                            <li>• 안정적인 식대/교통비 유지</li>
                        </ul>
                    </div>
                    
                    <div class="summary-card purple">
                        <h4><i class="fas fa-target"></i> 개선 제안</h4>
                        <ul>
                            <li>• 교육훈련 효과 측정 시스템 도입</li>
                            <li>• 복리후생 만족도 조사 실시</li>
                            <li>• 비용 효율성 분석 강화</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 간접 인건비 시스템 초기화
function initializeIndirectLabor() {
    console.log('🚀 간접 인건비 시스템 초기화 시작');
    
    // 샘플 데이터 로드
    loadIndirectLaborData();
    
    // 이벤트 리스너 설정
    setupIndirectLaborEvents();
    
    // 차트 초기화
    setTimeout(() => {
        initializeIndirectLaborCharts();
    }, 500);
    
    console.log('✅ 간접 인건비 시스템 초기화 완료');
}

// 샘플 데이터
const indirectLaborData = [
    {
        id: 1,
        name: '김철수',
        department: 'IT개발팀',
        position: '선임',
        welfare: 200000,
        education: 150000,
        transport: 100000,
        meals: 300000,
        others: 50000,
        total: 800000
    },
    {
        id: 2,
        name: '박영희',
        department: '인사팀',
        position: '주임',
        welfare: 180000,
        education: 100000,
        transport: 80000,
        meals: 300000,
        others: 40000,
        total: 700000
    },
    {
        id: 3,
        name: '이민수',
        department: '재무팀',
        position: '과장',
        welfare: 250000,
        education: 200000,
        transport: 120000,
        meals: 350000,
        others: 80000,
        total: 1000000
    },
    {
        id: 4,
        name: '최지영',
        department: '관리팀',
        position: '대리',
        welfare: 220000,
        education: 180000,
        transport: 90000,
        meals: 320000,
        others: 60000,
        total: 870000
    },
    {
        id: 5,
        name: '정현우',
        department: 'IT개발팀',
        position: '사원',
        welfare: 150000,
        education: 80000,
        transport: 70000,
        meals: 280000,
        others: 30000,
        total: 610000
    },
    {
        id: 6,
        name: '한소희',
        department: '인사팀',
        position: '주임',
        welfare: 180000,
        education: 120000,
        transport: 80000,
        meals: 300000,
        others: 40000,
        total: 720000
    },
    {
        id: 7,
        name: '윤성민',
        department: '마케팅팀',
        position: '선임',
        welfare: 210000,
        education: 160000,
        transport: 95000,
        meals: 310000,
        others: 55000,
        total: 830000
    },
    {
        id: 8,
        name: '김예진',
        department: '관리팀',
        position: '사원',
        welfare: 140000,
        education: 70000,
        transport: 65000,
        meals: 270000,
        others: 25000,
        total: 570000
    }
];

// 간접 인건비 데이터 로드
function loadIndirectLaborData() {
    const tbody = document.getElementById('indirect-labor-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    indirectLaborData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="employee-info">
                    <div class="employee-avatar blue">${employee.name.charAt(0)}</div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-dept">${employee.department} · ${employee.position}</div>
                    </div>
                </div>
            </td>
            <td class="amount">₩${employee.welfare.toLocaleString()}</td>
            <td class="amount">₩${employee.education.toLocaleString()}</td>
            <td class="amount">₩${(employee.transport + employee.meals).toLocaleString()}</td>
            <td class="amount">₩${employee.others.toLocaleString()}</td>
            <td class="amount total">₩${employee.total.toLocaleString()}</td>
            <td>
                <button class="action-btn detail-btn" onclick="showIndirectEmployeeDetail(${employee.id})">
                    <i class="fas fa-eye"></i> 상세보기
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 이벤트 리스너 설정
function setupIndirectLaborEvents() {
    // 검색 기능
    const searchInput = document.getElementById('employee-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterIndirectLaborData);
    }
    
    // 필터 기능
    const departmentFilter = document.getElementById('department-filter');
    const costTypeFilter = document.getElementById('cost-type-filter');
    if (departmentFilter) departmentFilter.addEventListener('change', filterIndirectLaborData);
    if (costTypeFilter) costTypeFilter.addEventListener('change', filterIndirectLaborData);
    
    // Excel 내보내기
    const exportBtn = document.getElementById('export-indirect-labor');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportIndirectLaborData);
    }
    
    // 데이터 새로고침
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadIndirectLaborData();
            showIndirectNotification('데이터가 새로고침되었습니다.', 'success');
        });
    }
}

// 데이터 필터링
function filterIndirectLaborData() {
    const searchTerm = document.getElementById('employee-search')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('department-filter')?.value || '';
    const costTypeFilter = document.getElementById('cost-type-filter')?.value || '';
    
    const filteredData = indirectLaborData.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm) ||
                             employee.department.toLowerCase().includes(searchTerm) ||
                             employee.position.toLowerCase().includes(searchTerm);
        const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
        
        return matchesSearch && matchesDepartment;
    });
    
    // 필터된 데이터로 테이블 업데이트
    updateIndirectLaborTable(filteredData);
}

// 테이블 업데이트
function updateIndirectLaborTable(data) {
    const tbody = document.getElementById('indirect-labor-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="employee-info">
                    <div class="employee-avatar blue">${employee.name.charAt(0)}</div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-dept">${employee.department} · ${employee.position}</div>
                    </div>
                </div>
            </td>
            <td class="amount">₩${employee.welfare.toLocaleString()}</td>
            <td class="amount">₩${employee.education.toLocaleString()}</td>
            <td class="amount">₩${(employee.transport + employee.meals).toLocaleString()}</td>
            <td class="amount">₩${employee.others.toLocaleString()}</td>
            <td class="amount total">₩${employee.total.toLocaleString()}</td>
            <td>
                <button class="action-btn detail-btn" onclick="showIndirectEmployeeDetail(${employee.id})">
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
function exportIndirectLaborData() {
    const csvData = [
        ['직원명', '부서', '직급', '복리후생비', '교육훈련비', '교통비', '식대', '기타', '총 간접인건비']
    ];
    
    indirectLaborData.forEach(employee => {
        csvData.push([
            employee.name,
            employee.department,
            employee.position,
            employee.welfare,
            employee.education,
            employee.transport,
            employee.meals,
            employee.others,
            employee.total
        ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '간접인건비_2024-08.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showIndirectNotification('간접인건비 데이터가 Excel로 내보내졌습니다.', 'success');
}

// 직원 상세 정보 보기
function showIndirectEmployeeDetail(employeeId) {
    const employee = indirectLaborData.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    alert(`간접인건비 상세 정보\n\n이름: ${employee.name}\n부서: ${employee.department}\n직급: ${employee.position}\n복리후생비: ₩${employee.welfare.toLocaleString()}\n교육훈련비: ₩${employee.education.toLocaleString()}\n교통비: ₩${employee.transport.toLocaleString()}\n식대: ₩${employee.meals.toLocaleString()}\n기타: ₩${employee.others.toLocaleString()}\n총 간접인건비: ₩${employee.total.toLocaleString()}`);
}

// 차트 초기화
function initializeIndirectLaborCharts() {
    console.log('📊 간접 인건비 차트 초기화 시작');
    
    // Chart.js 로드 확인
    if (typeof Chart === 'undefined') {
        console.log('⚠️ Chart.js가 로드되지 않음');
        return;
    }
    
    // 간접인건비 구성 비율 차트
    const compositionCtx = document.getElementById('compositionChart');
    if (compositionCtx) {
        const totalWelfare = indirectLaborData.reduce((sum, emp) => sum + emp.welfare, 0);
        const totalEducation = indirectLaborData.reduce((sum, emp) => sum + emp.education, 0);
        const totalTransport = indirectLaborData.reduce((sum, emp) => sum + emp.transport, 0);
        const totalMeals = indirectLaborData.reduce((sum, emp) => sum + emp.meals, 0);
        const totalOthers = indirectLaborData.reduce((sum, emp) => sum + emp.others, 0);
        
        new Chart(compositionCtx, {
            type: 'pie',
            data: {
                labels: ['복리후생비', '교육훈련비', '교통비', '식대', '기타'],
                datasets: [{
                    data: [totalWelfare, totalEducation, totalTransport, totalMeals, totalOthers],
                    backgroundColor: [
                        '#FF6384',
                        '#9966FF',
                        '#36A2EB',
                        '#FFCE56',
                        '#95A5A6'
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
    
    // 부서별 분포 차트
    const departmentCtx = document.getElementById('departmentChart');
    if (departmentCtx) {
        const departmentStats = {};
        indirectLaborData.forEach(emp => {
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = 0;
            }
            departmentStats[emp.department] += emp.total;
        });
        
        new Chart(departmentCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(departmentStats),
                datasets: [{
                    label: '간접인건비',
                    data: Object.values(departmentStats),
                    backgroundColor: '#3B82F6',
                    borderColor: '#2563EB',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₩' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }
    
    console.log('✅ 간접 인건비 차트 초기화 완료');
}

// 알림 표시 함수
function showIndirectNotification(message, type = 'info') {
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

console.log('✅ 간접 인건비 시스템 로드 완료');