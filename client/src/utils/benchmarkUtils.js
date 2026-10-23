export const PRIMARY_KEYS = ["average", "mean", "stddev", "min", "max"];

export const DEFAULT_PRESETS = [
  { label: "Quick Healthcheck", url: "https://httpbin.org/get", method: "GET", connections: 5, duration: 3, pipelining: 1, isDuration: true, warmup: 0 },
  { label: "Standard Stress", url: "https://httpbin.org/get", method: "GET", connections: 40, duration: 5, pipelining: 4, isDuration: true, warmup: 1 },
  { label: "Heavy Concurrency", url: "https://httpbin.org/get", method: "GET", connections: 100, duration: 10, pipelining: 8, isDuration: true, warmup: 2 },
  { label: "Burst (500 Req)", url: "https://httpbin.org/get", method: "GET", connections: 20, duration: 500, pipelining: 2, isDuration: false, warmup: 0 },
  { label: "POST JSON Payload", url: "https://httpbin.org/post", method: "POST", connections: 10, duration: 4, pipelining: 1, isDuration: true, warmup: 0, body: '{"sample": "load-test"}' },
];

export const formatNumber = (value, digits = 1) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(number);
};

export const formatBytes = (value) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${formatNumber(bytes / 1024 ** index, 1)} ${units[index]}`;
};

export const metricEntries = (section, showAll) => {
  if (!section) return [];
  const entries = Object.entries(section);
  if (showAll) return entries;
  return entries.filter(([key]) => PRIMARY_KEYS.includes(key));
};

export const calculateGrade = (results) => {
  if (!results) return { grade: "N/A", text: "" };
  const avgLat = Number(results.latency?.average || 0);
  const total = Number(results.requests?.total || 1);
  const errors = Number((results.errors || 0) + (results.timeouts || 0) + (results["5xx"] || 0));
  const errRate = (errors / total) * 100;

  if (errRate > 20 || avgLat > 1500) return { grade: "F", text: "Severe Failures" };
  if (errRate > 5 || avgLat > 800) return { grade: "D", text: "High Degradation" };
  if (errRate > 1 || avgLat > 350) return { grade: "C", text: "Moderate Performance" };
  if (avgLat > 120) return { grade: "B", text: "Good Performance" };
  return { grade: "A", text: "Excellent Health" };
};
