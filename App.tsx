import React, { useState, useEffect, useMemo } from 'react';
import { LoanParams, AppTab } from './types';
import { calculateSchedule } from './services/financialMath';
import { CalculatorForm } from './components/CalculatorForm';
import { ScheduleTable } from './components/ScheduleTable';
import { SummaryCard } from './components/SummaryCard';
import { AdvisorView } from './components/AdvisorView';
import { Calculator, CalendarDays, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CALCULATOR);
  
  // Default State
  const [params, setParams] = useState<LoanParams>({
    amount: 10000,
    rateType: 'annual',
    rateValue: 15,
    term: 12,
    termUnit: 'months',
    gracePeriod: 0,
    graceType: 'partial',
    graceDays: 0,
    insurance: 0.05,
    fixedFee: 5,
    // Extra payment defaults
    paidInstallments: 0,
    extraPaymentAmount: 0,
    extraPaymentMonth: 1, // Default to 1 or logic will handle it
    extraPaymentStrategy: 'reduce_term'
  });

  // Calculate whenever params change
  const result = useMemo(() => calculateSchedule(params), [params]);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.CALCULATOR:
        return (
          <div className="animate-fade-in">
            <SummaryCard result={result} />
            <CalculatorForm params={params} onChange={setParams} result={result} />
          </div>
        );
      case AppTab.SCHEDULE:
        return (
            <div className="animate-fade-in">
                <div className="mb-4 px-1 flex justify-between items-end">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Detalle de Pagos</h2>
                        <p className="text-sm text-gray-500">Proyección mensual</p>
                    </div>
                    {result.summary.newTerm && result.summary.newTerm < params.term && (
                         <div className="text-right">
                            <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-1 rounded">
                                Termina en mes {result.summary.newTerm}
                            </span>
                         </div>
                    )}
                </div>
                <ScheduleTable 
                    schedule={result.schedule} 
                    startDate={result.startDate} 
                    paidInstallments={params.paidInstallments}
                />
            </div>
        );
      case AppTab.ADVISOR:
        return (
             <div className="animate-fade-in">
                 <AdvisorView params={params} result={result} />
             </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      {/* Header */}
      <header className="bg-white pt-10 pb-4 px-6 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-black text-brand-600 tracking-tight">Calcula tu <span className="text-slate-800">Préstamo</span></h1>
            </div>
             <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                v1.3
             </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 min-h-[calc(100vh-160px)]">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 max-w-md mx-auto pb-safe">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab(AppTab.CALCULATOR)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === AppTab.CALCULATOR ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calculator className={`w-6 h-6 mb-1 ${activeTab === AppTab.CALCULATOR ? 'fill-brand-100' : ''}`} />
            <span className="text-[10px] font-medium">Calculadora</span>
          </button>
          
          <button
            onClick={() => setActiveTab(AppTab.SCHEDULE)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === AppTab.SCHEDULE ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CalendarDays className={`w-6 h-6 mb-1 ${activeTab === AppTab.SCHEDULE ? 'fill-brand-100' : ''}`} />
            <span className="text-[10px] font-medium">Cronograma</span>
          </button>

           <button
            onClick={() => setActiveTab(AppTab.ADVISOR)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === AppTab.ADVISOR ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BrainCircuit className={`w-6 h-6 mb-1 ${activeTab === AppTab.ADVISOR ? 'fill-indigo-100' : ''}`} />
            <span className="text-[10px] font-medium">IA Advisor</span>
          </button>
        </div>
      </nav>
      
      {/* Safe Area Spacer for iOS */}
      <div className="h-6 w-full bg-white fixed bottom-0 max-w-md mx-auto z-40 hidden sm:block"></div>
    </div>
  );
};

export default App;