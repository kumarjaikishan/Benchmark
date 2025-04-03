import { useState } from "react";

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
      setResults(data);
    } catch (error) {
      console.error("Error running test:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Autocannon Load Tester</h2>
      <label className="block font-medium">URL</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="w-full p-2 border rounded-md mb-3"
      />
      <label className="block font-medium">Connections</label>
      <input
        type="number"
        value={connections}
        onChange={(e) => setConnections(Number(e.target.value))}
        className="w-full p-2 border rounded-md mb-3"
      />
      <label className="block font-medium">Duration (seconds)</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="w-full p-2 border rounded-md mb-3"
      />
      <button
        onClick={runTest}
        disabled={loading}
        className="w-full mt-3 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Running..." : "Start Test"}
      </button>

      {results && (
        <div className="mt-5 p-3 border rounded-md bg-gray-100">
          <h3 className="text-lg font-bold mb-2">Results</h3>
          <pre className="overflow-auto text-sm">{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
