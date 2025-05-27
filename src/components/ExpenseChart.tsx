import React, { useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';

const ExpenseChart: React.FC = () => {
  const { getExpensesByCategory, categoryColors } = useExpenses();
  const chartContainer = useRef<HTMLDivElement>(null);
  
  const categoryData = getExpensesByCategory();
  const totalExpense = categoryData.reduce((sum, item) => sum + item.total, 0);
  
  // Sort categories from highest to lowest expense
  const sortedCategoryData = [...categoryData].sort((a, b) => b.total - a.total);

  useEffect(() => {
    if (!chartContainer.current) return;
    
    // Clear previous content
    chartContainer.current.innerHTML = '';
    
    if (sortedCategoryData.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No expense data available';
      emptyMessage.className = 'text-center text-gray-500 py-8';
      chartContainer.current.appendChild(emptyMessage);
      return;
    }
    
    // Create chart
    const chartHeight = 300;
    const chartWidth = chartContainer.current.clientWidth;
    const barWidth = Math.min(50, (chartWidth - 50) / sortedCategoryData.length - 10);
    
    const chart = document.createElement('div');
    chart.className = 'relative h-[300px] mt-4';
    
    // Get the maximum value for scaling
    const maxValue = Math.max(...sortedCategoryData.map(item => item.total));
    
    // Create bars
    sortedCategoryData.forEach((item, index) => {
      const percentage = (item.total / totalExpense) * 100;
      const barHeight = (item.total / maxValue) * chartHeight;
      
      const barContainer = document.createElement('div');
      barContainer.className = 'absolute bottom-0 flex flex-col items-center';
      barContainer.style.left = `${(index * (barWidth + 10)) + 25}px`;
      barContainer.style.width = `${barWidth}px`;
      
      const bar = document.createElement('div');
      bar.className = 'w-full rounded-t-md transition-all duration-500 ease-in-out';
      bar.style.height = '0';
      bar.style.backgroundColor = categoryColors[item.category];
      
      // Animated bar growth
      setTimeout(() => {
        bar.style.height = `${barHeight}px`;
      }, 100 * index);
      
      const label = document.createElement('div');
      label.className = 'text-xs text-gray-600 mt-2 font-medium w-20 text-center truncate';
      label.textContent = item.category;
      
      const value = document.createElement('div');
      value.className = 'text-xs font-bold text-gray-800 mt-1';
      value.textContent = `$${item.total.toFixed(2)}`;
      
      const percentageEl = document.createElement('div');
      percentageEl.className = 'text-xs text-gray-500';
      percentageEl.textContent = `${percentage.toFixed(1)}%`;
      
      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      barContainer.appendChild(value);
      barContainer.appendChild(percentageEl);
      chart.appendChild(barContainer);
    });
    
    chartContainer.current.appendChild(chart);
  }, [sortedCategoryData, categoryColors]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Distribution</h2>
      
      <div className="mb-4">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-800">${totalExpense.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Total Expenses</div>
        </div>
        
        <div ref={chartContainer} className="h-[350px]">
          {/* Chart will be rendered here */}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        {sortedCategoryData.map((item) => (
          <div key={item.category} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: categoryColors[item.category] }}
            ></div>
            <div>
              <div className="text-sm font-medium">{item.category}</div>
              <div className="text-xs text-gray-500">
                ${item.total.toFixed(2)} ({((item.total / totalExpense) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;