import { CannonIcon } from "./Icons";

export default function Navbar() {
  return (
    <nav className="app-navbar">
      <div className="brand-section">
        <div className="brand-logo-glow" title="CannonPulse by Webnex Labs">
          <CannonIcon />
        </div>
        <div className="brand-titles">
          <h1>CANNONPULSE</h1>
          <span style={{ letterSpacing: "0.14em", color: "#38bdf8" }}>BY WEBNEX LABS</span>
        </div>
      </div>

      <div className="nav-badges">
        <div className="system-status-pill">
          <span className="pulse-dot"></span>
          ENGINE READY
        </div>
      </div>
    </nav>
  );
}
