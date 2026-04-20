import { useEffect } from 'react';
import Button from './Button';
import styles from './Modal.module.css';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={[styles.dialog, styles[size]].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

/** Confirm delete modal */
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirmar exclusão'}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmar</Button>
        </div>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
        {message || 'Tem certeza? Esta ação não pode ser desfeita.'}
      </p>
    </Modal>
  );
}

export default Modal;