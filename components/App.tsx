// components/App.tsx
import React, { useState } from 'react';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import SalaryCalculator from './pages/SalaryCalculator';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'calculator':
        return <SalaryCalculator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default App;