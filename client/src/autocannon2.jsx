import { useState } from "react";
import "./cannon.css";
import TextField from '@mui/material/TextField';

export default function AutocannonTester() {
  const [url, setUrl] = useState("");
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState(5);
  const [pipelining, setpipelining] = useState(2);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await fetch("http://localhost:5000/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, connections, duration, pipelining })
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
        <TextField id="outlined-basic" label="Enter URL"
          value={url}
          sx={{ width: '100%' }}
          size="small"
          onChange={(e) => setUrl(e.target.value)}
          variant="outlined" />
      </div>
      <div className="form-row">
        <TextField id="outlined-basic" label="Connections"
          value={connections}
          size="small"
          sx={{ width: '32%' }}
          type="number"
          onChange={(e) => setConnections(Number(e.target.value))}
          variant="outlined" />

        <TextField id="outlined-basic" label="Duration (seconds)"
          value={duration}
          size="small"
          sx={{ width: '32%' }}
          type="number"
          onChange={(e) => setDuration(Number(e.target.value))}
          variant="outlined" />
        <TextField id="outlined-basic" label="pipelining"
          value={pipelining}
          title="Number of requests sent per connection before waiting for a response."
          size="small"
          sx={{ width: '32%' }}
          type="number"
          onChange={(e) => setpipelining(Number(e.target.value))}
          variant="outlined" />

      </div>
      <button onClick={runTest} disabled={loading} className="btn">
        {loading ? "Running..." : "Start Test"}
      </button>
      <div className="result">
        <div className="head">Responses</div>
        <div className="bodyhead">
          <div>
            <div className="headtitle">1xx</div>
            <div>100</div>
          </div>
          <div>
            <div className="headtitle">2xx</div>
            <div>100</div>
          </div>
          <div>
            <div className="headtitle">3xx</div>
            <div>100</div>
          </div>
          <div>
            <div className="headtitle">4xx</div>
            <div>100</div>
          </div>
          <div>
            <div className="headtitle">5xx</div>
            <div>100</div>
          </div>
        </div>
        <div className="head">Miscellenous</div>
        <div className="bodyhead">
          <div>
            <div className="headtitle">Connections</div>
            <div>{results?.connections}</div>
          </div>
          <div>
            <div className="headtitle">Duration</div>
            <div>{results?.duration}</div>
          </div>
          <div>
            <div className="headtitle">Errors</div>
            <div>{results?.errors}</div>
          </div>
          <div>
            <div className="headtitle">Pipelining</div>
            <div>{results?.pipelining}</div>
          </div>
          <div>
            <div className="headtitle">non2xx</div>
            <div>{results?.non2xx}</div>
          </div>
          <div>
            <div className="headtitle">Timeouts</div>
            <div>{results?.timeouts}</div>
          </div>
        </div>
        <div className="head">Requests</div>
        <div className="bodyhead">
        {Object.entries(results?.requests).map(([key, value], index) => (
            <div key={key}>
              <div className="headtitle">{key}</div>
              <div>{JSON.stringify(value)}</div>
            </div>
          ))}
        </div>
        <div className="head">Latency (in milliseconds)</div>
        <div className="bodyhead">
        {Object.entries(results?.latency).map(([key, value], index) => (
            <div key={key}>
              <div className="headtitle">{key}</div>
              <div>{JSON.stringify(value)}</div>
            </div>
          ))}
        </div>
        <div className="head">Throughput (in bytes per second)</div>
        <div className="bodyhead">
          {Object.entries(results?.throughput).map(([key, value], index) => (
            <div key={key}>
              <div className="headtitle">{key}</div>
              <div>{JSON.stringify(value)}</div>
            </div>
          ))}
        </div>
      </div>
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
