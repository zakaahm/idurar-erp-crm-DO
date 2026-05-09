import { useEffect, useState } from 'react';
import { Select, Spin, Alert } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  RiseOutlined, TeamOutlined, DollarOutlined,
  FallOutlined, FireOutlined, UserOutlined,
  TrophyOutlined, CalendarOutlined,
} from '@ant-design/icons';

import {
  currencyFormatter, emptyDashboardData, getDashboardData,
  MONTH_NAMES, pct,
} from './config';

/* ─── palette ─────────────────────────────────────────────────────────────── */
const C = {
  bg:         '#f8fafc',
  white:      '#ffffff',
  border:     '#e8eaf0',
  ink:        '#111827',
  sub:        '#6b7280',
  dim:        '#d1d5db',
  blue:       '#3b82f6',  blueSoft:   '#eff6ff',
  green:      '#10b981',  greenSoft:  '#ecfdf5',
  amber:      '#f59e0b',  amberSoft:  '#fffbeb',
  red:        '#ef4444',  redSoft:    '#fef2f2',
  violet:     '#8b5cf6',  violetSoft: '#f5f3ff',
  teal:       '#14b8a6',  tealSoft:   '#f0fdfa',
  font: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
};

const MEDALS        = ['#f59e0b', '#9ca3af', '#b45309'];
const STATUS_COLORS = [C.blue, C.green, C.amber, C.red, C.violet, C.teal];

/* ─── layout ─────────────────────────────────────────────────────────────── */
const S = {
  shell:  { display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:C.white, fontFamily:C.font, color:C.ink },
  header: { flexShrink:0, background:C.white, borderBottom:`1px solid ${C.border}`, padding:'0 28px', display:'flex', alignItems:'center', height:62, gap:16 },
  scroll: { flex:1, overflowY:'auto', padding:'24px 28px 48px', background:C.white },
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const now   = new Date();
const CY    = now.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i);

// Get the logged-in user's ID from localStorage
const getMyId = () => {
  try {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth)?.current?._id : null;
  } catch { return null; }
};

function Pill({ label, active, onClick, color = C.blue }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:700,
      cursor:'pointer', transition:'all .14s', whiteSpace:'nowrap',
      border:`1.5px solid ${active ? color : C.border}`,
      background: active ? color : C.white,
      color: active ? '#fff' : C.sub,
    }}>{label}</button>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'28px 0 20px' }}>
      <div style={{ flex:1, height:1, background:C.border }} />
      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', color:C.sub, whiteSpace:'nowrap' }}>{label}</div>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}

function Card({ children, style, accent }) {
  return (
    <div style={{
      background:C.white, border:`1px solid ${C.border}`, borderRadius:18,
      padding:'20px 22px', boxShadow:'0 1px 6px rgba(0,0,0,.04)',
      ...(accent ? { borderTop:`4px solid ${accent}` } : {}),
      ...style,
    }}>{children}</div>
  );
}

