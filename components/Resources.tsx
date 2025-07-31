
import React, { useState, useCallback } from 'react';
import { getFinancialContent } from '../services/geminiService';
import type { FinancialContent } from '../types';
import Card from './Card';

// Curated list of high-quality financial YouTube videos
const CURATED_VIDEOS = {
  'Investing for Beginners': [
    {
      title: 'How to Start Investing for Beginners (2024)',
      channel: 'Graham Stephan',
      url: 'https://www.youtube.com/watch?v=GkL7Hq1fG4U',
      duration: '18:21',
      thumbnail: 'https://img.youtube.com/vi/GkL7Hq1fG4U/mqdefault.jpg'
    },
    {
      title: 'The Complete Guide to Investing for Beginners',
      channel: 'The Plain Bagel',
      url: 'https://www.youtube.com/watch?v=Wf03KTJ2ypE',
      duration: '15:42',
      thumbnail: 'https://img.youtube.com/vi/Wf03KTJ2ypE/mqdefault.jpg'
    },
    {
      title: 'How to Invest for Beginners (2024)',
      channel: 'Ali Abdaal',
      url: 'https://www.youtube.com/watch?v=OqVyX1HvB8I',
      duration: '16:55',
      thumbnail: 'https://img.youtube.com/vi/OqVyX1HvB8I/mqdefault.jpg'
    }
  ],
  'Saving for Retirement': [
    {
      title: 'How Much Money You Need To Retire',
      channel: 'CNBC',
      url: 'https://www.youtube.com/watch?v=K0eJclXWqAI',
      duration: '14:28',
      thumbnail: 'https://img.youtube.com/vi/K0eJclXWqAI/mqdefault.jpg'
    },
    {
      title: 'How to Save for Retirement in Your 20s, 30s, 40s, and 50s',
      channel: 'Ramsey Solutions',
      url: 'https://www.youtube.com/watch?v=8tqVEJwhq7E',
      duration: '16:45',
      thumbnail: 'https://img.youtube.com/vi/8tqVEJwhq7E/mqdefault.jpg'
    },
    {
      title: 'Retirement Planning: How Much Should You Save?',
      channel: 'Khan Academy',
      url: 'https://www.youtube.com/watch?v=Wwa5lmLzKmo',
      duration: '13:52',
      thumbnail: 'https://img.youtube.com/vi/Wwa5lmLzKmo/mqdefault.jpg'
    }
  ],
  'Understanding Credit Scores': [
    {
      title: 'How to Build Credit from Scratch',
      channel: 'Graham Stephan',
      url: 'https://www.youtube.com/watch?v=HmpoeNLqS1w',
      duration: '11:23',
      thumbnail: 'https://img.youtube.com/vi/HmpoeNLqS1w/mqdefault.jpg'
    },
    {
      title: 'Credit Score Explained',
      channel: 'Investopedia',
      url: 'https://www.youtube.com/watch?v=5aWF6B97Mok',
      duration: '9:47',
      thumbnail: 'https://img.youtube.com/vi/5aWF6B97Mok/mqdefault.jpg'
    },
    {
      title: 'How to Improve Your Credit Score Fast',
      channel: 'CNBC',
      url: 'https://www.youtube.com/watch?v=YwFf0Nqb3QY',
      duration: '12:15',
      thumbnail: 'https://img.youtube.com/vi/YwFf0Nqb3QY/mqdefault.jpg'
    }
  ],
  'Budgeting Strategies': [
    {
      title: 'How to Budget Your Money (50/30/20 Rule)',
      channel: 'The Financial Diet',
      url: 'https://www.youtube.com/watch?v=HoK4w0Jf7uk',
      duration: '10:38',
      thumbnail: 'https://img.youtube.com/vi/HoK4w0Jf7uk/mqdefault.jpg'
    },
    {
      title: 'Zero-Based Budgeting for Beginners',
      channel: 'Ramsey Solutions',
      url: 'https://www.youtube.com/watch?v=Gv2p6Vd6_80',
      duration: '14:22',
      thumbnail: 'https://img.youtube.com/vi/Gv2p6Vd6_80/mqdefault.jpg'
    },
    {
      title: 'How to Create a Budget That Actually Works',
      channel: 'Ali Abdaal',
      url: 'https://www.youtube.com/watch?v=OqVyX1HvB8I',
      duration: '16:55',
      thumbnail: 'https://img.youtube.com/vi/OqVyX1HvB8I/mqdefault.jpg'
    }
  ],
  'Real Estate Investing': [
    {
      title: 'Real Estate Investing for Beginners',
      channel: 'Graham Stephan',
      url: 'https://www.youtube.com/watch?v=Uvl2j6_0_Go',
      duration: '19:33',
      thumbnail: 'https://img.youtube.com/vi/Uvl2j6_0_Go/mqdefault.jpg'
    },
    {
      title: 'How to Invest in Real Estate with Little Money',
      channel: 'Meet Kevin',
      url: 'https://www.youtube.com/watch?v=3VJKa3NojXE',
      duration: '15:47',
      thumbnail: 'https://img.youtube.com/vi/3VJKa3NojXE/mqdefault.jpg'
    },
    {
      title: 'Real Estate Investment Strategies',
      channel: 'BiggerPockets',
      url: 'https://www.youtube.com/watch?v=4E2a0wJ0L3Y',
      duration: '22:18',
      thumbnail: 'https://img.youtube.com/vi/4E2a0wJ0L3Y/mqdefault.jpg'
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
      className="block bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-lg overflow-hidden hover:from-red-400/30 hover:to-red-600/30 transition-all duration-200 border border-red-500/30 group"
    >
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">{video.title}</h4>
        <p className="text-xs text-gray-300">{video.channel}</p>
      </div>
    </a>
  );
};

const ResourceLink: React.FC<{ title: string; type: 'video' | 'article' }> = ({ title, type }) => {
  const query = encodeURIComponent(title);
  const url = type === 'video' 
    ? `https://www.youtube.com/results?search_query=${query}`
    : `https://www.google.com/search?q=${query}`;

  const gradient = type === 'video' 
    ? 'from-red-400/20 to-red-600/20 border-red-500/30' 
    : 'from-blue-400/20 to-blue-600/20 border-blue-500/30';

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`block p-3 bg-gradient-to-br ${gradient} rounded-lg hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center gap-3">
        {type === 'video' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2zM6 12h12v2H6v-2zm0-4h12v2H6V8zm0-4h12v2H6V4z" /></svg>
        )}
        <span className="text-gray-200 font-medium">{title}</span>
      </div>
    </a>
  );
};

const Resources: React.FC = () => {
  const [content, setContent] = useState<FinancialContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');

  const topics = ['Investing for Beginners', 'Saving for Retirement', 'Understanding Credit Scores', 'Budgeting Strategies', 'Real Estate Investing'];

  const fetchContent = useCallback(async (topic: string) => {
    setIsLoading(true);
    setCurrentTopic(topic);
    setContent(null);
    const result = await getFinancialContent(topic);
    setContent(result);
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Financial Education Resources</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Explore curated financial videos and articles to improve your money management skills. 
          Select topics to find expert advice on investing, budgeting, and financial planning.
        </p>
      </Card>
      
      <Card className="p-6 bg-gradient-to-br from-purple-400/20 to-pink-600/20 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Select a Topic</h3>
        <p className="text-gray-300 mb-6">Choose a topic to explore curated videos and AI-recommended content.</p>
        <div className="flex flex-wrap gap-3">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => fetchContent(topic)}
              disabled={isLoading && currentTopic === topic}
              className="px-4 py-2 bg-gradient-to-r from-brand-500/20 to-purple-500/20 border border-brand-500/30 text-gray-200 rounded-full hover:from-brand-500/30 hover:to-purple-500/30 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
            >
              {topic}
            </button>
          ))}
        </div>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      )}

      {currentTopic && !isLoading && (
        <div className="space-y-6">
          {/* Curated Videos Section */}
          <Card className="p-6 bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
              </svg>
              Curated Videos for {currentTopic}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_VIDEOS[currentTopic as keyof typeof CURATED_VIDEOS]?.map((video, index) => (
                <VideoCard key={index} video={video} />
              ))}
            </div>
          </Card>

          {/* AI-Generated Content */}
          {content && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-500/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
                  </svg>
                  AI-Recommended Videos
                </h3>
                <div className="space-y-3">
                  {content.videos.map((title, i) => <ResourceLink key={`v-${i}`} title={title} type="video"/>)}
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-500/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2zM6 12h12v2H6v-2zm0-4h12v2H6V8zm0-4h12v2H6V4z" />
                  </svg>
                  Suggested Articles
                </h3>
                <div className="space-y-3">
                  {content.articles.map((title, i) => <ResourceLink key={`a-${i}`} title={title} type="article"/>)}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Section */}
      <Card className="p-6 bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a 
            href="https://www.youtube.com/playlist?list=PLDZ4igg62Fcj_JMmX0M9YfAmFY77Y7473" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-500/30 rounded-lg hover:scale-105 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
            </svg>
            <span className="text-gray-200 font-medium">Investopedia Finance Playlist</span>
          </a>
          <a 
            href="https://www.youtube.com/c/GrahamStephan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-500/30 rounded-lg hover:scale-105 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
            </svg>
            <span className="text-gray-200 font-medium">Graham Stephan Channel</span>
          </a>
          <a 
            href="https://www.youtube.com/c/AliAbdaal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-400/20 to-red-600/20 border border-red-500/30 rounded-lg hover:scale-105 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25 1.09-.68 1.92-1.22 2.46-.55.55-1.37.98-2.46 1.22-.92.26-2.47.42-4.88.42-3.99 0-6.9-.1-8.6-.3-1.69-.2-3.1-.6-4.1-1.4-.8-.6-1.3-1.4-1.6-2.5C.05 15.3.01 13.7.01 12s.04-3.3.19-4.7c.1-1 .5-1.8 1.1-2.5.8-.8 2.2-1.2 4.1-1.4 1.7-.2 4.6-.3 8.6-.3 2.41 0 3.96.16 4.88.42.98.25 1.81.68 2.36 1.23.54.54.97 1.37 1.22 2.46z" />
            </svg>
            <span className="text-gray-200 font-medium">Ali Abdaal Finance</span>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Resources;
