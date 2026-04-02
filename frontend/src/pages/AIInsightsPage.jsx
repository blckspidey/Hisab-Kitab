import React from 'react';
import AIInsights from '../components/AIInsights';

const AIInsightsPage = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors">
      <div className="relative z-10 p-8 mb-6 mx-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">AI Expense Insights</h1>
        </div>
      </div>
      <div className="px-4 pb-8 max-w-5xl mx-auto">
        <AIInsights />
      </div>
    </div>
  );
};

export default AIInsightsPage;



