import { useState, useEffect } from "react";
import { novelApi } from "../services/novelApi";

function Search() {
  const [novels, setNovels] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, [search, genre]);

  useEffect(() => {
    document.title = "Novel Search";
  }, []);

  const loadNovels = async () => {
    setLoading(true);
    try {
      const response = await novelApi.getAllNovels(search, genre);
      setNovels(response.data);
      // Collect unique genres for filter dropdown
      const genreList = Array.from(
        new Set(response.data.map((n) => n.genre).filter(Boolean))
      );
      setGenres(genreList);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ padding: "32px 0", background: "#f7f7fb", minHeight: "100vh" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Light Novel By Title"
          style={{
            width: "600px",
            padding: "16px 40px",
            borderRadius: "32px",
            border: "none",
            fontSize: "18px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            outline: "none",
            color: "#222", // <-- input text black
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            background: "linear-gradient(90deg, #eaf6ff 0%, #f0f6fa 100%)",
            padding: "16px 36px",
            borderRadius: "36px",
            boxShadow: "0 4px 16px rgba(41,128,185,0.08)",
            minWidth: "340px",
            marginTop: "8px",
            marginBottom: "8px",
          }}
        >
          <label
            htmlFor="genre-select"
            style={{
              fontWeight: "bold",
              fontSize: "17px",
              color: "#2980b9",
              letterSpacing: "0.5px",
              marginRight: "8px",
            }}
          >
            Genre
          </label>
          <div style={{ position: "relative", width: "190px" }}>
            <select
              id="genre-select"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 44px 12px 18px",
                borderRadius: "24px",
                fontSize: "16px",
                border: "1.5px solid #2980b9",
                background: "#fff",
                color: "#222",
                appearance: "none",
                boxShadow: "0 2px 8px rgba(41,128,185,0.10)",
                outline: "none",
                cursor: "pointer",
                transition: "border-color 0.2s",
                fontWeight: "500",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#145a8a")}
              onBlur={(e) => (e.target.style.borderColor = "#2980b9")}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {/* Custom arrow */}
            <span
              style={{
                position: "absolute",
                right: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: "20px",
                color: "#2980b9",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* <div
          style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "12px" }}
        >
          Hot keywords
        </div> */}
        <div
          style={{
            borderBottom: "1px solid #eaeaea",
            marginBottom: "18px",
            width: "160px",
          }}
        />
      </div>
      <div style={{ maxWidth: "900px", margin: "32px auto 0" }}>
        {loading ? (
          <div>Loading novels...</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {novels.map((novel) => (
              <li
                key={novel.novelDetails?.id || novel.id}
                style={{
                  background: "#fff",
                  marginBottom: "12px",
                  padding: "18px 24px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {novel.name}
                  {novel.link && (
                    <a
                      href={novel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginLeft: "12px",
                        color: "#2980b9",
                        fontSize: "15px",
                      }}
                    >
                      Read
                    </a>
                  )}
                </div>
                <div style={{ fontSize: "15px", color: "#888" }}>
                  Genre: {novel.genre}
                </div>
                <div style={{ marginTop: "6px", color: "#444" }}>
                  {novel.novelDetails?.description}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Search;
