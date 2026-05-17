import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

export function Input({
  label,
  error,
  hint,
  id,
  type = 'text',
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      
      <div className={styles.inputContainer}>
        <input
          id={inputId}
          type={inputType}
          className={[
            styles.input, 
            error ? styles.hasError : '',
            isPassword ? styles.inputPassword : ''
          ].filter(Boolean).join(' ')}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            title={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export function Select({ label, error, hint, id, children, className = '', ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <select
        id={selectId}
        className={[styles.input, styles.select, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export function Textarea({ label, error, hint, id, className = '', ...props }) {
  const taId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={taId} className={styles.label}>{label}</label>}
      <textarea
        id={taId}
        className={[styles.input, styles.textarea, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export default Input;