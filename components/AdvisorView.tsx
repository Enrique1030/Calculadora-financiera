
import React, { useState, useEffect } from 'react';
import { LoanParams, CalculationResult } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  params: LoanParams;
  result: CalculationResult;
}

export const AdvisorView: React.FC<Props> = ({ params, result }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // We only fetch when the component mounts or when user explicitly asks to refresh
  const fetchAdvice = async () => {
    setLoading(true);
    const text = await getFinancialAdvice(params, result);
    setAdvice(text);
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-24 space-y-4">
      {/* Professional Dark Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden border border-slate-800">
        {/* Subtle premium light effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Asesoría Inteligente
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-700 px-2 py-1 rounded">
                    Gemini AI
                </span>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 font-light leading-relaxed border-b border-slate-800 pb-4">
                Análisis financiero profesional de tu estructura de crédito y recomendaciones de optimización.
            </p>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-slate-600" />
                        </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400 animate-pulse uppercase tracking-wide">Procesando datos...</p>
                </div>
            ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-amber-100 prose-li:text-slate-300">
                    <ReactMarkdown>{advice || ''}</ReactMarkdown>
                </div>
            )}
        </div>
      </div>

      {!loading && (
          <button 
            onClick={fetchAdvice}
            className="w-full bg-white text-slate-800 font-bold py-3.5 px-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center gap-2 active:bg-gray-50 transition-colors hover:border-gray-300"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Actualizar Diagnóstico
          </button>
      )}

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex gap-3 items-start">
        <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-600">Nota Legal:</span> Este análisis es generado por inteligencia artificial con fines informativos. No constituye asesoramiento financiero vinculante. Recomendamos consultar con su ejecutivo bancario antes de tomar decisiones.
        </p>
      </div>
    </div>
  );
};
