'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import {
  LayoutDashboard,
  Send,
  Flame,
  Users,
  Briefcase,
  FileText,
  Mail,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
      { label: 'Campaigns', icon: Send, href: '/campaigns' },
      { label: 'Warm-Up', icon: Flame, href: '/warmup' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Leads', icon: Users, href: '/leads' },
      { label: 'Prospects', icon: Briefcase, href: '/prospects' },
      { label: 'Templates', icon: FileText, href: '/templates' },
      { label: 'Email Accounts', icon: Mail, href: '/accounts' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', icon: BarChart3, href: '/analytics' },
      { label: 'Chat with Data', icon: Sparkles, href: '/chat' },
      { label: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const email = user?.email || '';

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Zap size={20} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Kylst</span>
          <span className={styles.brandTag}>Email Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <div className={styles.navSectionTitle}>{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>
                    <Icon size={20} />
                  </span>
                  <span className={styles.navText}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userEmail}>{email}</div>
          </div>
          <button
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        {!collapsed && (
          <button
            onClick={signOut}
            className={styles.navItem}
            style={{ marginTop: 4, width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <span className={styles.navIcon}><LogOut size={18} /></span>
            <span className={styles.navText} style={{ color: 'var(--red)', fontSize: 'var(--font-sm)' }}>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
