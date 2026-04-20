import styles from './Input.module.css';

export function Input({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <input
        id={inputId}
        className={[styles.input, error ? styles.hasError : ''].filter(Boolean).join(' ')}
        {...props}
      />
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