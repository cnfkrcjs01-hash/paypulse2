// components/pages/IndirectLaborPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentArrowDownIcon, 
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  HeartIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface IndirectLaborData {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  welfare: number;
  education: number;
  transport: number;
  meals: number;
  others: number;
  total: number;
}

const IndirectLaborPage: React.FC = () => {
  const [laborData, setLaborData] = useState<IndirectLaborData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-08');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  // 확장된 샘플 데이터
  const sampleData: IndirectLaborData[] = [
    {
      id: '1',
      employeeName: '김철수',
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
      id: '2',
      employeeName: '박영희',
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
      id: '3',
      employeeName: '이민수',
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
      id: '4',
      employeeName: '최지영',
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
      id: '5',
      employeeName: '정현우',
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
      id: '6',
      employeeName: '한소희',
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
      id: '7',
      employeeName: '윤성민',
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
      id: '8',
      employeeName: '김예진',
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

  useEffect(() => {
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
    
    return matchesSearch && matchesDepartment;
  });

  const totalIndirectLabor = laborData.reduce((sum, item) => sum + item.total, 0);
  const totalWelfare = laborData.reduce((sum, item) => sum + item.welfare, 0);
  const totalEducation = laborData.reduce((sum, item) => sum + item.education, 0);
  const totalMeals = laborData.reduce((sum, item) => sum + (item.meals + item.transport), 0);

  const exportToExcel = () => {
    // Excel 내보내기 로직
    const csvData = [
      ['직원명', '부서', '직급', '복리후생비', '교육훈련비', '교통비', '식대', '기타', '총액'],
      ...filteredData.map(item => [
        item.employeeName,
        item.department,
        item.position,
        item.welfare,
        item.education,
        item.transport,
        item.meals,
        item.others,
        item.total
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `간접인건비_${selectedPeriod}.csv`);
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
  }> = ({ title, value, icon: Icon, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {change} vs 전월
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-100">
          <Icon className="w-6 h-6 text-blue-600" />
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

  // 간접인건비 구성 비율 계산
  const compositionStats = {
    welfare: totalWelfare,
    education: totalEducation,
    transport: laborData.reduce((sum, item) => sum + item.transport, 0),
    meals: laborData.reduce((sum, item) => sum + item.meals, 0),
    others: laborData.reduce((sum, item) => sum + item.others, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BuildingOfficeIcon className="w-8 h-8 mr-3 text-blue-500" />
            간접 인건비 관리
          </h1>
          <p className="text-gray-600 mt-2">복리후생 및 관리·지원 업무 관련 비용 관리</p>
          <div className="flex items-center mt-2 text-sm text-blue-600">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            복리후생 데이터 분석 중
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024-08">2024년 8월</option>
              <option value="2024-07">2024년 7월</option>
              <option value="2024-06">2024년 6월</option>
              <option value="2024-05">2024년 5월</option>
            </select>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Excel 내보내기</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 간접인건비"
          value={`₩${totalIndirectLabor.toLocaleString()}`}
          icon={BuildingOfficeIcon}
          change="+5.2%"
          color="blue"
        />
        <StatCard
          title="복리후생비"
          value={`₩${totalWelfare.toLocaleString()}`}
          icon={HeartIcon}
          change="+3.1%"
          color="green"
        />
        <StatCard
          title="교육훈련비"
          value={`₩${totalEducation.toLocaleString()}`}
          icon={AcademicCapIcon}
          change="+12.8%"
          color="purple"
        />
        <StatCard
          title="식대/교통비"
          value={`₩${totalMeals.toLocaleString()}`}
          icon={TruckIcon}
          change="+1.5%"
          color="orange"
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">전체 부서</option>
              <option value="인사팀">인사팀</option>
              <option value="재무팀">재무팀</option>
              <option value="관리팀">관리팀</option>
              <option value="IT개발팀">IT개발팀</option>
              <option value="마케팅팀">마케팅팀</option>
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
                  복리후생비
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  교육훈련비
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  교통/식대
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기타
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 간접인건비
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
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
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
                    ₩{employee.welfare.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{employee.education.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{(employee.transport + employee.meals).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{employee.others.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    ₩{employee.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 font-medium">
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
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
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
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            간접인건비 구성 비율
          </h3>
          <div className="h-64 flex flex-col justify-center">
            {Object.entries(compositionStats).map(([type, amount], index) => {
              const labels = {
                welfare: '복리후생비',
                education: '교육훈련비',
                transport: '교통비',
                meals: '식대',
                others: '기타'
              };
              const colors = {
                welfare: 'bg-red-500',
                education: 'bg-purple-500',
                transport: 'bg-green-500',
                meals: 'bg-yellow-500',
                others: 'bg-gray-500'
              };
              
              return (
                <div key={type} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className={`w-3 h-3 ${colors[type]} rounded-full mr-2`}></span>
                      {labels[type]}
                    </span>
                    <span className="text-sm text-gray-600">
                      ₩{amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors[type]} h-2 rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${(amount / totalIndirectLabor) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((amount / totalIndirectLabor) * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            부서별 간접인건비 분포
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
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(stats.total / totalIndirectLabor) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((stats.total / totalIndirectLabor) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
          💡 간접인건비 분석 요약
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📊 현황 분석</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 총 간접인건비: ₩{totalIndirectLabor.toLocaleString()}</li>
              <li>• 월 평균 1인당: ₩{Math.round(totalIndirectLabor / laborData.length).toLocaleString()}</li>
              <li>• 복리후생비 비율: {((totalWelfare / totalIndirectLabor) * 100).toFixed(1)}%</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ 긍정 요소</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 교육훈련비 12.8% 증가</li>
              <li>• 직원 복리후생 개선</li>
              <li>• 안정적인 식대/교통비 유지</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">🎯 개선 제안</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 교육훈련 효과 측정 시스템 도입</li>
              <li>• 복리후생 만족도 조사 실시</li>
              <li>• 비용 효율성 분석 강화</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndirectLaborPage;