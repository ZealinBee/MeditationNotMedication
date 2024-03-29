import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png"

function Navigation() {
  const [expanded, setExpanded] = useState<boolean>(false);

  function handleClassToggle(): void {
    setExpanded(prev => !prev);
  }

  return (
    <div className="navigation">
      <Link to="/" className="web-logo">
        <img
          src={logo}
          alt="EasyEase"
          width="80px"
        />
      </Link>
      <button
        className="mobile-nav-toggle"
        onClick={handleClassToggle}
        aria-controls="primary-nav"
        aria-expanded={expanded ? "true" : "false"}
      >
        <span className="sr-only">Menu</span>
        <div id="hamburg" className={expanded ? "open" : ""}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <nav
        id="primary-nav"
        className={`primary-nav ${expanded ? "open" : ""}`}
      >
        <Link to="/browse">START BROWSING</Link>
        <Link to="/user-action-sign">LOGIN</Link>
        <Link to="/user-action-regis">SIGN UP</Link>
      </nav>
    </div>
  );
}

export default Navigation;