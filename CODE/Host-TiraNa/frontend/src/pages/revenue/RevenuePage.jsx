import { useState, useMemo } from 'react'
import '../../styles/revenue.css'
import {
  IconChart,
  IconMoney,
  IconWallet,
  IconArrowUp,
  IconArrowDown,
  IconDownload,
  IconBuilding,
  IconCalendar,
} from '../../components/icons'

/* ─── Mock data ───────────────────────────────────────────────── */

const PERIODS = ['This Month', 'Last 3 Months', 'Last 6 Months', 'Custom']

const MONTHLY_DATA = {
  'This Month': [
    { month: 'Jun', gross: 58400, net: 50888 },
  ],
  'Last 3 Months': [
    { month: 'Apr', gross: 42100, net: 36627 },
    { month: 'May', gross: 51800, net: 45066 },
    { month: 'Jun', gross: 58400, net: 50848 },
  ],
  'Last 6 Months': [
    { month: 'Jan', gross: 28900, net: 25143 },
    { month: 'Feb', gross: 34500, net: 30015 },
    { month: 'Mar', gross: 39200, net: 34104 },
    { month: 'Apr', gross: 42100, net: 36627 },
    { month: 'May', gross: 51800, net: 45066 },
    { month: 'Jun', gross: 58400, net: 50848 },
  ],
}

const COMMISSION_RATE = 0.13

const PROPERTIES = [
  { id: 1, name: 'Seafront Villa Batangas', type: 'Entire place', bookings: 14, gross: 82400, color: '#1B2A4A' },
  { id: 2, name: 'BGC Studio Loft', type: 'Private room', bookings: 27, gross: 61800, color: '#C9A84C' },
  { id: 3, name: 'Tagaytay Ridge Cabin', type: 'Entire place', bookings: 9, gross: 47500, color: '#16A34A' },
  { id: 4, name: 'Makati Executive Suite', type: 'Private room', bookings: 19, gross: 36200, color: '#DC2626' },
]