function SecLabel({ children, style }) {
  return <div style={{ fontSize:11, fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', color:C.sub, marginBottom:14, ...style }}>{children}</div>;
}

/* ─── KPI tile ────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, bg, icon, delay=0 }) {
  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
      <div style={{ background:bg, border:`1px solid ${color}22`, borderRadius:18, padding:'18px 20px', boxShadow:`0 2px 12px ${color}14` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:'.7px', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:28, fontWeight:900, color:C.ink, lineHeight:1 }}>{value}</div>
            {sub && <div style={{ fontSize:12, color:C.sub, marginTop:6 }}>{sub}</div>}
          </div>
          <div style={{ width:42, height:42, borderRadius:12, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Top performers podium ───────────────────────────────────────────────── */
function TopCard({ title, performers=[], valueKey, formatter, color, icon, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
      <Card style={{ height:'100%' }} accent={color}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color }}>{icon}</div>
          <SecLabel style={{ marginBottom:0 }}>{title}</SecLabel>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {performers.length === 0 && <div style={{ color:C.sub, fontSize:13 }}>Geen data beschikbaar</div>}
          {performers.slice(0,5).map((p, i) => {
            const val  = p[valueKey] ?? 0;
            const max  = performers[0]?.[valueKey] ?? 1;
            const barW = max > 0 ? (val / max) * 100 : 0;
            const col  = i < 3 ? MEDALS[i] : C.dim;
            return (
              <div key={p.userId ?? i}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:col+'28', color:col, fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                    </div>
                    <span style={{ fontWeight:700, fontSize:13 }}>{p.name}</span>
                  </div>
                  <span style={{ fontWeight:800, fontSize:14, color }}>{formatter ? formatter(val) : val}</span>
                </div>
                <div style={{ height:5, background:C.bg, borderRadius:99 }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${barW}%` }}
                    transition={{ duration:.6, delay: delay + i * 0.06 }}
                    style={{ height:'100%', background:color, borderRadius:99 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

/* ─── Chart tooltip ───────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 16px', boxShadow:'0 4px 20px rgba(0,0,0,.1)', fontSize:12 }}>
      <div style={{ fontWeight:700, marginBottom:4, color:C.ink }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color??C.blue, fontWeight:700 }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

/* ─── Own stats section — medewerker view only ────────────────────────────── */
function OwnStatsSection({ own, leadsByStatus }) {
  const ownConv = pct(own.totalSales ?? 0, own.totalLeads ?? 0);

  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:12, marginBottom:24 }}>
        <KpiCard delay={0}   label="Mijn leads aangebracht" value={own.totalLeads ?? 0} icon={<UserOutlined />}  color={C.violet} bg={C.violetSoft} sub={`${own.openLeads ?? 0} nog open`} />
        <KpiCard delay={.05} label="Open leads"             value={own.openLeads  ?? 0} icon={<TeamOutlined />}  color={C.blue}   bg={C.blueSoft}   sub="In behandeling" />
        <KpiCard delay={.1}  label="Klanten afgesloten"     value={own.totalSales ?? 0} icon={<FireOutlined />}  color={C.green}  bg={C.greenSoft}  sub="Door mij gesloten" />
        <KpiCard delay={.15} label="Verloren leads"         value={own.lostLeads  ?? 0} icon={<FallOutlined />}  color={C.red}    bg={C.redSoft}    sub="closed_lost" />
        <KpiCard delay={.2}  label="Mijn omzet"             value={currencyFormatter(own.totalRevenue ?? 0)} icon={<DollarOutlined />} color={C.teal} bg={C.tealSoft} sub="Betaalde offertes" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Card>
          <SecLabel>Mijn leads per status</SecLabel>
          <div style={{ height:210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStatus ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize:10, fill:C.sub }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:C.sub }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="total" name="Leads" radius={[6,6,0,0]}>
                  {(leadsByStatus??[]).map((_,i) => <Cell key={i} fill={STATUS_COLORS[i%STATUS_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SecLabel>Mijn prestatie</SecLabel>
          <div style={{ padding:'8px 0', display:'flex', flexDirection:'column', gap:24 }}>
            {[
              { label:'Afgeronde leads',                       val: pct((own.totalSales??0)+(own.lostLeads??0), own.totalLeads??0), color:C.blue  },
              { label:'Conversie (mijn leads → mijn klanten)', val: ownConv,                                                        color:C.green },
              { label:'Verlies %',                             val: pct(own.lostLeads??0, own.totalLeads??0),                       color:C.red   },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, fontSize:13 }}>
                  <span style={{ color:C.sub, fontWeight:600 }}>{row.label}</span>
                  <span style={{ color:row.color, fontWeight:800 }}>{row.val}%</span>
                </div>
                <div style={{ height:7, background:C.bg, borderRadius:99, border:`1px solid ${C.border}` }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${row.val}%` }}
                    transition={{ duration:.6 }}
                    style={{ height:'100%', background:row.color, borderRadius:99 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [data, setData]           = useState(emptyDashboardData);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [userId, setUserId]       = useState(undefined);
  const [month, setMonth]         = useState(undefined);
  const [year, setYear]           = useState(undefined);
  const [sortBy, setSortBy]       = useState('totalSales');
  const [focusUser, setFocusUser] = useState(null);

  const myId = getMyId();

  const { isOwner, isManager } = data.permissions ?? {};
  const isPrivileged = isOwner || isManager;

  const load = async (f = {}) => {
    try { setLoading(true); setError(''); setData(await getDashboardData(f)); }
    catch { setError('Dashboard kon niet geladen worden.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const buildFilters = (overrides = {}) => {
    const base = {};
    if (userId) base.userId = userId;
    if (month)  base.month  = month;
    if (year)   base.year   = year;
    return { ...base, ...overrides };
  };

  const handleUser  = (v) => { setUserId(v); load({ ...buildFilters(), userId: v ?? undefined }); };
  const handleMonth = (v) => { setMonth(v);  load({ ...buildFilters(), month:  v ?? undefined }); };
  const handleYear  = (v) => { setYear(v);   load({ ...buildFilters(), year:   v ?? undefined }); };
  const clearTime   = ()  => { setMonth(undefined); setYear(undefined); load({ ...(userId ? { userId } : {}) }); };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:C.white }}>
      <Spin size="large" />
    </div>
  );
  if (error) return (
    <div style={{ padding:28, background:C.white, minHeight:'100vh' }}>
      <Alert type="error" message={error} showIcon />
    </div>
  );

  /* ── derived ── */
  const perf       = data.sales.salesPerformance ?? [];
  const own        = data.sales.ownStats ?? {};
  const globalConv = data.sales.globalConversionRate ?? 0;

  const totalRevenue = data.revenue.summary.totalRevenue        ?? 0;
  const avgInvoice   = data.revenue.summary.averageInvoiceValue ?? 0;
  const totalInv     = data.revenue.summary.totalInvoices       ?? 0;
  const totalLeads       = data.leads.totalLeads        ?? 0;
  const openLeads        = data.leads.openLeads         ?? 0;
  const lostLeads        = data.leads.lostLeads         ?? 0;
  const totalSales       = data.sales.totalSales        ?? 0;
  const totalConversions = data.sales.totalConversions  ?? 0;

  // Top performers
  const topByLeads   = [...perf].sort((a,b) => (b.totalLeads   ?? 0) - (a.totalLeads   ?? 0));
  const topBySales   = [...perf].sort((a,b) => (b.totalSales   ?? 0) - (a.totalSales   ?? 0));
  const topByRevenue = [...perf].sort((a,b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));

  // Leaderboard
  const sortedPerf  = [...perf].sort((a,b) => {
    if (sortBy === 'totalRevenue') return (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0);
    if (sortBy === 'totalLeads')   return (b.totalLeads   ?? 0) - (a.totalLeads   ?? 0);
    return (b.totalSales ?? 0) - (a.totalSales ?? 0);
  });
  const metricNum   = (p) => sortBy==='totalRevenue' ? (p.totalRevenue??0) : sortBy==='totalLeads' ? (p.totalLeads??0) : (p.totalSales??0);
  const metricLabel = (p) => sortBy==='totalRevenue' ? currencyFormatter(metricNum(p)) : metricNum(p);
  const maxMetric   = Math.max(...sortedPerf.map(metricNum), 1);

  const periodLabel = month && year
    ? `${MONTH_NAMES[month-1]} ${year}`
    : year  ? `${year}`
    : month ? MONTH_NAMES[month-1]
    : 'Alle periodes';

  // Users dropdown: replace the logged-in user's entry with "Mijn statistieken"
  const userOptions = (data.leads.users ?? []).map(u => ({
    label: String(u._id) === String(myId) ? '⭐ Mijn statistieken' : `${u.name} (${u.role})`,
    value: u._id,
  }));

  /* ── shared time filter bar ── */
  const TimeFilter = () => (
    <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, flexWrap:'wrap' }}>
      <CalendarOutlined style={{ color:C.sub, fontSize:14 }} />
      <Pill label="Alle" active={!month && !year} onClick={clearTime} color={C.violet} />
      {YEARS.map(y => (
        <Pill key={y} label={String(y)} active={year===y && !month}
          onClick={() => { setYear(y); setMonth(undefined); load({ ...buildFilters(), year:y, month:undefined }); }}
          color={C.blue}
        />
      ))}
      <Select allowClear placeholder="Maand" value={month} onChange={handleMonth} style={{ width:130 }}
        options={MONTH_NAMES.map((m,i) => ({ label:m, value:i+1 }))} />
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     OWNER / ADMIN VIEW
  ══════════════════════════════════════════════════════════════════════════ */
  if (isPrivileged) return (
    <div style={S.shell}>
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:10, paddingRight:20, borderRight:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${C.blue},${C.violet})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <TrophyOutlined style={{ color:'#fff', fontSize:16 }} />
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:15, lineHeight:1, letterSpacing:'-.3px' }}>Dashboard</div>
            <div style={{ fontSize:11, color:C.sub }}>{periodLabel}</div>
          </div>
        </div>

        <TimeFilter />

        <Select
          allowClear
          placeholder="Medewerker"
          value={userId}
          onChange={handleUser}
          style={{ width:220, flexShrink:0 }}
          options={userOptions}
        />
      </div>

      <div style={S.scroll}>

        {/* ══ SECTIE 1: GLOBALE BEDRIJFSCIJFERS ══ */}
        <Divider label="Bedrijfsprestaties — totaaloverzicht" />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px,1fr))', gap:12, marginBottom:28 }}>
          <KpiCard delay={0}   label="Totale omzet"          value={currencyFormatter(totalRevenue)} icon={<DollarOutlined />} color={C.green}  bg={C.greenSoft}  sub={`${totalInv} betaalde offertes`} />
          <KpiCard delay={.05} label="Gem. factuurwaarde"    value={currencyFormatter(avgInvoice)}   icon={<RiseOutlined />}   color={C.blue}   bg={C.blueSoft}   sub="Per offerte" />
          <KpiCard delay={.1}  label="Leads aangebracht"     value={totalLeads}                      icon={<TeamOutlined />}   color={C.violet} bg={C.violetSoft} sub={`${openLeads} open · ${lostLeads} verloren`} />
          <KpiCard delay={.15} label="Klanten afgesloten"    value={totalSales}                      icon={<FireOutlined />}   color={C.amber}  bg={C.amberSoft}  sub={`${data.sales.totalSalesUsers ?? 0} closers actief`} />
          <KpiCard delay={.2}  label="Conversies lead→klant" value={totalConversions}                icon={<RiseOutlined />}   color={globalConv>=30?C.green:C.red} bg={globalConv>=30?C.greenSoft:C.redSoft} sub={`${globalConv}% van alle leads`} />
          <KpiCard delay={.25} label="Verloren leads"        value={lostLeads}                       icon={<FallOutlined />}   color={C.red}    bg={C.redSoft}    sub={`${pct(lostLeads,totalLeads)}% van totaal`} />
        </div>

        {/* Top performers */}
        <SecLabel>🏆 Top performers</SecLabel>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
          <TopCard title="Meeste leads aangebracht" performers={topByLeads}   valueKey="totalLeads"   color={C.violet} icon={<TeamOutlined />}   delay={.05} />
          <TopCard title="Meeste klanten gesloten"  performers={topBySales}   valueKey="totalSales"   color={C.amber}  icon={<FireOutlined />}   delay={.1}  />
          <TopCard title="Hoogste omzet gemaakt"    performers={topByRevenue} valueKey="totalRevenue" color={C.green}  icon={<DollarOutlined />} delay={.15} formatter={currencyFormatter} />
        </div>

        {/* Charts */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:14, marginBottom:28 }}>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.2 }}>
            <Card>
              <SecLabel>Omzet per maand</SecLabel>
              <div style={{ height:220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue.revenueByMonth}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={C.blue} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize:10, fill:C.sub }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v=>`€${Math.round(v/1000)}k`} tick={{ fontSize:10, fill:C.sub }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip formatter={v=>currencyFormatter(v)} />} />
                    <Area type="monotone" dataKey="revenue" name="Omzet" stroke={C.blue} strokeWidth={3} fill="url(#revGrad)" dot={{ r:3, fill:C.blue }} activeDot={{ r:6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.25 }}>
            <Card>
              <SecLabel>Leads per status</SecLabel>
              <div style={{ height:220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leads.leadsByStatus??[]} layout="vertical">
                    <XAxis type="number" tick={{ fontSize:10, fill:C.sub }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="status" tick={{ fontSize:11, fill:C.sub }} axisLine={false} tickLine={false} width={92} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="total" name="Leads" radius={[0,6,6,0]}>
                      {(data.leads.leadsByStatus??[]).map((_,i)=><Cell key={i} fill={STATUS_COLORS[i%STATUS_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Full leaderboard */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}>
          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <SecLabel style={{ marginBottom:0 }}>Alle medewerkers</SecLabel>
              <div style={{ display:'flex', gap:6 }}>
                {[['totalSales','Klanten'],['totalLeads','Leads'],['totalRevenue','Omzet']].map(([k,lbl]) => (
                  <button key={k} onClick={()=>setSortBy(k)} style={{
                    padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer',
                    border:`1.5px solid ${sortBy===k?C.blue:C.border}`,
                    background: sortBy===k?C.blue:C.white,
                    color: sortBy===k?'#fff':C.sub, transition:'all .14s',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'28px 36px 1fr 100px', gap:12, padding:'0 12px 8px', fontSize:10, fontWeight:800, color:C.sub, textTransform:'uppercase', letterSpacing:'.8px', borderBottom:`1px solid ${C.border}`, marginBottom:6 }}>
              <div>#</div><div></div><div>Naam</div>
              <div style={{ textAlign:'right' }}>{sortBy==='totalSales'?'Klanten':sortBy==='totalLeads'?'Leads':'Omzet'}</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              <AnimatePresence mode="popLayout">
                {sortedPerf.map((p,i) => {
                  const col    = i<3 ? MEDALS[i] : C.sub;
                  const barW   = maxMetric > 0 ? (metricNum(p)/maxMetric)*100 : 0;
                  const active = focusUser === String(p.userId);
                  const isMe   = String(p.userId) === String(myId);
                  return (
                    <motion.div key={String(p.userId)} layout
                      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      transition={{ delay: i*0.03 }}
                      onClick={() => setFocusUser(prev => prev===String(p.userId) ? null : String(p.userId))}
                      style={{
                        display:'grid', gridTemplateColumns:'28px 36px 1fr 100px',
                        alignItems:'center', gap:12,
                        padding:'9px 12px', borderRadius:12, cursor:'pointer',
                        background: active ? C.blueSoft : 'transparent',
                        border:`1px solid ${active?C.blue+'40':'transparent'}`,
                        transition:'all .15s',
                      }}
                    >
                      <div style={{ fontSize:13, textAlign:'center' }}>
                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':<span style={{ color:C.sub, fontWeight:700 }}>{i+1}</span>}
                      </div>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:col+'22', color:col, fontWeight:800, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {p.name?.charAt(0)?.toUpperCase()||'?'}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
                          {p.name}
                          {isMe && (
                            <span style={{ marginLeft:6, fontSize:10, fontWeight:700, color:C.blue, background:C.blueSoft, borderRadius:99, padding:'1px 8px' }}>jij</span>
                          )}
                        </div>
                        <div style={{ height:4, background:C.bg, borderRadius:99 }}>
                          <div style={{ height:'100%', width:`${barW}%`, background:col, borderRadius:99, transition:'width .5s' }} />
                        </div>
                      </div>
                      <div style={{ fontWeight:800, fontSize:14, color:col, textAlign:'right' }}>
                        {metricLabel(p)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Expandable detail */}
            <AnimatePresence>
              {focusUser && (() => {
                const p = perf.find(x => String(x.userId) === focusUser);
                if (!p) return null;
                const stats = [
                  { label:'Leads aangebracht', val: p.totalLeads,                         color:C.violet },
                  { label:'Open leads',         val: p.openLeads,                          color:C.blue   },
                  { label:'Verloren leads',     val: p.lostLeads,                          color:C.red    },
                  { label:'Klanten gesloten',   val: p.totalSales,                         color:C.amber  },
                  { label:'Omzet gemaakt',      val: currencyFormatter(p.totalRevenue??0), color:C.green  },
                ];
                return (
                  <motion.div key="detail"
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    style={{ overflow:'hidden' }}
                  >
                    <div style={{ marginTop:14, padding:'18px 20px', background:C.bg, borderRadius:14, border:`1px solid ${C.border}`, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, textAlign:'center' }}>
                      {stats.map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.val}</div>
                          <div style={{ fontSize:11, color:C.sub, marginTop:3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </Card>
        </motion.div>

      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     MEDEWERKER VIEW — enkel eigen cijfers
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={S.shell}>
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:10, paddingRight:20, borderRight:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${C.blue},${C.violet})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <UserOutlined style={{ color:'#fff', fontSize:15 }} />
          </div>
          <div>
            <div style={{ fontWeight:900, fontSize:15, lineHeight:1 }}>Mijn dashboard</div>
            <div style={{ fontSize:11, color:C.sub }}>Persoonlijke resultaten · {periodLabel}</div>
          </div>
        </div>
        <TimeFilter />
      </div>

      <div style={S.scroll}>
        <OwnStatsSection
          own={own}
          leadsByStatus={data.leads.leadsByStatus}
        />
      </div>
    </div>
  );
}