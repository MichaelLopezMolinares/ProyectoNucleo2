import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome, HiOutlineAcademicCap, HiOutlineUserGroup,
  HiOutlineBuildingOffice2, HiOutlineCog6Tooth, HiOutlineCalendarDays,
  HiOutlineEye, HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/academic', icon: HiOutlineAcademicCap, label: 'Gestión Académica' },
  { path: '/teachers', icon: HiOutlineUserGroup, label: 'Docentes' },
  { path: '/classrooms', icon: HiOutlineBuildingOffice2, label: 'Aulas' },
  { path: '/schedule-engine', icon: HiOutlineCog6Tooth, label: 'Generar Horarios' },
  { path: '/schedules', icon: HiOutlineCalendarDays, label: 'Ver Horarios' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <HiOutlineCalendarDays />
          <span>Agenda Fácil</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.nombre || 'Usuario'}</span>
            <span className="user-role">{user?.rol || 'N/A'}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
          <HiOutlineArrowRightOnRectangle />
        </button>
      </div>
    </aside>
  );
}
