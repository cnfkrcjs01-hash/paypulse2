import React, { useState } from 'react';
import { Upload, BarChart3, PieChart, TrendingUp, AlertTriangle } from 'lucide-react';

const ProfessionalAnalysis = () => {
  const [uploadedData, setUploadedData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // 테스트 템플릿 데이터
  const testTemplate = {
    laborCost: [
      { category: '정규직', monthlyCost: 4500000, benefits: 1200000, total: 5700000 },
      { category: '계약직', monthlyCost: 3200000, benefits: 400000, total: 3600000 }
    ],
    contractors: [
      { name: 'A도급사', monthlyFee: 8000000, quality: 85, risk: 'Low' },
      { name: 'B도급사', monthlyFee: 7200000, quality: 78, risk: 'Medium' }
    ],
    freelancers: [
      { type: '개발자', dailyRate: 400000, efficiency: 92, tax: '3.3%' },
      { type: '디자이너', dailyRate: 300000, efficiency: 88, tax: '3.3%' }
    ],
    agencies: [
      { name: 'X대행업체', serviceFee: 15000000, performance: 90, satisfaction: 4.2 },
      { name: 'Y대행업체', serviceFee: 12000000, performance: 82, satisfaction: 3.8 }
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      // 실제로는 파일 파싱 로직이 들어갈 부분
      setTimeout(() => {
        setUploadedData(file.name);
        setAnalysisResults(generateAnalysis(testTemplate));
        setLoading(false);
      }, 2000);
    }
  };

  const generateAnalysis = (data) => {
    return {
      costEfficiency: {
        mostEfficient: '개인사업자',
        leastEfficient: 'A도급사',
        avgCostPerMonth: 6500000
      },
      riskAssessment: {
        lowest: '정규직',
        highest: '개인사업자',
        recommendations: ['도급사 계약조건 재검토', '개인사업자 세무 리스크 관리']
      },
      qualityMetrics: {
        highest: 'X대행업체 (90점)',
        improvement: '계약직 교육 프로그램 필요'
      }
    };
  };

  const loadTestTemplate = () => {
    setLoading(true);
    setTimeout(() => {
      setUploadedData('test_template.xlsx');
      setAnalysisResults(generateAnalysis(testTemplate));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">전문분석</h1>
        <p className="text-gray-600">인건비, 도급사, 개인사업자, 대행업체 통합 분석 시스템</p>
      </div>

      {/* 업로드 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="mb-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                Excel 또는 CSV 파일을 업로드하세요
              </span>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mb-4">또는</p>
          <button
            onClick={loadTestTemplate}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                분석 중...
              </>
            ) : (
              '테스트 템플릿 사용'
            )}
          </button>
        </div>
      </div>

      {/* 분석 결과 대시보드 */}
      {analysisResults && (
        <div className="space-y-6">
          {/* 요약 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg analysis-card">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">비용 효율성</h3>
              </div>
              <p className="text-sm text-blue-600">
                최고: {analysisResults.costEfficiency.mostEfficient}
              </p>
              <p className="text-xs text-blue-500">
                평균 월비용: {analysisResults.costEfficiency.avgCostPerMonth.toLocaleString()}원
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg analysis-card">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">리스크 평가</h3>
              </div>
              <p className="text-sm text-yellow-600">
                최저위험: {analysisResults.riskAssessment.lowest}
              </p>
              <p className="text-xs text-yellow-500">
                고위험: {analysisResults.riskAssessment.highest}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg analysis-card">
              <div className="flex items-center mb-2">
                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">품질 지표</h3>
              </div>
              <p className="text-sm text-green-600">
                {analysisResults.qualityMetrics.highest}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg analysis-card">
              <div className="flex items-center mb-2">
                <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-800">업로드된 파일</h3>
              </div>
              <p className="text-sm text-purple-600 truncate">{uploadedData}</p>
            </div>
          </div>

          {/* 상세 분석 테이블 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">상세 비교 분석</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      구분
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월 비용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      효율성
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      리스크
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      추천도
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      정규직
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      5,700,000원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        중간
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        낮음
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ⭐⭐⭐⭐
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      개인사업자
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      8,800,000원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        높음
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        높음
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ⭐⭐⭐
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 추천사항 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 최적화 제안</h2>
            <ul className="space-y-2">
              {analysisResults.riskAssessment.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalAnalysis; 