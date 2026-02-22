'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  accent = 'accent1',
  miniData = [],
}) {
  const isPositive = change >= 0;
  const maxData = Math.max(...miniData, 1);

  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Icon size={22} />
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{isPositive ? '+' : ''}{change}%</span>
        <span style={{ color: 'var(--text-muted)' }}>{changeLabel}</span>
      </div>
      {miniData.length > 0 && (
        <div className={styles.miniChart}>
          {miniData.map((d, i) => (
            <div
              key={i}
              className={styles.miniBar}
              style={{ height: `${(d / maxData) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
