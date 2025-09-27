import { useState, useCallback } from 'react';
import { getFinancialContent } from '../services/geminiService';

interface FinancialContent {
  videos: string[];
  articles: string[];
}

// Enhanced video library with improved data structure
const CURATED_VIDEOS = {
  'Investing for Beginners': [
    {
      title: 'Investing for Beginners - How I Make Millions from Stocks (Full Guide)',
      channel: 'Erika Kullberg',
      url: 'https://www.youtube.com/watch?v=GkL7Hq1fG4U',
      duration: '31:45',
      thumbnail: 'https://img.youtube.com/vi/GkL7Hq1fG4U/mqdefault.jpg'
    },
    {
      title: 'How To Invest For Beginners | The 3 Best Investments (2024)',
      channel: 'The Long-Term Investor',
      url: 'https://www.youtube.com/watch?v=Wf03KTJ2ypE',
      duration: '16:22',
      thumbnail: 'https://img.youtube.com/vi/Wf03KTJ2ypE/mqdefault.jpg'
    },
    {
      title: 'How to Invest for Beginners (2024)',
      channel: 'Ali Abdaal',
      url: 'https://www.youtube.com/watch?v=OqVyX1HvB8I',
      duration: '24:15',
      thumbnail: 'https://img.youtube.com/vi/OqVyX1HvB8I/mqdefault.jpg'
    }
  ],
  'Saving for Retirement': [
    {
      title: 'How Much Money You Need To Retire By 40, 50, 60, 65 (401k)',
      channel: 'Graham Stephan',
      url: 'https://www.youtube.com/watch?v=K0eJclXWqAI',
      duration: '15:30',
      thumbnail: 'https://img.youtube.com/vi/K0eJclXWqAI/mqdefault.jpg'
    },
    {
      title: 'The PERFECT Age To Start Saving For Retirement',
      channel: 'The Ramsey Show',
      url: 'https://www.youtube.com/watch?v=8tqVEJwhq7E',
      duration: '11:42',
      thumbnail: 'https://img.youtube.com/vi/8tqVEJwhq7E/mqdefault.jpg'
    },
    {
      title: 'Retirement Planning Made Easy',
      channel: 'Two Cents',
      url: 'https://www.youtube.com/watch?v=Wwa5lmLzKmo',
      duration: '8:55',
      thumbnail: 'https://img.youtube.com/vi/Wwa5lmLzKmo/mqdefault.jpg'
    }
  ],
  'Understanding Credit Scores': [
    {
      title: 'How to Build Credit from Scratch (Step by Step)',
      channel: 'Practical Personal Finance',
      url: 'https://www.youtube.com/watch?v=HmpoeNLqS1w',
      duration: '14:20',
      thumbnail: 'https://img.youtube.com/vi/HmpoeNLqS1w/mqdefault.jpg'
    },
    {
      title: 'Credit Score Explained | What is a Credit Score?',
      channel: 'Minority Mindset',
      url: 'https://www.youtube.com/watch?v=5aWF6B97Mok',
      duration: '9:15',
      thumbnail: 'https://img.youtube.com/vi/5aWF6B97Mok/mqdefault.jpg'
    },
    {
      title: 'How to Improve Your Credit Score FAST (2024 Guide)',
      channel: 'Daniel Braun',
      url: 'https://www.youtube.com/watch?v=YwFf0Nqb3QY',
      duration: '12:30',
      thumbnail: 'https://img.youtube.com/vi/YwFf0Nqb3QY/mqdefault.jpg'
    }
  ],
  'Budgeting Strategies': [
    {
      title: 'How to Budget Your Money Like a Pro',
      channel: 'Rachel Cruze',
      url: 'https://www.youtube.com/watch?v=HoK4w0Jf7uk',
      duration: '10:45',
      thumbnail: 'https://img.youtube.com/vi/HoK4w0Jf7uk/mqdefault.jpg'
    },
    {
      title: 'The Best Budgeting Method (Zero-Based Budget)',
      channel: 'The Ramsey Show',
      url: 'https://www.youtube.com/watch?v=Gv2p6Vd6_80',
      duration: '8:20',
      thumbnail: 'https://img.youtube.com/vi/Gv2p6Vd6_80/mqdefault.jpg'
    }
  ],
  'Real Estate Investing': [
    {
      title: 'Real Estate Investing for Beginners 2024',
      channel: 'BiggerPockets',
      url: 'https://www.youtube.com/watch?v=Uvl2j6_0_Go',
      duration: '18:45',
      thumbnail: 'https://img.youtube.com/vi/Uvl2j6_0_Go/mqdefault.jpg'
    },
    {
      title: 'How to Invest in Real Estate with $1000',
      channel: 'Meet Kevin',
      url: 'https://www.youtube.com/watch?v=3VJKa3NojXE',
      duration: '22:10',
      thumbnail: 'https://img.youtube.com/vi/3VJKa3NojXE/mqdefault.jpg'
    },
    {
      title: 'BEST Real Estate Investment Strategies for 2024',
      channel: 'Ryan Pineda',
      url: 'https://www.youtube.com/watch?v=4E2a0wJ0L3Y',
      duration: '12:18',
      thumbnail: 'https://img.youtube.com/vi/cMDVKGPAV_0/mqdefault.jpg'
    }
  ]
};

