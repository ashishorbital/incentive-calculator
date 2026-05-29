import { useEffect, useState } from 'react';
import { Users, Car, IndianRupee, Layers } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { api } from '../../lib/api';
import { formatCurrency } from '../../components/ui';

/* ─── Styles ────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');

  .adm { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:20px; }

  /* Page header */
  .adm-header { display:flex; align-items:center; gap:12px; }
  .adm-header::before {
    content:''; display:block; width:4px; height:26px;
    background:#e10a1d; border-radius:2px; flex-shrink:0;
  }
  .adm-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; letter-spacing:-.3px; }

  /* Stat grid */
  .adm-stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:14px; }
  .adm-stat {
    background:#fff; border:1px solid #e8e8e8; border-radius:10px;
    padding:18px 20px; border-top:3px solid #e10a1d; display:flex; flex-direction:column; gap:12px;
  }
  .adm-stat-icon {
    width:36px; height:36px; background:#fff0f1; border-radius:8px;
    display:flex; align-items:center; justify-content:center; color:#e10a1d;
  }
  .adm-stat-val { font-size:28px; font-weight:800; color:#000; line-height:1; }
  .adm-stat-lbl { font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#787878; }

  /* Charts */
  .adm-chart-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; }
  .adm-card { background:#fff; border:1px solid #e8e8e8; border-radius:10px; padding:22px; }
  .adm-card-title {
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:#787878; margin-bottom:16px; display:flex; align-items:center; gap:8px;
  }
  .adm-card-title::before {
    content:''; display:inline-block; width:3px; height:13px;
    background:#e10a1d; border-radius:2px;
  }

  /* Top performers */
  .adm-perf-list { display:flex; flex-direction:column; gap:8px; }
  .adm-perf-item {
    display:flex; align-items:center; gap:12px;
    background:#f8f8f8; border-radius:8px; padding:10px 16px;
  }
  .adm-perf-rank {
    width:26px; height:26px; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; flex-shrink:0; color:#fff;
  }
  .adm-perf-rank.r1 { background:#e10a1d; }
  .adm-perf-rank.r2 { background:#787878; }
  .adm-perf-rank.r3 { background:#a0784a; }
  .adm-perf-rank.rn { background:#dbdbdb; color:#787878; }
  .adm-perf-name { flex:1; font-size:14px; font-weight:600; color:#212529; }
  .adm-perf-stats { font-size:13px; color:#787878; text-align:right; }
  .adm-perf-stats strong { color:#000; font-weight:700; }

  /* Loading */
  .adm-loading {
    display:flex; align-items:center; gap:12px;
    color:#787878; font-size:14px; padding:40px 0;
  }
  .adm-spin {
    width:20px; height:20px; border:2.5px solid #dbdbdb;
    border-top-color:#e10a1d; border-radius:50%;
    animation:spin .7s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Recharts overrides */
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line { stroke:#f0f0f0; }
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    border-radius:8px !important; border:1px solid #e8e8e8 !important;
    font-family:'Barlow',sans-serif !important; font-size:13px !important;
  }
`;

const rankClass = (i) => ['r1','r2','r3'][i] ?? 'rn';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <>
        <style>{css}</style>
        <div className="adm-loading">
          <div className="adm-spin" />
          Loading dashboard…
        </div>
      </>
    );
  }

  const { cards, trends, topPerformers } = data;

  const statDefs = [
    { label: 'Sales Officers',   value: cards.totalOfficers,                       icon: Users },
    { label: 'Total Cars Sold',  value: cards.totalCarsSold,                        icon: Car },
    { label: 'Incentives Paid',  value: formatCurrency(cards.totalIncentivesPaid),  icon: IndianRupee },
    { label: 'Active Slabs',     value: cards.activeSlabs,                          icon: Layers },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="adm">

        {/* Header */}
        <div className="adm-header">
          <h2>Admin Dashboard</h2>
        </div>

        {/* Stat cards */}
        <div className="adm-stat-grid">
          {statDefs.map(({ label, value, icon: Icon }) => (
            <div className="adm-stat" key={label}>
              <div className="adm-stat-icon"><Icon size={18} strokeWidth={2} /></div>
              <div className="adm-stat-val">{value}</div>
              <div className="adm-stat-lbl">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="adm-chart-grid">
          <div className="adm-card">
            <div className="adm-card-title">Monthly Sales Trend</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trends} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tickFormatter={(m) => m?.slice(0, 7)}
                  tick={{ fontSize: 11, fill: '#787878' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#787878' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8e8e8', fontFamily: 'Barlow, sans-serif', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="sales" stroke="#e10a1d" strokeWidth={2.5}
                  dot={{ fill: '#e10a1d', r: 3 }} name="Cars" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Incentive Trend</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trends} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(m) => m?.slice(0, 7)}
                  tick={{ fontSize: 11, fill: '#787878' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#787878' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e8e8e8', fontFamily: 'Barlow, sans-serif', fontSize: 13 }}
                />
                <Bar dataKey="incentives" fill="#212529" radius={[4, 4, 0, 0]} name="Incentive" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="adm-card">
          <div className="adm-card-title">Top Performers</div>
          <div className="adm-perf-list">
            {(topPerformers || []).map((p, i) => (
              <div className="adm-perf-item" key={p.officer_id}>
                <div className={`adm-perf-rank ${rankClass(i)}`}>{i + 1}</div>
                <div className="adm-perf-name">{p.users?.name || 'Officer'}</div>
                <div className="adm-perf-stats">
                  <strong>{p.total_sales}</strong> cars · {formatCurrency(p.total_incentive)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
