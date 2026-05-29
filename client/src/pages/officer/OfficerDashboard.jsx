import { Link } from 'react-router-dom';
import { ShoppingCart, Calculator, History, ArrowRight } from 'lucide-react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  .od { font-family:'Barlow',sans-serif; display:flex; flex-direction:column; gap:24px; }

  .od-header { display:flex; align-items:center; gap:12px; }
  .od-header::before { content:''; display:block; width:4px; height:26px; background:#e10a1d; border-radius:2px; }
  .od-header h2 { font-size:22px; font-weight:800; color:#000; margin:0; }

  /* Welcome banner */
  .od-banner {
    background:#000; border-radius:12px; padding:32px 36px;
    display:flex; align-items:center; justify-content:space-between;
    position:relative; overflow:hidden;
  }
  .od-banner::before {
    content:'';
    position:absolute; inset:0;
    background: radial-gradient(ellipse 50% 80% at 90% 50%, rgba(225,10,29,.25) 0%, transparent 70%);
    pointer-events:none;
  }
  .od-banner::after {
    content:'';
    position:absolute; inset:0;
    background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size:30px 30px;
    pointer-events:none;
  }
  .od-banner-text { position:relative; z-index:1; }
  .od-banner-eyebrow { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#e10a1d; margin-bottom:10px; }
  .od-banner-title { font-size:30px; font-weight:800; color:#fff; line-height:1.1; margin-bottom:10px; }
  .od-banner-sub { font-size:14px; color:#787878; max-width:360px; line-height:1.6; }
  .od-banner-logo { position:relative; z-index:1; opacity:.15; }

  /* Nav cards */
  .od-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }

  .od-nav-card {
    background:#fff; border:1.5px solid #e8e8e8; border-radius:12px;
    padding:24px 22px; text-decoration:none; display:flex; flex-direction:column; gap:16px;
    transition:all .2s; cursor:pointer; position:relative; overflow:hidden;
  }
  .od-nav-card::before {
    content:''; position:absolute; top:0; left:0; right:0;
    height:3px; background:#e8e8e8; transition:background .2s;
  }
  .od-nav-card:hover { border-color:#e10a1d; transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.1); }
  .od-nav-card:hover::before { background:#e10a1d; }

  .od-nav-icon {
    width:46px; height:46px; border-radius:10px; background:#f8f8f8;
    display:flex; align-items:center; justify-content:center;
    color:#787878; transition:all .2s;
  }
  .od-nav-card:hover .od-nav-icon { background:#fff0f1; color:#e10a1d; }

  .od-nav-label { font-size:16px; font-weight:700; color:#000; }
  .od-nav-desc { font-size:13px; color:#787878; line-height:1.5; margin-top:2px; }

  .od-nav-footer {
    display:flex; align-items:center; gap:6px;
    font-size:12px; font-weight:700; color:#787878; letter-spacing:.5px;
    text-transform:uppercase; margin-top:auto;
    transition:color .2s;
  }
  .od-nav-card:hover .od-nav-footer { color:#e10a1d; }

  /* Quick stats strip */
  .od-strip {
    background:#fff; border:1px solid #e8e8e8; border-radius:10px;
    padding:16px 22px; display:flex; gap:0; overflow:hidden;
  }
  .od-strip-item {
    flex:1; display:flex; flex-direction:column; gap:4px;
    padding:0 20px; border-right:1px solid #f0f0f0;
  }
  .od-strip-item:first-child { padding-left:0; }
  .od-strip-item:last-child { border-right:none; }
  .od-strip-label { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#787878; }
  .od-strip-val { font-size:20px; font-weight:800; color:#000; }
  .od-strip-val.red { color:#e10a1d; }
`;

const links = [
  {
    to: '/officer/sales',
    label: 'Monthly Sales Entry',
    desc: 'Add car sales, save drafts and submit monthly entries',
    icon: ShoppingCart,
    cta: 'Enter Sales',
  },
  {
    to: '/officer/calculator',
    label: 'Incentive Calculator',
    desc: 'Preview your real-time incentive based on current slabs',
    icon: Calculator,
    cta: 'Calculate Now',
  },
  {
    to: '/officer/history',
    label: 'Earnings History',
    desc: 'View past months, slabs applied and total payouts',
    icon: History,
    cta: 'View History',
  },
];

export default function OfficerDashboard() {
  return (
    <>
      <style>{css}</style>
      <div className="od">

        <div className="od-header"><h2>Sales Officer Dashboard</h2></div>

        {/* Hero banner */}
        <div className="od-banner">
          <div className="od-banner-text">
            <div className="od-banner-eyebrow">Toyota · Nippon Division</div>
            <div className="od-banner-title">Track. Sell.<br />Earn More.</div>
            <div className="od-banner-sub">
              Submit your monthly sales, check your incentive slab in real-time,
              and review your full earnings history — all in one place.
            </div>
          </div>
          <svg className="od-banner-logo" width="120" height="80" viewBox="0 0 120 80" fill="none">
            <ellipse cx="60" cy="40" rx="58" ry="37" stroke="white" strokeWidth="6"/>
            <ellipse cx="60" cy="40" rx="58" ry="13" stroke="white" strokeWidth="6"/>
            <line x1="2" y1="40" x2="118" y2="40" stroke="black" strokeWidth="10"/>
          </svg>
        </div>

        {/* Nav cards */}
        <div className="od-cards">
          {links.map(({ to, label, desc, icon: Icon, cta }) => (
            <Link key={to} to={to} className="od-nav-card">
              <div className="od-nav-icon"><Icon size={22} strokeWidth={1.8} /></div>
              <div>
                <div className="od-nav-label">{label}</div>
                <div className="od-nav-desc">{desc}</div>
              </div>
              <div className="od-nav-footer">
                {cta} <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}
