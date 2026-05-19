import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logo from '../../assets/liblivre_logo.svg';

const NAV_ITEMS = [
  { to: '/catalogo',      label: 'Catálogo' },
  { to: '/leitores',      label: 'Leitores' },
  { to: '/autores_categorias', label: 'Autores e Categorias' },
  { to: '/emprestimos',   label: 'Empréstimos' },
];

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <NavLink to="/catalogo">
          <img src={logo} alt="LibLivre" className={styles.logoIcon} />
        </NavLink>
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