import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  DownloadIcon,
  BoltIcon,
  SpeedIcon,
  TimerIcon,
  StorageIcon,
} from "./Icons";
import LatencyHistogram from "./LatencyHistogram";
import {
  formatNumber,
  formatBytes,
  metricEntries,
  calculateGrade,
} from "../utils/benchmarkUtils";

export default function ResultsDashboard({
  results,
  method,
  connections,
  duration,
  pinnedResult,
  onPinResult,
  onClearPin,
  onExportJSON,
  onExportCSV,
  resultsRef,
}) {
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllLatency, setShowAllLatency] = useState(false);
  const [showAllThroughput, setShowAllThroughput] = useState(false);

  const requestsEntries = useMemo(
    () => metricEntries(results?.requests, showAllRequests),
    [results, showAllRequests]
  );
  const latencyEntries = useMemo(
    () => metricEntries(results?.latency, showAllLatency),
    [results, showAllLatency]
  );
  const throughputEntries = useMemo(
    () => metricEntries(results?.throughput, showAllThroughput),
    [results, showAllThroughput]
  );
  const healthGrade = useMemo(() => calculateGrade(results), [results]);

  if (!results) return null;

  return (
    <section className="glass-panel" ref={resultsRef}>
      <div className="results-header-card">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className={`health-grade-badge grade-${healthGrade.grade}`}>
            {healthGrade.grade}
          </div>
          <div>
            <div className="target-badge-url">
              <CheckCircleIcon />
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                [{results.method || method}]
              </span>
              {results.url}
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
              Status: <strong style={{ color: "#f8fafc" }}>{healthGrade.text}</strong>
            </p>
          </div>
        </div>

        <div className="benchmark-stats-pills">
          <span className="pill pill-duration">⏱️ {formatNumber(results.duration, 1)}s runtime</span>
          <span className="pill pill-connections">⚡ {connections} connections</span>
          <button
            className="toggle-btn-clean"
            onClick={onPinResult}
            title="Pin this result to compare with next run"
          >
            📌 Pin Compare
          </button>
          <button className="toggle-btn-clean" onClick={onExportJSON} title="Export JSON Report">
            <span style={{ verticalAlign: "middle", marginRight: 4, display: "inline-flex" }}>
              <DownloadIcon />
            </span>
            JSON
          </button>
          <button className="toggle-btn-clean" onClick={onExportCSV} title="Export CSV Spreadsheet">
            <span style={{ verticalAlign: "middle", marginRight: 4, display: "inline-flex" }}>
              <DownloadIcon />
            </span>
            CSV
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Container (when pinned) */}
      {pinnedResult && (
        <div className="comparison-grid-container">
          <div className="comparison-col">
            <div className="comparison-header">
              <span>📌 PINNED RUN</span>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                onClick={onClearPin}
              >
                Clear Pin ✕
              </button>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: 6 }}>
              <div><strong>URL:</strong> {pinnedResult.url}</div>
              <div><strong>Rate:</strong> {formatNumber(pinnedResult.requests?.average, 1)} req/s</div>
              <div><strong>Avg Latency:</strong> {formatNumber(pinnedResult.latency?.average, 1)} ms</div>
              <div><strong>p99 Latency:</strong> {formatNumber(pinnedResult.latency?.p99, 1)} ms</div>
              <div>
                <strong>Total Requests:</strong>{" "}
                {formatNumber(pinnedResult.summary?.actualRequests ?? pinnedResult.requests?.total, 0)}
              </div>
            </div>
          </div>

          <div className="comparison-col" style={{ borderColor: "#6366f1" }}>
            <div className="comparison-header" style={{ color: "#818cf8" }}>
              <span>⚡ CURRENT RUN</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: 6 }}>
              <div><strong>URL:</strong> {results.url}</div>
              <div><strong>Rate:</strong> {formatNumber(results.requests?.average, 1)} req/s</div>
              <div><strong>Avg Latency:</strong> {formatNumber(results.latency?.average, 1)} ms</div>
              <div><strong>p99 Latency:</strong> {formatNumber(results.latency?.p99, 1)} ms</div>
              <div>
                <strong>Total Requests:</strong>{" "}
                {formatNumber(results.summary?.actualRequests ?? results.requests?.total, 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="kpi-grid">
        <div className="kpi-card accent-cyan">
          <div className="kpi-label">
            <span>Total Requests</span>
            <span style={{ color: "#06b6d4" }}><BoltIcon /></span>
          </div>
          <div className="kpi-value">
            {formatNumber(results.summary?.actualRequests ?? results.requests?.total, 0)}
          </div>
          <div className="kpi-sub">
            Target: {results.summary?.requested ? `${results.summary.requested.target} ${results.summary.requested.mode}` : `${duration}s`}
          </div>
        </div>

        <div className="kpi-card accent-indigo">
          <div className="kpi-label">
            <span>Avg Request Rate</span>
            <span style={{ color: "#6366f1" }}><SpeedIcon /></span>
          </div>
          <div className="kpi-value">{formatNumber(results.requests?.average, 1)}</div>
          <div className="kpi-sub">Requests / second throughput</div>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-label">
            <span>Avg Latency</span>
            <span style={{ color: "#10b981" }}><TimerIcon /></span>
          </div>
          <div className="kpi-value">
            {formatNumber(results.latency?.average, 1)} <span style={{ fontSize: "1rem" }}>ms</span>
          </div>
          <div className="kpi-sub">Round-trip response time</div>
        </div>

        <div className="kpi-card accent-pink">
          <div className="kpi-label">
            <span>Data Transferred</span>
            <span style={{ color: "#ec4899" }}><StorageIcon /></span>
          </div>
          <div className="kpi-value">{formatBytes(results.throughput?.total)}</div>
          <div className="kpi-sub">Avg {formatBytes(results.throughput?.average)}/sec</div>
        </div>
      </div>

      {/* Latency Percentile Visual Histogram */}
      <LatencyHistogram latency={results.latency} />

      {/* HTTP Status Code Distribution */}
      <div className="status-section">
        <div className="status-section-header">
          <h3>HTTP Status Code Breakdown</h3>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            Total Responses:{" "}
            <strong style={{ color: "#fff" }}>
              {formatNumber(results.summary?.responsesReceived ?? results.requests?.total, 0)}
            </strong>
          </span>
        </div>
        <div className="status-grid-pills">
          <div className="status-box status-2xx">
            <div className="status-code-name">2xx Success</div>
            <div className="status-val">{formatNumber(results["2xx"] || 0, 0)}</div>
          </div>
          <div className="status-box status-3xx">
            <div className="status-code-name">3xx Redirect</div>
            <div className="status-val">{formatNumber(results["3xx"] || 0, 0)}</div>
          </div>
          <div className="status-box status-4xx">
            <div className="status-code-name">4xx Client Err</div>
            <div className="status-val">{formatNumber(results["4xx"] || 0, 0)}</div>
          </div>
          <div className="status-box status-5xx">
            <div className="status-code-name">5xx Server Err</div>
            <div className="status-val">{formatNumber(results["5xx"] || 0, 0)}</div>
          </div>
          <div className="status-box status-1xx">
            <div className="status-code-name">Timeouts / Errors</div>
            <div className="status-val">
              {formatNumber((results.errors || 0) + (results.timeouts || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metric Percentiles */}
      <div className="breakdown-grid">
        {/* Requests distribution */}
        <div className="metric-panel">
          <div className="metric-panel-header">
            <div>
              <h4>Request Rate</h4>
              <span>req/sec</span>
            </div>
            <button className="toggle-btn-clean" onClick={() => setShowAllRequests(!showAllRequests)}>
              {showAllRequests ? "Compact" : "All Percentiles"}
            </button>
          </div>
          <div className="metric-stats-list">
            {requestsEntries.map(([key, val]) => (
              <div key={key} className="metric-stat-row">
                <span className="metric-key">{key}</span>
                <span className="metric-num">{formatNumber(val, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latency distribution */}
        <div className="metric-panel">
          <div className="metric-panel-header">
            <div>
              <h4>Latency Distribution</h4>
              <span>milliseconds (ms)</span>
            </div>
            <button className="toggle-btn-clean" onClick={() => setShowAllLatency(!showAllLatency)}>
              {showAllLatency ? "Compact" : "All Percentiles"}
            </button>
          </div>
          <div className="metric-stats-list">
            {latencyEntries.map(([key, val]) => (
              <div key={key} className="metric-stat-row">
                <span className="metric-key">{key}</span>
                <span className="metric-num">{formatNumber(val, 1)} ms</span>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput distribution */}
        <div className="metric-panel">
          <div className="metric-panel-header">
            <div>
              <h4>Data Throughput</h4>
              <span>bandwidth rate</span>
            </div>
            <button className="toggle-btn-clean" onClick={() => setShowAllThroughput(!showAllThroughput)}>
              {showAllThroughput ? "Compact" : "All Percentiles"}
            </button>
          </div>
          <div className="metric-stats-list">
            {throughputEntries.map(([key, val]) => (
              <div key={key} className="metric-stat-row">
                <span className="metric-key">{key}</span>
                <span className="metric-num">{formatBytes(val)}/s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
