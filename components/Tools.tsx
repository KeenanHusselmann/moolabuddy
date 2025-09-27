import React, { useState, useMemo } from 'react';
import Card from './Card';
import type { CostItem } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useToast } from './ToastContext';

interface ToolsProps {
    costs: CostItem[];
    addCost: (cost: Omit<CostItem, 'id'>) => void;
    deleteCost: (id: string) => void;
    income: string;
    setIncome: (income: string) => void;
}

interface FiftyThirtyTwentyToolProps {
    income: string;
    setIncome: (income: string) => void;
}

const FiftyThirtyTwentyTool: React.FC<FiftyThirtyTwentyToolProps> = ({ income, setIncome }) => {
    const needs = (parseFloat(income) || 0) * 0.5;
    const wants = (parseFloat(income) || 0) * 0.3;
    const savings = (parseFloat(income) || 0) * 0.2;

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-400/20 to-purple-500/20 border border-blue-500/30">
            <h2 className="text-xl font-bold text-white mb-4">50/30/20 Saving Strategy</h2>
            <p className="text-sm text-gray-300 mb-4">Enter your monthly income to see how you could allocate it.</p>
            <div className="mb-6">
                <label htmlFor="income" className="block text-sm font-medium text-gray-300">Monthly Income (N$)</label>
                <input type="number" id="income" value={income} onChange={e => setIncome(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-gray-300">Needs (50%)</p>
                    <p className="text-xl font-bold text-blue-400">N${needs.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-gray-300">Wants (30%)</p>
                    <p className="text-xl font-bold text-purple-400">N${wants.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-700/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-gray-300">Savings (20%)</p>
                    <p className="text-xl font-bold text-green-400">N${savings.toFixed(2)}</p>
                </div>
            </div>
        </Card>
    );
};

interface CostManagerProps {
    costs: CostItem[];
    addCost: (cost: Omit<CostItem, 'id'>) => void;
    deleteCost: (id: string) => void;
}

const CostCard: React.FC<{ cost: CostItem; onDelete: () => void; }> = ({ cost, onDelete }) => {
    const gradient = cost.type === 'Fixed' 
        ? 'from-blue-400/80 to-blue-600/80' 
        : 'from-purple-400/80 to-purple-600/80';
    
    return (
        <Card className={`p-4 bg-gradient-to-br ${gradient} shadow-lg border-0`}>
            <div className="flex justify-between items-center">
                <div className="flex-grow">
                    <h3 className="font-semibold text-white">{cost.name}</h3>
                    <p className="text-xs text-gray-200">{cost.type} Cost</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-white">N${cost.amount.toFixed(2)}</span>
                    <button onClick={onDelete} className="text-red-200 hover:text-white p-1 rounded bg-red-900/30">&times;</button>
                </div>
            </div>
        </Card>
    );
};

const CostManager: React.FC<CostManagerProps> = ({ costs, addCost, deleteCost }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'Fixed' | 'Variable'>('Fixed');
    const { showToast } = useToast();

    const { fixedCosts, variableCosts, totalFixed, totalVariable, breakdownData } = useMemo(() => {
        const fixed = costs.filter(c => c.type === 'Fixed');
        const variable = costs.filter(c => c.type === 'Variable');
        const totalFixed = fixed.reduce((sum, c) => sum + c.amount, 0);
        const totalVariable = variable.reduce((sum, c) => sum + c.amount, 0);
        const breakdown = [
            { name: 'Fixed', value: totalFixed },
            { name: 'Variable', value: totalVariable },
        ].filter(d => d.value > 0);
        
        return { 
            fixedCosts: fixed, 
            variableCosts: variable,
            totalFixed,
            totalVariable,
            breakdownData: breakdown
        };
    }, [costs]);

    const handleAddCost = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !amount || parseFloat(amount) <= 0) {
          showToast('Please enter a valid name and positive amount.', 'error');
          return;
        }
        addCost({ name, amount: parseFloat(amount), type });
        setName('');
        setAmount('');
    };

    const CHART_COLORS = ['#3b82f6', '#a855f7'];

    return (
        <Card className="p-6 bg-gradient-to-br from-green-400/20 to-blue-600/20 border border-green-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Monthly Cost Management</h2>
             <form onSubmit={handleAddCost} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Cost Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rent, Groceries" className="mt-1 flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white w-full" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="N$" className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex rounded-md">
                        <button type="button" onClick={() => setType('Fixed')} className={`w-1/2 rounded-l-md px-3 py-2 text-sm font-medium transition-colors ${type === 'Fixed' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>Fixed</button>
                        <button type="button" onClick={() => setType('Variable')} className={`w-1/2 rounded-r-md px-3 py-2 text-sm font-medium transition-colors ${type === 'Variable' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>Variable</button>
                    </div>
                    <button type="submit" className="px-3 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 w-full">Add Cost</button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {['Fixed', 'Variable'].map(costType => (
                        <div key={costType}>
                            <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{costType} Costs (N${(costType === 'Fixed' ? totalFixed : totalVariable).toFixed(2)})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                                {(costType === 'Fixed' ? fixedCosts : variableCosts).map(cost => (
                                    <CostCard key={cost.id} cost={cost} onDelete={() => deleteCost(cost.id)} />
                                ))}
                                {(costType === 'Fixed' ? fixedCosts : variableCosts).length === 0 && (
                                    <div className="col-span-full text-center py-4">
                                        <div className="text-2xl mb-2">💰</div>
                                        <p className="text-sm text-gray-400">No {costType.toLowerCase()} costs added.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
                    {breakdownData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5}>
                                    {breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value) => `N$${Number(value).toFixed(2)}`} />
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-4">
                            <div className="text-2xl mb-2">📊</div>
                            <p className="text-sm text-gray-400">Add costs to see the breakdown.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const CompoundInterestCalculator: React.FC = () => {
    const [principal, setPrincipal] = useState('1000');
    const [monthly, setMonthly] = useState('100');
    const [rate, setRate] = useState('7');
    const [years, setYears] = useState('10');

    const futureValue = useMemo(() => {
        const P = parseFloat(principal) || 0;
        const PMT = parseFloat(monthly) || 0;
        const r = (parseFloat(rate) || 0) / 100 / 12;
        const t = (parseInt(years, 10) || 0) * 12;

        if(r === 0) return P + PMT * t;

        const fvPrincipal = P * Math.pow(1 + r, t);
        const fvAnnuity = PMT * ( (Math.pow(1 + r, t) - 1) / r );
        return fvPrincipal + fvAnnuity;

    }, [principal, monthly, rate, years]);

    return (
        <Card className="p-6 bg-gradient-to-br from-purple-400/20 to-pink-600/20 border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Compound Interest Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-gray-300">Principal (N$)</label>
                    <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                    <label className="text-sm text-gray-300">Monthly Contribution (N$)</label>
                    <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                    <label className="text-sm text-gray-300">Annual Rate (%)</label>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                </div>
                <div>
                    <label className="text-sm text-gray-300">Years</label>
                    <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-300">Projected Value</p>
                <p className="text-3xl font-bold text-brand-400">N${futureValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
        </Card>
    );
};

const Tools: React.FC<ToolsProps> = ({ costs, addCost, deleteCost, income, setIncome }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Financial Tools & Calculators</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Use powerful financial tools to plan your budget, track costs, and calculate investments. 
          The 50/30/20 rule, cost management, and compound interest calculator help you make smart decisions.
        </p>
      </Card>

      <FiftyThirtyTwentyTool income={income} setIncome={setIncome} />
      <CostManager costs={costs} addCost={addCost} deleteCost={deleteCost} />
      <CompoundInterestCalculator />
    </div>
  );
};

export default Tools;