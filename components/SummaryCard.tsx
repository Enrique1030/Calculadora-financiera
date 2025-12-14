
import React, { useState } from 'react';
import { CalculationResult, LoanParams } from '../types';
import { CreditCard, ArrowDown, PiggyBank, CalendarClock, Coins, Ban, X, Eye, Trophy, TrendingUp } from 'lucide-react';
import { calculateSchedule } from '../services/financialMath';
import { ScheduleTable } from './ScheduleTable';

interface Props {
  result: CalculationResult;
  params: LoanParams;
}

type ScenarioType = 'original' | 'reduceTerm' | 'reduceQuota' | null;

export const SummaryCard: React.FC<Props> = ({ result, params }) => {
  const { summary } = result;
  const [viewingScenario, setViewingScenario] = useState<ScenarioType>(null);

  // Check if quota has changed significantly
  const quotaChanged = Math.abs(summary.firstPayment - summary.regularPayment) > 1;
  const comparison = summary.comparison;

  // Helper to calculate the result for the modal on the fly
  const getScenarioResult = () => {
      if (!viewingScenario) return null;
      
      let scenarioParams = { ...params };
      
      if (viewingScenario === 'original') {
          scenarioParams.extraPaymentAmount = 0;
      } else if (viewingScenario === 'reduceTerm') {
          scenarioParams.extraPaymentStrategy = 'reduce_term';
      } else if (viewingScenario === 'reduceQuota') {
          scenarioParams.extraPaymentStrategy = 'reduce_quota';
      }
      
      return calculateSchedule(scenarioParams);
  };

  const modalResult = getScenarioResult();

  const getScenarioTitle = () => {
      switch(viewingScenario) {
          case 'original': return 'Escenario: Original (Sin abonos)';
          case 'reduceTerm': return 'Escenario: Reducción de Plazo';
          case 'reduceQuota': return 'Escenario: Reducción de Cuota';
          default: return '';
      }
  };

  // Analysis Logic
  const bestStrategy = comparison ? (comparison.reduceTerm.savings >= comparison.reduceQuota.savings ? 'term' : 'quota') : null;
  const savingsDifference = comparison ? Math.abs(comparison.reduceTerm.savings - comparison.reduceQuota.savings) : 0;

  return (
    <>
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-green-600" />
                        <h3 className="font-bold text-slate-800 text-sm uppercase">Comparativa de Escenarios</h3>
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3"/>
                        Toca para ver detalle
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {/* Card 1: Original */}
                    <button 
                        type="button"
                        onClick={() => setViewingScenario('original')}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col justify-between h-full relative overflow-hidden hover:border-gray-400 hover:shadow-md transition-all text-left"
                    >
                        <div className="mb-2 w-full">
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
                    </button>

                    {/* Card 2: Reduce Term */}
                    <button 
                        type="button"
                        onClick={() => setViewingScenario('reduceTerm')}
                        className={`rounded-xl p-3 border flex flex-col justify-between h-full relative overflow-hidden hover:shadow-md transition-all text-left ${
                            bestStrategy === 'term' ? 'bg-amber-50 border-amber-200 hover:border-amber-400 ring-1 ring-amber-100' : 'bg-green-50 border-green-200 hover:border-green-400'
                        }`}
                    >
                        {bestStrategy === 'term' && (
                            <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm flex items-center gap-0.5">
                                <Trophy className="w-2 h-2" /> MEJOR
                            </div>
                        )}
                        <div className="mb-2 w-full">
                            <div className="flex items-center gap-1 mb-1.5">
                                <CalendarClock className={`w-3 h-3 ${bestStrategy === 'term' ? 'text-amber-600' : 'text-green-600'}`} />
                                <span className={`text-[10px] font-bold uppercase leading-tight ${bestStrategy === 'term' ? 'text-amber-800' : 'text-green-700'}`}>Menos Plazo</span>
                            </div>
                            <div>
                                <span className={`text-[9px] block -mb-0.5 ${bestStrategy === 'term' ? 'text-amber-700/70' : 'text-green-600/70'}`}>Total</span>
                                <div className="text-sm font-bold text-slate-900">
                                    {comparison.reduceTerm.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <div className={`text-[10px] font-bold bg-white/60 rounded px-1 w-fit ${bestStrategy === 'term' ? 'text-amber-700' : 'text-green-600'}`}>
                                Ahorras {comparison.reduceTerm.savings.toLocaleString('en-US', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })}
                            </div>
                            <div className={`text-[9px] pl-1 ${bestStrategy === 'term' ? 'text-amber-800/80' : 'text-green-700/80'}`}>
                                {comparison.reduceTerm.term} meses
                            </div>
                        </div>
                    </button>

                    {/* Card 3: Reduce Quota */}
                    <button 
                        type="button"
                        onClick={() => setViewingScenario('reduceQuota')}
                        className={`rounded-xl p-3 border flex flex-col justify-between h-full relative overflow-hidden hover:shadow-md transition-all text-left ${
                             bestStrategy === 'quota' ? 'bg-amber-50 border-amber-200 hover:border-amber-400 ring-1 ring-amber-100' : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                        }`}
                    >
                         {bestStrategy === 'quota' && (
                            <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm flex items-center gap-0.5">
                                <Trophy className="w-2 h-2" /> MEJOR
                            </div>
                        )}
                        <div className="mb-2 w-full">
                            <div className="flex items-center gap-1 mb-1.5">
                                <Coins className={`w-3 h-3 ${bestStrategy === 'quota' ? 'text-amber-600' : 'text-blue-600'}`} />
                                <span className={`text-[10px] font-bold uppercase leading-tight ${bestStrategy === 'quota' ? 'text-amber-800' : 'text-blue-700'}`}>Menos Cuota</span>
                            </div>
                            <div>
                                <span className={`text-[9px] block -mb-0.5 ${bestStrategy === 'quota' ? 'text-amber-700/70' : 'text-blue-600/70'}`}>Total</span>
                                <div className="text-sm font-bold text-slate-900">
                                    {comparison.reduceQuota.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <div className={`text-[10px] font-bold bg-white/60 rounded px-1 w-fit ${bestStrategy === 'quota' ? 'text-amber-700' : 'text-blue-600'}`}>
                                Ahorras {comparison.reduceQuota.savings.toLocaleString('en-US', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })}
                            </div>
                            <div className={`text-[9px] pl-1 ${bestStrategy === 'quota' ? 'text-amber-800/80' : 'text-blue-700/80'}`}>
                                {comparison.reduceQuota.regularPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mes
                            </div>
                        </div>
                    </button>
                </div>

                {/* Analysis Recommendation */}
                {bestStrategy && savingsDifference > 1 && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start">
                        <div className="bg-brand-100 p-1.5 rounded-lg shrink-0">
                            <TrendingUp className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase mb-0.5">Análisis de Ahorro</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                La estrategia de <span className="font-bold text-slate-900">{bestStrategy === 'term' ? 'Reducir Plazo' : 'Reducir Cuota'}</span> te permite ahorrar 
                                <span className="font-bold text-green-600 mx-1">{savingsDifference.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span> 
                                adicionales en intereses comparado con la otra opción.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )}
        </div>

        {/* Modal for Scenario Schedule */}
        {viewingScenario && modalResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h3 className="font-bold text-slate-800">{getScenarioTitle()}</h3>
                            <p className="text-xs text-gray-500">Cronograma proyectado para esta opción</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setViewingScenario(null)}
                            className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content - Scrollable Table */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 relative">
                         <ScheduleTable 
                            schedule={modalResult.schedule} 
                            startDate={modalResult.startDate} 
                            paidInstallments={params.paidInstallments}
                            className="pb-0"
                        />
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button 
                             type="button"
                             onClick={() => setViewingScenario(null)}
                             className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
