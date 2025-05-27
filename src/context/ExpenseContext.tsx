import React, { createContext, useState, useContext, useEffect } from 'react';
import { Expense, CategoryColors } from '../types';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  categories: string[];
  categoryColors: CategoryColors;
  getExpensesByCategory: () => { category: string; total: number }[];
  getTotalExpenses: () => number;
}

const defaultCategories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

const defaultCategoryColors: CategoryColors = {
  Food: '#0D9488', // Teal
  Transportation: '#8B5CF6', // Purple
  Entertainment: '#F97316', // Orange
  Shopping: '#EC4899', // Pink
  Utilities: '#3B82F6', // Blue
  Other: '#64748B', // Slate
};

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: () => {},
  deleteExpense: () => {},
  updateExpense: () => {},
  categories: defaultCategories,
  categoryColors: defaultCategoryColors,
  getExpensesByCategory: () => [],
  getTotalExpenses: () => 0,
});

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<string[]>(defaultCategories);
  const [categoryColors] = useState<CategoryColors>(defaultCategoryColors);

  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      // Add some demo expenses
      const demoExpenses: Expense[] = [
        {
          id: '1',
          name: 'Groceries',
          amount: 85.50,
          category: 'Food',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Movie tickets',
          amount: 32.00,
          category: 'Entertainment',
          date: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Gas',
          amount: 45.75,
          category: 'Transportation',
          date: new Date().toISOString(),
        },
      ];
      localStorage.setItem('expenses', JSON.stringify(demoExpenses));
      setExpenses(demoExpenses);
    }
  }, []);

  const saveExpenses = (updatedExpenses: Expense[]) => {
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    
    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
  };

  const updateExpense = (updatedExpense: Expense) => {
    const updatedExpenses = expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    saveExpenses(updatedExpenses);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const { category, amount } = expense;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
    }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        deleteExpense,
        updateExpense,
        categories,
        categoryColors,
        getExpensesByCategory,
        getTotalExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);