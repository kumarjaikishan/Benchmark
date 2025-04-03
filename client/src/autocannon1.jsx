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
    <div className=" mx-auto mt-10 p-8 border rounded-lg shadow-xl bg-white text-center">
      <h2 className="text-3xl font-bold mb-5 text-blue-600">Autocannon Load Tester</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-lg font-semibold">URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold">Connections</label>
            <input
              type="number"
              value={connections}
              onChange={(e) => setConnections(Number(e.target.value))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold">Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
          </div>
        </div>
        <button
          onClick={runTest}
          disabled={loading}
          className="w-full mt-4 p-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          {loading ? "Running..." : "Start Test"}
        </button>
      </div>

      {results && (
        <div className="mt-6 p-6 border rounded-lg bg-gray-100 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-left text-lg">
              <thead>
                <tr className="bg-blue-500 text-white text-lg">
                  <th className="border p-3">Metric</th>
                  <th className="border p-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}>
                    <td className="border p-3 font-semibold text-gray-800">{key}</td>
                    <td className="border p-3 text-gray-700">{JSON.stringify(value)}</td>
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
