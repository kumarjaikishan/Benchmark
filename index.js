const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const port = process.env.PORT || 5006;
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Vite inline scripts and styles during dev
  })
);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "50kb" }));

const testLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many benchmark tests initiated. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const clientDistPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientDistPath));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/port", (req, res) => {
  res.json({ port });
});

// Active test tracking for cancel functionality
const activeTests = new Map();

// Autocannon runner with async/await Promise wrapper and cancel handle
const runAutocannon = (options, testId) => {
  return new Promise((resolve, reject) => {
    const instance = autocannon(options, (err, result) => {
      activeTests.delete(testId);
      if (err) reject(err);
      else resolve(result);
    });

    if (testId) {
      activeTests.set(testId, instance);
    }
  });
};

const buildResultSummary = (result, requested) => {
  const responseCount = ["1xx", "2xx", "3xx", "4xx", "5xx"].reduce(
    (total, key) => total + Number(result?.[key] || 0),
    0
  );

  return {
    actualRequests: Number(result?.requests?.total || 0),
    responsesReceived: responseCount,
    requested,
  };
};

const validateTestInput = ({ url, connections, duration, pipelining }) => {
  if (typeof url !== "string" || url.trim() === "") {
    return { error: "Please enter a valid target URL." };
  }

  const numericFields = [
    ["connections", connections, 1, 1000],
    ["pipelining", pipelining, 1, 100],
    ["duration or requests", duration, 1, 500000],
  ];

  for (const [label, value, min, max] of numericFields) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
      return { error: `Please enter ${label} between ${min} and ${max}.` };
    }
  }

  return {};
};

// URL normalizer: preserves entire path, query, and port
const parseTargetUrl = (input) => {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) {
    raw = `http://${raw}`;
  }
  try {
    const parsed = new URL(raw);
    return {
      valid: true,
      protocol: parsed.protocol.replace(":", ""),
      host: parsed.host,
      fullUrl: parsed.href,
    };
  } catch {
    return { valid: false };
  }
};

app.post("/test/cancel", (req, res) => {
  const { testId } = req.body;
  if (!testId || !activeTests.has(testId)) {
    return res.status(404).json({ error: "No active test found with that ID or test already completed." });
  }

  const instance = activeTests.get(testId);
  try {
    instance.stop();
    activeTests.delete(testId);
    res.json({ message: "Test stopped successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to stop test: " + err.message });
  }
});

app.post("/test", testLimiter, async (req, res) => {
  const {
    url,
    connections,
    duration,
    pipelining,
    isduration,
    warmup = 0,
    overallRate = 0,
    method = "GET",
    headers = {},
    body = null,
    testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  } = req.body;

  const validation = validateTestInput({ url, connections, duration, pipelining });
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const parsed = parseTargetUrl(url);
  if (!parsed.valid) {
    return res.status(400).json({ error: "Invalid target URL syntax." });
  }

  try {
    const options = {
      url: parsed.fullUrl,
      connections: Number(connections),
      pipelining: Number(pipelining),
      method: String(method).toUpperCase(),
    };

    if (warmup && Number(warmup) > 0) {
      options.warmup = { duration: Number(warmup) };
    }

    if (overallRate && Number(overallRate) > 0) {
      options.overallRate = Number(overallRate);
    }

    if (headers && typeof headers === "object" && Object.keys(headers).length > 0) {
      options.headers = headers;
    }

    if (body && ["POST", "PUT", "PATCH"].includes(options.method)) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    if (isduration) {
      options.duration = Number(duration);
    } else {
      options.amount = Number(duration);
    }

    const result = await runAutocannon(options, testId);
    result.summary = buildResultSummary(result, {
      mode: isduration ? "duration" : "requests",
      target: Number(duration),
      connections: Number(connections),
      pipelining: Number(pipelining),
    });

    res.json(result);
  } catch (error) {
    activeTests.delete(testId);
    console.error("Autocannon execution error:", error.stack || error.message);
    res.status(500).json({ error: "Error running Autocannon test suite" });
  }
});

app.use((req, res, next) => {
  if (req.method === "GET") {
    res.sendFile(path.join(clientDistPath, "index.html"));
  } else {
    next();
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});
