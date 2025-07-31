import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { getFinancialInsights, getFinancialContent, getProjectionAnalysis } from '../services/geminiService';
import type { AIInsight, FinancialContent } from '../types';
import AIIcon from './icons/AIIcon';

interface AIAdvisorProps {
  financialData?: any;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ financialData }) => {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [content, setContent] = useState<FinancialContent | { videos: [], articles: [] }>({ videos: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const topics = [
    'Budgeting Basics',
    'Investment Strategies',
    'Debt Management',
    'Emergency Funds',
    'Retirement Planning',
    'Tax Optimization',
    'Credit Score',
    'Real Estate',
    'Cryptocurrency',
    'Insurance'
  ];

  const workingVideos = {
    'Budgeting Basics': [
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y'
    ],
    'Investment Strategies': [
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI'
    ],
    'Debt Management': [
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU'
    ],
    'Emergency Funds': [
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c'
    ],
    'Retirement Planning': [
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao'
    ],
    'Tax Optimization': [
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y'
    ],
    'Credit Score': [
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI'
    ],
    'Real Estate': [
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU'
    ],
    'Cryptocurrency': [
      'https://www.youtube.com/watch?v=YFzDW9uX7ao',
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c'
    ],
    'Insurance': [
      'https://www.youtube.com/watch?v=6U_ZWJcyq9Y',
      'https://www.youtube.com/watch?v=UoJEioANnaI',
      'https://www.youtube.com/watch?v=Gv2gBP87GfU',
      'https://www.youtube.com/watch?v=0xFUD8dPR9c',
      'https://www.youtube.com/watch?v=YFzDW9uX7ao'
    ]
  };

  useEffect(() => {
    if (financialData) {
      generateInsights();
      checkAlerts();
    }
  }, [financialData]);

  const generateInsights = async () => {
    if (!financialData) return;
    
    setLoading(true);
    try {
      const aiInsights = await getFinancialInsights(financialData);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = () => {
    const alerts: string[] = [];
    
    if (financialData) {
      // Budget alert
      if (financialData.spending > financialData.budget) {
        alerts.push(`⚠️ Budget Alert: You've exceeded your budget by $${financialData.spending - financialData.budget}`);
      }
      
      // Savings rate alert
      const savingsRate = (financialData.savings / financialData.income) * 100;
      if (savingsRate < 10) {
        alerts.push(`⚠️ Savings Alert: Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 10%`);
      }
      
      // Emergency fund alert
      if (financialData.emergencyFund < financialData.monthlyExpenses * 3) {
        alerts.push(`⚠️ Emergency Fund Alert: Build 3-6 months of expenses`);
      }
    }
    
    setNotifications(alerts);
  };

  const handleTopicClick = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);
    
    try {
      const financialContent = await getFinancialContent(topic);
      setContent(financialContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      // Use fallback videos
      setContent({
        videos: workingVideos[topic as keyof typeof workingVideos] || [],
        articles: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getVideoTitle = (url: string, index: number) => {
    const titles = [
      'Financial Planning Basics',
      'Smart Investment Strategies',
      'Debt Management Tips',
      'Building Emergency Funds',
      'Retirement Planning Guide'
    ];
    return titles[index % titles.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <AIIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">AI Advisor</h1>
        </div>

        {/* Alerts Section */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Alerts & Notifications</h2>
            <div className="space-y-2">
              {notifications.map((alert, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="text-red-700">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Insights</h2>
            <Card className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : insights ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
                    <p className="text-blue-700">{insights.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Actionable Tips</h3>
                    <div className="space-y-3">
                      {insights.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            tip.type === 'savings' ? 'bg-green-500' :
                            tip.type === 'spending' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase">{tip.type}</span>
                            <p className="text-gray-700">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">AI Observation</h3>
                    <p className="text-purple-700">{insights.observation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No financial data available for insights</p>
                </div>
              )}
            </Card>
          </div>

          {/* Learning Resources */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Resources</h2>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTopic === topic
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              
              {selectedTopic && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">{selectedTopic} Videos</h3>
                  <div className="space-y-2">
                    {content.videos.slice(0, 3).map((video, index) => (
                      <a
                        key={index}
                        href={video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-600 rounded"></div>
                          <span className="text-sm text-gray-700">{getVideoTitle(video, index)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Additional AI Features */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Smart Budgeting</h3>
              <p className="text-sm text-gray-600">AI analyzes spending patterns and suggests budget optimizations</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Investment Recommendations</h3>
              <p className="text-sm text-gray-600">Get personalized investment suggestions based on your goals</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Debt Strategy</h3>
              <p className="text-sm text-gray-600">AI creates optimal debt payoff strategies</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 