const PAYOUT_HISTORY = [
  {
    id: 1,
    date: 'Jun 15, 2025',
    amount: 48320,
    refs: 'BKG-1024, BKG-1019, BKG-1011',
    status: 'processed',
  },
  {
    id: 2,
    date: 'May 30, 2025',
    amount: 34870,
    refs: 'BKG-1007, BKG-0998',
    status: 'processed',
  },
  {
    id: 3,
    date: 'May 15, 2025',
    amount: 27400,
    refs: 'BKG-0991, BKG-0985, BKG-0978',
    status: 'processed',
  },
  {
    id: 4,
    date: 'Jun 28, 2025',
    amount: 21950,
    refs: 'BKG-1032, BKG-1030',
    status: 'pending',
  },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

const fmt = (n) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

function calcKPIs(period) {
  const data = MONTHLY_DATA[period] || MONTHLY_DATA['Last 6 Months']
  const gross = data.reduce((s, d) => s + d.gross, 0)
  const commission = Math.round(gross * COMMISSION_RATE)
  const net = gross - commission
  const bookings = PROPERTIES.reduce((s, p) => s + p.bookings, 0)
  const avg = bookings > 0 ? Math.round(gross / bookings) : 0
  return { gross, commission, net, avg }
}

/* ─── SVG bar chart (no external lib) ───────────────────────── */

function BarChart({ period, view }) {
  const data = MONTHLY_DATA[period] || MONTHLY_DATA['Last 6 Months']
  const W = 600; const H = 220; const PAD = { t: 12, r: 12, b: 40, l: 52 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b
  const maxVal = Math.max(...data.map(d => d.gross)) * 1.15
  const barW = Math.min(48, (chartW / data.length) * 0.55)
  const gap = chartW / data.length

  const yTicks = 4
  const yStep = Math.ceil(maxVal / yTicks / 10000) * 10000

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="rev-bar-chart"
      role="img"
      aria-label={`Revenue bar chart for ${period}`}
    >
      {/* Y-axis grid lines */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const val = i * yStep
        const y = PAD.t + chartH - (val / maxVal) * chartH
        return (
          <g key={i}>
            <line
              x1={PAD.l} y1={y} x2={PAD.l + chartW} y2={y}
              stroke="var(--color-border)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '4 3'}
            />
            <text
              x={PAD.l - 8} y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--color-text-muted)"
              fontFamily="var(--font-body)"
            >
              {val >= 1000 ? `₱${val / 1000}k` : `₱${val}`}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = PAD.l + gap * i + gap / 2
        const grossH = (d.gross / maxVal) * chartH
        const netH = (d.net / maxVal) * chartH
        const grossY = PAD.t + chartH - grossH
        const netY = PAD.t + chartH - netH

        return (
          <g key={d.month}>
            {/* Gross bar */}
            {(view === 'gross' || view === 'both') && (
              <rect
                x={cx - barW / 2 - (view === 'both' ? barW / 2 + 2 : 0)}
                y={grossY}
                width={barW}
                height={grossH}
                rx="4"
                fill="var(--color-primary)"
                opacity="0.85"
              />
            )}
            {/* Net bar */}
            {(view === 'net' || view === 'both') && (
              <rect
                x={cx - barW / 2 + (view === 'both' ? barW / 2 + 2 : 0)}
                y={netY}
                width={barW}
                height={netH}
                rx="4"
                fill="var(--color-success)"
                opacity="0.85"
              />
            )}
            {/* Month label */}
            <text
              x={cx} y={PAD.t + chartH + 20}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-secondary)"
              fontFamily="var(--font-body)"
              fontWeight="500"
            >
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Main component ─────────────────────────────────────────── */

export default function RevenuePage() {
  const [period, setPeriod] = useState('Last 6 Months')
  const [chartView, setChartView] = useState('both') // 'gross' | 'net' | 'both'

  const kpis = useMemo(() => calcKPIs(period), [period])
  const monthlyRows = MONTHLY_DATA[period] || MONTHLY_DATA['Last 6 Months']
  const totalPayouts = PAYOUT_HISTORY.filter(p => p.status === 'processed')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="rev-page">

      {/* ── Header ── */}
      <header className="rev-header">
        <div>
          <h1 className="rev-title">Revenue</h1>
          <p className="rev-subtitle">Track earnings, commissions, and payout history across all properties.</p>
        </div>

        {/* Period selector */}
        <div className="rev-period-bar">
          <div className="rev-period-tabs" role="tablist" aria-label="Period filter">
            {PERIODS.filter(p => p !== 'Custom').map(p => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                className={`rev-period-tab${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <section aria-label="Key performance indicators">
        <div className="rev-kpi-grid">
          <KpiCard
            label="Gross Revenue"
            value={fmt(kpis.gross)}
            delta="+12%"
            up
            icon={<IconMoney />}
            variant="gross"
            iconVariant="primary"
          />
          <KpiCard
            label="Platform Commission"
            value={fmt(kpis.commission)}
            sub={`${Math.round(COMMISSION_RATE * 100)}% rate`}
            icon={<IconChart />}
            variant="commission"
            iconVariant="danger"
          />
          <KpiCard
            label="Net Revenue"
            value={fmt(kpis.net)}
            delta="+11%"
            up
            icon={<IconWallet />}
            variant="net"
            iconVariant="success"
          />
          <KpiCard
            label="Avg per Booking"
            value={fmt(kpis.avg)}
            sub="across all stays"
            icon={<IconCalendar />}
            variant="avg"
            iconVariant="gold"
          />
        </div>
      </section>

      {/* ── Body grid splits at laptop ── */}
      <div className="rev-body-grid">

        {/* Left / Main column */}
        <div className="rev-body-main">

          {/* Chart */}
          <section className="rev-chart-card" aria-label="Revenue chart">
            <div className="rev-chart-head">
              <span className="rev-chart-title">Revenue Over Time</span>
              <div className="rev-chart-toggle" role="group" aria-label="Chart view">
                {[
                  { key: 'gross', label: 'Gross' },
                  { key: 'net', label: 'Net' },
                  { key: 'both', label: 'Both' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    className={`rev-chart-toggle-btn${chartView === opt.key ? ' active' : ''}`}
                    onClick={() => setChartView(opt.key)}
                    aria-pressed={chartView === opt.key}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rev-chart-body">
              <BarChart period={period} view={chartView} />
            </div>
            <div className="rev-chart-legend">
              {(chartView === 'gross' || chartView === 'both') && (
                <span className="rev-legend-item">
                  <span className="rev-legend-dot" style={{ background: 'var(--color-primary)' }} />
                  Gross Revenue
                </span>
              )}
              {(chartView === 'net' || chartView === 'both') && (
                <span className="rev-legend-item">
                  <span className="rev-legend-dot" style={{ background: 'var(--color-success)' }} />
                  Net Revenue
                </span>
              )}
            </div>
          </section>

          {/* Revenue by property */}
          <section className="rev-table-card" aria-label="Revenue by property">
            <div className="rev-table-head-row">
              <span className="rev-table-title">By Property</span>
              <button className="rev-export-btn" aria-label="Export property revenue as CSV">
                <IconDownload width={15} height={15} />
                Export CSV
              </button>
            </div>
            <div className="rev-table-wrapper">
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Bookings</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPERTIES.map(p => {
                    const comm = Math.round(p.gross * COMMISSION_RATE)
                    const net = p.gross - comm
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="rev-prop-cell">
                            <span className="rev-prop-dot" style={{ background: p.color }} />
                            <div>
                              <div className="rev-prop-name">{p.name}</div>
                              <div className="rev-prop-type">{p.type}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="rev-badge-bookings">{p.bookings}</span>
                        </td>
                        <td><span className="rev-amount-gross">{fmt(p.gross)}</span></td>
                        <td><span className="rev-amount-commission">−{fmt(comm)}</span></td>
                        <td><span className="rev-amount-net">{fmt(net)}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td style={{ textAlign: 'right' }}>
                      {PROPERTIES.reduce((s, p) => s + p.bookings, 0)}
                    </td>
                    <td>{fmt(PROPERTIES.reduce((s, p) => s + p.gross, 0))}</td>
                    <td style={{ color: 'var(--color-error)' }}>
                      −{fmt(Math.round(PROPERTIES.reduce((s, p) => s + p.gross, 0) * COMMISSION_RATE))}
                    </td>
                    <td style={{ color: 'var(--color-success)' }}>
                      {fmt(Math.round(PROPERTIES.reduce((s, p) => s + p.gross, 0) * (1 - COMMISSION_RATE)))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Monthly earnings report */}
          <section className="rev-earnings-card" aria-label="Monthly earnings report">
            <div className="rev-earnings-head">
              <span className="rev-earnings-title">Monthly Earnings Report</span>
              <div className="rev-export-group">
                <button className="rev-export-btn" aria-label="Export as CSV">
                  <IconDownload width={15} height={15} />
                  CSV
                </button>
                <button className="rev-export-btn" aria-label="Export as PDF">
                  <IconDownload width={15} height={15} />
                  PDF
                </button>
              </div>
            </div>
            <div className="rev-table-wrapper">
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {[...monthlyRows].reverse().map((row, i) => {
                    const bookingsEst = Math.round((row.gross / kpis.gross) * PROPERTIES.reduce((s, p) => s + p.bookings, 0))
                    const comm = Math.round(row.gross * COMMISSION_RATE)
                    const barWidth = Math.round((row.gross / Math.max(...monthlyRows.map(r => r.gross))) * 60)
                    return (
                      <tr key={i}>
                        <td>
                          <span className="rev-month-bar" style={{ width: barWidth }} aria-hidden="true" />
                          <strong>{row.month}</strong>
                        </td>
                        <td>{bookingsEst}</td>
                        <td>{fmt(row.gross)}</td>
                        <td style={{ color: 'var(--color-error)' }}>−{fmt(comm)}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{fmt(row.net)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right / Side column — payout history */}
        <div className="rev-body-side">
          <section className="rev-payout-card" aria-label="Payout history">
            <div className="rev-payout-head">
              <div>
                <div className="rev-payout-title">Payout History</div>
                <div className="rev-payout-total">
                  Total paid out: <strong>{fmt(totalPayouts)}</strong>
                </div>
              </div>
              <button className="rev-export-btn" aria-label="Export payout history">
                <IconDownload width={15} height={15} />
              </button>
            </div>
            <div className="rev-payout-list">
              {PAYOUT_HISTORY.map(p => (
                <div key={p.id} className="rev-payout-row">
                  <div className="rev-payout-icon-wrap" aria-hidden="true">
                    <IconWallet width={18} height={18} />
                  </div>
                  <div className="rev-payout-meta">
                    <div className="rev-payout-date">{p.date}</div>
                    <div className="rev-payout-refs">{p.refs}</div>
                  </div>
                  <div className="rev-payout-right">
                    <span className="rev-payout-amount">{fmt(p.amount)}</span>
                    <span className={`rev-status-badge rev-status-badge--${p.status}`}>
                      <span className="rev-status-dot" aria-hidden="true" />
                      {p.status === 'processed' ? 'Processed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Commission breakdown info card */}
          <div
            className="rev-chart-card"
            style={{ padding: 'var(--space-5)' }}
            aria-label="Commission breakdown"
          >
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div className="rev-chart-title" style={{ marginBottom: 4 }}>Commission Breakdown</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Platform fee applied per booking
              </div>
            </div>
            <CommissionDonut rate={COMMISSION_RATE} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {[
                { label: 'Your Net Share', pct: Math.round((1 - COMMISSION_RATE) * 100), color: 'var(--color-primary)' },
                { label: 'Platform Commission', pct: Math.round(COMMISSION_RATE * 100), color: 'var(--color-error)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="rev-legend-dot" style={{ background: item.color, width: 10, height: 10 }} />
                  <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{item.pct}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────── */

function KpiCard({ label, value, delta, up, sub, icon, variant, iconVariant }) {
  return (
    <article className={`rev-kpi-card rev-kpi-card--${variant}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`rev-kpi-icon rev-kpi-icon--${iconVariant}`} aria-hidden="true">
          {icon}
        </span>
        {delta && (
          <span className={`rev-kpi-delta rev-kpi-delta--${up ? 'up' : 'down'}`}>
            {up
              ? <IconArrowUp width={10} height={10} />
              : <IconArrowDown width={10} height={10} />
            }
            {delta}
          </span>
        )}
      </div>
      <div>
        <div className="rev-kpi-label">{label}</div>
        <div className="rev-kpi-value">{value}</div>
        {sub && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 3 }}>{sub}</div>
        )}
      </div>
    </article>
  )
}

function CommissionDonut({ rate }) {
  const r = 52; const cx = 64; const cy = 64
  const circ = 2 * Math.PI * r
  const hostArc = circ * (1 - rate)
  const commArc = circ * rate

  return (
    <svg viewBox="0 0 128 128" width="120" height="120" style={{ display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* Host share */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="18"
        strokeDasharray={`${hostArc} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="butt"
      />
      {/* Commission share */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-error)"
        strokeWidth="18"
        strokeDasharray={`${commArc} ${circ}`}
        strokeDashoffset={circ * 0.25 - hostArc}
        strokeLinecap="butt"
        opacity="0.7"
      />
      {/* Center label */}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--color-text-primary)" fontFamily="var(--font-heading)">
        {Math.round((1 - rate) * 100)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-body)">
        your share
      </text>
    </svg>
  )
}