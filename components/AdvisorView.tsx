import React, { useState, useEffect } from 'react';
import { LoanParams, CalculationResult } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  params: LoanParams;
  result: CalculationResult;
}

export const AdvisorView: React.FC<Props> = ({ params, result }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // We only fetch when the component mounts or when user explicitly asks to refresh
  // to avoid spamming the API on every keystroke in the calculator.
  
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
  }, []); // Only on mount. User needs to refresh manually if they change data heavily.

  return (
    <div className="pb-24 space-y-4">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Asesor Financiero IA
            </h2>
            <p className="text-indigo-100 text-sm mb-4">
                Análisis inteligente de tu préstamo impulsado por Gemini.
            </p>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-white opacity-80" />
                    <p className="text-sm font-medium animate-pulse">Analizando estructura financiera...</p>
                </div>
            ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{advice || ''}</ReactMarkdown>
                </div>
            )}
        </div>
      </div>

      {!loading && (
          <button 
            onClick={fetchAdvice}
            className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar Análisis
          </button>
      )}

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-xs text-orange-700">
            Este análisis es generado por IA y debe usarse solo como referencia. Consulta siempre con una entidad financiera regulada antes de tomar decisiones.
        </p>
      </div>
    </div>
  );
};
