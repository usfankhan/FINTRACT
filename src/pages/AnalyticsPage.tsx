import React from 'react';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseInsights from '../components/ExpenseInsights';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <ExpenseInsights />
      </div>
    </div>
  );
};

export default AnalyticsPage;