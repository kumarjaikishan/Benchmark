const express = require("express");
const cors = require("cors");
const autocannon = require("autocannon");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.status(200).json({mgs:'Welcome to our Autocannon Backend'})
})

app.post("/test", async (req, res) => {
  const { url, connections, duration,pipelining } = req.body;

  try {
    const result = await autocannon({
      url,
      connections,
      duration,
      pipelining
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error running Autocannon test" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
