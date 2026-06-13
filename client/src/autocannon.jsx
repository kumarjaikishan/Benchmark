import { useMemo, useState } from "react";
import "./cannon.css";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";

const PRIMARY_KEYS = ["average", "mean", "stddev", "min", "max"];

const formatNumber = (value, digits = 1) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(number);
};

const formatBytes = (value) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${formatNumber(bytes / 1024 ** index, 1)} ${units[index]}`;
};

const metricEntries = (section, showAll) => {
  return Object.entries(section || {}).filter(([key]) => showAll || PRIMARY_KEYS.includes(key));
};

const requestedTargetLabel = (summary) => {
  const requested = summary?.requested;
  if (!requested) return "Not available";
  return requested.mode === "requests"
    ? `${formatNumber(requested.target, 0)} requested`
    : `${formatNumber(requested.target, 0)} seconds`;
};

const StatCard = ({ label, value, hint }) => (
  <div className="stat-card" title={hint}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const MetricSection = ({ title, unit, entries, showAll, onToggle, formatter = formatNumber }) => (
  <section className="result-section">
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {unit && <p>{unit}</p>}
      </div>
      <Button size="small" variant="outlined" onClick={onToggle}>
        {showAll ? "Show less" : "Show more"}
      </Button>
    </div>
    <div className="metric-grid">
      {entries.map(([key, value]) => (
        <StatCard key={key} label={key} value={formatter(value)} />
      ))}
    </div>
  </section>
);

export default function AutocannonTester() {
  const [url, setUrl] = useState("");
  const [connections, setConnections] = useState(4);
  const [duration, setDuration] = useState(3);
  const [pipelining, setPipelining] = useState(2);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllLatency, setShowAllLatency] = useState(false);
  const [showAllThroughput, setShowAllThroughput] = useState(false);
  const [isDuration, setIsDuration] = useState(true);

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

  const updateNumber = (setter, min, max) => (event) => {
    const value = Number(event.target.value);
    if (event.target.value === "") {
      setter("");
      return;
    }
    setter(Math.min(Math.max(value, min), max));
  };

  const validateForm = () => {
    if (url.trim() === "") return "Please enter a site URL.";
    if (!Number.isInteger(Number(connections)) || Number(connections) < 1) {
      return "Connections must be at least 1.";
    }
    if (!Number.isInteger(Number(pipelining)) || Number(pipelining) < 1) {
      return "Pipelining must be at least 1.";
    }
    if (!Number.isInteger(Number(duration)) || Number(duration) < 1) {
      return isDuration ? "Duration must be at least 1 second." : "Requests must be at least 1.";
    }
    return "";
  };

  const runTest = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      toast.warn(validationMessage, { autoClose: 1800 });
      return;
    }

    setLoading(true);
    setResults(null);
    let elapsed = 0;
    const toastId = toast.loading("Running... 0s");

    const timer = setInterval(() => {
      elapsed += 1;
      toast.update(toastId, { render: `Running... ${elapsed}s` });
    }, 1000);

    try {
      const response = await fetch("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          connections: Number(connections),
          duration: Number(duration),
          pipelining: Number(pipelining),
          isduration: isDuration,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.update(toastId, {
          render: data.error || "Could not run the test.",
          type: "warning",
          isLoading: false,
          autoClose: 2500,
        });
        return;
      }

      toast.update(toastId, {
        render: "Test complete",
        type: "success",
        isLoading: false,
        autoClose: 1800,
      });
      setResults(data);
    } catch (error) {
      toast.update(toastId, {
        render: error?.message || "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">HTTP performance benchmark</p>
        <h1>Autocannon Load Tester</h1>
        <p className="subheading">
          Run a quick load test against a public URL and review latency, request rate,
          throughput, errors, and response classes in one place.
        </p>

        <div className="tester-form">
          <TextField
            label="Target URL"
            value={url}
            fullWidth
            size="small"
            placeholder="example.com or https://example.com"
            onChange={(event) => setUrl(event.target.value)}
          />

          <div className="form-grid">
            <FormControl fullWidth size="small">
              <InputLabel id="mode-select-label">Run by</InputLabel>
              <Select
                labelId="mode-select-label"
                value={isDuration}
                label="Run by"
                onChange={(event) => setIsDuration(event.target.value)}
              >
                <MenuItem value={true}>Duration</MenuItem>
                <MenuItem value={false}>Total requests</MenuItem>
              </Select>
            </FormControl>

            <Tooltip arrow title="Concurrent TCP connections used during the test.">
              <TextField
                label="Connections"
                value={connections}
                size="small"
                type="number"
                inputProps={{ min: 1, max: 500 }}
                onChange={updateNumber(setConnections, 1, 500)}
              />
            </Tooltip>

            <Tooltip arrow title="Requests sent per connection before waiting for a response.">
              <TextField
                label="Pipelining"
                value={pipelining}
                size="small"
                type="number"
                inputProps={{ min: 1, max: 100 }}
                onChange={updateNumber(setPipelining, 1, 100)}
              />
            </Tooltip>

            <Tooltip arrow title={isDuration ? "How many seconds the test should run." : "Total request count to send."}>
              <TextField
                label={isDuration ? "Duration (seconds)" : "Requests"}
                value={duration}
                size="small"
                type="number"
                inputProps={{ min: 1, max: 100000 }}
                onChange={updateNumber(setDuration, 1, 100000)}
              />
            </Tooltip>
          </div>

          <Button
            onClick={runTest}
            loading={loading}
            loadingPosition="end"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? "Running test" : "Start test"}
          </Button>
        </div>
      </section>

      {results && (
        <section className="results-panel">
          <div className="results-title">
            <div>
              <p className="eyebrow">Latest result</p>
              <h2>{results.url}</h2>
            </div>
            <span>{formatNumber(results.duration, 1)}s test</span>
          </div>

          <div className="summary-grid">
            <StatCard
              label="Actual requests made"
              value={formatNumber(results.summary?.actualRequests ?? results.requests?.total, 0)}
              hint="Total completed requests reported by Autocannon."
            />
            <StatCard
              label="Requested target"
              value={requestedTargetLabel(results.summary)}
              hint="The duration or request amount you asked Autocannon to run."
            />
            <StatCard label="Avg requests/sec" value={formatNumber(results.requests?.average, 1)} />
            <StatCard label="Avg latency" value={`${formatNumber(results.latency?.average, 1)} ms`} />
            <StatCard label="Data read" value={formatBytes(results.throughput?.total)} />
            <StatCard label="Errors" value={formatNumber(results.errors, 0)} />
            <StatCard label="Timeouts" value={formatNumber(results.timeouts, 0)} />
          </div>

          <section className="result-section">
            <div className="section-header">
              <div>
                <h3>Response status classes</h3>
                <p>Shows how many responses landed in each HTTP status family.</p>
              </div>
            </div>
            <div className="status-grid">
              <StatCard
                label="Responses received"
                value={formatNumber(results.summary?.responsesReceived, 0)}
                hint="Sum of 1xx, 2xx, 3xx, 4xx, and 5xx responses."
              />
              {["1xx", "2xx", "3xx", "4xx", "5xx"].map((key) => (
                <StatCard key={key} label={key} value={formatNumber(results[key], 0)} />
              ))}
            </div>
          </section>

          <MetricSection
            title="Requests"
            unit="Requests per second"
            entries={requestsEntries}
            showAll={showAllRequests}
            onToggle={() => setShowAllRequests((value) => !value)}
          />

          <MetricSection
            title="Latency"
            unit="Milliseconds"
            entries={latencyEntries}
            showAll={showAllLatency}
            onToggle={() => setShowAllLatency((value) => !value)}
          />

          <MetricSection
            title="Throughput"
            unit="Bytes per second"
            entries={throughputEntries}
            showAll={showAllThroughput}
            onToggle={() => setShowAllThroughput((value) => !value)}
            formatter={formatBytes}
          />
        </section>
      )}
    </main>
  );
}
