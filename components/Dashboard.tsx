
import React, { useState, useMemo } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, BarChart } from 'recharts';
import type { Transaction, CostItem } from '../types';
import { TransactionType } from '../types';
import Card from './Card';
import { useToast } from './ToastContext';

interface DashboardProps {
  financialData: {
    transactions: Transaction[];
    goals: any[];
    income: number;
    expenses: number;
  };
  costs: CostItem[];
  addTransaction?: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addGoal?: (goal: any) => void;
}

const COLORS = ['#29a9ff', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

const generateConsistentColor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % COLORS.length;
  return COLORS[colorIndex];
};

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subtext?: string; 
  className?: string; 
  icon?: string;
  trend?: number;
  isLoading?: boolean;
}> = ({ title, value, subtext, className, trend, isLoading = false }) => (
  <Card className={`p-2 sm:p-3 lg:p-4 xl:p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0 ${className}`}>
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative z-10 min-w-0">
      <div className="flex items-center justify-between mb-1 sm:mb-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-medium text-gray-400 truncate">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-600 rounded w-3/4 mb-1 sm:mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-white mt-1 break-all overflow-hidden leading-tight">{value}</p>
          <div className="flex items-center justify-between mt-1 sm:mt-2 min-w-0">
            {subtext && <p className="text-xs text-gray-500 truncate">{subtext}</p>}
            {trend !== undefined && (
              <div className={`flex items-center text-xs font-medium min-w-0 ${
                trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                <span className="truncate">{trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    
    {/* Subtle shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
  </Card>
);

// Custom label for Pie slices
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
  const RADIAN = Math.PI / 180;
  // Position label at the center of the slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={window.innerWidth < 500 ? 10 : 14}
      style={{ fontWeight: 600, textShadow: '0 1px 2px #0008' }}
    >
      {`N$${value}`}
    </text>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ financialData, costs, addTransaction, addGoal }) => {
  const { transactions, income, expenses } = financialData;
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights'>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [incomeData, setIncomeData] = useState({
    description: '',
    amount: '',
    category: 'Salary'
  });
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining'
  });
  const [goalData, setGoalData] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });
  const { showToast } = useToast();
  
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Categories for dropdowns
  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Other'];
  const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'];

  // Quick Actions handlers
  const handleSubmitIncome = () => {
    if (!incomeData.description.trim() || !incomeData.amount || parseFloat(incomeData.amount) <= 0) {
      showToast('Please fill in all income details with a valid amount', 'error');
      return;
    }

    if (addTransaction) {
      const newTransaction = {
        description: incomeData.description.trim(),
        amount: parseFloat(incomeData.amount),
        type: TransactionType.INCOME,
        category: incomeData.category,
      };
      addTransaction(newTransaction);
      showToast(`Income of N$${parseFloat(incomeData.amount).toLocaleString()} added successfully!`, 'success');
      
      // Reset form
      setIncomeData({ description: '', amount: '', category: 'Salary' });
      setShowIncomeForm(false);
      setShowQuickActions(false);
    }
  };

  const handleSubmitExpense = () => {
    if (!expenseData.description.trim() || !expenseData.amount || parseFloat(expenseData.amount) <= 0) {
      showToast('Please fill in all expense details with a valid amount', 'error');
      return;
    }

    if (addTransaction) {
      const newTransaction = {
        description: expenseData.description.trim(),
        amount: parseFloat(expenseData.amount),
        type: TransactionType.EXPENSE,
        category: expenseData.category,
      };
      addTransaction(newTransaction);
      showToast(`Expense of N$${parseFloat(expenseData.amount).toLocaleString()} recorded successfully!`, 'success');
      
      // Reset form
      setExpenseData({ description: '', amount: '', category: 'Food & Dining' });
      setShowExpenseForm(false);
      setShowQuickActions(false);
    }
  };

  const handleSubmitGoal = () => {
    if (!goalData.name.trim() || !goalData.targetAmount || parseFloat(goalData.targetAmount) <= 0) {
      showToast('Please fill in all goal details with a valid target amount', 'error');
      return;
    }

    if (addGoal) {
      const newGoal = {
        name: goalData.name.trim(),
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: 0,
        deadline: goalData.deadline || null,
      };
      addGoal(newGoal);
      showToast(`Goal "${goalData.name}" created successfully!`, 'success');
      
      // Reset form
      setGoalData({ name: '', targetAmount: '', deadline: '' });
      setShowGoalForm(false);
      setShowQuickActions(false);
    }
  };

  // Calculate previous month data for trends
  const previousMonthData = useMemo(() => {
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const prevMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === previousMonth.getMonth() && 
             transactionDate.getFullYear() === previousMonth.getFullYear();
    });
    
    const prevIncome = prevMonthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExpenses = prevMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
      
    return { income: prevIncome, expenses: prevExpenses, balance: prevIncome - prevExpenses };
  }, [transactions]);

  // Calculate trends
  const trends = useMemo(() => {
    const incomeTrend = previousMonthData.income === 0 ? 0 : 
      ((income - previousMonthData.income) / previousMonthData.income) * 100;
    const expenseTrend = previousMonthData.expenses === 0 ? 0 : 
      ((expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100;
    const balanceTrend = previousMonthData.balance === 0 ? 0 : 
      ((balance - previousMonthData.balance) / Math.abs(previousMonthData.balance)) * 100;
    
    return { income: incomeTrend, expenses: expenseTrend, balance: balanceTrend };
  }, [income, expenses, balance, previousMonthData]);

  // Enhanced spending insights
  const spendingInsights = useMemo(() => {
    const categorySpending = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    const averageTransaction = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
      : 0;

    const weeklySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return transactionDate >= weekAgo && t.type === TransactionType.EXPENSE;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      topCategory: topCategory ? topCategory[0] : 'None',
      topCategoryAmount: topCategory ? topCategory[1] : 0,
      averageTransaction,
      weeklySpending,
      financialHealth: savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : savingsRate > 0 ? 'Fair' : 'Needs Attention'
    };
  }, [transactions, savingsRate]);

  const spendingByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    
    const result = Object.entries(categories)
      .map(([name, amount]) => ({ name, amount, fill: generateConsistentColor(name) }))
      .sort((a, b) => b.amount - a.amount);

    // If no data, provide sample demo data
    if (result.length === 0) {
      return [
        { name: 'Food & Dining', amount: 2500, fill: generateConsistentColor('Food & Dining') },
        { name: 'Transportation', amount: 1800, fill: generateConsistentColor('Transportation') },
        { name: 'Shopping', amount: 1200, fill: generateConsistentColor('Shopping') },
        { name: 'Entertainment', amount: 800, fill: generateConsistentColor('Entertainment') },
        { name: 'Bills & Utilities', amount: 1500, fill: generateConsistentColor('Bills & Utilities') },
      ];
    }

    return result;
  }, [transactions]);
  
  const costBreakdown = useMemo(() => {
    const fixed = costs.filter(c => c.type === 'Fixed').reduce((sum, c) => sum + c.amount, 0);
    const variable = costs.filter(c => c.type === 'Variable').reduce((sum, c) => sum + c.amount, 0);
    
    const result = [
        { name: 'Fixed Costs', value: fixed },
        { name: 'Variable Costs', value: variable },
    ].filter(d => d.value > 0);

    // If no cost data, provide sample demo data
    if (result.length === 0) {
      return [
        { name: 'Fixed Costs', value: 3500 },
        { name: 'Variable Costs', value: 2200 },
      ];
    }

    return result;
  }, [costs]);

  const monthlyTrend = useMemo(() => {
    const trends: { [key: string]: { month: string, income: number, expenses: number }} = {};
    
    // Process actual transactions
    transactions.forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM for sorting
        if (!trends[month]) {
            trends[month] = { month, income: 0, expenses: 0 };
        }
        if (t.type === TransactionType.INCOME) {
            trends[month].income += t.amount;
        } else {
            trends[month].expenses += t.amount;
        }
    });
    
    // If we have current month data, update with the actual totals
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (trends[currentMonth]) {
        trends[currentMonth].income = income;
        trends[currentMonth].expenses = expenses;
    } else if (income > 0 || expenses > 0) {
        // Add current month data if we have income/expenses but no transactions
        trends[currentMonth] = { month: currentMonth, income, expenses };
    }

    let result = Object.values(trends)
      .map(trend => ({
          ...trend,
          // Format month for display e.g., "Jan '24"
          displayMonth: new Date(trend.month + '-02').toLocaleString('default', { month: 'short', year: '2-digit'}),
          net: trend.income - trend.expenses
      }))
      .sort((a,b) => a.month.localeCompare(b.month))
      .filter(trend => trend.income > 0 || trend.expenses > 0); // Only include months with data

    // If no real data, provide sample demo data for the last 3 months
    if (result.length === 0) {
      const currentDate = new Date();
      const sampleData = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().substring(0, 7);
        const displayMonth = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        
        // Generate realistic sample data
        const sampleIncome = 15000 + Math.floor(Math.random() * 10000);
        const sampleExpenses = 8000 + Math.floor(Math.random() * 7000);
        
        sampleData.push({
          month: monthKey,
          displayMonth,
          income: sampleIncome,
          expenses: sampleExpenses,
          net: sampleIncome - sampleExpenses
        });
      }
      console.log('Monthly Cash Flow - Using demo data:', sampleData);
      return sampleData;
    }

    console.log('Monthly Cash Flow - Final data:', result);
    console.log('Income:', income, 'Expenses:', expenses, 'Transactions:', transactions.length);
    return result;
  }, [transactions, income, expenses]);


  const recentTransactions = useMemo(() => {
    // Filter out shopping list and receipt transactions
    const filteredTransactions = transactions.filter(transaction => 
      !transaction.description.includes('(Shopping List:') && 
      !transaction.description.includes('(Receipt:')
    );
    
    return [...filteredTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden px-2 sm:px-0 pb-20 sm:pb-6">
      {/* Enhanced Header Card */}
      <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div className="w-full lg:w-auto">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg lg:text-xl">Financial Dashboard</span>
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  spendingInsights.financialHealth === 'Excellent' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  spendingInsights.financialHealth === 'Good' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  spendingInsights.financialHealth === 'Fair' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {spendingInsights.financialHealth}
                </div>
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 break-words">
                Real-time insights into your financial health with AI-powered trends and personalized recommendations.
              </p>
              
              {/* Quick insights */}
              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2 text-purple-300 min-w-0">
                  <span className="truncate">Top: {spendingInsights.topCategory}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-blue-300 min-w-0">
                  <span className="truncate">Weekly: N${spendingInsights.weeklySpending.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-green-300 min-w-0">
                  <span className="truncate">Avg: N${spendingInsights.averageTransaction.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-gray-800/50 rounded-lg p-1 w-full sm:w-auto min-w-0 overflow-hidden">
              {(['overview', 'trends', 'insights'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-w-0 truncate ${
                    activeTab === tab
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  {tab === 'overview' ? 'Overview' : tab === 'trends' ? 'Trends' : 'Insights'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 px-1 sm:px-0">
        <StatCard 
          title="Total Balance" 
          value={`N$${balance.toFixed(2)}`} 
          subtext="This month" 
          className="bg-gradient-to-br from-blue-500/20 to-blue-800/20 border border-blue-500/30"
          trend={trends.balance}
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Income" 
          value={`N$${income.toFixed(2)}`} 
          subtext="This month" 
          className="bg-gradient-to-br from-green-500/20 to-green-800/20 border border-green-500/30"
          trend={trends.income}
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Expenses" 
          value={`N$${expenses.toFixed(2)}`} 
          subtext="This month" 
          className="bg-gradient-to-br from-red-500/20 to-red-800/20 border border-red-500/30"
          trend={trends.expenses}
          isLoading={isLoading}
        />
        <StatCard 
          title="Savings Rate" 
          value={`${savingsRate.toFixed(1)}%`} 
          subtext="This month" 
          className="bg-gradient-to-br from-purple-500/20 to-purple-800/20 border border-purple-500/30"
          isLoading={isLoading}
        />
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Monthly Cash Flow Chart */}
          <Card className="p-3 sm:p-4 md:p-6 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white flex items-center gap-2">
                  Monthly Cash Flow
                  {transactions.length === 0 && (income === 0 && expenses === 0) && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                      Demo Data
                    </span>
                  )}
                  {monthlyTrend.length > 0 && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded-full">
                      {monthlyTrend.length} months
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                    <span>Expenses</span>
                  </div>
                </div>
              </div>
              {monthlyTrend.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Redesigned Monthly Cash Flow Chart */}
                  <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto custom-scrollbar">
                    {monthlyTrend.map((data, index) => {
                      const maxValue = Math.max(...monthlyTrend.map(d => Math.max(d.income, d.expenses)));
                      const incomePercent = Math.max((data.income / maxValue) * 100, 5); // Minimum 5% for visibility
                      const expensePercent = Math.max((data.expenses / maxValue) * 100, 5);
                      const isPositive = data.net >= 0;
                      const savingsRate = data.income > 0 ? ((data.income - data.expenses) / data.income) * 100 : 0;
                      
                      return (
                        <div key={index} className="relative overflow-hidden bg-gradient-to-r from-gray-800/60 via-gray-800/40 to-gray-800/60 backdrop-blur-sm p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 group">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="relative z-10">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white">{data.displayMonth}</h3>
                                  <p className="text-xs sm:text-sm text-gray-400">Financial Overview</p>
                                </div>
                              </div>
                              
                              {/* Savings Rate Badge */}
                              <div className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full font-medium text-xs sm:text-sm ${
                                savingsRate >= 20 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                savingsRate >= 10 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                savingsRate >= 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {savingsRate.toFixed(1)}% saved
                              </div>
                            </div>

                            {/* Income vs Expenses Comparison */}
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                              {/* Income Section */}
                              <div className="bg-gray-900/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-green-500/20">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-green-400 font-medium text-xs sm:text-sm md:text-base">Income</span>
                                  </div>
                                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">N${data.income.toLocaleString()}</span>
                                </div>
                                <div className="relative h-2 sm:h-3 md:h-4 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                                    style={{ width: `${incomePercent}%` }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Expenses Section */}
                              <div className="bg-gray-900/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-red-500/20">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-red-400 font-medium text-xs sm:text-sm md:text-base">Expenses</span>
                                  </div>
                                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">N${data.expenses.toLocaleString()}</span>
                                </div>
                                <div className="relative h-2 sm:h-3 md:h-4 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                                    style={{ width: `${expensePercent}%` }}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Stats */}
                              <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-700/50">
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-1">Net Flow</p>
                                  <p className={`text-sm sm:text-base md:text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}N${data.net.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-1">Flow Ratio</p>
                                  <p className="text-sm sm:text-base md:text-lg font-bold text-blue-400">
                                    {data.income > 0 ? (data.expenses / data.income).toFixed(2) : '0.00'}x
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Enhanced Summary Section */}
                  {monthlyTrend.length > 0 && (
                    <div className="mt-3 sm:mt-4 md:mt-6 bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-700/50">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2z" />
                        </svg>
                        {monthlyTrend.length === 1 ? 'Current Summary' : 'Period Summary'}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <div className="bg-gray-800/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center">
                          <p className="text-xs text-gray-400 mb-1">Total Income</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-green-400">
                            N${monthlyTrend.reduce((sum, d) => sum + d.income, 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center">
                          <p className="text-xs text-gray-400 mb-1">Total Expenses</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-red-400">
                            N${monthlyTrend.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center">
                          <p className="text-xs text-gray-400 mb-1">Avg Savings</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-blue-400">
                            {(monthlyTrend.reduce((sum, d) => sum + (d.income > 0 ? ((d.income - d.expenses) / d.income) * 100 : 0), 0) / monthlyTrend.length).toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-gray-800/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center">
                          <p className="text-xs text-gray-400 mb-1">{monthlyTrend.length === 1 ? 'Current Month' : 'Best Month'}</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-purple-400">
                            {monthlyTrend.reduce((best, current) => current.net > best.net ? current : best).displayMonth}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-2">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-lg mb-1 sm:mb-2 font-semibold text-center">No Chart Data</p>
                  <p className="text-xs sm:text-sm text-center max-w-xs leading-relaxed mb-3 sm:mb-4">Add transactions to see your monthly cash flow trends</p>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-transactions'))}
                    className="px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    Add Transactions
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 px-1 sm:px-0">
            {/* Enhanced Fixed vs Variable Costs */}
            <Card className="p-3 sm:p-4 lg:p-6 h-[280px] sm:h-[320px] lg:h-[400px] overflow-hidden relative group min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center gap-2 min-w-0">
                  <span className="truncate">Cost Structure</span>
                  {costs.length === 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full whitespace-nowrap">
                      Demo Data
                    </span>
                  )}
                </h3>
                <div className="flex-1 min-h-0">
                  {costBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <linearGradient id="fixedGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                          </linearGradient>
                          <linearGradient id="variableGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={costBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={window.innerWidth < 640 ? 60 : 90}
                          innerRadius={window.innerWidth < 640 ? 25 : 40}
                          label={renderPieLabel}
                          strokeWidth={2}
                          stroke="#1f2937"
                        >
                          <Cell fill="url(#fixedGradient)" />
                          <Cell fill="url(#variableGradient)" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                          formatter={(value) => `N$${Number(value).toFixed(2)}`} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 px-2">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                      </div>
                      <p className="text-sm sm:text-lg mb-1 sm:mb-2 font-semibold text-center">No Cost Data</p>
                      <p className="text-xs sm:text-sm text-center max-w-xs leading-relaxed">Add fixed and variable costs in the Tools section to see your cost breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Enhanced Spending by Category */}
            <Card className="p-3 sm:p-4 lg:p-6 h-[280px] sm:h-[320px] lg:h-[400px] lg:col-span-2 overflow-hidden relative group min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4 flex items-center gap-2 min-w-0">
                  <span className="truncate">Category Breakdown</span>
                  {transactions.filter(t => t.type === TransactionType.EXPENSE).length === 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-green-500/20 text-green-300 border border-green-500/30 rounded-full whitespace-nowrap">
                      Demo Data
                    </span>
                  )}
                </h3>
                <div className="flex-1 min-h-0">
                  {spendingByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={spendingByCategory} layout="vertical" margin={{ top: 5, right: 30, left: window.innerWidth < 640 ? 60 : 100, bottom: 5 }}>
                      <defs>
                        {spendingByCategory.map((entry, index) => (
                          <linearGradient key={`gradient-${index}`} id={`categoryGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={entry.fill} />
                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#9ca3af', fontSize: window.innerWidth < 640 ? 10 : 12 }}
                        axisLine={{ stroke: '#4b5563' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fill: '#9ca3af', fontSize: window.innerWidth < 640 ? 10 : 12 }} 
                        width={window.innerWidth < 640 ? 60 : 100}
                        axisLine={{ stroke: '#4b5563' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151', 
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                        cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                        formatter={(value) => `N$${Number(value).toFixed(2)}`}
                      />
                      <Bar dataKey="amount" name="Spending" radius={[0, 8, 8, 0]}>
                        {spendingByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#categoryGradient-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2z" />
                      </svg>
                    </div>
                    <p className="text-sm sm:text-lg mb-1 sm:mb-2 font-semibold text-center">No Category Data</p>
                    <p className="text-xs sm:text-sm text-center max-w-xs leading-relaxed mb-3 sm:mb-4">Add expense transactions with categories to see your spending breakdown</p>
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-transactions'))}
                      className="px-3 py-2 sm:px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
                    >
                      Add Expenses
                    </button>
                  </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <Card className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              Monthly Comparison
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Income Trend</p>
                  <p className="text-white font-bold text-sm sm:text-base truncate">N${income.toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-1 sm:gap-2 ${trends.income >= 0 ? 'text-green-400' : 'text-red-400'} whitespace-nowrap text-xs sm:text-sm`}>
                  {trends.income >= 0 ? '↗' : '↘'} {Math.abs(trends.income).toFixed(1)}%
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Expense Trend</p>
                  <p className="text-white font-bold text-sm sm:text-base truncate">N${expenses.toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-1 sm:gap-2 ${trends.expenses <= 0 ? 'text-green-400' : 'text-red-400'} whitespace-nowrap text-xs sm:text-sm`}>
                  {trends.expenses >= 0 ? '↗' : '↘'} {Math.abs(trends.expenses).toFixed(1)}%
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm">Balance Trend</p>
                  <p className="text-white font-bold text-sm sm:text-base truncate">N${balance.toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-1 sm:gap-2 ${trends.balance >= 0 ? 'text-green-400' : 'text-red-400'} whitespace-nowrap text-xs sm:text-sm`}>
                  {trends.balance >= 0 ? '↗' : '↘'} {Math.abs(trends.balance).toFixed(1)}%
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              Financial Goals Progress
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Savings Rate Target (20%)</span>
                  <span className="text-white font-medium">{savingsRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((savingsRate / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Monthly Budget Utilization</span>
                  <span className="text-white font-medium">
                    {income > 0 ? ((expenses / income) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (expenses / income) <= 0.8 ? 'bg-green-500' : 
                      (expenses / income) <= 0.9 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((expenses / income) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              Smart Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h4 className="font-medium text-blue-300 mb-2">Top Spending Category</h4>
                <p className="text-white text-sm">
                  You spent <strong>N${spendingInsights.topCategoryAmount.toFixed(2)}</strong> on <strong>{spendingInsights.topCategory}</strong> this month.
                </p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-medium text-green-300 mb-2">Financial Health</h4>
                <p className="text-white text-sm">
                  Your financial health is rated as <strong>{spendingInsights.financialHealth}</strong> with a {savingsRate.toFixed(1)}% savings rate.
                </p>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="font-medium text-purple-300 mb-2">Weekly Spending</h4>
                <p className="text-white text-sm">
                  You've spent <strong>N${spendingInsights.weeklySpending.toFixed(2)}</strong> in the last 7 days.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              Recommendations
            </h3>
            <div className="space-y-4">
              {savingsRate < 10 && (
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <h4 className="font-medium text-yellow-300 mb-2">Improve Savings</h4>
                  <p className="text-white text-sm">
                    Consider reducing expenses in {spendingInsights.topCategory} to increase your savings rate.
                  </p>
                </div>
              )}
              
              {spendingInsights.weeklySpending > (expenses / 4) && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <h4 className="font-medium text-red-300 mb-2">High Weekly Spending</h4>
                  <p className="text-white text-sm">
                    Your weekly spending is above average. Review recent transactions for optimization.
                  </p>
                </div>
              )}
              
              {savingsRate >= 20 && (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <h4 className="font-medium text-green-300 mb-2">Excellent Savings!</h4>
                  <p className="text-white text-sm">
                    Great job! Consider investing your surplus for long-term growth.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            Recent Transactions
          </h3>
          <div className="text-sm text-gray-400">
            Last {recentTransactions.length} transactions
          </div>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length > 0 ? recentTransactions.map((t, index) => (
            <div key={t.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg hover:bg-gray-700/30 transition-all duration-200 border border-gray-700/50 group gap-3">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                  t.type === TransactionType.INCOME ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white group-hover:text-brand-300 transition-colors truncate">{t.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="truncate">{t.category}</span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 self-start sm:self-center">
                <p className={`font-bold text-lg break-all ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}
                </p>
                <div className="text-xs text-gray-500">
                  {index === 0 ? 'Latest' : `${index + 1} ago`}
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="text-6xl mb-4 opacity-30"></div>
              <p className="text-lg mb-2">No transactions yet</p>
              <p className="text-sm">Start adding income and expenses to see your activity</p>
            </div>
          )}
        </div>
      </Card>

      {/* Floating + Button */}
      <button
        onClick={() => setShowQuickActions(true)}
        className="fixed bottom-32 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full shadow-2xl hover:shadow-brand-500/25 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
      >
        <svg className="w-6 h-6 transition-transform duration-200 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Quick Actions
              </h3>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setShowIncomeForm(true);
                }}
                className="w-full p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors group flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Add Income</p>
                  <p className="text-gray-400 text-sm">Record your earnings</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setShowExpenseForm(true);
                }}
                className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-colors group flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Track Expense</p>
                  <p className="text-gray-400 text-sm">Log your spending</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setShowGoalForm(true);
                }}
                className="w-full p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors group flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Add Goal</p>
                  <p className="text-gray-400 text-sm">Set financial targets</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Form Modal */}
      {showIncomeForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                Add Income
              </h3>
              <button 
                onClick={() => setShowIncomeForm(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={incomeData.description}
                  onChange={(e) => setIncomeData({...incomeData, description: e.target.value})}
                  placeholder="e.g., Monthly salary, Freelance payment"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (N$)</label>
                <input
                  type="number"
                  value={incomeData.amount}
                  onChange={(e) => setIncomeData({...incomeData, amount: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={incomeData.category}
                  onChange={(e) => setIncomeData({...incomeData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {incomeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIncomeForm(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitIncome}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Add Income
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </div>
                Track Expense
              </h3>
              <button 
                onClick={() => setShowExpenseForm(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  placeholder="e.g., Lunch, Gas, Groceries"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (N$)</label>
                <input
                  type="number"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExpenseForm(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExpense}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                Add Goal
              </h3>
              <button 
                onClick={() => setShowGoalForm(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={goalData.name}
                  onChange={(e) => setGoalData({...goalData, name: e.target.value})}
                  placeholder="e.g., Emergency Fund, New Car, Vacation"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount (N$)</label>
                <input
                  type="number"
                  value={goalData.targetAmount}
                  onChange={(e) => setGoalData({...goalData, targetAmount: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={goalData.deadline}
                  onChange={(e) => setGoalData({...goalData, deadline: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalForm(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGoal}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;