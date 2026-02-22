'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Plus } from 'lucide-react';
import styles from './TopBar.module.css';

const pageTitles = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'New Campaign',
  '/warmup': 'Warm-Up',
  '/leads': 'Leads',
  '/accounts': 'Email Accounts',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function TopBar({ collapsed }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <header className={`${styles.topbar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.leftSection}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search campaigns, leads..."
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.notifBtn} aria-label="Notifications">
          <Bell size={20} />
          <span className={styles.notifBadge}></span>
        </button>
        <Link href="/campaigns/new" className={styles.newCampaignBtn}>
          <Plus size={16} />
          New Campaign
        </Link>
      </div>
    </header>
  );
}
