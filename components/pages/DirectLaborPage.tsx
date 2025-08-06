// components/pages/DirectLaborPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentArrowDownIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface DirectLaborData {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  basicSalary: number;
  overtime: number;
  bonus: number;
  total: number;
}

const DirectLaborPage: React.FC = () => {
  const [laborData, setLaborData] = useState<DirectLaborData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-07');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [loading, setLoading] = useState(true);

  // 확장된 샘플 데이터
  const sampleData: DirectLaborData[] = [
    {
      id: '1',
      employeeName: '김철수',
      department: 'IT개발팀',
      position: '선임',
      basicSalary: 4500000,
      overtime: 800000,
      bonus: 300000,
      total: 5600000
    },
    {
      id: '2',
      employeeName: '박영희',
      department: 'IT개발팀',
      position: '주임',
      basicSalary: 3800000,
      overtime: 600000,
      bonus: 200000,
      total: 4600000
    },
    {
      id: '3',
      employeeName: '이민수',
      department: '영업팀',
      position: '과장',
      basicSalary: 5200000,
      overtime: 400000,
      bonus: 500000,
      total: 6100000
    },
    {
      id: '4',
      employeeName: '최지영',
      department: '마케팅팀',
      position: '대리',
      basicSalary: 4200000,
      overtime: 500000,
      bonus: 250000,
      total: 4950000
    },
    {
      id: '5',
      employeeName: '정현우',
      department: 'IT개발팀',
      position: '사원',
      basicSalary: 3200000,
      overtime: 700000,
      bonus: 150000,
      total: 4050000
    },
    {
      id: '6',
      employeeName: '한소희',
      department: '인사팀',
      position: '주임',
      basicSalary: 3600000,
      overtime: 300000,
      bonus: 200000,
      total: 4100000
    },
    {
      id: '7',
      employeeName: '윤성민',
      department: '영업팀',
      position: '선임',
      basicSalary: 4400000,
      overtime: 600000,
      bonus: 400000,
      total: 5400000
    },
    {
      id: '8',
      employeeName: '김예진',
      department: '마케팅팀',
      position: '사원',
      basicSalary: 3000000,
      overtime: 450000,
      bonus: 100000,
      total: 3550000
    }
  ];

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setLaborData(sampleData);
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const filteredData = laborData.filter(item => {
    const matchesSearch = item.employeeName.includes(searchTerm) ||
                         item.department.includes(searchTerm) ||
                         item.position.includes(searchTerm);
    const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;
    const matchesPosition = !selectedPosition || item.position === selectedPosition;
    
    return matchesSearch && matchesDepartment && matchesPosition;
  });

  const totalDirectLabor = laborData.reduce((sum, item) => sum + item.total, 0);
  const totalOvertime = laborData.reduce((sum, item) => sum + item.overtime, 0);
  const totalBonus = laborData.reduce((sum, item) => sum + item.bonus, 0);

  const exportToExcel = () => {
    // Excel 내보내기 로직 시뮬레이션
    const csvData = [
      ['직원명', '부서', '직급', '기본급', '연장근무수당', '성과급', '총액'],
      ...filteredData.map(item => [
        item.employeeName,
        item.department,
        item.position,
        item.basicSalary,
        item.overtime,
        item.bonus,
        item.total
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `직접인건비_${selectedPeriod}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ComponentType<any>; 
    change?: string;
    color?: string;
  }> = ({ title, value, icon: Icon, change, color = 'orange' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-gray-900 mt-2`}>{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} vs 전월
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-orange-100`}>
          <Icon className={`w-6 h-6 text-orange-600`} />
        </div>
      </div>
    </div>
  );

  // 부서별 통계 계산
  const departmentStats = laborData.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = { count: 0, total: 0 };
    }
    acc[item.department].count++;
    acc[item.department].total += item.total;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-orange-500" />
            직접 인건비 관리
          </h1>
          <p className="text-gray-600 mt-2">생산활동에 직접 투입되는 인력 비용 관리</p>
          <div className="flex items-center mt-2 text-sm text-orange-600">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            실시간 데이터 동기화 중
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="2024-08">2024년 8월</option>
              <option value="2024-07">2024년 7월</option>
              <option value="2024-06">2024년 6월</option>
              <option value="2024-05">2024년 5월</option>
            </select>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Excel 내보내기</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 직접인건비"
          value={`₩${totalDirectLabor.toLocaleString()}`}
          icon={ChartBarIcon}
          change="+12.5%"
        />
        <StatCard
          title="총 직원수"
          value={`${laborData.length}명`}
          icon={UsersIcon}
          change="+2명"
          color="blue"
        />
        <StatCard
          title="연장근무비"
          value={`₩${totalOvertime.toLocaleString()}`}
          icon={ClockIcon}
          change="+8.3%"
          color="green"
        />
        <StatCard
          title="성과급"
          value={`₩${totalBonus.toLocaleString()}`}
          icon={TrophyIcon}
          change="+15.2%"
          color="purple"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="직원명, 부서, 직급으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">전체 부서</option>
              <option value="IT개발팀">IT개발팀</option>
              <option value="영업팀">영업팀</option>
              <option value="마케팅팀">마케팅팀</option>
              <option value="인사팀">인사팀</option>
            </select>
            <select 
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">전체 직급</option>
              <option value="사원">사원</option>
              <option value="주임">주임</option>
              <option value="대리">대리</option>
              <option value="선임">선임</option>
              <option value="과장">과장</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직원정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기본급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연장근무수당
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  성과급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 직접인건비
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((employee, index) => (
                <tr key={employee.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-semibold text-sm">
                          {employee.employeeName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.department} · {employee.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₩{employee.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{employee.overtime.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{employee.bonus.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                    ₩{employee.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-orange-600 hover:text-orange-900 font-medium">
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 {filteredData.length}건 중 1-{Math.min(10, filteredData.length)}건 표시
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
              이전
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
              다음
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            부서별 직접인건비 분포
          </h3>
          <div className="h-64 flex flex-col justify-center">
            {Object.entries(departmentStats).map(([dept, stats], index) => (
              <div key={dept} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{dept}</span>
                  <span className="text-sm text-gray-600">
                    {stats.count}명 · ₩{stats.total.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(stats.total / totalDirectLabor) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((stats.total / totalDirectLabor) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            월별 직접인건비 추이
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">월별 추이 차트</p>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>6월</span>
                  <span className="font-semibold">₩35.2M</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>7월</span>
                  <span className="font-semibold">₩38.1M</span>
                </div>
                <div className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-200">
                  <span className="text-orange-700">8월 (현재)</span>
                  <span className="font-semibold text-orange-700">₩{(totalDirectLabor / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectLaborPage;