// components/layout/Sidebar.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const menuItems = [
    { icon: HomeIcon, label: '메인 대시보드', path: '/dashboard' },
    { icon: ChartBarIcon, label: '종합 인건비', path: '/labor-cost' },
    { icon: CurrencyDollarIcon, label: '직접 인건비', path: '/direct-labor', active: true },
    { icon: UsersIcon, label: '간접 인건비', path: '/indirect-labor' },
    { icon: DocumentTextIcon, label: '급여 인건비', path: '/salary-labor' },
    { icon: CogIcon, label: '통계 분석', path: '/analytics' }
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <h1 className="text-xl font-bold text-orange-500">PayPulse</h1>
        </div>
        <p className="text-gray-400 text-sm mt-2">AI 기반 스마트 인건비 관리 시스템</p>
        <p className="text-orange-400 text-xs mt-1">급여와 개인정보보호를 위해 암호화됨</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-orange-400 text-sm font-semibold mb-4">인건비 관리</div>
        {menuItems.slice(0, 4).map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              item.active || router.pathname === item.path
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        <div className="text-orange-400 text-sm font-semibold mt-8 mb-4">분석 및 설정</div>
        {menuItems.slice(4).map((item, index) => (
          <button
            key={index + 4}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
              router.pathname === item.path
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          현재 인력 분석 중...
        </div>
      </div>
    </div>
  );
};

export default Sidebar;