# CannonPulse 🚀

> **High-Performance HTTP Stress & Load Testing Suite**  
> Powered by [Autocannon](https://github.com/mcollina/autocannon), React 19, Vite 7, and Express 5.

---

## Features

- **High-Concurrency Engine:** Measure requests per second (RPS), round-trip latency percentiles (p50, p75, p90, p99), and throughput bandwidth.
- **Full Path Support:** Fully compliant URL parser preserving entire paths, queries, and ports (`/api/v1/health`).
- **HTTP Methods & Payloads:** Benchmark `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `HEAD` with custom headers and raw JSON payloads.
- **Safety & Rate Limiting:** Built-in IP rate limiter, request body size limits, and `helmet` security headers.
- **Live Visuals:**
  - Dynamic health grade badge (**A** through **F**) computed from error ratios and response times.
  - Latency distribution visual histogram bars.
  - Real-time progress bar with an indeterminate shimmer for request-count mode.
  - Side-by-side benchmark comparison (pin run to compare before & after code changes).
- **Preset Management:** Preconfigured quick tests + save custom presets to `localStorage`.
- **Export Options:** One-click download of comprehensive JSON and CSV reports.
- **Abort / Cancel Support:** Instant cancellation of active benchmark runs via dedicated `/test/cancel` route.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x

### Development Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Benchmark
   ```
2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```
3. **Start backend daemon (port 5006):**
   ```bash
   npm run dev
   ```
4. **Start client dev server (port 5173):**
   ```bash
   cd client && npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Run

```bash
# Build Vite client bundle to client/dist/
npm run build

# Start production server (serves API and compiled client on port 5006)
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server uptime and health probe |
| `GET` | `/port` | Configured daemon port |
| `POST` | `/test` | Trigger load test job (rate-limited) |
| `POST` | `/test/cancel` | Immediately terminate active test by `testId` |
