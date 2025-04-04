const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ mgs: 'Welcome to our Autocannon Backend' })
})

app.post("/test", async (req, res) => {
  const { url, connections, duration, pipelining } = req.body;
  let newurl = url;
  let neturl=newurl
  if (newurl.startsWith('http')) {
    newurl = url.split('//')[1]
    neturl=newurl;
  }
  console.log("neturl always:", neturl)
  const jai = await detectProtocol(newurl);
  console.log("protocol detected:", jai)
  newurl = jai+"://"+neturl;
  console.log("final protocol formed:", newurl)

  try {
    const result = await autocannon({
      url:newurl,
      connections,
      duration,
      pipelining
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});


const detectProtocol = async (url) => {
  try {
    const httpsRes = await axios.head(`https://${url}`, { maxRedirects: 0 });
    if (httpsRes.status >= 200 && httpsRes.status < 400) return 'https';
  } catch (err) {
    if (err.response?.status >= 300 && err.response?.status < 400) {
      // It's a redirect, still counts
      return 'https';
    }
  }

  try {
    const httpRes = await axios.head(`http://${url}`, { maxRedirects: 0 });
    if (httpRes.status >= 200 && httpRes.status < 400) return 'http';
  } catch (err) {
    if (err.response?.status >= 300 && err.response?.status < 400) {
      return 'http';
    }
  }

  return null; // unreachable or error
};


app.listen(5000, () => console.log("Server running on port 5000"));
