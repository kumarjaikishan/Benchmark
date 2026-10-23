import { HistoryIcon, TrashIcon } from "./Icons";
import { formatNumber } from "../utils/benchmarkUtils";

export default function HistoryList({ history, onSelectRun, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <section className="history-section">
      <div className="history-card">
        <div className="history-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <HistoryIcon />
            <h3>Recent Benchmark Runs</h3>
          </div>
          <button className="toggle-btn-clean" onClick={onClearHistory}>
            <span style={{ verticalAlign: "middle", marginRight: 4, display: "inline-flex" }}>
              <TrashIcon />
            </span>
            Clear
          </button>
        </div>
        <div>
          {history.map((item, i) => (
            <div key={i} className="history-item" onClick={() => onSelectRun(item.fullData)}>
              <div>
                <span style={{ fontSize: "0.78rem", color: "#64748b", marginRight: "10px" }}>{item.timestamp}</span>
                {item.method && (
                  <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700, marginRight: "8px" }}>
                    {item.method}
                  </span>
                )}
                <strong style={{ color: "#f8fafc", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>{item.url}</strong>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "#cbd5e1" }}>
                <span>⚡ {formatNumber(item.reqSec, 1)} req/s</span>
                <span>⏱️ {formatNumber(item.latency, 1)} ms</span>
                <span style={{ color: "#818cf8" }}>View ➜</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
