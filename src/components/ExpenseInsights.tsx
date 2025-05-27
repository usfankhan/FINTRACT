import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';

const ExpenseInsights: React.FC = () => {
  const { expenses, getExpensesByCategory, categoryColors } = useExpenses();
  const categoryData = getExpensesByCategory();
  
  // Sort categories by total amount (highest first)
  const sortedCategories = [...categoryData].sort((a, b) => b.total - a.total);
  
  // Find highest spending category
  const highestCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
  
  // Calculate total spending
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate monthly totals
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get last 6 months for comparison
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }).reverse();

  // Calculate month-over-month change
  const currentMonth = last6Months[last6Months.length - 1];
  const previousMonth = last6Months[last6Months.length - 2];
  const monthlyChange = ((monthlyTotals[currentMonth] || 0) - (monthlyTotals[previousMonth] || 0)) / (monthlyTotals[previousMonth] || 1) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="mr-2 text-teal-600" />
        Financial Insights
      </h2>
      
      {expenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Add expenses to see insights</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Monthly Overview</h3>
              <div className="text-3xl font-bold mb-2">
                ${monthlyTotals[currentMonth]?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center">
                <span className={`flex items-center ${monthlyChange >= 0 ? 'text-teal-100' : 'text-red-200'}`}>
                  {monthlyChange >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  {Math.abs(monthlyChange).toFixed(1)}% from last month
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">6-Month Trend</h3>
              <div className="space-y-2">
                {last6Months.map(month => {
                  const amount = monthlyTotals[month] || 0;
                  const maxAmount = Math.max(...Object.values(monthlyTotals));
                  const percentage = maxAmount ? (amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={month} className="flex items-center">
                      <div className="w-20 text-sm text-gray-600">
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-medium text-gray-700">
                        ${amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <TrendingDown className="mr-2 text-purple-500" />
              Category Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCategories.map((category) => (
                <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: categoryColors[category.category] }}
                      />
                      <span className="font-medium text-gray-700">{category.category}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {((category.total / totalSpending) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-800 mb-2">
                    ${category.total.toFixed(2)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(category.total / totalSpending) * 100}%`,
                        backgroundColor: categoryColors[category.category],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recommendations */}
          {highestCategory && highestCategory.total / totalSpending > 0.3 && (
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="mr-2 text-amber-500" />
                Smart Recommendations
              </h3>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800">
                  Your spending on <strong>{highestCategory.category}</strong> is {((highestCategory.total / totalSpending) * 100).toFixed(1)}% of your total expenses.
                  Consider setting a budget limit for this category to better manage your finances.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseInsights;