import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/catalogo',      label: 'Catálogo',      icon: '📚' },
  { to: '/leitores',      label: 'Leitores',      icon: '👤' },
  { to: '/emprestimos',   label: 'Empréstimos',   icon: '🔄' },
  { to: '/autores',       label: 'Autores',        icon: '✏️' },
  { to: '/categorias',    label: 'Categorias',     icon: '🏷️' },
];

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>📖</span>
        <span className={styles.brandName}>LibLivre</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            [styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>Meu Perfil</span>
        </NavLink>

        <button className={styles.logout} onClick={handleLogout}>
          <span className={styles.navIcon}>↩</span>
          <span className={styles.navLabel}>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;