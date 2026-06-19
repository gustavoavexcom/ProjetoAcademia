import {
  useId,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import './ui.css';

/**
 * Ao pressionar Enter em um campo, move o foco para o próximo campo do mesmo
 * container (em vez de enviar o formulário). Use como `onKeyDown` no elemento
 * que agrupa os campos (ex.: a div `.crud__form-grid`). Textareas são ignoradas
 * para preservar a quebra de linha.
 */
export function avancarComEnter(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== 'Enter') return;
  const alvo = e.target as HTMLElement;
  if (alvo.tagName === 'TEXTAREA') return;
  const campos = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('input, select, textarea'),
  ).filter((el) => !(el as HTMLInputElement).disabled && el.tabIndex !== -1);
  const i = campos.indexOf(alvo);
  if (i === -1) return;
  // Evita o submit acidental e avança para o próximo campo, se houver.
  e.preventDefault();
  campos[i + 1]?.focus();
}

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

interface AutocompleteFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Sugestões exibidas conforme o usuário digita (autocomplete por nome). */
  options: string[];
}

/**
 * Campo de texto com sugestões de cadastros existentes (via `<datalist>` nativo).
 * Ex.: ao digitar "gu", o navegador sugere "Gustavo" se houver no cadastro.
 */
export function AutocompleteField({ label, options, ...props }: AutocompleteFieldProps) {
  const listId = useId();
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="field__control" list={listId} autoComplete="off" {...props} />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
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
