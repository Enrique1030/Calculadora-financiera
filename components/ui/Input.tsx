import React, { useState, useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, helperText, className, ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm text-base font-medium"
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-[10px] text-gray-500 ml-1">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
                {label}
            </label>
            <div className="relative">
                <select
                    className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm text-base font-medium appearance-none"
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    )
}

interface FormattedNumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, ...props }) => {
  // Initialize with formatted value
  const [displayValue, setDisplayValue] = useState(() => 
    value === 0 ? '' : value.toLocaleString('en-US', { maximumFractionDigits: 10 })
  );

  useEffect(() => {
    const cleanState = displayValue.replace(/,/g, '');
    const numState = parseFloat(cleanState);
    
    // If the prop value is different from our current state's numeric value (handling resets/presets)
    const currentVal = isNaN(numState) ? 0 : numState;
    
    if (Math.abs(currentVal - value) > 0.000001) {
       setDisplayValue(value === 0 ? '' : value.toLocaleString('en-US', { maximumFractionDigits: 10 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and one dot
    const cleanVal = val.replace(/[^0-9.]/g, ''); 
    
    // Check dots
    const parts = cleanVal.split('.');
    if (parts.length > 2) return; // More than one dot

    // Format integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formatted = parts.join('.');

    setDisplayValue(formatted);

    // Calculate number for parent
    const numVal = parseFloat(cleanVal);
    onChange(isNaN(numVal) ? 0 : numVal);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
    />
  );
};
