import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { novelApi } from "../services/novelApi";
import { getCoverImage, handleImageError } from "../utils/coverUtils";

function Search({ darkMode }) {
  const [novels, setNovels] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNovels();
  }, [search, genre]);

  useEffect(() => {
    document.title = "Novel Search";
  }, []);

  const loadNovels = async () => {
    setLoading(true);
    try {
      // Fetch all novels with search parameter
      const response = await novelApi.getAllNovels(search);

      // Apply exact genre matching client-side if genre is selected
      let filteredNovels = response.data;
      if (genre) {
        filteredNovels = response.data.filter((novel) => novel.genre === genre);
      }

      setNovels(filteredNovels);

      // Only update genres list when not filtering
      if (!genre) {
        const allGenres = Array.from(
          new Set(response.data.map((n) => n.genre).filter(Boolean))
        ).sort();
        setGenres(allGenres);
      }
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNovelByKeyword = async (keyword) => {
    console.log("here", keyword);
    setLoading(true);
    try {
      const response = await novelApi.getNovelByKeyword(keyword);
      setNovels(response.data);
    } catch (error) {
      console.error("Error searching novels by keyword:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simplified handler without debug logging
  const handleGenreChange = (e) => setGenre(e.target.value);

  const handleSearchKeyDown = (e) => {
    console.log(e);
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      getNovelByKeyword(search);
    }
  };

  return (
    <div
      style={{
        padding: "32px 16px",
        background: darkMode
          ? "linear-gradient(145deg, #1a1a1a 0%, #121212 100%)"
          : "linear-gradient(145deg, #f9f9f9 0%, #ffffff 100%)",
        minHeight: "100vh",
        color: darkMode ? "#f7f7fb" : "#222",
      }}
    >
      {/* Search Header Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "24px",
            background: darkMode
              ? "linear-gradient(90deg, #61dafb 0%, #3a95e3 100%)"
              : "linear-gradient(90deg, #0066cc 0%, #004d99 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: darkMode
              ? "0 2px 10px rgba(97, 218, 251, 0.2)"
              : "0 2px 10px rgba(0, 102, 204, 0.1)",
          }}
        >
          Novel Library Search
        </h1>

        {/* Search Input */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
            position: "relative",
            maxWidth: "800px",
            margin: "0 auto 32px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              color: darkMode ? "#61dafb" : "#0066cc",
              zIndex: 2,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search novels by name, genre, or description..."
            style={{
              width: "100%",
              padding: "16px 24px 16px 54px",
              borderRadius: "16px",
              border: "none",
              fontSize: "18px",
              background: darkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
              boxShadow: darkMode
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.05)",
              outline: "none",
              color: darkMode ? "#f7f7fb" : "#222",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = darkMode
                ? "0 12px 36px rgba(97, 218, 251, 0.15)"
                : "0 12px 36px rgba(0, 102, 204, 0.1)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = darkMode
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.05)";
              e.target.style.transform = "translateY(0)";
            }}
          />
        </div>

        {/* Genre Filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "18px",
              background: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 102, 204, 0.03)",
              padding: "12px 24px",
              borderRadius: "12px",
              boxShadow: darkMode
                ? "0 4px 16px rgba(0, 0, 0, 0.2)"
                : "0 4px 16px rgba(0, 0, 0, 0.03)",
            }}
          >
            <label
              htmlFor="genre-select"
              style={{
                fontWeight: "600",
                fontSize: "17px",
                color: darkMode ? "#61dafb" : "#0066cc",
                letterSpacing: "0.5px",
              }}
            >
              Exact Genre Match:
            </label>
            <div style={{ position: "relative", width: "220px" }}>
              <select
                id="genre-select"
                value={genre}
                onChange={handleGenreChange}
                style={{
                  width: "100%",
                  padding: "10px 36px 10px 16px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  border: `2px solid ${darkMode ? "#2a2a2a" : "#e6e6e6"}`,
                  background: darkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
                  color: darkMode ? "#f7f7fb" : "#222",
                  appearance: "none",
                  outline: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = darkMode ? "#61dafb" : "#0066cc";
                  e.target.style.boxShadow = darkMode
                    ? "0 0 0 3px rgba(97, 218, 251, 0.2)"
                    : "0 0 0 3px rgba(0, 102, 204, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = darkMode ? "#2a2a2a" : "#e6e6e6";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {/* Custom arrow */}
              <svg
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: darkMode ? "#61dafb" : "#0066cc",
                  width: "16",
                  height: "16",
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Results count and status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            padding: "0 12px",
          }}
        >
          {!loading && (
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "500",
                color: darkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              }}
            >
              {novels.length > 0 ? (
                <>
                  Found{" "}
                  <span
                    style={{
                      color: darkMode ? "#61dafb" : "#0066cc",
                      fontWeight: "700",
                    }}
                  >
                    {novels.length}
                  </span>{" "}
                  novel{novels.length !== 1 ? "s" : ""}
                </>
              ) : (
                "No novels found"
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div className="loader-spinner"></div>
            <div
              style={{
                color: darkMode ? "#f7f7fb" : "#333",
                fontSize: "1.2rem",
              }}
            >
              Searching novels...
            </div>
          </div>
        ) : novels.length === 0 ? (
          // Empty State
          <div
            style={{
              textAlign: "center",
              color: darkMode ? "#f7f7fb" : "#333",
              fontSize: "1.5rem",
              fontWeight: "500",
              marginTop: "40px",
              padding: "40px 20px",
              background: darkMode ? "rgba(255,255,255,0.03)" : "#f9f9f9",
              borderRadius: "16px",
              boxShadow: darkMode
                ? "0 8px 32px rgba(0, 0, 0, 0.2)"
                : "0 8px 32px rgba(0, 0, 0, 0.05)",
              maxWidth: "700px",
              margin: "40px auto",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke={darkMode ? "#61dafb" : "#0066cc"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: "20px" }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div style={{ marginBottom: "15px" }}>
              No novels match your search
            </div>
            <div
              style={{
                fontSize: "1rem",
                opacity: 0.7,
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              Try adjusting your search terms or filter criteria to find what
              you're looking for.
            </div>
          </div>
        ) : (
          // Novel Cards Grid - Same style as Library for consistency
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {novels.map((novel) => {
              const id = novel.novelDetails?.id || novel.id;
              return (
                <div
                  key={id}
                  style={{
                    backgroundColor: darkMode ? "#1e1e1e" : "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: darkMode
                      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    border: `1px solid ${
                      darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }`,
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => navigate(`/novel/${id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = darkMode
                      ? "0 8px 24px rgba(0, 0, 0, 0.4)"
                      : "0 8px 24px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = darkMode
                      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  {/* Status badge */}
                  {novel.novelDetails?.status && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        zIndex: 1,
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          backgroundColor:
                            novel.novelDetails.status === "Reading"
                              ? "#4CAF50"
                              : novel.novelDetails.status === "Completed"
                              ? "#2196F3"
                              : novel.novelDetails.status === "Dropped"
                              ? "#F44336"
                              : novel.novelDetails.status === "On Hold"
                              ? "#FF9800"
                              : novel.novelDetails.status === "Plan to Read"
                              ? "#9C27B0"
                              : "#757575",
                          color: "white",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                      >
                        {novel.novelDetails.status}
                      </span>
                    </div>
                  )}

                  {/* Cover Image */}
                  <div
                    style={{
                      height: "250px",
                      overflow: "hidden",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      position: "relative",
                      backgroundColor: darkMode ? "#272727" : "#f5f5f5",
                    }}
                  >
                    <img
                      src={getCoverImage(novel)}
                      alt={novel.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "5px",
                      }}
                      onError={handleImageError}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        height: "35%",
                      }}
                    />
                  </div>

                  {/* Card header */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: `1px solid ${
                        darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                      }`,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        color: darkMode ? "#f7f7fb" : "#333",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.4",
                        height: "2.8em",
                      }}
                    >
                      {novel.name}
                    </h3>
                  </div>

                  {/* Card content */}
                  <div
                    style={{
                      padding: "16px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      color: darkMode
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(0,0,0,0.7)",
                    }}
                  >
                    {/* Genre */}
                    {novel.genre && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            opacity: 0.7,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                            width: "70px",
                          }}
                        >
                          Genre:
                        </span>
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: genre === novel.genre ? "700" : "500",
                            color:
                              genre === novel.genre && genre !== ""
                                ? darkMode
                                  ? "#61dafb"
                                  : "#0066cc"
                                : "inherit",
                            padding:
                              genre === novel.genre && genre !== ""
                                ? "0px 8px"
                                : "0",
                            backgroundColor:
                              genre === novel.genre && genre !== ""
                                ? darkMode
                                  ? "rgba(97, 218, 251, 0.15)"
                                  : "rgba(0, 102, 204, 0.08)"
                                : "transparent",
                            borderRadius: "4px",
                          }}
                        >
                          {novel.genre}
                        </span>
                      </div>
                    )}

                    {/* Main Character Name */}
                    {novel.novelDetails?.mcName && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            opacity: 0.7,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                            width: "70px",
                          }}
                        >
                          MC:
                        </span>
                        <span
                          style={{ fontSize: "0.95rem", fontWeight: "500" }}
                        >
                          {novel.novelDetails.mcName}
                        </span>
                      </div>
                    )}

                    {/* Chapters display */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          opacity: 0.7,
                          fontSize: "0.9rem",
                          flexShrink: 0,
                          width: "70px",
                        }}
                      >
                        Chapters:
                      </span>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          backgroundColor: darkMode
                            ? "rgba(97, 218, 251, 0.1)"
                            : "rgba(0, 102, 204, 0.05)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          color: darkMode ? "#61dafb" : "#0066cc",
                        }}
                      >
                        {!novel.novelDetails?.totalChapters ||
                        novel.novelDetails.totalChapters === 0
                          ? "N/A"
                          : `${novel.novelOpinion?.chaptersRead || 0}/${
                              novel.novelDetails.totalChapters
                            }`}
                      </span>
                    </div>

                    {/* Link - clickable separately */}
                    {novel.link && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "auto",
                          paddingTop: "8px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={novel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: darkMode ? "#61dafb" : "#0066cc",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 0",
                          }}
                        >
                          Visit Source
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15,3 21,3 21,9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
