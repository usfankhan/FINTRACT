import React from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const ExpensesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 gap-6">
        <ExpenseForm />
        <ExpenseList />
      </div>
    </div>
  );
};

export default ExpensesPage;