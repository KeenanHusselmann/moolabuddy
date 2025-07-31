
import React, { useState, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProjectionAnalysis } from '../services/geminiService';
import Card from './Card';
import type { Projection } from '../types';

interface ProjectionData {
  year: number;
  value: number;
}

interface ProjectionsProps {
    projections: Projection[];
    addProjection: (projection: Omit<Projection, 'id' | 'createdAt'>) => void;
    updateProjection: (projection: Projection) => void;
    deleteProjection: (id: string) => void;
}

const ProjectionCard: React.FC<{ projection: Projection; onLoad: () => void; onDelete: () => void; }> = ({ projection, onLoad, onDelete }) => {
  const finalValue = projection.initialInvestment * Math.pow(1 + projection.annualRate / 100, projection.years) + 
                     projection.monthlyContribution * 12 * projection.years;
  
  return (
    <Card className="p-4 bg-gradient-to-br from-green-400/80 to-blue-600/80 shadow-lg border-0">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow">
          <h3 className="font-bold text-white text-lg">{projection.name}</h3>
          <p className="text-xs text-gray-200">Final Value: N${finalValue.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onLoad} className="text-blue-100 hover:text-white p-1 rounded bg-blue-900/30">Load</button>
          <button onClick={onDelete} className="text-red-200 hover:text-white p-1 rounded bg-red-900/30">Delete</button>
        </div>
      </div>
      <div className="text-xs text-gray-200 space-y-1">
        <p>Initial: N${projection.initialInvestment.toLocaleString()}</p>
        <p>Monthly: N${projection.monthlyContribution.toLocaleString()}</p>
        <p>Rate: {projection.annualRate}% | Years: {projection.years}</p>
      </div>
    </Card>
  );
};

const Projections: React.FC<ProjectionsProps> = ({ projections, addProjection, updateProjection, deleteProjection }) => {
  const [name, setName] = useState('My Projection');
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateProjection = useCallback(() => {
    const p = parseFloat(initial);
    const pm = parseFloat(monthly);
    const r = parseFloat(rate) / 100;
    const t = parseInt(years, 10);
    
    if (isNaN(p) || isNaN(pm) || isNaN(r) || isNaN(t)) {
      setProjectionData([]);
      return;
    }

    const data: ProjectionData[] = [];
    let futureValue = p;
    data.push({ year: 0, value: futureValue });

    for (let i = 1; i <= t; i++) {
      futureValue = futureValue * (1 + r) + (pm * 12);
      data.push({ year: i, value: parseFloat(futureValue.toFixed(2)) });
    }
    setProjectionData(data);
  }, [initial, monthly, rate, years]);

  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);
  
  const handleAnalysis = async () => {
    setIsLoading(true);
    setAiAnalysis('');
    
    const params = { initialInvestment: initial, monthlyContribution: monthly, annualRate: rate, years };
    const analysis = await getProjectionAnalysis(params);
    
    setAiAnalysis(analysis);
    setIsLoading(false);
  };

  const handleSaveProjection = () => {
    if(!name.trim()) {
      alert("Please enter a name for the projection.");
      return;
    }
    addProjection({
      name,
      initialInvestment: parseFloat(initial) || 0,
      monthlyContribution: parseFloat(monthly) || 0,
      annualRate: parseFloat(rate) || 0,
      years: parseInt(years, 10) || 0,
    });
  };

  const loadProjection = (p: Projection) => {
    setName(p.name);
    setInitial(String(p.initialInvestment));
    setMonthly(String(p.monthlyContribution));
    setRate(String(p.annualRate));
    setYears(String(p.years));
    setAiAnalysis('');
  };

  const clearForm = () => {
    setName('My Projection');
    setInitial('1000');
    setMonthly('200');
    setRate('7');
    setYears('10');
    setAiAnalysis('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Financial Projections</h2>
      
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Projection Calculator</h3>
             <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium text-gray-300">Projection Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Initial Investment (N$)</label>
                  <input type="number" value={initial} onChange={e => setInitial(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Monthly Contribution (N$)</label>
                  <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Annual Growth Rate (%)</label>
                  <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Years to Grow</label>
                  <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
              </div>
              <div className="flex flex-col gap-2">
                 <button onClick={handleAnalysis} disabled={isLoading} className="w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600">
                    {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                 </button>
                 <button onClick={handleSaveProjection} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Save This Projection
                 </button>
                 <button onClick={clearForm} className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                    Clear Form
                 </button>
              </div>
            </div>
         </Card>

          {/* Saved Scenarios */}
          <Card className="p-6 bg-gradient-to-br from-green-400/20 to-blue-600/20 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Saved Scenarios</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {projections.length > 0 ? projections.map(p => (
                <ProjectionCard key={p.id} projection={p} onLoad={() => loadProjection(p)} onDelete={() => deleteProjection(p.id)} />
              )) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-200">No saved scenarios yet.</p>
                        </div>
              )}
            </div>
        </Card>
      </div>

        {/* Chart and Analysis */}
      <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 h-[500px]">
          <h3 className="text-lg font-semibold text-white mb-4">Projected Growth for "{name}"</h3>
          {projectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} tick={{ fill: '#9ca3af' }} />
                <YAxis tickFormatter={(value) => `N$${Number(value).toLocaleString()}`} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }}
                    formatter={(value) => `N$${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#29a9ff" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} name="Projected Value"/>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Enter your details and click "Get AI Analysis" to see your projection.</p>
            </div>
          )}
        </Card>
          
        {aiAnalysis && (
            <Card className="p-6 bg-gradient-to-br from-purple-400/20 to-pink-600/20 border border-purple-500/30">
                 <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
                 <div className="prose prose-sm prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }}></div>
             </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default Projections;
