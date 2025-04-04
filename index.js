const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.post("/test", async (req, res) => {
  let { url, connections, duration, pipelining } = req.body;
  url = url.trim().replace(/^(https?:\/\/)?\/?/, '');

  let newurl = url;
  if (newurl.startsWith('http')) {
    newurl = url.split('//')[1]
  }
  const jai = await detectProtocol(newurl);
  console.log("protocol detected:", jai)
  if (jai == null) {
    return res.status(400).json({ error: "Please send a proper site link." });
  }
  newurl = jai + "://" + newurl;

  try {
    const result = await autocannon({
      url: newurl,
      connections,
      duration,
      pipelining
    });
    res.json(result);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});


const detectProtocol = async (url) => {
  try {
    const httpsRes = await axios.head(`https://${url}`, { maxRedirects: 0 });
    if (httpsRes.status >= 200 && httpsRes.status < 400) return 'https';
  } catch (err) {
    console.log(err)
    if (err.response?.status >= 300 && err.response?.status < 400) {
      // It's a redirect, still counts
      return 'https';
    }
  }

  try {
    const httpRes = await axios.head(`http://${url}`, { maxRedirects: 0 });
    if (httpRes.status >= 200 && httpRes.status < 400) return 'http';
  } catch (err) {
    console.log(err)
    if (err.response?.status >= 300 && err.response?.status < 400) {
      return 'http';
    }
  }

  return null; // unreachable or error
};


app.listen(5000, () => console.log("Server running on port 5000"));