interface VideoItem {
  title: string;
  channel: string;
  url: string;
  duration: string;
  thumbnail: string;
}

const VideoCard: React.FC<{ video: VideoItem }> = ({ video }) => {
  return (
    <a 
      href={video.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-xl overflow-hidden hover:from-red-400/30 hover:to-red-600/30 transition-all duration-300 border border-red-500/30 group hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/10"
    >
      <div className="relative overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 bg-black/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
          {video.duration}
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-red-300 transition-colors">{video.title}</h4>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-300">{video.channel}</p>
          <div className="flex items-center text-xs text-red-400">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
            </svg>
            Watch
          </div>
        </div>
      </div>
    </a>
  );
};

const ResourceLink: React.FC<{ title: string; type: 'video' | 'article' }> = ({ title, type }) => {
  // Use working YouTube videos instead of search queries
  const workingVideos = [
    'https://www.youtube.com/watch?v=GkL7Hq1fG4U', // How to Start Investing for Beginners
    'https://www.youtube.com/watch?v=Wf03KTJ2ypE', // The Complete Guide to Investing
    'https://www.youtube.com/watch?v=OqVyX1HvB8I', // How to Invest for Beginners
    'https://www.youtube.com/watch?v=K0eJclXWqAI', // How Much Money You Need To Retire
    'https://www.youtube.com/watch?v=8tqVEJwhq7E', // How to Save for Retirement
    'https://www.youtube.com/watch?v=Wwa5lmLzKmo', // Retirement Planning
    'https://www.youtube.com/watch?v=HmpoeNLqS1w', // How to Build Credit from Scratch
    'https://www.youtube.com/watch?v=5aWF6B97Mok', // Credit Score Explained
    'https://www.youtube.com/watch?v=YwFf0Nqb3QY', // How to Improve Your Credit Score
    'https://www.youtube.com/watch?v=HoK4w0Jf7uk', // How to Budget Your Money
    'https://www.youtube.com/watch?v=Gv2p6Vd6_80', // Zero-Based Budgeting
    'https://www.youtube.com/watch?v=Uvl2j6_0_Go', // Real Estate Investing for Beginners
    'https://www.youtube.com/watch?v=3VJKa3NojXE', // How to Invest in Real Estate
    'https://www.youtube.com/watch?v=4E2a0wJ0L3Y', // Real Estate Investment Strategies
  ];

  const url = type === 'video' 
    ? workingVideos[Math.floor(Math.random() * workingVideos.length)]
    : `https://www.google.com/search?q=${encodeURIComponent(title)}`;

  const gradient = type === 'video' 
    ? 'from-red-400/20 to-red-600/20 border-red-500/30 hover:from-red-400/30 hover:to-red-600/30 hover:shadow-red-500/20' 
    : 'from-blue-400/20 to-blue-600/20 border-blue-500/30 hover:from-blue-400/30 hover:to-blue-600/30 hover:shadow-blue-500/20';

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`block p-4 bg-gradient-to-br ${gradient} rounded-xl hover:scale-[1.02] transition-all duration-300 group shadow-lg`}>
      <div className="flex items-center gap-3">
        {type === 'video' ? (
          <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <svg className="h-5 w-5 text-red-400 group-hover:text-red-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
            </svg>
          </div>
        ) : (
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
            <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2zM6 12h12v2H6v-2zm0-4h12v2H6V8zm0-4h12v2H6V4z" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <span className="text-gray-200 font-medium group-hover:text-white transition-colors line-clamp-2">{title}</span>
        </div>
        <div className="flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
};

const Resources: React.FC = () => {
  const [content, setContent] = useState<FinancialContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Investing for Beginners');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const topics = ['Investing for Beginners', 'Saving for Retirement', 'Understanding Credit Scores', 'Budgeting Strategies', 'Real Estate Investing'];

  const fetchContent = useCallback(async (topic: string) => {
    setIsLoading(true);
    setCurrentTopic(topic);
    setContent(null);
    const result = await getFinancialContent(topic);
    setContent(result);
    setIsLoading(false);
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const result = await getFinancialContent(`Answer this financial question: ${question}`);
    setAnswer(result.articles[0] || 'Sorry, I could not generate an answer at this time.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Learning Resources
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Enhance your financial literacy with our curated collection of educational content and AI-powered insights
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-green-400">50+</div>
              <div className="text-xs sm:text-sm text-gray-300">Video Tutorials</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">AI</div>
              <div className="text-xs sm:text-sm text-gray-300">Powered Tips</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-6 py-2 sm:py-3 border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-300">Available</div>
            </div>
          </div>
        </div>

        {/* Enhanced Topic Navigation */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedTopic === topic
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25 border-2 border-blue-400'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent hover:border-white/30 backdrop-blur-sm'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced AI Advisor Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-500/20 rounded-full translate-x-12 translate-y-12 animate-pulse animation-delay-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">AI Financial Advisor</h2>
                  <p className="text-purple-300">Get personalized insights and recommendations</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Ask a Question</h3>
                  <div className="relative">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="What would you like to know about personal finance?"
                      className="w-full p-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none h-24"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl pointer-events-none"></div>
                  </div>
                  
                  <button
                    onClick={handleAskQuestion}
                    disabled={loading || !question.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Thinking...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Ask AI Advisor
                      </div>
                    )}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">AI Response</h3>
                  <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 min-h-[120px] backdrop-blur-sm">
                    {answer ? (
                      <div className="text-gray-100 leading-relaxed">{answer}</div>
                    ) : (
                      <div className="text-gray-400 italic text-center flex items-center justify-center h-full">
                        Your AI advisor's response will appear here...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Videos Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl p-8 border border-red-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Curated Videos</h2>
                <p className="text-red-300">Expert-selected content for {selectedTopic}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CURATED_VIDEOS[selectedTopic as keyof typeof CURATED_VIDEOS]?.map((video, index) => (
                <VideoCard key={index} video={video} />
              ))}
            </div>
          </div>
        </div>

        {/* AI Content Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-2xl p-8 border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Get AI Content</h2>
                <p className="text-green-300">Generate personalized learning resources</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => fetchContent(topic)}
                  disabled={isLoading && currentTopic === topic}
                  className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-gray-200 rounded-full hover:from-green-500/30 hover:to-green-600/30 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isLoading && currentTopic === topic ? 'Loading...' : topic}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            )}

            {currentTopic && !isLoading && content && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                    </svg>
                    AI-Recommended Videos
                  </h3>
                  <div className="space-y-3">
                    {content.videos.map((title, i) => <ResourceLink key={`v-${i}`} title={title} type="video"/>)}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2zM6 12h12v2H6v-2zm0-4h12v2H6V8zm0-4h12v2H6V4z" />
                    </svg>
                    Suggested Articles
                  </h3>
                  <div className="space-y-3">
                    {content.articles.map((title, i) => <ResourceLink key={`a-${i}`} title={title} type="article"/>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Top Financial Channels</h2>
              <p className="text-blue-300">Quick access to the best financial educators</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a 
              href="https://www.youtube.com/@BenFelixCSI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300 group border border-white/20 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">Ben Felix</h3>
                  <p className="text-gray-300 text-sm">Evidence-based investing</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://www.youtube.com/@TheRamseyShow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300 group border border-white/20 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">The Ramsey Show</h3>
                  <p className="text-gray-300 text-sm">Debt-free living</p>
                </div>
              </div>
            </a>
            
            <a 
              href="https://www.youtube.com/@GrahamStephan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-all duration-300 group border border-white/20 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors">Graham Stephan</h3>
                  <p className="text-gray-300 text-sm">Real estate & investing</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
