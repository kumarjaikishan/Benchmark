import { useState } from "react";
import "./cannon.css";
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export default function AutocannonTester() {
  const [url, setUrl] = useState("");
  const [connections, setConnections] = useState(4);
  const [duration, setDuration] = useState(3);
  const [pipelining, setpipelining] = useState(2);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showallRequests, setshowallRequests] = useState(false);
  const [showallLatency, setshowallLatency] = useState(false);
  const [showallThroughput, setshowallThroughput] = useState(false);

  const importantKeys = ["average", "mean", "stddev", "min", "max"];

  const filteredRequestsEntries = Object.entries(results?.requests || {}).filter(
    ([key]) => showallRequests || importantKeys.includes(key)
  );
  const filteredLatencyEntries = Object.entries(results?.latency || {}).filter(
    ([key]) => showallLatency || importantKeys.includes(key)
  );
  const filteredshowallThroughputEntries = Object.entries(results?.throughput || {}).filter(
    ([key]) => showallThroughput || importantKeys.includes(key)
  );

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
        <Tooltip arrow enterDelay={200} placement="top" title="Number of requests sent per connection before waiting for a response.">
          <TextField id="outlined-basic" label="pipelining"
            value={pipelining}
            size="small"
            sx={{ width: '32%' }}
            type="number"
            onChange={(e) => setpipelining(Number(e.target.value))}
            variant="outlined" />
        </Tooltip>
      </div>
      <button onClick={runTest} disabled={loading} className="btn">
        {loading ? "Running..." : "Start Test"}
      </button>
      {results &&
        <div className="result">
          <div style={{marginTop:'20px', fontSize: '1.4em', fontWeight: '700' }}>Result - {results?.url}</div>
          <div className="one">
            <div className="head">Responses ({results?.requests?.total} Total)</div>
            <div className="bodyhead">
              <div>
                <div className="headtitle">1xx</div>
                <div>{results?.['1xx']}</div> 
              </div>
              <div>
                <div className="headtitle">2xx</div>
                <div>{results?.['2xx']}</div>
              </div>
              <div>
                <div className="headtitle">3xx</div>
                <div>{results?.['3xx']}</div>
              </div>
              <div>
                <div className="headtitle">4xx</div>
                <div>{results?.['4xx']}</div>
              </div>
              <div>
                <div className="headtitle">5xx</div>
                <div>{results?.['5xx']}</div>
              </div>
            </div>
          </div>

          <div className="one">
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
                <div className="headtitle">Data Read</div>
                <div>{((results?.throughput?.total * results?.duration) / 1024 / 1024).toFixed(1)} MB</div>
              </div>
              <div>
                <div className="headtitle">Errors</div>
                <div>{results?.errors}</div>
              </div>
              {/* <div>
              <div className="headtitle">Pipelining</div>
              <div>{results?.pipelining}</div>
            </div> */}
              {/* <div>
              <div className="headtitle">non2xx</div>
              <div>{results?.non2xx}</div>
            </div> */}
              <div>
                <div className="headtitle">Timeouts</div>
                <div>{results?.timeouts}</div>
              </div>
            </div>
          </div>

          <div className="one">
            <div className="head">Requests</div>
            <div className="bodyhead">
              {results &&
                filteredRequestsEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="headtitle">{key}</div>
                    <div>{JSON.stringify(value)}</div>
                  </div>
                ))}
              <Button
                size="small"
                endIcon={showallRequests ? null : <ChevronRightIcon />}
                startIcon={showallRequests ? <ChevronLeftIcon /> : null}
                variant="contained"
                onClick={() => setshowallRequests(!showallRequests)}
              >
                {showallRequests ? "Less" : "More"}
              </Button>
            </div>
          </div>

          <div className="one">
            <div className="head">Latency (in milliseconds)</div>
            <div className="bodyhead">
              {results &&
                filteredLatencyEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="headtitle">{key}</div>
                    <div>{JSON.stringify(value)}</div>
                  </div>
                ))}
              {/* <button onClick={() => setshowallLatency(!showallLatency)} className="more-button">
              {showallLatency ? "Show Less" : "Show More"}
            </button> */}
              <span style={{ cursor: 'pointer' }}
                onClick={() => setshowallLatency(!showallLatency)}
              >
                <u> {showallLatency ? "Show Less" : "Show More"} </u>
              </span>
            </div>
          </div>

          <div className="one">
            <div className="head">Throughput (in bytes per second)</div>
            <div className="bodyhead">
              {results &&
                filteredshowallThroughputEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="headtitle">{key}</div>
                    <div>{JSON.stringify(value)}</div>
                  </div>
                ))}
              <button onClick={() => setshowallThroughput(!showallThroughput)} className="more-button">
                {showallThroughput ? "Show Less" : "Show More" } 
              </button>
            </div>
          </div>
        </div>}
    </div>
  );
}
