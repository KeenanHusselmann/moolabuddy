
import React, { useState, useMemo, useCallback } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, Line, BarChart } from 'recharts';
import type { Transaction, AIInsight, AIInsightTip, CostItem } from '../types';
import { TransactionType } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import Card from './Card';
import SavingsIcon from './icons/SavingsIcon';
import SpendingIcon from './icons/SpendingIcon';
import InvestmentIcon from './icons/InvestmentIcon';

interface DashboardProps {
  financialData: {
    transactions: Transaction[];
    goals: any[];
    income: number;
    expenses: number;
  };
  costs: CostItem[];
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


const StatCard: React.FC<{ title: string; value: string; subtext?: string, className?: string }> = ({ title, value, subtext, className }) => (
    <Card className={`p-4 ${className}`}>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-1 break-words overflow-hidden">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </Card>
);

const TipCard: React.FC<{ tip: AIInsightTip }> = ({ tip }) => {
    const icons = {
        savings: <SavingsIcon />,
        spending: <SpendingIcon />,
        investment: <InvestmentIcon />,
    };
    const colors = {
        savings: 'border-green-500/50',
        spending: 'border-red-500/50',
        investment: 'border-purple-500/50',
    };
    return (
        <div className={`flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border-l-4 ${colors[tip.type]}`}>
            <div className="flex-shrink-0 w-6 h-6 mt-1">{icons[tip.type]}</div>
            <p className="text-gray-300">{tip.description}</p>
        </div>
    )
}

// Custom label for Pie slices
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, index, name }) => {
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

const Dashboard: React.FC<DashboardProps> = ({ financialData, costs }) => {
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { transactions, income, expenses } = financialData;
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  const spendingByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, amount]) => ({ name, amount, fill: generateConsistentColor(name) }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);
  
  const costBreakdown = useMemo(() => {
    const fixed = costs.filter(c => c.type === 'Fixed').reduce((sum, c) => sum + c.amount, 0);
    const variable = costs.filter(c => c.type === 'Variable').reduce((sum, c) => sum + c.amount, 0);
    return [
        { name: 'Fixed Costs', value: fixed },
        { name: 'Variable Costs', value: variable },
    ].filter(d => d.value > 0);
  }, [costs]);

  const monthlyTrend = useMemo(() => {
    const trends: { [key: string]: { month: string, income: number, expenses: number }} = {};
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
    
    return Object.values(trends)
      .map(trend => ({
          ...trend,
          // Format month for display e.g., "Jan '24"
          displayMonth: new Date(trend.month + '-02').toLocaleString('default', { month: 'short', year: '2-digit'}),
          net: trend.income - trend.expenses
      }))
      .sort((a,b) => a.month.localeCompare(b.month));

  }, [transactions]);


  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAiInsights(null);
    try {
      const insights = await getFinancialInsights({ ...financialData, costs });
      if (insights) {
          setAiInsights(insights);
      } else {
          setError('Failed to load AI insights. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to load AI insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [financialData, costs]);

  const recentTransactions = useMemo(() => {
    // Filter out shopping list and receipt transactions
    const filteredTransactions = transactions.filter(transaction => 
      !transaction.description.includes('(Shopping List:') && 
      !transaction.description.includes('(Receipt:')
    );
    
    return [...filteredTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Financial Overview</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Track your financial health with income vs expenses, spending trends, and AI-powered advice. 
          View charts and statistics to understand your spending patterns.
        </p>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
        <StatCard title="Total Balance" value={`N$${balance.toFixed(2)}`} subtext="This month" className="bg-gradient-to-br from-blue-500/20 to-blue-800/20"/>
        <StatCard title="Total Income" value={`N$${income.toFixed(2)}`} subtext="This month" className="bg-gradient-to-br from-green-500/20 to-green-800/20" />
        <StatCard title="Total Expenses" value={`N$${expenses.toFixed(2)}`} subtext="This month" className="bg-gradient-to-br from-red-500/20 to-red-800/20"/>
        <StatCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} subtext="This month" className="bg-gradient-to-br from-purple-500/20 to-purple-800/20"/>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-3 sm:p-4 h-[280px] sm:h-[350px] lg:h-[400px] lg:col-span-2 overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4">Monthly Cash Flow</h3>
             {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                    <ComposedChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="displayMonth" tick={{ fill: '#9ca3af' }} fontSize={12} />
                        <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} tickFormatter={(value) => `N$${Number(value) / 1000}k`} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                whiteSpace: 'nowrap',
                                overflow: 'visible'
                            }}
                            formatter={(value: number, name: string) => [`N$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Legend 
                            wrapperStyle={{
                                fontSize: "14px",
                                whiteSpace: 'nowrap',
                                overflow: 'visible'
                            }}
                        />
                        <Bar dataKey="income" name="Income" fill="#22c55e" barSize={20} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" barSize={20} />
                        <Line type="monotone" dataKey="net" name="Net Flow" stroke="#29a9ff" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-500"><p>Not enough data for a trend analysis.</p></div>
             )}
        </Card>
        <Card className="p-3 sm:p-4 flex flex-col h-[280px] sm:h-[350px] lg:h-[400px] overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4">AI Financial Advisor</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3 text-sm text-gray-300">
                {isLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {aiInsights ? (
                    <div className="space-y-4">
                        <Card className="p-3 bg-gray-900/30">
                            <h4 className="font-semibold text-brand-400">Summary</h4>
                            <p className="mt-1">{aiInsights.summary}</p>
                        </Card>
                         <div>
                            <h4 className="font-semibold text-brand-400 mb-2">Actionable Tips</h4>
                            <div className="space-y-2">
                                {aiInsights.tips.map((tip, index) => <TipCard key={index} tip={tip} />)}
                            </div>
                        </div>
                        <Card className="p-3 bg-gray-900/30">
                             <h4 className="font-semibold text-brand-400">Observation</h4>
                             <p className="mt-1">{aiInsights.observation}</p>
                        </Card>
                    </div>
                ) : (
                    !isLoading && !error &&
                    <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                        <p>Click the button below to get personalized financial insights powered by AI.</p>
                    </div>
                )}
            </div>
            <button
                onClick={fetchInsights}
                disabled={isLoading}
                className="mt-4 w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? 'Generating...' : 'Get AI Insights'}
            </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-3 sm:p-4 h-[280px] sm:h-[350px] lg:h-[400px] lg:col-span-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4">Fixed vs. Variable Costs</h3>
           {costBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie
                            data={costBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={renderPieLabel}
                        >
                             <Cell key={`cell-0`} fill={COLORS[0]} />
                             <Cell key={`cell-1`} fill={COLORS[1]} />
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                whiteSpace: 'nowrap',
                                overflow: 'visible'
                            }} 
                            formatter={(value) => `N$${Number(value).toFixed(2)}`} 
                        />
                        <Legend 
                            wrapperStyle={{
                                fontSize: "14px",
                                whiteSpace: 'nowrap',
                                overflow: 'visible'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-500"><p>No cost data entered in Tools.</p></div>
             )}
        </Card>
        <Card className="p-3 sm:p-4 h-[280px] sm:h-[350px] lg:h-[400px] lg:col-span-2 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4">Spending by Category</h3>
          {spendingByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={spendingByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{ fill: '#9ca3af' }} fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#9ca3af' }} 
                fontSize={12} 
                width={80}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151', 
                  color: '#f9fafb',
                  whiteSpace: 'nowrap',
                  overflow: 'visible'
                }}
                cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                 formatter={(value) => `N$${Number(value).toFixed(2)}`}
              />
              <Bar dataKey="amount" name="Spending" radius={[0, 4, 4, 0]}>
                {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500"><p>No expense transactions recorded.</p></div>
          )}
        </Card>
      </div>

       <Card className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
              {transactions.length > 0 ? recentTransactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700/50">
                      <div>
                          <p className="font-medium text-white">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.category} - {new Date(t.date).toLocaleDateString()}</p>
                      </div>
                      <p className={`font-semibold text-sm sm:text-base ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'} break-words overflow-hidden`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}
                      </p>
                  </div>
              )) : (
                <p className="text-center text-gray-500 py-4">No recent transactions.</p>
              )}
          </div>
        </Card>
    </div>
  );
};

export default Dashboard;