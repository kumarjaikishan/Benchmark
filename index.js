const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");
const axios = require('axios');
const path = require('path');
const port = process.env.PORT || 5006;

const app = express();
app.use(cors());
app.use(express.json());

const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.get('/port', (req, res) => {
  res.json({ "port": port });
});

app.get('/computer', async (req, res) => {
  try {
    const options = {
      url: "https://nclcomputer.com",
      connections: 80,
      pipelining: 10,
      duration: 5
    };

    const result = await runAutocannon(options);
    result.summary = buildResultSummary(result, {
      mode: isduration ? 'duration' : 'requests',
      target: Number(duration),
      connections: Number(connections),
      pipelining: Number(pipelining),
    });
    res.json(result);
  } catch (error) {
    console.error(error.stack || error.message);
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});

app.post("/test", async (req, res) => {
  let { url, connections, duration, pipelining, isduration } = req.body;

  const validation = validateTestInput({ url, connections, duration, pipelining });
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const normalizedHost = normalizeTarget(url);
  const protocol = await detectProtocol(normalizedHost);
  if (protocol == null) {
    return res.status(400).json({ error: "Please send a proper site link." });
  }
  const targetUrl = `${protocol}://${normalizedHost}`;

  try {
    const options = {
      url: targetUrl,
      connections: Number(connections),
      pipelining: Number(pipelining),
    };

    if (isduration) {
      options.duration = Number(duration);
    } else {
      options.amount = Number(duration);
    }

    const result = await runAutocannon(options);
    res.json(result);
  } catch (error) {
    console.error(error.stack || error.message);
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});

const runAutocannon = (options) => {
  return new Promise((resolve, reject) => {
    autocannon(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const buildResultSummary = (result, requested) => {
  const responseCount = ['1xx', '2xx', '3xx', '4xx', '5xx'].reduce(
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
  if (typeof url !== 'string' || url.trim() === '') {
    return { error: 'Please enter a site URL.' };
  }

  const numericFields = [
    ['connections', connections, 1, 500],
    ['pipelining', pipelining, 1, 100],
    ['duration or requests', duration, 1, 100000],
  ];

  for (const [label, value, min, max] of numericFields) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
      return { error: `Please enter ${label} between ${min} and ${max}.` };
    }
  }

  return {};
};

const normalizeTarget = (value) => {
  return value
    .trim()
    .replace(/^(https?:\/\/)/i, '')
    .replace(/^\/+/, '')
    .split('/')[0];
};

const detectProtocol = async (url) => {
  const requestOptions = {
    maxRedirects: 0,
    timeout: 5000,
    validateStatus: (status) => status >= 200 && status < 400,
  };

  try {
    const httpsRes = await axios.head(`https://${url}`, requestOptions);
    if (httpsRes.status >= 200 && httpsRes.status < 400) return 'https';
  } catch (err) {
    if (err.response?.status >= 300 && err.response?.status < 400) {
      return 'https';
    }
  }

  try {
    const httpRes = await axios.head(`http://${url}`, requestOptions);
    if (httpRes.status >= 200 && httpRes.status < 400) return 'http';
  } catch (err) {
    if (err.response?.status >= 300 && err.response?.status < 400) {
      return 'http';
    }
  }

  return null;
};

app.listen(port, () => console.log(`Server running on port ${port}`));

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
