
import React from 'react';
import { CalculationResult } from '../types';
import { CreditCard, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  result: CalculationResult;
}

export const SummaryCard: React.FC<Props> = ({ result }) => {
  const { summary } = result;

  const chartData = [
    { name: 'Capital', value: result.schedule.reduce((acc, row) => acc + row.amortization, 0) },
    { name: 'Interés', value: summary.totalInterest },
    { name: 'Seguros/Com', value: result.schedule.reduce((acc, row) => acc + row.insurance + row.fee, 0) },
  ];

  const COLORS = ['#0ea5e9', '#f97316', '#94a3b8'];

  // Check if quota has changed significantly (more than 1 unit of currency)
  const quotaChanged = Math.abs(summary.firstPayment - summary.regularPayment) > 1;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                {quotaChanged ? 'Cuota (Inicial vs Nueva)' : 'Cuota Estimada'}
            </p>
            
            <div className="flex items-baseline gap-2 flex-wrap">
                {quotaChanged && (
                    <>
                        <span className="text-lg font-bold text-gray-400 line-through">
                            {summary.firstPayment.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
                        </span>
                        <ArrowDown className="w-4 h-4 text-green-500" />
                    </>
                )}
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {summary.regularPayment.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
                    <span className="text-base font-normal text-gray-400 ml-1">/mes</span>
                </h1>
            </div>
        </div>
        <div className="bg-brand-50 p-2 rounded-lg">
            <CreditCard className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Mini Charts & Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 h-24 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-[10px] text-gray-400 font-bold">Total</span>
              </div>
        </div>
        
        <div className="col-span-1 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <span className="text-xs text-gray-500">TEA: <span className="text-slate-900 font-bold">{(summary.annualRate * 100).toFixed(2)}%</span></span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-500">TEM: <span className="text-slate-900 font-bold">{(summary.monthlyRate * 100).toFixed(2)}%</span></span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <span className="text-xs text-gray-500">Int. Total: <span className="text-slate-900 font-bold">${(summary.totalInterest).toLocaleString('es-ES', { maximumFractionDigits: 0 })}</span></span>
            </div>
        </div>
      </div>
    </div>
  );
};