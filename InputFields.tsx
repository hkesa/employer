import React from 'react';

interface BaseProps {
  label?: string;
  className?: string;
}

interface TextInputProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {}
interface TextAreaProps extends BaseProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
interface SelectProps extends BaseProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  placeholder?: string;
}

// Removed "transition-all" to prevent date picker jumping. Added text-[21px].
const inputClass = "w-full p-4 border border-gray-300 rounded-lg bg-white text-[21px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none";
const labelClass = "block mb-3 font-bold text-gray-800 text-[21px]";

export const TextInput: React.FC<TextInputProps> = ({ label, className = "", ...props }) => (
  <div className={`mb-8 ${className}`}>
    {label && <label className={labelClass}>{label}</label>}
    <input className={inputClass} {...props} />
  </div>
);

export const TextArea: React.FC<TextAreaProps> = ({ label, className = "", ...props }) => (
  <div className={`mb-8 ${className}`}>
    {label && <label className={labelClass}>{label}</label>}
    <textarea className={`${inputClass} min-h-[120px] resize-y`} {...props} />
  </div>
);

export const Select: React.FC<SelectProps> = ({ label, options, placeholder, className = "", ...props }) => (
  <div className={`mb-8 ${className}`}>
    {label && <label className={labelClass}>{label}</label>}
    <div className="relative">
      <select className={inputClass} {...props}>
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

export const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-12 mb-6">
    <h3 className="text-primary border-b-4 border-primary pb-2 font-bold mb-6 text-[21px]">{title}</h3>
    {children}
  </div>
);

export const Divider: React.FC = () => (
  <div className="h-1.5 bg-gray-200 my-12 rounded-full opacity-70"></div>
);