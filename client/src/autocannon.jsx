import { useState, useEffect, useRef } from "react";
import "./cannon.css";
import "./cannon-extra.css";
import { toast } from "react-toastify";

import Navbar from "./components/Navbar";
import BenchmarkForm from "./components/BenchmarkForm";
import ResultsDashboard from "./components/ResultsDashboard";
import HistoryList from "./components/HistoryList";

export default function AutocannonTester() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState(5);
  const [pipelining, setPipelining] = useState(1);
  const [isDuration, setIsDuration] = useState(true);
  const [warmup, setWarmup] = useState(0);
  const [overallRate, setOverallRate] = useState(0);

  // Advanced headers & body
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [requestBody, setRequestBody] = useState("");
  const [customHeaders, setCustomHeaders] = useState([{ key: "Accept", value: "application/json" }]);

  // Custom presets
  const [customPresets, setCustomPresets] = useState([]);
  const [newPresetName, setNewPresetName] = useState("");

  // Results & Comparison
  const [results, setResults] = useState(null);
  const [pinnedResult, setPinnedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTestId, setCurrentTestId] = useState(null);
  const [history, setHistory] = useState([]);

  const resultsRef = useRef(null);

  // Load history and custom presets from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("cannonpulse_history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedPresets = localStorage.getItem("cannonpulse_custom_presets");
      if (savedPresets) setCustomPresets(JSON.parse(savedPresets));
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (item) => {
    setHistory((prev) => {
      const updated = [item, ...prev.slice(0, 9)];
      try {
        localStorage.setItem("cannonpulse_history", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("cannonpulse_history");
    toast.info("Benchmark history cleared");
  };

  const saveCustomPreset = () => {
    const name = newPresetName.trim();
    if (!name) {
      toast.warn("Please enter a name for the custom preset.");
      return;
    }
    const preset = {
      label: name,
      url,
      method,
      connections,
      duration,
      pipelining,
      isDuration,
      warmup,
      overallRate,
      body: requestBody,
    };
    const updated = [...customPresets.filter((p) => p.label !== name), preset];
    setCustomPresets(updated);
    localStorage.setItem("cannonpulse_custom_presets", JSON.stringify(updated));
    setNewPresetName("");
    toast.success(`Preset "${name}" saved!`);
  };

  const deleteCustomPreset = (label) => {
    const updated = customPresets.filter((p) => p.label !== label);
    setCustomPresets(updated);
    localStorage.setItem("cannonpulse_custom_presets", JSON.stringify(updated));
    toast.info(`Preset "${label}" removed`);
  };

  const exportJSON = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `benchmark_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Benchmark JSON report downloaded");
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [
      ["Metric", "Value", "Unit"],
      ["Target URL", results.url, ""],
      ["Method", results.method || method, ""],
      ["Total Requests", results.summary?.actualRequests ?? results.requests?.total, "requests"],
      ["Avg Requests/sec", results.requests?.average, "req/s"],
      ["Avg Latency", results.latency?.average, "ms"],
      ["p50 Latency", results.latency?.p50, "ms"],
      ["p75 Latency", results.latency?.p75, "ms"],
      ["p90 Latency", results.latency?.p90, "ms"],
      ["p99 Latency", results.latency?.p99, "ms"],
      ["Throughput Total", results.throughput?.total, "bytes"],
      ["2xx Responses", results["2xx"] || 0, "count"],
      ["3xx Responses", results["3xx"] || 0, "count"],
      ["4xx Responses", results["4xx"] || 0, "count"],
      ["5xx Responses", results["5xx"] || 0, "count"],
      ["Errors", results.errors || 0, "count"],
      ["Timeouts", results.timeouts || 0, "count"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map(String).join(",")).join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `benchmark_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Benchmark CSV report downloaded");
  };

  const applyPreset = (preset) => {
    setUrl(preset.url);
    setMethod(preset.method || "GET");
    setConnections(preset.connections);
    setDuration(preset.duration);
    setPipelining(preset.pipelining);
    setIsDuration(preset.isDuration);
    if (preset.warmup !== undefined) setWarmup(preset.warmup);
    if (preset.overallRate !== undefined) setOverallRate(preset.overallRate);
    if (preset.body) {
      setRequestBody(preset.body);
      setShowAdvanced(true);
    }
    toast.info(`Preset: ${preset.label}`, { autoClose: 1500 });
  };

  const addHeaderRow = () => {
    setCustomHeaders((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeHeaderRow = (idx) => {
    setCustomHeaders((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateHeaderRow = (idx, field, val) => {
    setCustomHeaders((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const validateForm = () => {
    if (!url.trim()) return "Target URL cannot be empty";
    if (!Number.isInteger(Number(connections)) || Number(connections) < 1) return "Connections must be ≥ 1";
    if (!Number.isInteger(Number(pipelining)) || Number(pipelining) < 1) return "Pipelining must be ≥ 1";
    if (!Number.isInteger(Number(duration)) || Number(duration) < 1) {
      return isDuration ? "Duration must be ≥ 1 second" : "Requests count must be ≥ 1";
    }
    return "";
  };

  const cancelRunningTest = async () => {
    if (!currentTestId) return;
    try {
      await fetch("/test/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: currentTestId }),
      });
      toast.warn("Benchmark aborted by user");
    } catch {
      toast.error("Failed to signal cancel to server");
    } finally {
      setLoading(false);
      setCurrentTestId(null);
    }
  };

  const runTest = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.warn(errorMsg, { autoClose: 2000 });
      return;
    }

    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentTestId(testId);
    setLoading(true);
    setElapsedTime(0);

    const toastId = toast.loading("Launching CannonPulse engine...");

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      toast.update(toastId, { render: `Benchmark running... ${elapsed}s` });
    }, 1000);

    const headerObj = {};
    customHeaders.forEach((h) => {
      if (h.key.trim()) headerObj[h.key.trim()] = h.value.trim();
    });

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
          warmup: Number(warmup),
          overallRate: Number(overallRate),
          method,
          headers: headerObj,
          body: ["POST", "PUT", "PATCH"].includes(method) ? requestBody : null,
          testId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.update(toastId, {
          render: data.error || "Execution failed on target host.",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
        return;
      }

      toast.update(toastId, {
        render: "Benchmark completed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setResults(data);
      saveToHistory({
        timestamp: new Date().toLocaleTimeString(),
        url: data.url,
        method,
        duration: data.duration,
        reqSec: data.requests?.average,
        latency: data.latency?.average,
        fullData: data,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      toast.update(toastId, {
        render: err?.message || "Failed to contact benchmark daemon.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      clearInterval(interval);
      setLoading(false);
      setCurrentTestId(null);
    }
  };

  const progressPercent = isDuration
    ? Math.min(100, Math.round((elapsedTime / Math.max(1, duration)) * 100))
    : 100;

  return (
    <div className="app-container">
      <Navbar />

      <BenchmarkForm
        url={url}
        setUrl={setUrl}
        method={method}
        setMethod={setMethod}
        connections={connections}
        setConnections={setConnections}
        duration={duration}
        setDuration={setDuration}
        pipelining={pipelining}
        setPipelining={setPipelining}
        isDuration={isDuration}
        setIsDuration={setIsDuration}
        warmup={warmup}
        setWarmup={setWarmup}
        overallRate={overallRate}
        setOverallRate={setOverallRate}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        requestBody={requestBody}
        setRequestBody={setRequestBody}
        customHeaders={customHeaders}
        addHeaderRow={addHeaderRow}
        removeHeaderRow={removeHeaderRow}
        updateHeaderRow={updateHeaderRow}
        customPresets={customPresets}
        newPresetName={newPresetName}
        setNewPresetName={setNewPresetName}
        applyPreset={applyPreset}
        saveCustomPreset={saveCustomPreset}
        deleteCustomPreset={deleteCustomPreset}
        loading={loading}
        elapsedTime={elapsedTime}
        progressPercent={progressPercent}
        onRunTest={runTest}
        onCancelTest={cancelRunningTest}
      />

      <ResultsDashboard
        results={results}
        method={method}
        connections={connections}
        duration={duration}
        pinnedResult={pinnedResult}
        onPinResult={() => {
          setPinnedResult(results);
          toast.success("Benchmark pinned for side-by-side comparison!");
        }}
        onClearPin={() => setPinnedResult(null)}
        onExportJSON={exportJSON}
        onExportCSV={exportCSV}
        resultsRef={resultsRef}
      />

      <HistoryList
        history={history}
        onSelectRun={(fullData) => setResults(fullData)}
        onClearHistory={clearHistory}
      />
    </div>
  );
}
