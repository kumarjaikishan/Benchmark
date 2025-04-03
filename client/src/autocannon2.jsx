import { useState } from "react";
import "./cannon.css";

export default function AutocannonTester() {
  const [url, setUrl] = useState("");
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch("http://localhost:5000/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, connections, duration })
      });
      const data = await response.json();
      console.log(data);
      setResults(data);
    } catch (error) {
      console.error("Error running test:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="title">Autocannon Load Tester</h2>
      <div className="form-group">
        <label>URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="input-field"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Connections</label>
          <input
            type="number"
            value={connections}
            onChange={(e) => setConnections(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Duration (seconds)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="input-field"
          />
        </div>
      </div>
      <button onClick={runTest} disabled={loading} className="btn">
        {loading ? "Running..." : "Start Test"}
      </button>

      {results && (
        <div className="results">
          <h3 className="results-title">Results</h3>
          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                    <td>{key}</td>
                    <td>{JSON.stringify(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
