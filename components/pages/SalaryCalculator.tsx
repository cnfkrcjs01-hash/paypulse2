// components/pages/SalaryCalculator.tsx
import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CalculatorIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface SalaryData {
  baseSalary: number;
  position: string;
  department: string;
  overtimeHours: number;
  allowances: number;
  nationalPension: number;
  healthInsurance: number;
  employmentInsurance: number;
  workersCompensation: number;
  localTax: number;
  incomeTax: number;
}

interface CalculationResult {
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  employerCosts: number;
  totalLaborCost: number;
}

const SalaryCalculator: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryData>({
    baseSalary: 3000000,
    position: '사원',
    department: '개발팀',
    overtimeHours: 0,
    allowances: 100000,
    nationalPension: 4.5,
    healthInsurance: 3.495,
    employmentInsurance: 0.9,
    workersCompensation: 0.7,
    localTax: 10,
    incomeTax: 0
  });

  const [result, setResult] = useState<CalculationResult>({
    grossSalary: 0,
    totalDeductions: 0,
    netSalary: 0,
    employerCosts: 0,
    totalLaborCost: 0
  });

  const calculateSalary = () => {
    const { baseSalary, overtimeHours, allowances } = salaryData;
    
    // 시간당 임금 계산 (주 40시간 기준)
    const hourlyWage = baseSalary / (40 * 4.33);
    const overtimePay = hourlyWage * 1.5 * overtimeHours;
    
    // 총 급여
    const grossSalary = baseSalary + overtimePay + allowances;
    
    // 4대보험 공제액 (직원 부담분)
    const nationalPension = Math.min(grossSalary * (salaryData.nationalPension / 100), 243000); // 상한선 적용
    const healthInsurance = grossSalary * (salaryData.healthInsurance / 100);
    const employmentInsurance = grossSalary * (salaryData.employmentInsurance / 100);
    
    // 소득세 간이 계산 (실제로는 더 복잡)
    let incomeTax = 0;
    if (grossSalary > 1060000) {
      incomeTax = (grossSalary - 1060000) * 0.06;
    }
    
    // 지방소득세
    const localTax = incomeTax * (salaryData.localTax / 100);
    
    // 총 공제액
    const totalDeductions = nationalPension + healthInsurance + employmentInsurance + incomeTax + localTax;
    
    // 실수령액
    const netSalary = grossSalary - totalDeductions;
    
    // 사용자 부담 4대보험 (회사 부담분)
    const employerNationalPension = nationalPension; // 동일 금액
    const employerHealthInsurance = healthInsurance * 1.0288; // 장기요양보험 포함
    const employerEmploymentInsurance = grossSalary * (salaryData.employmentInsurance / 100);
    const workersCompensation = grossSalary * (salaryData.workersCompensation / 100);
    
    const employerCosts = employerNationalPension + employerHealthInsurance + 
                         employerEmploymentInsurance + workersCompensation;
    
    // 총 인건비
    const totalLaborCost = grossSalary + employerCosts;
    
    setResult({
      grossSalary,
      totalDeductions,
      netSalary,
      employerCosts,
      totalLaborCost
    });
  };

  useEffect(() => {
    calculateSalary();
  }, [salaryData]);

  const handleInputChange = (field: keyof SalaryData, value: number | string) => {
    setSalaryData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <CalculatorIcon className="h-8 w-8 mr-3 text-blue-600" />
          스마트 인건비 계산기
        </h1>
        <p className="text-gray-600 mt-2">정확한 급여 계산과 총 인건비 분석을 위한 도구입니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
            급여 정보 입력
          </h2>

          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직급</label>
                <select
                  value={salaryData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="사원">사원</option>
                  <option value="주임">주임</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="차장">차장</option>
                  <option value="부장">부장</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
                <select
                  value={salaryData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="개발팀">개발팀</option>
                  <option value="마케팅팀">마케팅팀</option>
                  <option value="인사팀">인사팀</option>
                  <option value="영업팀">영업팀</option>
                  <option value="기획팀">기획팀</option>
                </select>
              </div>
            </div>

            {/* 급여 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기본급 (월)</label>
              <input
                type="number"
                value={salaryData.baseSalary}
                onChange={(e) => handleInputChange('baseSalary', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3,000,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연장근무 시간 (월)</label>
              <input
                type="number"
                value={salaryData.overtimeHours}
                onChange={(e) => handleInputChange('overtimeHours', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제수당 (월)</label>
              <input
                type="number"
                value={salaryData.allowances}
                onChange={(e) => handleInputChange('allowances', Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100,000"
              />
            </div>

            {/* 4대보험 요율 */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">4대보험 요율 설정</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">국민연금 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salaryData.nationalPension}
                    onChange={(e) => handleInputChange('nationalPension', Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">건강보험 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salaryData.healthInsurance}
                    onChange={(e) => handleInputChange('healthInsurance', Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">고용보험 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salaryData.employmentInsurance}
                    onChange={(e) => handleInputChange('employmentInsurance', Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">산재보험 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salaryData.workersCompensation}
                    onChange={(e) => handleInputChange('workersCompensation', Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 계산 결과 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
            계산 결과
          </h2>

          <div className="space-y-4">
            {/* 총 급여 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">총 급여 (세전)</span>
                <span className="text-xl font-bold text-blue-900">{formatCurrency(result.grossSalary)}</span>
              </div>
            </div>

            {/* 공제 내역 */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-red-900">총 공제액</span>
                <span className="text-xl font-bold text-red-900">{formatCurrency(result.totalDeductions)}</span>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                <div className="flex justify-between">
                  <span>• 국민연금</span>
                  <span>{formatCurrency(Math.min(result.grossSalary * (salaryData.nationalPension / 100), 243000))}</span>
                </div>
                <div className="flex justify-between">
                  <span>• 건강보험</span>
                  <span>{formatCurrency(result.grossSalary * (salaryData.healthInsurance / 100))}</span>
                </div>
                <div className="flex justify-between">
                  <span>• 고용보험</span>
                  <span>{formatCurrency(result.grossSalary * (salaryData.employmentInsurance / 100))}</span>
                </div>
              </div>
            </div>

            {/* 실수령액 */}
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-900">실수령액</span>
                <span className="text-2xl font-bold text-green-900">{formatCurrency(result.netSalary)}</span>
              </div>
            </div>

            {/* 회사 부담 비용 */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-orange-900">회사 부담 4대보험</span>
                <span className="text-xl font-bold text-orange-900">{formatCurrency(result.employerCosts)}</span>
              </div>
            </div>

            {/* 총 인건비 */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-900">총 인건비 (회사 부담)</span>
                <span className="text-2xl font-bold text-purple-900">{formatCurrency(result.totalLaborCost)}</span>
              </div>
            </div>

            {/* 요약 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-gray-900 mb-2">💡 요약 정보</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• 시간당 기본급: {formatCurrency(salaryData.baseSalary / (40 * 4.33))}</div>
                <div>• 연장근무수당: {formatCurrency((salaryData.baseSalary / (40 * 4.33)) * 1.5 * salaryData.overtimeHours)}</div>
                <div>• 공제율: {((result.totalDeductions / result.grossSalary) * 100).toFixed(1)}%</div>
                <div>• 회사 총 부담률: {((result.totalLaborCost / result.grossSalary - 1) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;