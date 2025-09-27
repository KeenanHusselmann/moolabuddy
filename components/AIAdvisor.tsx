import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { getFinancialInsights } from '../services/geminiService';
import type { AIInsight } from '../types';
import { useToast } from './ToastContext';

interface AIAdvisorProps {
  financialData?: any;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  type?: 'text' | 'insight' | 'recommendation' | 'alert';
}

interface AdvancedInsight {
  category: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface FinancialAlert {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  message: string;
  actionable: boolean;
  createdAt: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ financialData }) => {
  const { showToast } = useToast();
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [budgetAnalysis, setBudgetAnalysis] = useState<string>('');
  const [investmentAdvice, setInvestmentAdvice] = useState<string>('');
  const [debtStrategy, setDebtStrategy] = useState<string>('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [investmentLoading, setInvestmentLoading] = useState(false);
  const [debtLoading, setDebtLoading] = useState(false);

  // New state for enhanced features
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'analytics' | 'alerts'>('insights');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [advancedInsights, setAdvancedInsights] = useState<AdvancedInsight[]>([]);
  const [financialAlerts, setFinancialAlerts] = useState<FinancialAlert[]>([]);
  const [insightType, setInsightType] = useState<'general' | 'budget' | 'investment' | 'savings' | 'debt'>('general');

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    if (!financialData?.transactions || financialData.transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
        avgDailySpending: 0,
        topCategory: 'None',
        financialHealth: 0,
        monthlyTrend: 'stable' as const,
        expenseGrowth: 0,
        incomeGrowth: 0
      };
    }

    const income = financialData.income || 0;
    const expenses = financialData.expenses || 0;
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
    
    const categories = financialData.spendingByCategory || {};
    const topCategory = Object.entries(categories).length > 0 
      ? Object.entries(categories).reduce((a, b) => ((a as any)[1] > (b as any)[1] ? a : b))[0] 
      : 'None';
    
    const avgDailySpending = expenses / 30;
    
    // Calculate financial health score (0-100)
    let healthScore = 50;
    if (savingsRate > 20) healthScore += 30;
    else if (savingsRate > 10) healthScore += 15;
    else if (savingsRate < 0) healthScore -= 30;
    
    if (income > expenses * 3) healthScore += 20;
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings,
      savingsRate,
      avgDailySpending,
      topCategory,
      financialHealth: Math.max(0, Math.min(100, healthScore)),
      monthlyTrend: netSavings > 0 ? 'up' as const : netSavings < 0 ? 'down' as const : 'stable' as const,
      expenseGrowth: 0, // Would need historical data
      incomeGrowth: 0   // Would need historical data
    };
  }, [financialData]);

  // Filter insights based on search
  const filteredInsights = useMemo(() => {
    if (!searchQuery || !insights) return insights;
    
    const filtered = {
      ...insights,
      tips: insights.tips.filter(tip => 
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
    
    return filtered;
  }, [insights, searchQuery]);

  useEffect(() => {
    if (financialData) {
      generateAdvancedInsights();
      generateFinancialAlerts();
    }
  }, [financialData, selectedTimeframe]);

  // Generate advanced insights
  const generateAdvancedInsights = () => {
    if (!financialData?.transactions) return;

    const insights: AdvancedInsight[] = [
      {
        category: 'Savings Rate',
        value: analytics.savingsRate,
        change: 0, // Would need historical data
        trend: analytics.monthlyTrend,
        recommendation: analytics.savingsRate < 10 ? 'Consider increasing your savings rate to at least 10%' : 'Great job maintaining a healthy savings rate!'
      },
      {
        category: 'Monthly Spending',
        value: analytics.totalExpenses,
        change: 0,
        trend: analytics.monthlyTrend === 'up' ? 'down' : 'up', // Inverse for expenses
        recommendation: analytics.avgDailySpending > 200 ? 'Review your daily spending habits for optimization opportunities' : 'Your spending is well-controlled'
      },
      {
        category: 'Financial Health',
        value: analytics.financialHealth,
        change: 0,
        trend: analytics.financialHealth > 70 ? 'up' : analytics.financialHealth < 50 ? 'down' : 'stable',
        recommendation: analytics.financialHealth < 50 ? 'Focus on improving your income-to-expense ratio' : 'Excellent financial health!'
      }
    ];

    setAdvancedInsights(insights);
  };

  // Generate smart financial alerts
  const generateFinancialAlerts = () => {
    const alerts: FinancialAlert[] = [];
    const now = new Date().toISOString();

    if (analytics.savingsRate < 0) {
      alerts.push({
        id: 'negative-savings',
        type: 'critical',
        title: 'Negative Savings Rate',
        message: 'You\'re spending more than you earn. Immediate action required.',
        actionable: true,
        createdAt: now
      });
    }

    if (analytics.savingsRate > 0 && analytics.savingsRate < 5) {
      alerts.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${analytics.savingsRate.toFixed(1)}%. Consider increasing to 10% or more.`,
        actionable: true,
        createdAt: now
      });
    }

    if (analytics.financialHealth > 80) {
      alerts.push({
        id: 'excellent-health',
        type: 'success',
        title: 'Excellent Financial Health',
        message: 'Your financial health score is outstanding! Keep up the great work.',
        actionable: false,
        createdAt: now
      });
    }

    if (financialData?.budgets && Object.keys(financialData.spendingByCategory || {}).length > 0) {
      financialData.budgets.forEach((budget: any) => {
        const spent = financialData.spendingByCategory[budget.category.toLowerCase()] || 0;
        if (spent > budget.limit * 0.9) {
          alerts.push({
            id: `budget-alert-${budget.category}`,
            type: spent > budget.limit ? 'warning' : 'info',
            title: `${budget.category} Budget Alert`,
            message: `You've used ${((spent / budget.limit) * 100).toFixed(0)}% of your ${budget.category} budget.`,
            actionable: true,
            createdAt: now
          });
        }
      });
    }

    setFinancialAlerts(alerts);
  };

  const generateInsights = async () => {
    if (!financialData) return;
    
    setLoading(true);
    try {
      showToast('Generating AI insights...', 'info');
      
      // Check if user has any transactions
      const hasTransactions = financialData.transactions && financialData.transactions.length > 0;
      
      if (!hasTransactions) {
        // Provide guidance for users with no transactions
        setInsights({
          summary: "Welcome to MoolaBuddy! I notice you haven't recorded any transactions yet. Start by adding your income and expenses to get personalized financial insights.",
          tips: [
            {
              type: 'spending',
              description: "Add your first transaction by going to the Transactions page and recording your recent income or expenses."
            },
            {
              type: 'savings',
              description: "Set up your financial goals in the Goals section to track your progress towards important milestones."
            },
            {
              type: 'investment',
              description: "Use the Projections tool to explore how your money could grow over time with different investment strategies."
            }
          ],
          observation: "Getting started with financial tracking is the first step towards better money management. Every transaction you record helps build a clearer picture of your financial health."
        });
        showToast('Welcome insights generated!', 'success');
        return;
      }
      
      // Include detailed financial data for better analysis
      const detailedData = {
        ...financialData,
        income: financialData.income || 0,
        expenses: financialData.expenses || 0,
        savings: financialData.savings || 0,
        budget: financialData.budget || 0,
        spending: financialData.spending || 0,
        transactions: financialData.transactions || [],
        monthlyExpenses: financialData.monthlyExpenses || 0,
        emergencyFund: financialData.emergencyFund || 0,
        requestType: insightType
      };
      
      const aiInsights = await getFinancialInsights(detailedData);
      if (aiInsights) {
        setInsights(aiInsights);
        showToast('AI insights generated successfully!', 'success');
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      showToast('Failed to generate insights. Please try again.', 'error');
      // Provide fallback insights if AI service fails
      setInsights({
        summary: "I'm having trouble analyzing your data right now, but I can see you have some transactions recorded. Try refreshing the insights later.",
        tips: [
          {
            type: 'spending',
            description: "Review your recent transactions to identify any patterns in your spending habits."
          },
          {
            type: 'savings',
            description: "Consider setting up a budget for your most common expense categories."
          },
          {
            type: 'investment',
            description: "Explore the Projections tool to see how your savings could grow over time."
          }
        ],
        observation: "Regular tracking of your finances is key to building better financial habits."
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetAnalysis = async () => {
    if (!financialData) return;
    
    setBudgetLoading(true);
    try {
      // Check if user has transactions and budgets
      const hasTransactions = financialData.transactions && financialData.transactions.length > 0;
      const hasBudgets = financialData.budgets && financialData.budgets.length > 0;
      
      if (!hasTransactions) {
        setBudgetAnalysis("Start by adding some transactions to get personalized budget recommendations. Record your income and expenses to see where your money is going.");
        return;
      }
      
      if (!hasBudgets) {
        setBudgetAnalysis("Great! You have transactions recorded. Consider setting up budgets for your main spending categories to better track and control your expenses.");
        return;
      }
      
      // Analyze actual spending vs budgets
      const budgetAnalysis = financialData.budgets.map((budget: any) => {
        const spentInCategory = financialData.spendingByCategory[budget.category.toLowerCase()] || 0;
        const remaining = budget.limit - spentInCategory;
        const percentageUsed = (spentInCategory / budget.limit) * 100;
        
        return {
          category: budget.category,
          limit: budget.limit,
          spent: spentInCategory,
          remaining,
          percentageUsed
        };
      });
      
      const analysis = await getFinancialInsights({
        ...financialData,
        requestType: 'budget_optimization',
        budgetAnalysis,
        income: financialData.income || 0,
        expenses: financialData.expenses || 0,
        spending: financialData.spending || 0,
        budget: financialData.budget || 0,
        transactions: financialData.transactions || []
      });
      if (analysis) {
        setBudgetAnalysis(analysis.summary);
        showToast('Budget analysis completed!', 'success');
      } else {
        throw new Error('Failed to generate analysis');
      }
    } catch (error) {
      console.error('Error generating budget analysis:', error);
      showToast('Failed to generate budget analysis', 'error');
      setBudgetAnalysis('AI analysis temporarily unavailable. Please try again later.');
    } finally {
      setBudgetLoading(false);
    }
  };

  const generateInvestmentAdvice = async () => {
    if (!financialData) return;
    
    setInvestmentLoading(true);
    try {
      // Check if user has sufficient data for investment advice
      const hasTransactions = financialData.transactions && financialData.transactions.length > 0;
      const hasIncome = financialData.income && financialData.income > 0;
      const hasSavings = financialData.savings && financialData.savings > 0;
      
      if (!hasTransactions || !hasIncome) {
        setInvestmentAdvice("Start by recording your income and expenses to get personalized investment recommendations. Understanding your cash flow is the first step to smart investing.");
        return;
      }
      
      if (!hasSavings) {
        setInvestmentAdvice("Focus on building your savings first. Once you have a solid emergency fund (3-6 months of expenses), you can start exploring investment opportunities.");
        return;
      }
      
      const advice = await getFinancialInsights({
        ...financialData,
        requestType: 'investment_recommendations',
        income: financialData.income || 0,
        savings: financialData.savings || 0,
        emergencyFund: financialData.emergencyFund || 0,
        monthlyExpenses: financialData.monthlyExpenses || 0
      });
      if (advice) {
        setInvestmentAdvice(advice.summary);
        showToast('Investment advice generated!', 'success');
      } else {
        throw new Error('Failed to generate advice');
      }
    } catch (error) {
      console.error('Error generating investment advice:', error);
      showToast('Failed to generate investment advice', 'error');
      setInvestmentAdvice('AI investment advice temporarily unavailable. Please try again later.');
    } finally {
      setInvestmentLoading(false);
    }
  };

  const generateDebtStrategy = async () => {
    if (!financialData) return;
    
    setDebtLoading(true);
    try {
      // Check if user has sufficient data for debt strategy
      const hasTransactions = financialData.transactions && financialData.transactions.length > 0;
      const hasIncome = financialData.income && financialData.income > 0;
      
      if (!hasTransactions || !hasIncome) {
        setDebtStrategy("Start by recording your income and expenses to get personalized debt management strategies. Understanding your financial situation is key to effective debt planning.");
        return;
      }
      
      // Check if user has any debt-related transactions (this would need to be enhanced if debt tracking is added)
      const debtStrategy = await getFinancialInsights({
        ...financialData,
        requestType: 'debt_strategy',
        income: financialData.income || 0,
        expenses: financialData.expenses || 0,
        savings: financialData.savings || 0,
        transactions: financialData.transactions || []
      });
      if (debtStrategy) {
        setDebtStrategy(debtStrategy.summary);
        showToast('Debt strategy created!', 'success');
      } else {
        throw new Error('Failed to generate strategy');
      }
    } catch (error) {
      console.error('Error generating debt strategy:', error);
      showToast('Failed to generate debt strategy', 'error');
      setDebtStrategy('AI debt strategy temporarily unavailable. Please try again later.');
    } finally {
      setDebtLoading(false);
    }
  };

  // Chat functionality
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      timestamp: new Date().toISOString(),
      isUser: true,
      type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Simulate AI response (would integrate with actual AI service)
      const aiResponse = await getFinancialInsights({
        ...financialData,
        requestType: 'chat',
        query: chatInput,
        context: chatMessages.slice(-5) // Last 5 messages for context
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse?.summary || "I'm here to help with your financial questions. Could you be more specific about what you'd like to know?",
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text'
      };

      setChatMessages(prev => [...prev, aiMessage]);
      showToast('AI response generated', 'success');
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isUser: false,
        type: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
      showToast('Chat error occurred', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    showToast('Chat cleared', 'info');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header with Analytics Summary */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">AI Financial Advisor</h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get personalized financial insights, real-time analysis, and AI-powered recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${analytics.financialHealth > 70 ? 'bg-green-400' : analytics.financialHealth > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">Health: {analytics.financialHealth.toFixed(0)}%</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Net Savings</h3>
            <div className={`text-lg font-bold ${analytics.netSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              N${analytics.netSavings.toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-xs ${analytics.monthlyTrend === 'up' ? 'text-green-400' : analytics.monthlyTrend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                {analytics.monthlyTrend === 'up' ? '↗' : analytics.monthlyTrend === 'down' ? '↘' : '→'} {analytics.monthlyTrend}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Savings Rate</h3>
            <div className={`text-lg font-bold ${analytics.savingsRate > 10 ? 'text-green-400' : analytics.savingsRate > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {analytics.savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">
              {analytics.savingsRate > 20 ? 'Excellent' : analytics.savingsRate > 10 ? 'Good' : analytics.savingsRate > 0 ? 'Fair' : 'Needs Attention'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Daily Spending</h3>
            <div className="text-lg font-bold text-blue-400">
              N${analytics.avgDailySpending.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Top: {analytics.topCategory}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xs font-medium text-gray-400 mb-1">Transactions</h3>
            <div className="text-lg font-bold text-purple-400">
              {financialData?.transactions?.length || 0}
            </div>
            <div className="text-xs text-gray-400">
              This {selectedTimeframe}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['insights', 'chat', 'analytics', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all capitalize text-xs sm:text-sm ${
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab}
            {tab === 'alerts' && financialAlerts.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {financialAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={insightType}
                  onChange={(e) => setInsightType(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="general">General</option>
                  <option value="budget">Budget</option>
                  <option value="investment">Investment</option>
                  <option value="savings">Savings</option>
                  <option value="debt">Debt</option>
                </select>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                <span className="ml-3 text-gray-300">Generating AI insights...</span>
              </div>
            ) : filteredInsights ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-brand-500/20 to-purple-500/20 p-6 rounded-lg border border-brand-500/30">
                  <h3 className="font-semibold text-brand-400 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-brand-400 rounded-full mr-2"></div>
                    AI Summary
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{filteredInsights.summary}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Actionable Recommendations
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredInsights.tips.map((tip, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 bg-gray-900/50 ${
                        tip.type === 'savings' ? 'border-green-500 bg-green-500/5' :
                        tip.type === 'spending' ? 'border-orange-500 bg-orange-500/5' : 
                        'border-blue-500 bg-blue-500/5'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-3 h-3 rounded-full ${
                            tip.type === 'savings' ? 'bg-green-500' :
                            tip.type === 'spending' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-xs font-medium text-gray-400 uppercase">{tip.type}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{tip.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg border border-purple-500/30">
                  <h3 className="font-semibold text-purple-400 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    AI Observation
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{filteredInsights.observation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {financialData?.transactions && financialData.transactions.length > 0 ? (
                  <>
                    <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      You have {financialData.transactions.length} transaction{financialData.transactions.length !== 1 ? 's' : ''} recorded. 
                      Generate personalized insights based on your {insightType} financial data.
                    </p>
                    <button
                      onClick={generateInsights}
                      disabled={loading}
                      className="bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? 'Generating...' : `Generate ${insightType} Insights`}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Start by adding transactions to get personalized financial insights and AI-powered recommendations.
                    </p>
                    <button
                      onClick={generateInsights}
                      disabled={loading}
                      className="bg-gradient-to-r from-brand-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-brand-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? 'Generating...' : 'Get Started'}
                    </button>
                  </>
                )}
              </div>
            )}
          </Card>

          {/* AI-Powered Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Smart Budgeting</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">AI analyzes spending patterns and suggests budget optimizations</p>
              {budgetAnalysis ? (
                <div className="bg-gray-900/30 p-4 rounded-lg border border-green-500/20">
                  <p className="text-sm text-gray-300 leading-relaxed">{budgetAnalysis}</p>
                  <button
                    onClick={() => setBudgetAnalysis('')}
                    className="mt-3 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Generate new analysis →
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateBudgetAnalysis}
                  disabled={budgetLoading}
                  className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {budgetLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Generate Analysis'
                  )}
                </button>
              )}
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Investment Advice</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">Get personalized investment recommendations based on your goals</p>
              {investmentAdvice ? (
                <div className="bg-gray-900/30 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-gray-300 leading-relaxed">{investmentAdvice}</p>
                  <button
                    onClick={() => setInvestmentAdvice('')}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Get new advice →
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateInvestmentAdvice}
                  disabled={investmentLoading}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {investmentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Get Advice'
                  )}
                </button>
              )}
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Debt Strategy</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">AI creates optimal debt payoff strategies</p>
              {debtStrategy ? (
                <div className="bg-gray-900/30 p-4 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-gray-300 leading-relaxed">{debtStrategy}</p>
                  <button
                    onClick={() => setDebtStrategy('')}
                    className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Create new strategy →
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateDebtStrategy}
                  disabled={debtLoading}
                  className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {debtLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Strategy'
                  )}
                </button>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          <Card className="p-6 h-96 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">AI Financial Chat</h3>
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">Start a conversation with your AI financial advisor</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleChatSubmit} className="flex gap-2 w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="bg-brand-600 text-white px-3 py-2.5 rounded-lg hover:bg-brand-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedInsights.map((insight, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">{insight.category}</h3>
                  <div className={`flex items-center text-sm ${
                    insight.trend === 'up' ? 'text-green-400' : 
                    insight.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
                    <span className="ml-1">{Math.abs(insight.change).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-white">
                    {insight.category.includes('Rate') || insight.category.includes('Health') 
                      ? `${insight.value.toFixed(1)}%` 
                      : `N$${insight.value.toFixed(2)}`}
                  </div>
                  <div className={`text-sm ${
                    insight.trend === 'up' ? 'text-green-400' : 
                    insight.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    vs last period
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-300">{insight.recommendation}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Analytics */}
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-4">Financial Health Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Health Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        analytics.financialHealth > 70 ? 'bg-green-500' : 
                        analytics.financialHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(analytics.financialHealth, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold">{analytics.financialHealth.toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <span className="text-gray-400 text-sm">Income vs Expenses</span>
                  <div className="text-white font-semibold">
                    {analytics.totalIncome > 0 ? ((analytics.totalExpenses / analytics.totalIncome) * 100).toFixed(1) : 0}% ratio
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Top Spending Category</span>
                  <div className="text-white font-semibold">{analytics.topCategory}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {financialAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">All Good!</h3>
              <p className="text-gray-400">No financial alerts at the moment. Keep up the great work!</p>
            </Card>
          ) : (
            financialAlerts.map((alert) => (
              <Card key={alert.id} className={`p-4 border-l-4 ${
                alert.type === 'critical' ? 'border-red-500 bg-red-500/10' :
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                alert.type === 'success' ? 'border-green-500 bg-green-500/10' :
                'border-blue-500 bg-blue-500/10'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' :
                        alert.type === 'success' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}></div>
                      <h3 className="font-semibold text-white">{alert.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {alert.actionable && (
                    <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors ml-4">
                      Take Action →
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor; 