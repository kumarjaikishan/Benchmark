const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");
const axios = require('axios');
const path = require('path');
const port = process.env.PORT || 5006;

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
    res.json(result);
  } catch (error) {
    console.error(error.stack || error.message);
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});

app.post("/test", async (req, res) => {
  let { url, connections, duration, pipelining, isduration } = req.body;
  console.log(req.body);

  url = url.trim().replace(/^(https?:\/\/)?\/?/, '');

  let newurl = url;
  if (newurl.startsWith('http')) {
    newurl = url.split('//')[1];
  }
  const jai = await detectProtocol(newurl);
  console.log("protocol detected:", jai);
  if (jai == null) {
    return res.status(400).json({ error: "Please send a proper site link." });
  }
  newurl = jai + "://" + newurl;

  try {
    const options = {
      url: newurl,
      connections: connections,
      pipelining: pipelining,
    };

    if (isduration) {
      options.duration = duration;
    } else {
      options.amount = duration;
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

const detectProtocol = async (url) => {
  try {
    const httpsRes = await axios.head(`https://${url}`, { maxRedirects: 0 });
    if (httpsRes.status >= 200 && httpsRes.status < 400) return 'https';
  } catch (err) {
    console.log(err.message);
    if (err.response?.status >= 300 && err.response?.status < 400) {
      return 'https';
    }
  }

  try {
    const httpRes = await axios.head(`http://${url}`, { maxRedirects: 0 });
    if (httpRes.status >= 200 && httpRes.status < 400) return 'http';
  } catch (err) {
    console.log(err.message);
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
