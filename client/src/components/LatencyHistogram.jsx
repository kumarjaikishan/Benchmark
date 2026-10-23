import { TimerIcon } from "./Icons";
import { formatNumber } from "../utils/benchmarkUtils";

export default function LatencyHistogram({ latency }) {
  const p99Val = Number(latency?.p99 || latency?.max || 1);

  const percentiles = [
    { label: "p50 (Median)", val: latency?.p50 },
    { label: "p75", val: latency?.p75 },
    { label: "p90", val: latency?.p90 },
    { label: "p99 (Tail)", val: latency?.p99 },
  ];

  return (
    <div className="histogram-card">
      <div className="histogram-title">
        <TimerIcon />
        Latency Percentile Distribution (ms)
      </div>
      {percentiles.map(({ label, val }) => {
        const num = Number(val || 0);
        const pct = p99Val > 0 ? Math.min(100, Math.max(8, (num / p99Val) * 100)) : 0;
        return (
          <div key={label} className="histogram-bar-row">
            <span style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 600 }}>{label}</span>
            <div className="histogram-bar-track">
              <div className="histogram-bar-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#f8fafc", textAlign: "right" }}>
              {formatNumber(num, 1)} ms
            </span>
          </div>
        );
      })}
    </div>
  );
}
