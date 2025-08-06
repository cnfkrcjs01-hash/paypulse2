// components/pages/Dashboard.tsx
import React from 'react';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-2 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            <span className={changeType === 'increase' ? '↗️' : '↘️'}>{change}</span>
            <span className="text-gray-500 ml-1">전월 대비</span>
          </p>
        </div>
        <div className={`p-3 rounded-full ${changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-6 w-6 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: '총 직원 수',
      value: '46명',
      change: '+3.2%',
      changeType: 'increase' as const,
      icon: UserGroupIcon
    },
    {
      title: '월 총 인건비',
      value: '₩236.3M',
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon
    },
    {
      title: '평균 급여',
      value: '₩5.14M',
      change: '-1.5%',
      changeType: 'decrease' as const,
      icon: TrendingUpIcon
    },
    {
      title: '연장근무비 비율',
      value: '6.2%',
      change: '+0.8%',
      changeType: 'increase' as const,
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💼 PayPulse 대시보드</h1>
        <p className="text-gray-600 mt-2">스마트 인건비 관리 시스템의 핵심 지표를 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 부서별 인건비 차트 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 부서별 인건비 현황</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">차트 영역</p>
              <p className="text-sm text-gray-400">실제 구현시 Chart.js 또는 D3.js 사용</p>
            </div>
          </div>
        </div>

        {/* 월별 추이 차트 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 월별 인건비 추이</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">차트 영역</p>
              <p className="text-sm text-gray-400">실제 구현시 Chart.js 또는 D3.js 사용</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 최근 활동</h3>
        <div className="space-y-3">
          {[
            { time: '10분 전', activity: '마케팅팀 급여 데이터가 업데이트되었습니다.', type: 'update' },
            { time: '1시간 전', activity: 'AI 분석 보고서가 생성되었습니다.', type: 'report' },
            { time: '2시간 전', activity: '새로운 직원 3명이 추가되었습니다.', type: 'add' },
            { time: '3시간 전', activity: '월간 인건비 보고서가 완료되었습니다.', type: 'complete' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'update' ? 'bg-blue-500' :
                activity.type === 'report' ? 'bg-green-500' :
                activity.type === 'add' ? 'bg-purple-500' : 'bg-orange-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.activity}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;