
import React from 'react';
import { PaymentRow } from '../types';
import { ArrowDownCircle, ArrowUpCircle, Calendar, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  schedule: PaymentRow[];
  startDate: string;
  paidInstallments?: number;
}

export const ScheduleTable: React.FC<Props> = ({ schedule, startDate, paidInstallments = 0 }) => {
  return (
    <div className="pb-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-slate-700">Cronograma de Pagos</h3>
                <p className="text-xs text-gray-500">Desliza para ver más detalles</p>
            </div>
            <div className="text-right">
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Fecha Desembolso</span>
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-md">{startDate}</span>
            </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Pago Total</th>
                <th className="px-4 py-3 text-right text-brand-600">Capital</th>
                <th className="px-4 py-3 text-right text-orange-500">Interés</th>
                <th className="px-4 py-3 text-right text-purple-500">Seguro</th>
                <th className="px-4 py-3 text-right text-gray-500">Comisión</th>
                <th className="px-4 py-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedule.map((row) => {
                const isExtra = row.extraPayment && row.extraPayment > 0;
                const isPaid = row.period <= paidInstallments;

                return (
                    <tr 
                        key={row.period} 
                        className={`transition-colors 
                            ${isExtra ? 'bg-green-50' : 'hover:bg-gray-50'}
                            ${isPaid ? 'bg-gray-50/80 grayscale opacity-60' : ''}
                        `}
                    >
                    <td className="px-4 py-3 font-medium text-gray-400 relative">
                        {row.period}
                        {isExtra && !isPaid && <Zap className="w-3 h-3 text-green-500 absolute -left-0 top-3" />}
                        {isPaid && <CheckCircle2 className="w-3 h-3 text-gray-400 absolute -left-0 top-3" />}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                        {row.date}
                        {isPaid && <span className="ml-2 text-[9px] bg-gray-200 text-gray-600 px-1 rounded uppercase font-bold">Pagado</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {row.payment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        {isExtra && (
                            <div className="text-[9px] text-green-600 font-bold flex justify-end items-center gap-1">
                                <Zap className="w-2 h-2"/> Incl. extra
                            </div>
                        )}
                    </td>
                    <td className="px-4 py-3 text-right text-brand-600">
                        {row.amortization.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-500">
                        {row.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-500">
                        {row.insurance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                     <td className="px-4 py-3 text-right text-gray-500">
                        {row.fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-600">
                        {row.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
