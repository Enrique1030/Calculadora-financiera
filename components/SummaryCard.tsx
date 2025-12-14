
import React from 'react';
import { CalculationResult } from '../types';
import { CreditCard, ArrowDown, TrendingDown, PiggyBank, CalendarClock, Coins, Ban } from 'lucide-react';

interface Props {
  result: CalculationResult;
}

export const SummaryCard: React.FC<Props> = ({ result }) => {
  const { summary } = result;

  // Check if quota has changed significantly
  const quotaChanged = Math.abs(summary.firstPayment - summary.regularPayment) > 1;
  const comparison = summary.comparison;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 space-y-6">
      {/* Top Section: Quota Display */}
      <div className="flex justify-between items-start">
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                {quotaChanged ? 'Cuota (Inicial vs Nueva)' : 'Cuota Estimada'}
            </p>
            
            <div className="flex items-baseline gap-2 flex-wrap">
                {quotaChanged && (
                    <>
                        <span className="text-lg font-bold text-gray-400 line-through">
                            {summary.firstPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </span>
                        <ArrowDown className="w-4 h-4 text-green-500" />
                    </>
                )}
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {summary.regularPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    <span className="text-base font-normal text-gray-400 ml-1">/mes</span>
                </h1>
            </div>
        </div>
        <div className="bg-brand-50 p-2 rounded-lg">
            <CreditCard className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Comparison Section - 3 Cards Layout */}
      {comparison && (
        <div className="space-y-3">
             <div className="flex items-center gap-2">
                 <PiggyBank className="w-5 h-5 text-green-600" />
                 <h3 className="font-bold text-slate-800 text-sm uppercase">Comparativa de Escenarios</h3>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                 {/* Card 1: Original */}
                 <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col justify-between h-full relative overflow-hidden">
                     <div className="mb-2">
                         <div className="flex items-center gap-1 mb-1.5">
                             <Ban className="w-3 h-3 text-gray-400" />
                             <span className="text-[10px] font-bold text-gray-500 uppercase">Original</span>
                         </div>
                         <div>
                             <span className="text-[9px] text-gray-400 block -mb-0.5">Total</span>
                             <div className="text-sm font-bold text-slate-700">
                                 {comparison.original.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                             </div>
                         </div>
                     </div>
                     <div className="text-[10px] text-gray-500 mt-1 font-medium bg-white/50 rounded px-1 w-fit">
                        {comparison.original.term} meses
                     </div>
                 </div>

                 {/* Card 2: Reduce Term */}
                 <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex flex-col justify-between h-full relative overflow-hidden">
                     <div className="mb-2">
                         <div className="flex items-center gap-1 mb-1.5">
                             <CalendarClock className="w-3 h-3 text-green-600" />
                             <span className="text-[10px] font-bold text-green-700 uppercase leading-tight">Menos Plazo</span>
                         </div>
                         <div>
                             <span className="text-[9px] text-green-600/70 block -mb-0.5">Total</span>
                             <div className="text-sm font-bold text-slate-900">
                                 {comparison.reduceTerm.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                             </div>
                         </div>
                     </div>
                     <div className="flex flex-col gap-0.5 mt-1">
                         <div className="text-[10px] font-bold text-green-600 bg-white/60 rounded px-1 w-fit">
                            Ahorras {comparison.reduceTerm.savings.toLocaleString('en-US', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })}
                         </div>
                         <div className="text-[9px] text-green-700/80 pl-1">
                            {comparison.reduceTerm.term} meses
                         </div>
                     </div>
                 </div>

                 {/* Card 3: Reduce Quota */}
                 <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 flex flex-col justify-between h-full relative overflow-hidden">
                     <div className="mb-2">
                         <div className="flex items-center gap-1 mb-1.5">
                             <Coins className="w-3 h-3 text-blue-600" />
                             <span className="text-[10px] font-bold text-blue-700 uppercase leading-tight">Menos Cuota</span>
                         </div>
                         <div>
                             <span className="text-[9px] text-blue-600/70 block -mb-0.5">Total</span>
                             <div className="text-sm font-bold text-slate-900">
                                 {comparison.reduceQuota.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                             </div>
                         </div>
                     </div>
                     <div className="flex flex-col gap-0.5 mt-1">
                         <div className="text-[10px] font-bold text-blue-600 bg-white/60 rounded px-1 w-fit">
                            Ahorras {comparison.reduceQuota.savings.toLocaleString('en-US', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })}
                         </div>
                         <div className="text-[9px] text-blue-700/80 pl-1">
                            {comparison.reduceQuota.regularPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mes
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};
