import { LinkIcon, TuneIcon, PlayIcon, StopIcon } from "./Icons";
import { DEFAULT_PRESETS } from "../utils/benchmarkUtils";

export default function BenchmarkForm({
  url,
  setUrl,
  method,
  setMethod,
  connections,
  setConnections,
  duration,
  setDuration,
  pipelining,
  setPipelining,
  isDuration,
  setIsDuration,
  warmup,
  setWarmup,
  overallRate,
  setOverallRate,
  showAdvanced,
  setShowAdvanced,
  requestBody,
  setRequestBody,
  customHeaders,
  addHeaderRow,
  removeHeaderRow,
  updateHeaderRow,
  customPresets,
  newPresetName,
  setNewPresetName,
  applyPreset,
  saveCustomPreset,
  deleteCustomPreset,
  loading,
  elapsedTime,
  progressPercent,
  onRunTest,
  onCancelTest,
}) {
  return (
    <section className="glass-panel hero-glass">
      <div className="hero-header">
        <h2>Configure Target Benchmark</h2>
        <p>Deploy synthetic concurrent loads to measure maximum requests per second, latency distribution, and HTTP error resilience.</p>
      </div>

      {/* Built-in & Custom Presets */}
      <div className="presets-bar">
        <span className="presets-label">Quick Presets:</span>
        {DEFAULT_PRESETS.map((p, idx) => (
          <button key={idx} className="preset-chip" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
        {customPresets.map((p, idx) => (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <button
              className="preset-chip"
              style={{ borderColor: "#a855f7", color: "#d8b4fe" }}
              onClick={() => applyPreset(p)}
            >
              ★ {p.label}
            </button>
            <button
              type="button"
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", padding: "2px" }}
              onClick={() => deleteCustomPreset(p.label)}
              title="Delete preset"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Save Current as Custom Preset */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Save current setup as preset name..."
          className="input-field-custom"
          style={{ maxWidth: "280px", padding: "6px 12px", fontSize: "0.82rem" }}
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
        />
        <button
          type="button"
          className="toggle-btn-clean"
          style={{ fontSize: "0.8rem", padding: "6px 12px", color: "#a855f7" }}
          onClick={saveCustomPreset}
        >
          + Save Preset
        </button>
      </div>

      {/* Target URL & Method Input */}
      <div className="input-group">
        <div className="input-label-row">
          <label className="input-label">
            <LinkIcon />
            TARGET ENDPOINT & METHOD
          </label>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>HTTP / HTTPS full path supported</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="input-field-custom"
            style={{ width: "130px", fontWeight: "700", color: "#38bdf8", cursor: "pointer" }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
          </select>
          <div className="url-input-wrapper" style={{ flex: 1 }}>
            <span className="url-input-icon"><TuneIcon /></span>
            <input
              type="text"
              className="input-field-custom url-input-custom"
              placeholder="e.g. https://api.myproject.com/v1/health"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Advanced Headers & Payload Toggle */}
      <button
        type="button"
        className="advanced-toggle-btn"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <span>{showAdvanced ? "▼" : "▶"}</span>
        <span>Advanced Tuning, Headers & Payload ({customHeaders.length} headers)</span>
      </button>

      {showAdvanced && (
        <div className="advanced-panel">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="input-group">
              <label className="input-label">WARM-UP DURATION (SEC)</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field-custom"
                placeholder="e.g. 2 (unrecorded warmup)"
                value={warmup}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setWarmup(clean === "" ? "" : Number(clean));
                }}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label className="input-label">OVERALL THROTTLE (REQ/SEC)</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field-custom"
                placeholder="0 = unlimited full speed"
                value={overallRate}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setOverallRate(clean === "" ? "" : Number(clean));
                }}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="presets-label">Request Headers:</span>
              <button
                type="button"
                className="toggle-btn-clean"
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                onClick={addHeaderRow}
              >
                + Add Header
              </button>
            </div>
            <div className="headers-editor-list">
              {customHeaders.map((hdr, idx) => (
                <div key={idx} className="header-row-item">
                  <input
                    type="text"
                    placeholder="Header Name"
                    className="input-field-custom"
                    value={hdr.key}
                    onChange={(e) => updateHeaderRow(idx, "key", e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Header Value"
                    className="input-field-custom"
                    value={hdr.value}
                    onChange={(e) => updateHeaderRow(idx, "value", e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-btn-clean"
                    style={{ color: "#ef4444", padding: "8px" }}
                    onClick={() => removeHeaderRow(idx)}
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {["POST", "PUT", "PATCH"].includes(method) && (
            <div>
              <span className="presets-label" style={{ display: "block", marginBottom: "8px" }}>
                JSON / Text Request Body:
              </span>
              <textarea
                className="textarea-custom"
                rows={4}
                placeholder='{"name": "load-test", "count": 100}'
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>
      )}

      {/* Parameters Grid */}
      <div className="config-grid">
        <div className="input-group">
          <label className="input-label">EXECUTION MODE</label>
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${isDuration ? "active" : ""}`}
              onClick={() => setIsDuration(true)}
              disabled={loading}
            >
              Time Limit
            </button>
            <button
              type="button"
              className={`mode-btn ${!isDuration ? "active" : ""}`}
              onClick={() => setIsDuration(false)}
              disabled={loading}
            >
              Request Count
            </button>
          </div>
        </div>

        <div className="input-group">
          <div className="input-label-row">
            <label className="input-label">CONCURRENCY</label>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>TCP sockets</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="input-field-custom"
            value={connections}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "");
              setConnections(clean === "" ? "" : Number(clean));
            }}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <div className="input-label-row">
            <label className="input-label">PIPELINING</label>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>req/conn buffer</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="input-field-custom"
            value={pipelining}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "");
              setPipelining(clean === "" ? "" : Number(clean));
            }}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <div className="input-label-row">
            <label className="input-label">{isDuration ? "DURATION (SEC)" : "MAX REQUESTS"}</label>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{isDuration ? "seconds" : "count"}</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="input-field-custom"
            value={duration}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "");
              setDuration(clean === "" ? "" : Number(clean));
            }}
            disabled={loading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="btn-row-actions">
        <button className="launch-btn" style={{ flex: 1 }} onClick={onRunTest} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              RUNNING TEST ({elapsedTime}s)
            </>
          ) : (
            <>
              <PlayIcon />
              LAUNCH BENCHMARK CANNON
            </>
          )}
        </button>
        {loading && (
          <button className="cancel-btn" onClick={onCancelTest} type="button">
            <StopIcon />
            ABORT
          </button>
        )}
      </div>

      {/* Live Progress Bar when running */}
      {loading && (
        <div className="live-progress-container">
          <div className="progress-header-row">
            <span>Transmitting synthetic concurrent loads...</span>
            <span>
              {isDuration ? `${elapsedTime}s / ${duration}s (${progressPercent}%)` : `${elapsedTime}s elapsed`}
            </span>
          </div>
          <div className="progress-track">
            {isDuration ? (
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            ) : (
              <div className="progress-indeterminate"></div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
