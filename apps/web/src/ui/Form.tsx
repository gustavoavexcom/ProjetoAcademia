import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import './ui.css';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, ...props }: FieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="field__control" {...props} />
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function SelectField({ label, children, ...props }: SelectFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className="field__control" {...props}>
        {children}
      </select>
    </label>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextAreaField({ label, ...props }: TextAreaFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea className="field__control" rows={3} {...props} />
    </label>
  );
}
