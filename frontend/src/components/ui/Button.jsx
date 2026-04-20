import styles from './Button.module.css';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}

export default Button;