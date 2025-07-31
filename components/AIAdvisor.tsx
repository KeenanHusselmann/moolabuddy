import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getFinancialInsights, getFinancialContent, getProjectionAnalysis } from '../services/geminiService';
import type { AIInsight, FinancialContent } from '../types';
import AIIcon from './icons/AIIcon';

interface AIAdvisorProps {
  financialData?: any;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ financialData }) => {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<string>('');
  const [investmentAdvice, setInvestmentAdvice] = useState<string>('');
  const [debtStrategy, setDebtStrategy] = useState<string>('');
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [investmentLoading, setInvestmentLoading] = useState(false);
  const [debtLoading, setDebtLoading] = useState(false);

  useEffect(() => {
    if (financialData) {
      checkAlerts();
    }
  }, [financialData]);

  const generateInsights = async () => {
    if (!financialData) return;
    
    setLoading(true);
    try {
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
        emergencyFund: financialData.emergencyFund || 0
      };
      
      const aiInsights = await getFinancialInsights(detailedData);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
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

  const checkAlerts = () => {
    const alerts: string[] = [];
    
    if (financialData) {
      // Check if user has any transactions first
      const hasTransactions = financialData.transactions && financialData.transactions.length > 0;
      
      if (!hasTransactions) {
        alerts.push(`📝 Welcome! Start by adding your first transaction to get personalized financial insights and alerts.`);
        setNotifications(alerts);
        return;
      }
      
      // Budget alerts based on actual spending vs budgets
      if (financialData.budgets && financialData.budgets.length > 0) {
        financialData.budgets.forEach(budget => {
          const spentInCategory = financialData.spendingByCategory[budget.category.toLowerCase()] || 0;
          if (spentInCategory > budget.limit) {
            const overspent = spentInCategory - budget.limit;
            alerts.push(`⚠️ Budget Alert: You've exceeded your ${budget.category} budget by N$${overspent.toFixed(2)}. You spent N$${spentInCategory.toFixed(2)} but your limit was N$${budget.limit.toFixed(2)}`);
          }
        });
      }
      
      // Savings rate alert with actual amounts
      if (financialData.income > 0) {
        const savingsRate = (financialData.savings / financialData.income) * 100;
        if (savingsRate < 10 && financialData.savings < 0) {
          alerts.push(`⚠️ Savings Alert: You're spending more than you earn. Your savings rate is ${savingsRate.toFixed(1)}%. Focus on reducing expenses or increasing income.`);
        } else if (savingsRate < 10) {
          alerts.push(`💡 Savings Tip: Your savings rate is ${savingsRate.toFixed(1)}%. Consider increasing it to at least 10% for better financial security.`);
        }
      }
      
      // Emergency fund alert (if monthly expenses are available)
      if (financialData.monthlyExpenses > 0) {
        const recommendedEmergencyFund = financialData.monthlyExpenses * 3;
        if (financialData.savings < recommendedEmergencyFund) {
          alerts.push(`💡 Emergency Fund: Consider building an emergency fund of N$${recommendedEmergencyFund.toFixed(2)} (3 months of expenses) for financial security.`);
        }
      }
      
      // Transaction frequency alert
      if (financialData.recentTransactions && financialData.recentTransactions.length < 3) {
        alerts.push(`📊 Tracking Tip: You've recorded ${financialData.recentTransactions.length} transactions in the last 30 days. Regular tracking helps build better financial habits.`);
      }
    }
    
    setNotifications(alerts);
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
      const budgetAnalysis = financialData.budgets.map(budget => {
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
      setBudgetAnalysis(analysis.summary);
    } catch (error) {
      console.error('Error generating budget analysis:', error);
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
      setInvestmentAdvice(advice.summary);
    } catch (error) {
      console.error('Error generating investment advice:', error);
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
      setDebtStrategy(debtStrategy.summary);
    } catch (error) {
      console.error('Error generating debt strategy:', error);
      setDebtStrategy('AI debt strategy temporarily unavailable. Please try again later.');
    } finally {
      setDebtLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">AI Financial Advisor</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Get personalized financial insights, tips, and recommendations powered by AI. 
          Receive real-time alerts for important financial milestones and budget overruns.
        </p>
        
        {/* Transaction Summary */}
        {financialData.transactions && financialData.transactions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-brand-400 mb-2">Your Financial Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Total Income:</span>
                <div className="text-green-400 font-semibold">N${financialData.income?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <span className="text-gray-400">Total Expenses:</span>
                <div className="text-red-400 font-semibold">N${financialData.expenses?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <span className="text-gray-400">Net Savings:</span>
                <div className={`font-semibold ${financialData.savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  N${financialData.savings?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Transactions:</span>
                <div className="text-white font-semibold">{financialData.transactions.length}</div>
              </div>
            </div>
            
            {/* Top Spending Categories */}
            {Object.keys(financialData.spendingByCategory || {}).length > 0 && (
              <div className="mt-3">
                <span className="text-gray-400 text-xs">Top Spending Categories:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(financialData.spendingByCategory || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([category, amount]) => (
                      <span key={category} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {category}: N${amount.toFixed(2)}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Alerts Section */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((alert, index) => (
            <Card key={index} className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
              <p className="text-red-300">{alert}</p>
            </Card>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Financial Insights</h2>
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div className="bg-gray-900/30 p-4 rounded-lg border border-brand-500/30">
                <h3 className="font-semibold text-brand-400 mb-2">Summary</h3>
                <p className="text-gray-300">{insights.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Actionable Tips</h3>
                <div className="space-y-3">
                  {insights.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border-l-4 border-brand-500/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        tip.type === 'savings' ? 'bg-green-500' :
                        tip.type === 'spending' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase">{tip.type}</span>
                        <p className="text-gray-300">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900/30 p-4 rounded-lg border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 mb-2">AI Observation</h3>
                <p className="text-gray-300">{insights.observation}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {financialData.transactions && financialData.transactions.length > 0 ? (
                <>
                  <p className="text-gray-400 mb-4">
                    You have {financialData.transactions.length} transaction{financialData.transactions.length !== 1 ? 's' : ''} recorded. 
                    Generate personalized insights based on your actual spending patterns.
                  </p>
                  <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate AI Insights'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">Start by adding transactions to get personalized financial insights</p>
                  <button
                    onClick={generateInsights}
                    disabled={loading}
                    className="bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Get Started'}
                  </button>
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* AI-Powered Features */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">AI-Powered Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
            <h3 className="font-semibold text-white mb-2">Smart Budgeting</h3>
            <p className="text-sm text-gray-300 mb-4">AI analyzes spending patterns and suggests budget optimizations</p>
            {budgetAnalysis ? (
              <div className="bg-gray-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{budgetAnalysis}</p>
              </div>
            ) : (
              <button
                onClick={generateBudgetAnalysis}
                disabled={budgetLoading}
                className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {budgetLoading ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            )}
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <h3 className="font-semibold text-white mb-2">Investment Recommendations</h3>
            <p className="text-sm text-gray-300 mb-4">Get personalized investment suggestions based on your goals</p>
            {investmentAdvice ? (
              <div className="bg-gray-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{investmentAdvice}</p>
              </div>
            ) : (
              <button
                onClick={generateInvestmentAdvice}
                disabled={investmentLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {investmentLoading ? 'Generating...' : 'Get Advice'}
              </button>
            )}
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
            <h3 className="font-semibold text-white mb-2">Debt Strategy</h3>
            <p className="text-sm text-gray-300 mb-4">AI creates optimal debt payoff strategies</p>
            {debtStrategy ? (
              <div className="bg-gray-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{debtStrategy}</p>
              </div>
            ) : (
              <button
                onClick={generateDebtStrategy}
                disabled={debtLoading}
                className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {debtLoading ? 'Creating...' : 'Create Strategy'}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor; 