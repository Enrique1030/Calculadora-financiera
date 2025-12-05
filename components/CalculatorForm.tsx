
import React from 'react';
import { LoanParams, CalculationResult } from '../types';
import { Input, Select } from './ui/Input';
import { DollarSign, Percent, Calendar, Shield, Clock, Layers, TrendingDown, History } from 'lucide-react';

interface Props {
  params: LoanParams;
  onChange: (params: LoanParams) => void;
  result: CalculationResult;
}

export const CalculatorForm: React.FC<Props> = ({ params, onChange, result }) => {
  const handleChange = (field: keyof LoanParams, value: string | number) => {
    // Smart logic for paid installments
    if (field === 'paidInstallments') {
        const newPaid = Number(value);
        // Automatically suggest the next month for extra payment if the user hasn't manually set a weird one
        onChange({ 
            ...params, 
            [field]: newPaid,
            extraPaymentMonth: newPaid + 1 
        });
        return;
    }
    onChange({ ...params, [field]: value });
  };

  // Helper to find current balance based on paid installments
  const getCurrentBalance = () => {
      if (params.paidInstallments === 0) return params.amount;
      // Find the row corresponding to the last paid installment
      const row = result.schedule.find(r => r.period === params.paidInstallments);
      return row ? row.balance : 0;
  };

  const currentBalance = getCurrentBalance();
  const maxTerm = params.termUnit === 'years' ? params.term * 12 : params.term;

  return (
    <div className="space-y-4 pb-24"> {/* Padding bottom for sticky nav */}
      
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
           <DollarSign className="w-5 h-5 text-brand-500" />
           Préstamo
        </h2>
        
        <Input
          label="Monto del Préstamo"
          type="number"
          value={params.amount}
          onChange={(e) => handleChange('amount', Number(e.target.value))}
          icon={<span className="text-gray-400 font-bold">$</span>}
          placeholder="0.00"
        />

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
                <Input
                label="Tasa (%)"
                type="number"
                step="0.01"
                value={params.rateValue}
                onChange={(e) => handleChange('rateValue', Number(e.target.value))}
                icon={<Percent className="w-4 h-4" />}
                />
            </div>
            <div className="col-span-1">
                <Select
                    label="Tipo de Tasa"
                    value={params.rateType}
                    onChange={(e) => handleChange('rateType', e.target.value as 'monthly' | 'annual')}
                >
                    <option value="monthly">Mensual (TEM)</option>
                    <option value="annual">Anual (TEA)</option>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <Input
                label="Plazo"
                type="number"
                value={params.term}
                onChange={(e) => handleChange('term', Number(e.target.value))}
                icon={<Calendar className="w-4 h-4" />}
            />
            <Select
                label="Unidad"
                value={params.termUnit}
                onChange={(e) => handleChange('termUnit', e.target.value as 'months' | 'years')}
            >
                <option value="months">Meses</option>
                <option value="years">Años</option>
            </Select>
        </div>
      </div>

      {/* Extra Payment & Status Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 border-l-4 border-l-green-500">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
           <TrendingDown className="w-5 h-5 text-green-500" />
           Progreso y Prepago
        </h2>
        
        {/* Current Status Input */}
        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
             <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                    <History className="w-3 h-3" />
                    ¿Cuotas ya pagadas?
                </label>
                <span className="text-xs font-bold text-brand-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                    Estás en la cuota {params.paidInstallments}
                </span>
             </div>
             
             <input 
                type="range" 
                min="0" 
                max={maxTerm - 1}
                value={params.paidInstallments}
                onChange={(e) => handleChange('paidInstallments', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
             />
             
             <div className="mt-3 flex justify-between items-end">
                <div className="text-[10px] text-gray-500">Saldo Capital Pendiente:</div>
                <div className="text-lg font-bold text-slate-900">
                    {currentBalance.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
                </div>
             </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Abono Extra a Capital"
                type="number"
                value={params.extraPaymentAmount}
                onChange={(e) => handleChange('extraPaymentAmount', Number(e.target.value))}
                icon={<span className="text-green-500 font-bold">$</span>}
                placeholder="0"
                helperText="Monto adicional directo a deuda"
            />
             <Input
                label="Aplicar en cuota #"
                type="number"
                value={params.extraPaymentMonth}
                onChange={(e) => handleChange('extraPaymentMonth', Number(e.target.value))}
                icon={<span className="text-gray-400 font-bold">#</span>}
                min={params.paidInstallments + 1}
                max={maxTerm}
                helperText={params.paidInstallments > 0 ? `Sugerido: ${params.paidInstallments + 1}` : ''}
            />
        </div>

        {params.extraPaymentAmount > 0 && (
             <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                    Objetivo del Pago
                </label>
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-green-100 transition-colors">
                        <input 
                            type="radio" 
                            name="extraPaymentStrategy" 
                            value="reduce_term" 
                            checked={params.extraPaymentStrategy === 'reduce_term'}
                            onChange={() => handleChange('extraPaymentStrategy', 'reduce_term')}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <div>
                            <span className="text-sm font-bold text-slate-700 block">Reducir Plazo</span>
                            <span className="text-[10px] text-slate-500">Mantener cuota similar, terminar antes.</span>
                        </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-green-100 transition-colors">
                        <input 
                            type="radio" 
                            name="extraPaymentStrategy" 
                            value="reduce_quota" 
                            checked={params.extraPaymentStrategy === 'reduce_quota'}
                            onChange={() => handleChange('extraPaymentStrategy', 'reduce_quota')}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                         <div>
                            <span className="text-sm font-bold text-slate-700 block">Reducir Cuota</span>
                            <span className="text-[10px] text-slate-500">Mantener plazo, pagar menos mensualmente.</span>
                        </div>
                    </label>
                </div>
             </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-500" />
            Adicionales y Gracia
        </h2>

        <Input
            label="Seguro (% Mensual del Saldo)"
            type="number"
            step="0.01"
            value={params.insurance}
            onChange={(e) => handleChange('insurance', Number(e.target.value))}
            icon={<Percent className="w-4 h-4" />}
        />

        <Input
            label="Comisión Fija Mensual"
            type="number"
            value={params.fixedFee}
            onChange={(e) => handleChange('fixedFee', Number(e.target.value))}
            icon={<span className="text-gray-400 font-bold">$</span>}
        />

        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Periodo Gracia (Meses)"
                type="number"
                value={params.gracePeriod}
                onChange={(e) => handleChange('gracePeriod', Number(e.target.value))}
                icon={<Clock className="w-4 h-4" />}
                min={0}
            />
            <Input
                label="Días de Gracia"
                type="number"
                value={params.graceDays}
                onChange={(e) => handleChange('graceDays', Number(e.target.value))}
                icon={<Calendar className="w-4 h-4" />}
                min={0}
            />
        </div>

        {/* Grace Type Selector - Only visible if grace period > 0 */}
        {params.gracePeriod > 0 && (
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Layers className="w-3 h-3" />
                    Tipo de Periodo de Gracia
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="graceType" 
                            value="partial" 
                            checked={params.graceType === 'partial'}
                            onChange={() => handleChange('graceType', 'partial')}
                            className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Parcial (Paga Int.)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="graceType" 
                            value="total" 
                            checked={params.graceType === 'total'}
                            onChange={() => handleChange('graceType', 'total')}
                            className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Total (Capitaliza)</span>
                    </label>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};