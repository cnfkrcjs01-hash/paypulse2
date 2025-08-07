// ExpertAnalysis.jsx - 전문가 분석&예측 메뉴 컴포넌트
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './ExpertAnalysis.css';

const ExpertAnalysis = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hcRoiData, setHcRoiData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 샘플 데이터 - 실제 프로젝트에서는 API로 대체
  const sampleData = {
    departmentCosts: [
      { name: '개발팀', cost: 450000000, headcount: 45, productivity: 95 },
      { name: '마케팅팀', cost: 280000000, headcount: 28, productivity: 88 },
      { name: '영업팀', cost: 320000000, headcount: 32, productivity: 92 },
      { name: '인사팀', cost: 180000000, headcount: 18, productivity: 85 },
      { name: '재무팀', cost: 150000000, headcount: 15, productivity: 90 }
    ],
    monthlyTrend: [
      { month: '1월', cost: 1200000000, revenue: 1800000000, roi: 150 },
      { month: '2월', cost: 1250000000, revenue: 1950000000, roi: 156 },
      { month: '3월', cost: 1180000000, revenue: 2100000000, roi: 178 },
      { month: '4월', cost: 1300000000, revenue: 2200000000, roi: 169 },
      { month: '5월', cost: 1280000000, revenue: 2350000000, roi: 184 },
      { month: '6월', cost: 1350000000, revenue: 2500000000, roi: 185 }
    ]
  };

  // AI 기반 HC ROI 분석 함수
  const analyzeHCROI = async () => {
    setIsAnalyzing(true);
    
    // 실제 AI 분석 로직 시뮬레이션
    setTimeout(() => {
      const totalCost = sampleData.departmentCosts.reduce((sum, dept) => sum + dept.cost, 0);
      const totalHeadcount = sampleData.departmentCosts.reduce((sum, dept) => sum + dept.headcount, 0);
      const avgProductivity = sampleData.departmentCosts.reduce((sum, dept) => sum + dept.productivity, 0) / sampleData.departmentCosts.length;
      
      const predictedRevenue = totalCost * (avgProductivity / 100) * 2.3; // AI 예측 모델
      const hcRoi = ((predictedRevenue - totalCost) / totalCost * 100).toFixed(2);
      
      setHcRoiData({
        totalCost: totalCost,
        totalHeadcount: totalHeadcount,
        avgProductivity: avgProductivity.toFixed(1),
        predictedRevenue: predictedRevenue,
        hcRoi: hcRoi,
        riskLevel: hcRoi > 80 ? 'LOW' : hcRoi > 50 ? 'MEDIUM' : 'HIGH',
        recommendations: [
          '개발팀 생산성 향상을 위한 AI 도구 도입 검토',
          '마케팅팀 ROI 최적화를 위한 디지털 전환 가속화',
          '인력 재배치를 통한 부서별 효율성 극대화'
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="expert-analysis">
      <div className="header">
        <h1>🎯 전문가 분석&예측</h1>
        <p className="subtitle">AI 기반 인건비 최적화 및 HC ROI 전략 플랫폼</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 임원 대시보드
        </button>
        <button 
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          🔍 AI 분석
        </button>
        <button 
          className={activeTab === 'hcroi' ? 'active' : ''}
          onClick={() => setActiveTab('hcroi')}
        >
          💎 HC ROI
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>총 인건비</h3>
              <div className="metric-value">₩13.8억</div>
              <div className="metric-change positive">+5.2% vs 전월</div>
            </div>
            <div className="metric-card">
              <h3>총 인원수</h3>
              <div className="metric-value">138명</div>
              <div className="metric-change positive">+3명 vs 전월</div>
            </div>
            <div className="metric-card">
              <h3>평균 생산성</h3>
              <div className="metric-value">90.2%</div>
              <div className="metric-change negative">-1.8% vs 전월</div>
            </div>
            <div className="metric-card">
              <h3>예상 ROI</h3>
              <div className="metric-value">185%</div>
              <div className="metric-change positive">+12% vs 전월</div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-section">
              <h3>부서별 인건비 현황</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleData.departmentCosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₩${(value/100000000).toFixed(1)}억`} />
                  <Legend />
                  <Bar dataKey="cost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h3>월별 ROI 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="roi" stroke="#82ca9d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="analysis-section">
          <div className="ai-insights">
            <h3>🤖 AI 인사이트</h3>
            <div className="insight-cards">
              <div className="insight-card critical">
                <h4>⚠️ 중요 발견사항</h4>
                <p>개발팀 생산성이 95%로 최고 수준이나, 인건비 대비 아웃풋 효율성 개선 여지 존재</p>
              </div>
              <div className="insight-card opportunity">
                <h4>💡 기회 요소</h4>
                <p>마케팅팀 ROI 개선 시 전체 HC ROI 15% 이상 향상 가능</p>
              </div>
              <div className="insight-card prediction">
                <h4>🔮 예측 모델</h4>
                <p>현재 추세 유지 시 Q3 HC ROI 190% 달성 예상</p>
              </div>
            </div>
          </div>

          <div className="productivity-analysis">
            <h3>부서별 생산성 분석</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={sampleData.departmentCosts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, productivity}) => `${name}: ${productivity}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="productivity"
                >
                  {sampleData.departmentCosts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'hcroi' && (
        <div className="hcroi-section">
          <div className="hcroi-header">
            <h2>💎 HC ROI 전문가 분석</h2>
            <button 
              className="analyze-btn"
              onClick={analyzeHCROI}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '🔄 AI 분석 중...' : '🚀 최신 HC ROI 분석 실행'}
            </button>
          </div>

          {isAnalyzing && (
            <div className="loading-animation">
              <div className="spinner"></div>
              <p>AI가 최신 데이터를 분석하고 있습니다...</p>
            </div>
          )}

          {hcRoiData && (
            <div className="hcroi-results">
              <div className="roi-highlight">
                <div className="roi-main">
                  <h3>최종 HC ROI</h3>
                  <div className="roi-value">{hcRoiData.hcRoi}%</div>
                  <div className={`risk-level ${hcRoiData.riskLevel.toLowerCase()}`}>
                    리스크: {hcRoiData.riskLevel}
                  </div>
                </div>
              </div>

              <div className="roi-breakdown">
                <div className="breakdown-item">
                  <span>총 인건비</span>
                  <span>₩{(hcRoiData.totalCost/100000000).toFixed(1)}억</span>
                </div>
                <div className="breakdown-item">
                  <span>총 인원수</span>
                  <span>{hcRoiData.totalHeadcount}명</span>
                </div>
                <div className="breakdown-item">
                  <span>평균 생산성</span>
                  <span>{hcRoiData.avgProductivity}%</span>
                </div>
                <div className="breakdown-item">
                  <span>예측 매출</span>
                  <span>₩{(hcRoiData.predictedRevenue/100000000).toFixed(1)}억</span>
                </div>
              </div>

              <div className="recommendations">
                <h4>🎯 전문가 추천사항</h4>
                <ul>
                  {hcRoiData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpertAnalysis; 