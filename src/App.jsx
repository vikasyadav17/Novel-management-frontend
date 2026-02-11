// filepath: d:\Save your projects here\Mern\novel-library\src\App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NovelForm from "./components/NovelForm";
import Library from "./pages/Library";
import Search from "./pages/Search"; // import Search page
import BulkUploadPage from "./pages/BulkUploadPage"; // Import BulkUploadPage
import NovelDetails from "./pages/NovelDetails"; // Import NovelDetails
import "./App.css";
import { novelApi } from "./services/novelApi"; // <-- add this import

function App() {
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleAddNovel = async (newNovel) => {
    try {
      const resp = await novelApi.addNovel(newNovel);
      const data = resp?.data ?? resp;
      console.log("Add novel response:", resp, data);

      // Prefer server message, fallback to generic text
      const message = data?.message || data?.msg || "Novel added successfully";

      // If server returns explicit success flag use it, otherwise infer from HTTP status
      const success =
        typeof data?.success === "boolean"
          ? data.success
          : resp?.status >= 200 && resp?.status < 300;

      if (success) {
        alert(message);
      } else {
        // Server accepted request but responded with a domain-level failure (e.g. validation)
        alert(message || "Request completed but returned invalid result.");
      }

      return resp;
    } catch (err) {
      console.error("Failed to add novel:", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to add novel";
      setError("Failed to add novel: " + backendMessage);
      alert("Error adding novel: " + backendMessage);
      throw err; // re-throw so callers can handle if needed
    }
  };

  const handleBulkUpload = async (novels) => {
    try {
      // You can call your API here to upload the novels in bulk
      console.log("Bulk upload data:", novels);
      // Example: await novelApi.bulkUpload(novels);
    } catch (err) {
      console.error(err);
      setError("Failed to upload novels in bulk");
    }
  };

  return (
    <Router>
      <div className={`app-container${darkMode ? " dark-mode" : ""}`}>
        <header
          className="app-header"
          style={{
            background: darkMode
              ? "linear-gradient(90deg, #222 0%, #333 100%)"
              : "linear-gradient(90deg, #eaf6ff 0%, #dde6f7 100%)",
            color: darkMode ? "#f7f7fb" : "#222",
            padding: "32px 0 24px 0",
            boxShadow: darkMode
              ? "0 2px 12px rgba(41,128,185,0.18)"
              : "0 2px 12px rgba(41,128,185,0.06)",
            marginBottom: "32px",
            borderRadius: "0 0 32px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "0 32px",
            }}
          >
            {/* Left: Logo + Title */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "14px" }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <rect
                    x="8"
                    y="12"
                    width="32"
                    height="24"
                    rx="6"
                    fill="#2980b9"
                    opacity="0.18"
                  />
                  <rect
                    x="12"
                    y="8"
                    width="32"
                    height="24"
                    rx="6"
                    fill="#27ae60"
                    opacity="0.18"
                  />
                  <rect
                    x="4"
                    y="16"
                    width="32"
                    height="24"
                    rx="6"
                    fill="#e74c3c"
                    opacity="0.18"
                  />
                </svg>
              </span>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                }}
              >
                <h1
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: "bold",
                    color: darkMode ? "#f7f7fb" : "#222", // <-- fix for dark mode
                    textShadow: darkMode
                      ? "0 2px 8px rgba(41,128,185,0.18)"
                      : "0 2px 8px rgba(41,128,185,0.08)",
                    margin: 0,
                    letterSpacing: "1px",
                    cursor: "pointer",
                  }}
                >
                  Novel Updates
                </h1>
              </Link>
            </div>
            {/* Right: Navigation */}
            <nav style={{ display: "flex", alignItems: "center" }}>
              <Link
                to="/"
                style={{
                  color: "#2980b9",
                  fontWeight: "500",
                  textDecoration: "none",
                  margin: "0 12px",
                  fontSize: "18px",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#eaf6ff")}
                onMouseOut={(e) => (e.target.style.background = "transparent")}
              >
                Home
              </Link>
              <span style={{ color: "#bbb", fontSize: "18px" }}>|</span>
              <Link
                to="/library"
                style={{
                  color: "#2980b9",
                  fontWeight: "500",
                  textDecoration: "none",
                  margin: "0 12px",
                  fontSize: "18px",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#eaf6ff")}
                onMouseOut={(e) => (e.target.style.background = "transparent")}
              >
                Library
              </Link>
              <span style={{ color: "#bbb", fontSize: "18px" }}>|</span>
              <Link
                to="/search"
                style={{
                  color: "#2980b9",
                  fontWeight: "500",
                  textDecoration: "none",
                  margin: "0 12px",
                  fontSize: "18px",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#eaf6ff")}
                onMouseOut={(e) => (e.target.style.background = "transparent")}
              >
                Search
              </Link>
              <span style={{ color: "#bbb", fontSize: "18px" }}>|</span>
              <Link
                to="/bulk-upload"
                style={{
                  color: "#2980b9",
                  fontWeight: "500",
                  textDecoration: "none",
                  margin: "0 12px",
                  fontSize: "18px",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#eaf6ff")}
                onMouseOut={(e) => (e.target.style.background = "transparent")}
              >
                Bulk Upload
              </Link>
            </nav>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <NovelForm
                  onAddNovel={handleAddNovel}
                  onBulkUpload={handleBulkUpload}
                  darkMode={false} // Pass darkMode if needed
                />
              }
            />
            <Route path="/library" element={<Library darkMode={darkMode} />} />
            <Route
              path="/search"
              element={<Search darkMode={darkMode} />}
            />{" "}
            {/* add this line */}
            <Route
              path="/bulk-upload"
              element={<BulkUploadPage onBulkUpload={handleBulkUpload} />}
            />
            <Route path="/novel/:id" element={<NovelDetails />} />{" "}
            {/* Add route for novel details */}
          </Routes>
          {error && <div>{error}</div>}
        </main>
        {/* Dark mode toggle button at bottom right */}
        <button
          onClick={() => setDarkMode((d) => !d)}
          style={{
            position: "fixed",
            right: "32px",
            bottom: "32px",
            padding: "0",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            background: darkMode ? "#2980b9" : "#eaf6ff",
            color: darkMode ? "#fff" : "#222",
            fontSize: "1.4rem", // smaller icon
            boxShadow: "0 2px 12px rgba(41,128,185,0.12)",
            cursor: "pointer",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>
    </Router>
  );
}

export default App;
