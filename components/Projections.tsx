
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart, Area, AreaChart } from 'recharts';
import { getProjectionAnalysis } from '../services/geminiService';
import Card from './Card';
import type { Projection } from '../types';
import { useToast } from './ToastContext';

interface ProjectionData {
  year: number;
  value: number;
  principal: number;
  interest: number;
  contributions: number;
}

interface ComparisonProjection {
  name: string;
  data: ProjectionData[];
  color: string;
}

interface ProjectionsProps {
    projections: Projection[];
    addProjection: (projection: Omit<Projection, 'id' | 'createdAt'>) => void;
    updateProjection: (projection: Projection) => void;
    deleteProjection: (id: string) => void;
}

const ProjectionCard: React.FC<{ projection: Projection; onLoad: () => void; onDelete: () => void; onCompare: () => void; isSelected: boolean; }> = ({ projection, onLoad, onDelete, onCompare, isSelected }) => {
  const finalValue = projection.initialInvestment * Math.pow(1 + projection.annualRate / 100, projection.years) + 
                     projection.monthlyContribution * 12 * projection.years;
  const totalContributions = projection.initialInvestment + (projection.monthlyContribution * 12 * projection.years);
  const totalGrowth = finalValue - totalContributions;
  const annualizedReturn = ((finalValue / projection.initialInvestment) ** (1 / projection.years) - 1) * 100;
  
  return (
    <Card className={`p-4 bg-gradient-to-br from-green-400/80 to-blue-600/80 shadow-lg border-0 transition-all duration-200 ${isSelected ? 'ring-2 ring-brand-400' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow">
          <h3 className="font-bold text-white text-lg">{projection.name}</h3>
          <p className="text-xs text-gray-200">Final Value: N${finalValue.toLocaleString()}</p>
          <p className="text-xs text-green-200">Growth: N${totalGrowth.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onCompare} className={`text-xs px-1.5 py-1 rounded transition-colors ${isSelected ? 'bg-brand-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            {isSelected ? 'Selected' : 'Compare'}
          </button>
          <button onClick={onLoad} className="text-blue-100 hover:text-white p-1 rounded bg-blue-900/30 text-xs">Load</button>
          <button onClick={onDelete} className="text-red-200 hover:text-white p-1 rounded bg-red-900/30 text-xs">×</button>
        </div>
      </div>
      <div className="text-xs text-gray-200 space-y-1">
        <p>Initial: N${projection.initialInvestment.toLocaleString()}</p>
        <p>Monthly: N${projection.monthlyContribution.toLocaleString()}</p>
        <p>Rate: {projection.annualRate}% | Years: {projection.years}</p>
        <p>Annual Return: {annualizedReturn.toFixed(2)}%</p>
      </div>
    </Card>
  );
};

const Projections: React.FC<ProjectionsProps> = ({ projections, addProjection, updateProjection: _updateProjection, deleteProjection }) => {
  const [name, setName] = useState('My Projection');
  const [initial, setInitial] = useState('1000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Enhanced state for new features
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chartType, setChartType] = useState<'growth' | 'breakdown' | 'comparison'>('growth');
  const [selectedProjections, setSelectedProjections] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonProjection[]>([]);
  const [inflationRate, setInflationRate] = useState('3');
  const [showInflationAdjusted, setShowInflationAdjusted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'finalValue' | 'returns' | 'created'>('finalValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Analytics calculations
  const analytics = useMemo(() => {
    if (projections.length === 0) {
      return {
        totalProjections: 0,
        averageFinalValue: 0,
        averageReturn: 0,
        totalInvestment: 0,
        totalGrowth: 0,
        bestPerformer: null,
        worstPerformer: null
      };
    }

    const calculatedProjections = projections.map(p => {
      const finalValue = p.initialInvestment * Math.pow(1 + p.annualRate / 100, p.years) + 
                        p.monthlyContribution * 12 * p.years;
      const totalContributions = p.initialInvestment + (p.monthlyContribution * 12 * p.years);
      const growth = finalValue - totalContributions;
      const annualizedReturn = ((finalValue / p.initialInvestment) ** (1 / p.years) - 1) * 100;
      
      return { ...p, finalValue, totalContributions, growth, annualizedReturn };
    });

    const totalFinalValue = calculatedProjections.reduce((sum, p) => sum + p.finalValue, 0);
    const totalInvestment = calculatedProjections.reduce((sum, p) => sum + p.totalContributions, 0);
    const averageReturn = calculatedProjections.reduce((sum, p) => sum + p.annualizedReturn, 0) / calculatedProjections.length;
    
    const bestPerformer = calculatedProjections.reduce((best, current) => 
      current.annualizedReturn > best.annualizedReturn ? current : best
    );
    
    const worstPerformer = calculatedProjections.reduce((worst, current) => 
      current.annualizedReturn < worst.annualizedReturn ? current : worst
    );

    return {
      totalProjections: projections.length,
      averageFinalValue: totalFinalValue / projections.length,
      averageReturn,
      totalInvestment,
      totalGrowth: totalFinalValue - totalInvestment,
      bestPerformer,
      worstPerformer
    };
  }, [projections]);

  // Filtered and sorted projections
  const filteredAndSortedProjections = useMemo(() => {
    let filtered = [...projections];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort projections
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'finalValue':
          const aFinal = a.initialInvestment * Math.pow(1 + a.annualRate / 100, a.years) + a.monthlyContribution * 12 * a.years;
          const bFinal = b.initialInvestment * Math.pow(1 + b.annualRate / 100, b.years) + b.monthlyContribution * 12 * b.years;
          comparison = aFinal - bFinal;
          break;
        case 'returns':
          comparison = a.annualRate - b.annualRate;
          break;
        case 'created':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [projections, searchTerm, sortBy, sortOrder]);

  const calculateProjection = useCallback(() => {
    const p = parseFloat(initial);
    const pm = parseFloat(monthly);
    const r = parseFloat(rate) / 100;
    const t = parseInt(years, 10);
    const inf = parseFloat(inflationRate) / 100;
    
    if (isNaN(p) || isNaN(pm) || isNaN(r) || isNaN(t)) {
      setProjectionData([]);
      return;
    }

    const data: ProjectionData[] = [];
    let principal = p;
    let totalContributions = p;
    
    data.push({ 
      year: 0, 
      value: p, 
      principal: p, 
      interest: 0, 
      contributions: p 
    });

    for (let i = 1; i <= t; i++) {
      const yearlyContributions = pm * 12;
      totalContributions += yearlyContributions;
      
      // Calculate compound interest
      const interestEarned = principal * r;
      principal = principal + interestEarned + yearlyContributions;
      
      const totalInterest = principal - totalContributions;
      
      const nominalValue = principal;
      const realValue = showInflationAdjusted ? principal / Math.pow(1 + inf, i) : principal;
      
      data.push({ 
        year: i, 
        value: parseFloat(realValue.toFixed(2)),
        principal: parseFloat(nominalValue.toFixed(2)),
        interest: parseFloat(totalInterest.toFixed(2)),
        contributions: parseFloat(totalContributions.toFixed(2))
      });
    }
    setProjectionData(data);
  }, [initial, monthly, rate, years, inflationRate, showInflationAdjusted]);

  const calculateComparison = useCallback(() => {
    const colors = ['#29a9ff', '#82ca9d', '#ffc658', '#ff8042', '#8884d8', '#00C49F'];
    const comparisonProj: ComparisonProjection[] = [];
    
    selectedProjections.forEach((projId, index) => {
      const proj = projections.find(p => p.id === projId);
      if (!proj) return;
      
      const data: ProjectionData[] = [];
      let principal = proj.initialInvestment;
      let totalContributions = proj.initialInvestment;
      
      data.push({ 
        year: 0, 
        value: proj.initialInvestment, 
        principal: proj.initialInvestment, 
        interest: 0, 
        contributions: proj.initialInvestment 
      });

      for (let i = 1; i <= proj.years; i++) {
        const yearlyContributions = proj.monthlyContribution * 12;
        totalContributions += yearlyContributions;
        
        const interestEarned = principal * (proj.annualRate / 100);
        principal = principal + interestEarned + yearlyContributions;
        
        const totalInterest = principal - totalContributions;
        
        data.push({ 
          year: i, 
          value: parseFloat(principal.toFixed(2)),
          principal: parseFloat(principal.toFixed(2)),
          interest: parseFloat(totalInterest.toFixed(2)),
          contributions: parseFloat(totalContributions.toFixed(2))
        });
      }
      
      comparisonProj.push({
        name: proj.name,
        data,
        color: colors[index % colors.length]
      });
    });
    
    setComparisonData(comparisonProj);
  }, [selectedProjections, projections]);

  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);

  useEffect(() => {
    calculateComparison();
  }, [calculateComparison]);

  const toggleProjectionSelection = (projId: string) => {
    setSelectedProjections(prev => {
      if (prev.includes(projId)) {
        return prev.filter(id => id !== projId);
      } else if (prev.length < 5) { // Limit to 5 comparisons
        return [...prev, projId];
      } else {
        showToast('Maximum 5 projections can be compared at once.', 'warning');
        return prev;
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('finalValue');
    setSortOrder('desc');
  };
  
  const handleAnalysis = async () => {
    setIsLoading(true);
    setAiAnalysis('');
    
    const params = { 
      initialInvestment: initial, 
      monthlyContribution: monthly, 
      annualRate: rate, 
      years,
      inflationRate: inflationRate,
      showInflationAdjusted
    };
    const analysis = await getProjectionAnalysis(params);
    
    setAiAnalysis(analysis);
    setIsLoading(false);
  };

  const handleSaveProjection = () => {
    if(!name.trim()) {
      showToast('Please enter a name for the projection.', 'error');
      return;
    }
    addProjection({
      name,
      initialInvestment: parseFloat(initial) || 0,
      monthlyContribution: parseFloat(monthly) || 0,
      annualRate: parseFloat(rate) || 0,
      years: parseInt(years, 10) || 0,
    });
    showToast('Projection saved successfully!', 'success');
  };

  const loadProjection = (p: Projection) => {
    setName(p.name);
    setInitial(String(p.initialInvestment));
    setMonthly(String(p.monthlyContribution));
    setRate(String(p.annualRate));
    setYears(String(p.years));
    setAiAnalysis('');
    showToast(`Loaded projection: ${p.name}`, 'success');
  };

  const clearForm = () => {
    setName('My Projection');
    setInitial('1000');
    setMonthly('200');
    setRate('7');
    setYears('10');
    setAiAnalysis('');
  };

  const generateQuickScenarios = () => {
    const baseInitial = parseFloat(initial) || 1000;
    const baseMonthly = parseFloat(monthly) || 200;
    const baseRate = parseFloat(rate) || 7;
    const baseYears = parseInt(years) || 10;

    const scenarios = [
      { name: 'Conservative', rate: 4, description: 'Low-risk bonds and savings' },
      { name: 'Moderate', rate: 7, description: 'Balanced portfolio' },
      { name: 'Aggressive', rate: 10, description: 'Growth stocks and equity' },
      { name: 'High Savings', monthly: baseMonthly * 1.5, rate: baseRate, description: '50% more monthly savings' },
      { name: 'Extended Time', years: baseYears + 5, rate: baseRate, description: '5 more years of growth' }
    ];

    scenarios.forEach((scenario, index) => {
      setTimeout(() => {
        addProjection({
          name: `${scenario.name} Scenario`,
          initialInvestment: baseInitial,
          monthlyContribution: scenario.monthly || baseMonthly,
          annualRate: scenario.rate,
          years: scenario.years || baseYears,
        });
      }, index * 100);
    });
    
    showToast('Generated 5 quick scenarios for comparison!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Advanced Financial Projections</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Create detailed investment projections with inflation adjustments, scenario comparisons, and AI-powered analysis. 
          Track growth potential across different investment strategies and time horizons.
        </p>
      </Card>

      {/* Analytics Summary */}
      {showAnalytics && analytics.totalProjections > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Portfolio Analytics</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">{analytics.totalProjections}</div>
              <div className="text-sm text-gray-400">Total Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">N${analytics.averageFinalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Avg Final Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{analytics.averageReturn.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Avg Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">N${analytics.totalGrowth.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Growth</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.bestPerformer && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Best Performer</div>
                <div className="text-lg font-bold text-green-400">{analytics.bestPerformer.name}</div>
                <div className="text-xs text-gray-500">{analytics.bestPerformer.annualizedReturn.toFixed(2)}% annual return</div>
              </div>
            )}
            {analytics.worstPerformer && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Conservative Option</div>
                <div className="text-lg font-bold text-blue-400">{analytics.worstPerformer.name}</div>
                <div className="text-xs text-gray-500">{analytics.worstPerformer.annualizedReturn.toFixed(2)}% annual return</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Enhanced Filter Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-bold text-white">Projection Management</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-2 sm:px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-xs whitespace-nowrap"
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={generateQuickScenarios}
              className="px-2 sm:px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs whitespace-nowrap"
            >
              Quick Scenarios
            </button>
            <button
              onClick={clearFilters}
              className="px-2 sm:px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scenarios..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'growth' | 'breakdown' | 'comparison')}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="growth">Growth Chart</option>
              <option value="breakdown">Value Breakdown</option>
              <option value="comparison">Scenario Comparison</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'finalValue' | 'returns' | 'created')}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="finalValue">Final Value</option>
                <option value="returns">Returns</option>
                <option value="name">Name</option>
                <option value="created">Created Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-end">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 w-full">
              <div className="text-sm text-gray-300">
                Showing <span className="font-semibold text-white">{filteredAndSortedProjections.length}</span> of{' '}
                <span className="font-semibold text-white">{projections.length}</span> scenarios
                {searchTerm && (
                  <span className="text-brand-400 font-medium"> (filtered)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Controls */}
        {selectedProjections.length > 0 && (
          <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-300 font-medium">
                  {selectedProjections.length} scenario(s) selected for comparison
                </span>
                <p className="text-xs text-gray-400 mt-1">Switch to comparison chart to view side by side</p>
              </div>
              <button
                onClick={() => setSelectedProjections([])}
                className="px-2 sm:px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </Card>
      
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Investment Calculator</h3>
             <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium text-gray-300">Scenario Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter scenario name..."
                  />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Initial Investment (N$)</label>
                  <input 
                    type="number" 
                    value={initial} 
                    onChange={e => setInitial(e.target.value)} 
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="1000"
                  />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Monthly Contribution (N$)</label>
                  <input 
                    type="number" 
                    value={monthly} 
                    onChange={e => setMonthly(e.target.value)} 
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="200"
                  />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Annual Growth Rate (%)</label>
                  <input 
                    type="number" 
                    value={rate} 
                    onChange={e => setRate(e.target.value)} 
                    step="0.1"
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="7"
                  />
              </div>
              <div>
                  <label className="text-sm font-medium text-gray-300">Investment Period (Years)</label>
                  <input 
                    type="number" 
                    value={years} 
                    onChange={e => setYears(e.target.value)} 
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="10"
                  />
              </div>
              
              {/* Advanced Options */}
              <div className="border-t border-gray-600 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Advanced Options</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Inflation Rate (%)</label>
                    <input 
                      type="number" 
                      value={inflationRate} 
                      onChange={e => setInflationRate(e.target.value)} 
                      step="0.1"
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="3"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inflation-adjusted"
                      checked={showInflationAdjusted}
                      onChange={e => setShowInflationAdjusted(e.target.checked)}
                      className="w-4 h-4 text-brand-500 border-gray-600 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="inflation-adjusted" className="ml-2 text-sm text-gray-300">
                      Show inflation-adjusted values
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                 <button 
                   onClick={handleAnalysis} 
                   disabled={isLoading} 
                   className="w-full bg-brand-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 text-sm sm:text-base"
                 >
                    {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
                 </button>
                 <button 
                   onClick={handleSaveProjection} 
                   className="w-full bg-blue-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                 >
                    Save Scenario
                 </button>
                 <button 
                   onClick={clearForm} 
                   className="w-full bg-gray-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base"
                 >
                    Reset Form
                 </button>
              </div>
            </div>
         </Card>

          {/* Saved Scenarios */}
          <Card className="p-6 bg-gradient-to-br from-green-400/20 to-blue-600/20 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Saved Scenarios ({filteredAndSortedProjections.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredAndSortedProjections.length > 0 ? filteredAndSortedProjections.map(p => (
                <ProjectionCard 
                  key={p.id} 
                  projection={p} 
                  onLoad={() => loadProjection(p)} 
                  onDelete={() => deleteProjection(p.id)}
                  onCompare={() => toggleProjectionSelection(p.id)}
                  isSelected={selectedProjections.includes(p.id)}
                />
              )) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-200">
                    {projections.length === 0 ? 'No saved scenarios yet.' : 'No scenarios match your search.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-brand-400 hover:text-brand-300 text-xs mt-1"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
        </Card>

        {/* Quick Calculations */}
        <Card className="p-6 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-white mb-4">Quick Insights</h3>
          {projectionData.length > 0 && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Final Value:</span>
                <span className="text-green-400 font-medium">
                  N${projectionData[projectionData.length - 1]?.value.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Contributions:</span>
                <span className="text-blue-400 font-medium">
                  N${projectionData[projectionData.length - 1]?.contributions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Interest Earned:</span>
                <span className="text-yellow-400 font-medium">
                  N${projectionData[projectionData.length - 1]?.interest.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Growth Multiple:</span>
                <span className="text-purple-400 font-medium">
                  {((projectionData[projectionData.length - 1]?.value || 0) / (parseFloat(initial) || 1)).toFixed(2)}x
                </span>
              </div>
              {showInflationAdjusted && (
                <div className="pt-2 border-t border-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Real Value:</span>
                    <span className="text-green-300 font-medium">
                      N${projectionData[projectionData.length - 1]?.value.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Adjusted for {inflationRate}% inflation</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

        {/* Enhanced Charts and Analysis */}
      <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <Card className="p-6 h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h3 className="text-lg font-semibold text-white">
                {chartType === 'growth' && `Growth Projection: "${name}"`}
                {chartType === 'breakdown' && 'Investment Breakdown'}
                {chartType === 'comparison' && `Scenario Comparison (${selectedProjections.length})`}
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setChartType('growth')}
                  className={`px-2 sm:px-3 py-1 rounded text-xs transition-colors ${
                    chartType === 'growth' ? 'bg-brand-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Growth
                </button>
                <button
                  onClick={() => setChartType('breakdown')}
                  className={`px-2 sm:px-3 py-1 rounded text-xs transition-colors ${
                    chartType === 'breakdown' ? 'bg-brand-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Breakdown
                </button>
                <button
                  onClick={() => setChartType('comparison')}
                  className={`px-2 sm:px-3 py-1 rounded text-xs transition-colors ${
                    chartType === 'comparison' ? 'bg-brand-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>

            {/* Growth Chart */}
            {chartType === 'growth' && projectionData.length > 0 && (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} 
                    tick={{ fill: '#9ca3af' }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `N$${Number(value).toLocaleString()}`} 
                    tick={{ fill: '#9ca3af' }} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }}
                    formatter={(value, name) => [
                      `N$${Number(value).toLocaleString()}`,
                      name === 'value' ? (showInflationAdjusted ? 'Real Value' : 'Total Value') : name
                    ]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#29a9ff" 
                    fill="#29a9ff" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name={showInflationAdjusted ? 'Real Value' : 'Total Value'}
                  />
                  {!showInflationAdjusted && (
                    <Line 
                      type="monotone" 
                      dataKey="contributions" 
                      stroke="#82ca9d" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      name="Contributions"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Breakdown Chart */}
            {chartType === 'breakdown' && projectionData.length > 0 && (
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" tick={{ fill: '#9ca3af' }} />
                  <YAxis tickFormatter={(value) => `N$${Number(value).toLocaleString()}`} tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }}
                    formatter={(value) => `N$${Number(value).toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="contributions" stackId="a" fill="#82ca9d" name="Contributions" />
                  <Bar dataKey="interest" stackId="a" fill="#ffc658" name="Interest Earned" />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* Comparison Chart */}
            {chartType === 'comparison' && comparisonData.length > 0 && (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number"
                    dataKey="year"
                    domain={[0, Math.max(...comparisonData.flatMap(d => d.data.map(p => p.year)))]}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `N$${Number(value).toLocaleString()}`} 
                    tick={{ fill: '#9ca3af' }} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#f9fafb' }}
                    formatter={(value) => `N$${Number(value).toLocaleString()}`}
                  />
                  <Legend />
                  {comparisonData.map((comp) => (
                    <Line
                      key={comp.name}
                      type="monotone"
                      data={comp.data}
                      dataKey="value"
                      stroke={comp.color}
                      strokeWidth={2}
                      name={comp.name}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Empty State */}
            {((chartType === 'growth' || chartType === 'breakdown') && projectionData.length === 0) && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Enter your investment details to see projections</p>
                </div>
              </div>
            )}

            {chartType === 'comparison' && comparisonData.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Select 2 or more scenarios to compare</p>
                  <p className="text-sm mt-2">Use the "Compare" button on saved scenarios</p>
                </div>
              </div>
            )}
        </Card>

        {/* Summary Cards */}
        {projectionData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  N${projectionData[projectionData.length - 1]?.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Final Portfolio Value</div>
                {showInflationAdjusted && (
                  <div className="text-xs text-green-300 mt-1">Inflation-adjusted</div>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  N${projectionData[projectionData.length - 1]?.interest.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Interest Earned</div>
                <div className="text-xs text-yellow-300 mt-1">
                  {(((projectionData[projectionData.length - 1]?.interest || 0) / (projectionData[projectionData.length - 1]?.contributions || 1)) * 100).toFixed(1)}% of total
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {((projectionData[projectionData.length - 1]?.value || 0) / (parseFloat(initial) || 1)).toFixed(1)}x
                </div>
                <div className="text-sm text-gray-400">Growth Multiple</div>
                <div className="text-xs text-blue-300 mt-1">
                  {(((projectionData[projectionData.length - 1]?.value || 0) / (parseFloat(initial) || 1)) ** (1 / (parseInt(years) || 1)) - 1) * 100}% annual
                </div>
              </div>
            </Card>
          </div>
        )}
          
        {/* AI Analysis */}
        {aiAnalysis && (
            <Card className="p-6 bg-gradient-to-br from-purple-400/20 to-pink-600/20 border border-purple-500/30">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                   <span className="text-purple-400">🤖</span>
                   AI Investment Analysis
                 </h3>
                 <div className="prose prose-sm prose-invert text-gray-300" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }}></div>
             </Card>
        )}

        {/* Investment Tips */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Investment Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">Time Horizon</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• <span className="text-green-400">Long-term (10+ years):</span> Consider growth stocks</li>
                <li>• <span className="text-yellow-400">Medium-term (5-10 years):</span> Balanced portfolio</li>
                <li>• <span className="text-blue-400">Short-term (1-5 years):</span> Conservative options</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Risk vs Return</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• <span className="text-red-400">High Risk (10-12%):</span> Growth stocks, crypto</li>
                <li>• <span className="text-yellow-400">Medium Risk (6-8%):</span> Index funds, ETFs</li>
                <li>• <span className="text-green-400">Low Risk (2-4%):</span> Bonds, savings accounts</li>
              </ul>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Projections;
