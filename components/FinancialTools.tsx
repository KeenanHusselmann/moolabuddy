import React, { useState, useMemo } from 'react';
import Card from './Card';
import type { CostItem } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { useToast } from './ToastContext';

interface FinancialToolsProps {
    costs: CostItem[];
    addCost: (cost: Omit<CostItem, 'id'>) => void;
    deleteCost: (id: string) => void;
    income: string;
    setIncome: (income: string) => void;
}

// Enhanced 50/30/20 Rule Tool with detailed breakdown
const Enhanced503020Tool: React.FC<{ income: string; setIncome: (income: string) => void }> = ({ income, setIncome }) => {
    const monthlyIncome = parseFloat(income) || 0;
    const needs = monthlyIncome * 0.5;
    const wants = monthlyIncome * 0.3;
    const savings = monthlyIncome * 0.2;

    const annualData = useMemo(() => {
        return {
            income: monthlyIncome * 12,
            needs: needs * 12,
            wants: wants * 12,
            savings: savings * 12
        };
    }, [monthlyIncome, needs, wants, savings]);

    const chartData = [
        { name: 'Needs (50%)', value: needs, color: '#3b82f6' },
        { name: 'Wants (30%)', value: wants, color: '#a855f7' },
        { name: 'Savings (20%)', value: savings, color: '#22c55e' }
    ];

    const needsCategories = [
        'Housing (rent/mortgage)',
        'Utilities (electricity, water, gas)',
        'Groceries & essential food',
        'Transportation (fuel, public transport)',
        'Insurance premiums',
        'Minimum debt payments',
        'Phone bill',
        'Essential clothing'
    ];

    const wantsCategories = [
        'Dining out & entertainment',
        'Hobbies & recreation',
        'Streaming services',
        'Non-essential shopping',
        'Gym membership',
        'Travel & vacations',
        'Personal care & beauty',
        'Gifts & donations'
    ];

    const savingsCategories = [
        'Emergency fund (3-6 months expenses)',
        'Retirement savings',
        'Investment accounts',
        'Short-term savings goals',
        'Extra debt payments',
        'Education fund',
        'Home down payment',
        'Vehicle replacement fund'
    ];

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-400/20 to-purple-500/20 border border-blue-500/30">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">50/30/20 Budget Rule</h2>
                        <p className="text-sm text-gray-300">The gold standard for balanced financial planning</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="monthly-income" className="block text-sm font-medium text-gray-300 mb-2">
                                Monthly After-Tax Income (N$)
                            </label>
                            <input 
                                type="number" 
                                id="monthly-income" 
                                value={income} 
                                onChange={e => setIncome(e.target.value)}
                                placeholder="Enter your monthly income"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg shadow-sm py-3 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </div>

                        {monthlyIncome > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-lg border border-blue-500/50">
                                    <div className="text-center">
                                        <p className="text-sm text-blue-200 font-medium">NEEDS (50%)</p>
                                        <p className="text-2xl font-bold text-blue-300">N${needs.toFixed(2)}</p>
                                        <p className="text-xs text-blue-200 mt-1">Essential expenses</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-lg border border-purple-500/50">
                                    <div className="text-center">
                                        <p className="text-sm text-purple-200 font-medium">WANTS (30%)</p>
                                        <p className="text-2xl font-bold text-purple-300">N${wants.toFixed(2)}</p>
                                        <p className="text-xs text-purple-200 mt-1">Lifestyle & fun</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-500/30 to-green-700/30 rounded-lg border border-green-500/50">
                                    <div className="text-center">
                                        <p className="text-sm text-green-200 font-medium">SAVINGS (20%)</p>
                                        <p className="text-2xl font-bold text-green-300">N${savings.toFixed(2)}</p>
                                        <p className="text-xs text-green-200 mt-1">Future security</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        {monthlyIncome > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `N$${Number(value).toFixed(2)}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-400">Enter your income to see the breakdown</p>
                            </div>
                        )}
                    </div>
                </div>

                {monthlyIncome > 0 && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-3">Annual Projection</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-gray-400 text-sm">Total Income</p>
                                <p className="text-xl font-bold text-white">N${annualData.income.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Annual Needs</p>
                                <p className="text-xl font-bold text-blue-400">N${annualData.needs.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Annual Wants</p>
                                <p className="text-xl font-bold text-purple-400">N${annualData.wants.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Annual Savings</p>
                                <p className="text-xl font-bold text-green-400">N${annualData.savings.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {monthlyIncome > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border border-blue-500/30">
                        <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center">
                            🏠 NEEDS (50%) - N${needs.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">Essential expenses you can't avoid</p>
                        <ul className="space-y-2">
                            {needsCategories.map((item, index) => (
                                <li key={index} className="text-sm text-gray-400 flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6 border border-purple-500/30">
                        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center">
                            🎯 WANTS (30%) - N${wants.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">Lifestyle choices and enjoyment</p>
                        <ul className="space-y-2">
                            {wantsCategories.map((item, index) => (
                                <li key={index} className="text-sm text-gray-400 flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 flex-shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6 border border-green-500/30">
                        <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center">
                            💎 SAVINGS (20%) - N${savings.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">Building your financial future</p>
                        <ul className="space-y-2">
                            {savingsCategories.map((item, index) => (
                                <li key={index} className="text-sm text-gray-400 flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Salary Calculator Tool
const SalaryCalculator: React.FC = () => {
    const [annualSalary, setAnnualSalary] = useState('');
    const [taxRate, setTaxRate] = useState('25');
    const [workingHours, setWorkingHours] = useState('40');
    const [workingWeeks, setWorkingWeeks] = useState('50');

    const calculations = useMemo(() => {
        const annual = parseFloat(annualSalary) || 0;
        const tax = parseFloat(taxRate) || 0;
        const hours = parseFloat(workingHours) || 40;
        const weeks = parseFloat(workingWeeks) || 50;

        const grossMonthly = annual / 12;
        const taxAmount = annual * (tax / 100);
        const netAnnual = annual - taxAmount;
        const netMonthly = netAnnual / 12;
        const netWeekly = netAnnual / 52;
        const netDaily = netWeekly / 5;
        const hourlyRate = annual / (hours * weeks);
        const netHourlyRate = netAnnual / (hours * weeks);

        return {
            grossMonthly,
            netAnnual,
            netMonthly,
            netWeekly,
            netDaily,
            hourlyRate,
            netHourlyRate,
            taxAmount
        };
    }, [annualSalary, taxRate, workingHours, workingWeeks]);

    return (
        <Card className="p-6 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                Salary Calculator
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Annual Salary (N$)</label>
                        <input 
                            type="number" 
                            value={annualSalary} 
                            onChange={e => setAnnualSalary(e.target.value)}
                            placeholder="e.g., 480000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tax Rate (%)</label>
                        <input 
                            type="number" 
                            value={taxRate} 
                            onChange={e => setTaxRate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Hours/Week</label>
                            <input 
                                type="number" 
                                value={workingHours} 
                                onChange={e => setWorkingHours(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Weeks/Year</label>
                            <input 
                                type="number" 
                                value={workingWeeks} 
                                onChange={e => setWorkingWeeks(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                            />
                        </div>
                    </div>
                </div>

                {parseFloat(annualSalary) > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg mobile-card">
                                <p className="text-gray-400 text-sm">Gross Monthly</p>
                                <p className="text-lg sm:text-xl font-bold text-blue-400 break-words mobile-currency">N${calculations.grossMonthly.toLocaleString()}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg mobile-card">
                                <p className="text-gray-400 text-sm">Net Monthly</p>
                                <p className="text-lg sm:text-xl font-bold text-green-400 break-words mobile-currency">N${calculations.netMonthly.toLocaleString()}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg mobile-card">
                                <p className="text-gray-400 text-sm">Net Weekly</p>
                                <p className="text-base sm:text-lg font-bold text-emerald-400 break-words mobile-currency">N${calculations.netWeekly.toLocaleString()}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg mobile-card">
                                <p className="text-gray-400 text-sm">Net Daily</p>
                                <p className="text-base sm:text-lg font-bold text-cyan-400 break-words mobile-currency">N${calculations.netDaily.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30 mobile-card">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                                <div className="mobile-flex-item">
                                    <p className="text-gray-300 text-sm">Hourly Rate (Gross)</p>
                                    <p className="text-lg sm:text-xl font-bold text-white break-words mobile-currency">N${calculations.hourlyRate.toFixed(2)}</p>
                                </div>
                                <div className="mobile-flex-item">
                                    <p className="text-gray-300 text-sm">Hourly Rate (Net)</p>
                                    <p className="text-lg sm:text-xl font-bold text-emerald-400 break-words mobile-currency">N${calculations.netHourlyRate.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/30 mobile-card">
                            <p className="text-gray-300 text-sm">Annual Tax</p>
                            <p className="text-lg sm:text-xl font-bold text-red-400 break-words mobile-currency">N${calculations.taxAmount.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Debt Payoff Calculator
const DebtPayoffCalculator: React.FC = () => {
    const [debtAmount, setDebtAmount] = useState('');
    const [interestRate, setInterestRate] = useState('18');
    const [monthlyPayment, setMonthlyPayment] = useState('');
    const [extraPayment, setExtraPayment] = useState('0');

    const calculations = useMemo(() => {
        const debt = parseFloat(debtAmount) || 0;
        const rate = parseFloat(interestRate) || 0;
        const payment = parseFloat(monthlyPayment) || 0;
        const extra = parseFloat(extraPayment) || 0;

        if (debt <= 0 || payment <= 0) return null;

        const monthlyRate = rate / 100 / 12;
        const totalPayment = payment + extra;

        // Calculate months to pay off
        const monthsWithExtra = Math.log(1 + (debt * monthlyRate) / totalPayment) / Math.log(1 + monthlyRate);
        const monthsWithoutExtra = Math.log(1 + (debt * monthlyRate) / payment) / Math.log(1 + monthlyRate);

        const totalInterestWithExtra = (monthsWithExtra * totalPayment) - debt;
        const totalInterestWithoutExtra = (monthsWithoutExtra * payment) - debt;
        const interestSaved = totalInterestWithoutExtra - totalInterestWithExtra;
        const timeSaved = monthsWithoutExtra - monthsWithExtra;

        return {
            monthsWithExtra: Math.ceil(monthsWithExtra),
            monthsWithoutExtra: Math.ceil(monthsWithoutExtra),
            totalInterestWithExtra,
            totalInterestWithoutExtra,
            interestSaved,
            timeSaved: Math.ceil(timeSaved)
        };
    }, [debtAmount, interestRate, monthlyPayment, extraPayment]);

    return (
        <Card className="p-6 bg-gradient-to-br from-red-400/20 to-orange-500/20 border border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                Debt Payoff Calculator
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Total Debt Amount (N$)</label>
                        <input 
                            type="number" 
                            value={debtAmount} 
                            onChange={e => setDebtAmount(e.target.value)}
                            placeholder="e.g., 50000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Annual Interest Rate (%)</label>
                        <input 
                            type="number" 
                            value={interestRate} 
                            onChange={e => setInterestRate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Payment (N$)</label>
                        <input 
                            type="number" 
                            value={monthlyPayment} 
                            onChange={e => setMonthlyPayment(e.target.value)}
                            placeholder="e.g., 2000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Extra Monthly Payment (N$)</label>
                        <input 
                            type="number" 
                            value={extraPayment} 
                            onChange={e => setExtraPayment(e.target.value)}
                            placeholder="e.g., 500"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                        />
                    </div>
                </div>

                {calculations && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-3">Payoff Comparison</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Without extra payment:</span>
                                    <span className="text-white font-semibold">{calculations.monthsWithoutExtra} months</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">With extra payment:</span>
                                    <span className="text-green-400 font-semibold">{calculations.monthsWithExtra} months</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Time saved:</span>
                                    <span className="text-blue-400 font-semibold">{calculations.timeSaved} months</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                            <h3 className="text-lg font-semibold text-white mb-3">Interest Comparison</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Interest without extra:</span>
                                    <span className="text-red-400 font-semibold">N${calculations.totalInterestWithoutExtra.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Interest with extra:</span>
                                    <span className="text-orange-400 font-semibold">N${calculations.totalInterestWithExtra.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-600 pt-2">
                                    <span className="text-gray-400">Total Interest Saved:</span>
                                    <span className="text-green-400 font-bold text-lg">N${calculations.interestSaved.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                            <p className="text-center text-white">
                                By paying an extra <span className="font-bold text-purple-400">N${parseFloat(extraPayment).toLocaleString()}</span> monthly,
                                you'll save <span className="font-bold text-green-400">N${calculations.interestSaved.toLocaleString()}</span> in interest
                                and become debt-free <span className="font-bold text-blue-400">{calculations.timeSaved} months</span> sooner!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Emergency Fund Calculator
const EmergencyFundCalculator: React.FC = () => {
    const [monthlyExpenses, setMonthlyExpenses] = useState('');
    const [currentSavings, setCurrentSavings] = useState('');
    const [targetMonths, setTargetMonths] = useState('6');
    const [monthlySavings, setMonthlySavings] = useState('');

    const calculations = useMemo(() => {
        const expenses = parseFloat(monthlyExpenses) || 0;
        const current = parseFloat(currentSavings) || 0;
        const months = parseFloat(targetMonths) || 6;
        const savings = parseFloat(monthlySavings) || 0;

        const targetAmount = expenses * months;
        const needed = Math.max(0, targetAmount - current);
        const monthsToTarget = savings > 0 ? Math.ceil(needed / savings) : 0;
        const progressPercentage = targetAmount > 0 ? (current / targetAmount) * 100 : 0;

        return {
            targetAmount,
            needed,
            monthsToTarget,
            progressPercentage: Math.min(100, progressPercentage)
        };
    }, [monthlyExpenses, currentSavings, targetMonths, monthlySavings]);

    return (
        <Card className="p-6 bg-gradient-to-br from-teal-400/20 to-blue-500/20 border border-teal-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                Emergency Fund Calculator
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Expenses (N$)</label>
                        <input 
                            type="number" 
                            value={monthlyExpenses} 
                            onChange={e => setMonthlyExpenses(e.target.value)}
                            placeholder="e.g., 15000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Emergency Savings (N$)</label>
                        <input 
                            type="number" 
                            value={currentSavings} 
                            onChange={e => setCurrentSavings(e.target.value)}
                            placeholder="e.g., 30000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Months of Expenses</label>
                        <select 
                            value={targetMonths} 
                            onChange={e => setTargetMonths(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="3">3 months (minimum)</option>
                            <option value="6">6 months (recommended)</option>
                            <option value="9">9 months (conservative)</option>
                            <option value="12">12 months (very safe)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Savings Contribution (N$)</label>
                        <input 
                            type="number" 
                            value={monthlySavings} 
                            onChange={e => setMonthlySavings(e.target.value)}
                            placeholder="e.g., 2000"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500" 
                        />
                    </div>
                </div>

                {parseFloat(monthlyExpenses) > 0 && (
                    <div className="space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg mobile-card">
                            <h3 className="text-lg font-semibold text-white mb-3">Emergency Fund Target</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-400 text-sm mobile-flex-item">Target Amount:</span>
                                    <span className="text-teal-400 font-bold text-lg sm:text-xl break-words text-right mobile-currency mobile-flex-item">N${calculations.targetAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-400 text-sm mobile-flex-item">Current Savings:</span>
                                    <span className="text-white font-semibold text-base sm:text-lg break-words text-right mobile-currency mobile-flex-item">N${parseFloat(currentSavings || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-400 text-sm mobile-flex-item">Still Needed:</span>
                                    <span className="text-orange-400 font-semibold text-base sm:text-lg break-words text-right mobile-currency mobile-flex-item">N${calculations.needed.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-lg border border-teal-500/30">
                            <h3 className="text-lg font-semibold text-white mb-3">Progress</h3>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Completion</span>
                                    <span className="text-teal-400">{calculations.progressPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3 mt-1">
                                    <div 
                                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${calculations.progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            {parseFloat(monthlySavings) > 0 && calculations.monthsToTarget > 0 && (
                                <p className="text-center text-white mt-3">
                                    At N${parseFloat(monthlySavings).toLocaleString()}/month, you'll reach your goal in{' '}
                                    <span className="font-bold text-teal-400">{calculations.monthsToTarget} months</span>
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                            <h4 className="font-semibold text-yellow-400 mb-2">Emergency Fund Tips</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Keep funds in a high-yield savings account</li>
                                <li>• Separate from other savings accounts</li>
                                <li>• Only use for true emergencies</li>
                                <li>• Replenish immediately after use</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Expense Tracker Component
const ExpenseTracker: React.FC<{ costs: CostItem[]; addCost: (cost: Omit<CostItem, 'id'>) => void; deleteCost: (id: string) => void }> = ({ costs, addCost, deleteCost }) => {
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseType, setExpenseType] = useState<'Fixed' | 'Variable'>('Fixed');

    const fixedExpenses = costs.filter(cost => cost.type === 'Fixed');
    const variableExpenses = costs.filter(cost => cost.type === 'Variable');
    const totalFixed = fixedExpenses.reduce((sum, cost) => sum + cost.amount, 0);
    const totalVariable = variableExpenses.reduce((sum, cost) => sum + cost.amount, 0);
    const totalExpenses = totalFixed + totalVariable;

    const handleAddExpense = () => {
        if (expenseName.trim() && expenseAmount.trim()) {
            addCost({
                name: expenseName.trim(),
                amount: parseFloat(expenseAmount),
                type: expenseType
            });
            setExpenseName('');
            setExpenseAmount('');
        }
    };

    const handleDeleteExpense = (id: string) => {
        deleteCost(id);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-6">
                    Expense Tracker
                </h2>

                {/* Add New Expense Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Expense</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Expense Name</label>
                            <input 
                                type="text" 
                                value={expenseName} 
                                onChange={e => setExpenseName(e.target.value)}
                                placeholder="e.g., Rent, Groceries, Entertainment"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Amount (N$)</label>
                            <input 
                                type="number" 
                                value={expenseAmount} 
                                onChange={e => setExpenseAmount(e.target.value)}
                                placeholder="e.g., 5000"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Expense Type</label>
                            <select 
                                value={expenseType} 
                                onChange={e => setExpenseType(e.target.value as 'Fixed' | 'Variable')}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="Fixed">Fixed Expense</option>
                                <option value="Variable">Variable Expense</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleAddExpense}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Add Expense
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Expense Summary</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                <p className="text-blue-200 text-sm font-medium">Fixed Expenses</p>
                                <p className="text-xl font-bold text-blue-300 mobile-currency">N${totalFixed.toLocaleString()}</p>
                                <p className="text-xs text-blue-200 mt-1">{fixedExpenses.length} items</p>
                            </div>
                            <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                                <p className="text-orange-200 text-sm font-medium">Variable Expenses</p>
                                <p className="text-xl font-bold text-orange-300 mobile-currency">N${totalVariable.toLocaleString()}</p>
                                <p className="text-xs text-orange-200 mt-1">{variableExpenses.length} items</p>
                            </div>
                            <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                <p className="text-purple-200 text-sm font-medium">Total Expenses</p>
                                <p className="text-xl font-bold text-purple-300 mobile-currency">N${totalExpenses.toLocaleString()}</p>
                                <p className="text-xs text-purple-200 mt-1">All expenses</p>
                            </div>
                        </div>

                        {/* Expense Type Explanations */}
                        <div className="space-y-3 mt-6">
                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <h4 className="font-semibold text-blue-400 mb-1">Fixed Expenses</h4>
                                <p className="text-xs text-gray-300">Regular, consistent costs that don't change month to month (rent, insurance, subscriptions)</p>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <h4 className="font-semibold text-orange-400 mb-1">Variable Expenses</h4>
                                <p className="text-xs text-gray-300">Costs that can fluctuate based on usage or choice (groceries, entertainment, utilities)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Expense Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fixed Expenses */}
                <Card className="p-6 border border-blue-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        Fixed Expenses
                        <span className="ml-2 text-sm font-normal text-blue-400">({fixedExpenses.length})</span>
                    </h3>
                    {fixedExpenses.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {fixedExpenses.map(expense => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                                    <div className="mobile-flex-item">
                                        <p className="font-medium text-white">{expense.name}</p>
                                        <p className="text-xs text-gray-400">Fixed monthly cost</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-blue-400 mobile-currency">N${expense.amount.toLocaleString()}</p>
                                        <button 
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No fixed expenses added yet</p>
                            <p className="text-sm mt-1">Add expenses like rent, insurance, or subscriptions</p>
                        </div>
                    )}
                </Card>

                {/* Variable Expenses */}
                <Card className="p-6 border border-orange-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        Variable Expenses
                        <span className="ml-2 text-sm font-normal text-orange-400">({variableExpenses.length})</span>
                    </h3>
                    {variableExpenses.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {variableExpenses.map(expense => (
                                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                                    <div className="mobile-flex-item">
                                        <p className="font-medium text-white">{expense.name}</p>
                                        <p className="text-xs text-gray-400">Variable monthly cost</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-orange-400 mobile-currency">N${expense.amount.toLocaleString()}</p>
                                        <button 
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No variable expenses added yet</p>
                            <p className="text-sm mt-1">Add expenses like groceries, entertainment, or dining out</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// Main Financial Tools Component
const FinancialTools: React.FC<FinancialToolsProps> = ({ costs, addCost, deleteCost, income, setIncome }) => {
    const [activeTab, setActiveTab] = useState('budget');

    const tabs = [
        { id: 'budget', label: '50/30/20 Rule', icon: '' },
        { id: 'expenses', label: 'Expense Tracker', icon: '' },
        { id: 'salary', label: 'Salary Calculator', icon: '' },
        { id: 'debt', label: 'Debt Payoff', icon: '' },
        { id: 'emergency', label: 'Emergency Fund', icon: '' }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
                <h1 className="text-3xl font-bold text-white mb-3 flex items-center">
                    Financial Tools Suite
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                    Comprehensive financial calculators and planning tools to help you budget, plan, and achieve your financial goals.
                    Use these tools to make informed decisions about your money.
                </p>
            </Card>

            {/* Navigation Tabs */}
            <div className="bg-gray-800 rounded-lg p-1">
                {/* Mobile: Horizontal Scrollable Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mobile-tabs pb-1 sm:hidden">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap min-w-max ${
                                activeTab === tab.id
                                    ? 'bg-brand-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Desktop: Grid Layout */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-brand-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                            }`}
                        >
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'budget' && <Enhanced503020Tool income={income} setIncome={setIncome} />}
                {activeTab === 'expenses' && <ExpenseTracker costs={costs} addCost={addCost} deleteCost={deleteCost} />}
                {activeTab === 'salary' && <SalaryCalculator />}
                {activeTab === 'debt' && <DebtPayoffCalculator />}
                {activeTab === 'emergency' && <EmergencyFundCalculator />}
            </div>

            {/* Quick Tips */}
            <Card className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <h2 className="text-xl font-bold text-white mb-4">Financial Planning Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-blue-400 mb-2">Budget Rule</h3>
                        <p className="text-sm text-gray-300">The 50/30/20 rule is a starting point. Adjust based on your life situation and goals.</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-green-400 mb-2">Emergency Fund</h3>
                        <p className="text-sm text-gray-300">Build 3-6 months of expenses before focusing on investments or extra debt payments.</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-purple-400 mb-2">Debt Strategy</h3>
                        <p className="text-sm text-gray-300">Pay minimums on all debts, then focus extra payments on highest interest rate first.</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-orange-400 mb-2">Salary Planning</h3>
                        <p className="text-sm text-gray-300">Know your true hourly rate to make better decisions about overtime and side hustles.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FinancialTools;
