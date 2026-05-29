import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Layers, Users, FileText,
  ShoppingCart, Calculator, History, User, Bell, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

/* ─── Nav link definitions ──────────────────────────────────────────────── */
const adminLinks = [
  { to: '/admin',         label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/cars',    label: 'Cars',        icon: Car },
  { to: '/admin/slabs',   label: 'Slabs',       icon: Layers },
  { to: '/admin/users',   label: 'Users',       icon: Users },
  { to: '/admin/reports', label: 'Reports',     icon: FileText },
];

const officerLinks = [
  { to: '/officer',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/officer/sales',       label: 'Sales Entry', icon: ShoppingCart },
  { to: '/officer/calculator',  label: 'Calculator',  icon: Calculator },
  { to: '/officer/history',     label: 'History',     icon: History },
  { to: '/officer/profile',     label: 'Profile',     icon: User },
];

/* ─── Styles ────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Barlow', sans-serif;
    background: #f4f4f4;
    color: #212529;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Shell ── */
  .ly-shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .ly-sidebar {
    width: 240px; flex-shrink: 0;
    background: #000; display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
    transition: transform .25s ease;
  }

  /* ── Logo area ── */
  .ly-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }
  .ly-logo-mark { flex-shrink: 0; }
  .ly-logo-name { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 3px; text-transform: uppercase; line-height: 1; }
  .ly-logo-role { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #787878; margin-top: 3px; }

  /* ── Nav ── */
  .ly-nav { flex: 1; padding: 14px 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }

  .ly-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 600; letter-spacing: .2px;
    color: #787878; text-decoration: none;
    transition: all .15s; position: relative; overflow: hidden;
  }
  .ly-nav-link:hover { color: #fff; background: rgba(255,255,255,.06); }
  .ly-nav-link.active {
    color: #fff; background: rgba(225,10,29,.15);
  }
  .ly-nav-link.active::before {
    content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; background: #e10a1d; border-radius: 0 2px 2px 0;
  }
  .ly-nav-icon { flex-shrink: 0; }

  /* ── Sidebar footer ── */
  .ly-sidebar-footer {
    padding: 14px 10px;
    border-top: 1px solid rgba(255,255,255,.07);
    flex-shrink: 0;
  }
  .ly-logout {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 10px 12px; border-radius: 8px;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 600;
    color: #787878; background: none; border: none; cursor: pointer;
    transition: all .15s; text-align: left;
  }
  .ly-logout:hover { color: #e10a1d; background: rgba(225,10,29,.08); }

  /* ── Main area ── */
  .ly-main { flex: 1; display: flex; flex-direction: column; margin-left: 240px; min-width: 0; }

  /* ── Topbar ── */
  .ly-topbar {
    height: 56px; flex-shrink: 0;
    background: #fff; border-bottom: 1px solid #e8e8e8;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; position: sticky; top: 0; z-index: 90;
  }
  .ly-topbar-welcome { font-size: 14px; font-weight: 600; color: #212529; }
  .ly-topbar-welcome span { color: #e10a1d; }
  .ly-topbar-right { display: flex; align-items: center; gap: 6px; }

  /* Notification bell */
  .ly-notif-btn {
    position: relative; width: 36px; height: 36px; border-radius: 8px;
    background: none; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #787878; transition: all .15s;
  }
  .ly-notif-btn:hover { background: #f4f4f4; color: #212529; }
  .ly-notif-badge {
    position: absolute; top: 5px; right: 5px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #e10a1d; color: #fff;
    font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  /* Notification dropdown */
  .ly-notif-drop {
    position: absolute; right: 0; top: calc(100% + 8px);
    width: 320px; background: #fff;
    border: 1px solid #e8e8e8; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.12);
    overflow: hidden; z-index: 200;
  }
  .ly-notif-header {
    padding: 12px 16px; border-bottom: 1px solid #f0f0f0;
    font-size: 12px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #787878;
    display: flex; align-items: center; gap: 8px;
  }
  .ly-notif-header::before { content: ''; display: inline-block; width: 3px; height: 13px; background: #e10a1d; border-radius: 2px; }
  .ly-notif-body { max-height: 280px; overflow-y: auto; }
  .ly-notif-item { padding: 12px 16px; border-bottom: 1px solid #f8f8f8; }
  .ly-notif-item:last-child { border-bottom: none; }
  .ly-notif-item.unread { background: #fffbfb; }
  .ly-notif-title { font-size: 13px; font-weight: 700; color: #212529; margin-bottom: 2px; }
  .ly-notif-msg { font-size: 12px; color: #787878; line-height: 1.5; }
  .ly-notif-empty { padding: 32px 16px; text-align: center; color: #787878; font-size: 13px; }

  /* Content area */
  .ly-content { flex: 1; padding: 24px; overflow-y: auto; }

  /* Mobile sidebar toggle */
  .ly-mob-toggle {
    display: none; position: fixed; bottom: 20px; right: 20px; z-index: 200;
    width: 48px; height: 48px; border-radius: 50%;
    background: #e10a1d; border: none; cursor: pointer;
    color: #fff; box-shadow: 0 4px 16px rgba(225,10,29,.4);
    align-items: center; justify-content: center;
  }

  /* Mobile overlay */
  .ly-mob-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,.6); z-index: 99;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .ly-sidebar { transform: translateX(-100%); }
    .ly-sidebar.open { transform: translateX(0); }
    .ly-main { margin-left: 0; }
    .ly-mob-toggle { display: flex; }
    .ly-mob-overlay.open { display: block; }
    .ly-content { padding: 16px; }
    .ly-topbar { padding: 0 16px; }
  }
`;

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  const links = isAdmin ? adminLinks : officerLinks;

  useEffect(() => {
    api('/notifications').then(setNotifications).catch(() => {});
  }, []);

  /* close notif dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{css}</style>

      <div className="ly-shell">

        {/* ── Mobile overlay ── */}
        <div
          className={`ly-mob-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`ly-sidebar ${sidebarOpen ? 'open' : ''}`}>

          {/* Logo */}
          <div className="ly-logo">
            <svg className="ly-logo-mark" width="36" height="24" viewBox="0 0 36 24" fill="none">
              <ellipse cx="18" cy="12" rx="17" ry="11" stroke="white" strokeWidth="2"/>
              <ellipse cx="18" cy="12" rx="17" ry="4" stroke="white" strokeWidth="2"/>
              <line x1="1" y1="12" x2="35" y2="12" stroke="black" strokeWidth="3.5"/>
            </svg>
            <div>
              <div className="ly-logo-name">Toyota</div>
              <div className="ly-logo-role">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="ly-nav">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `ly-nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} strokeWidth={2} className="ly-nav-icon" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="ly-sidebar-footer">
            <button className="ly-logout" onClick={handleLogout}>
              <LogOut size={16} strokeWidth={2} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="ly-main">

          {/* Topbar */}
          <header className="ly-topbar">
            <div className="ly-topbar-welcome">
              Welcome back, <span>{user?.name}</span>
            </div>

            <div className="ly-topbar-right">

              {/* Notification bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button className="ly-notif-btn" onClick={() => setShowNotif((v) => !v)}>
                  <Bell size={18} strokeWidth={2} />
                  {unread > 0 && <span className="ly-notif-badge">{unread}</span>}
                </button>

                {showNotif && (
                  <div className="ly-notif-drop">
                    <div className="ly-notif-header">Notifications</div>
                    <div className="ly-notif-body">
                      {notifications.length === 0 ? (
                        <div className="ly-notif-empty">No notifications yet</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`ly-notif-item ${!n.read ? 'unread' : ''}`}>
                            <div className="ly-notif-title">{n.title}</div>
                            <div className="ly-notif-msg">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar chip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 10px 4px 4px',
                background: '#f4f4f4', borderRadius: 20,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#000', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, letterSpacing: '.5px',
                }}>
                  {getInitials(user?.name)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#212529' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

            </div>
          </header>

          {/* Page content */}
          <main className="ly-content">
            <Outlet />
          </main>
        </div>

        {/* Mobile sidebar toggle */}
        <button className="ly-mob-toggle" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? <X size={20} /> : (
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect width="20" height="2" rx="1" fill="white"/>
              <rect y="6" width="14" height="2" rx="1" fill="white"/>
              <rect y="12" width="20" height="2" rx="1" fill="white"/>
            </svg>
          )}
        </button>

      </div>
    </>
  );
}
