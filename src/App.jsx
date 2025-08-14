// filepath: d:\Save your projects here\Mern\novel-library\src\App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NovelForm from "./components/NovelForm";
import Library from "./pages/Library";
import "./App.css";

function App() {
  const [error, setError] = useState(null);

  const handleAddNovel = async (newNovel) => {
    try {
      // You can call your API here if needed
      // await novelApi.addNovel(newNovel);
    } catch (err) {
      console.error(err);
      setError("Failed to add novel");
    }
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>📚 Novel Updates</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/library">Library</Link>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<NovelForm onAddNovel={handleAddNovel} />}
            />
            <Route path="/library" element={<Library />} />
          </Routes>
          {error && <div>{error}</div>}
        </main>
      </div>
    </Router>
  );
}

export default App;
