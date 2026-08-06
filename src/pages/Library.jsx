// pages/Library.jsx — Main library page: loads novels, provides filters, export and pagination
import { useState, useEffect } from "react";
import { novelApi } from "../services/novelApi";
import logger from "../utils/logger";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Library.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { getCoverImage, handleImageError } from "../utils/coverUtils";

const getSortValue = (novel, sortBy) => {
  switch (sortBy) {
    case "name":
      return (novel.name || "").toLowerCase();
    case "genre":
      return (novel.genre || "").toLowerCase();
    case "status":
      return (novel.novelDetails?.status || "").toLowerCase();
    case "rating":
      return Number(novel.novelOpinion?.rating ?? -1);
    case "lastUpdated":
      return Date.parse(novel.novelDetails?.lastUpdatedOn || 0) || 0;
    case "totalChapters":
      return Number(novel.novelDetails?.totalChapters ?? -1);
    case "chaptersRead":
      return Number(novel.novelOpinion?.chaptersRead ?? -1);
    default:
      return "";
  }
};

function Library({ darkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [novels, setNovels] = useState([]);
  const [filteredNovels, setFilteredNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("desc");
  const [genres, setGenres] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const novelsPerPage = 20;

  // Initialize currentPage from URL query param if present
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const page = parseInt(params.get("page"), 10);
      if (page && page > 0) setCurrentPage(page);
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") {
        const next = Math.max(1, currentPage - 1);
        if (next !== currentPage) {
          handlePageChange(next);
        }
      } else if (e.key === "ArrowRight") {
        const max = Math.max(1, Math.ceil(filteredNovels.length / novelsPerPage));
        const next = Math.min(max, currentPage + 1);
        if (next !== currentPage) {
          handlePageChange(next);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPage, filteredNovels.length, novelsPerPage, navigate]);

  useEffect(() => {
    document.title = "Novel Library";
    loadNovels();
  }, []);

  useEffect(() => {
    if (novels.length > 0) {
      let result = [...novels];

      if (genreFilter) {
        result = result.filter((novel) => novel.genre === genreFilter);
      }

      if (statusFilter) {
        result = result.filter(
          (novel) => novel.novelDetails?.status === statusFilter
        );
      }

      if (sortBy !== "default") {
        result.sort((a, b) => {
          const aValue = getSortValue(a, sortBy);
          const bValue = getSortValue(b, sortBy);
          const isDescending = sortOrder === "desc";

          if (typeof aValue === "string" && typeof bValue === "string") {
            const comparison = aValue.localeCompare(bValue);
            return isDescending ? -comparison : comparison;
          }

          const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          return isDescending ? -comparison : comparison;
        });
      }

      setFilteredNovels(result);
    }
  }, [novels, genreFilter, statusFilter, sortBy, sortOrder]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
    try {
      navigate(`${location.pathname}?page=1`, { replace: true });
    } catch (e) {
      // ignore
    }
  }, [genreFilter, statusFilter, sortBy, sortOrder, location.pathname, navigate]);

  const loadNovels = async () => {
    try {
      const response = await novelApi.getAllNovels();
      setNovels(response.data);

      const uniqueGenres = Array.from(
        new Set(response.data.map((novel) => novel.genre).filter(Boolean))
      ).sort();

      const uniqueStatuses = Array.from(
        new Set(
          response.data
            .map((novel) => novel.novelDetails?.status)
            .filter(Boolean)
        )
      ).sort();

      setGenres(uniqueGenres);
      setStatuses(uniqueStatuses);
    } catch (err) {
      setError("Failed to load novels");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setGenreFilter("");
    setStatusFilter("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // reflect page in URL so navigation back/forward preserves it
    try {
      navigate(`${location.pathname}?page=${pageNumber}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Pagination
  const paginatedNovels = filteredNovels.slice(
    (currentPage - 1) * novelsPerPage,
    currentPage * novelsPerPage
  );

  const exportToExcel = () => {
    // Create headers for Excel
    const headers = [
      "Name",
      "Original Name",
      "Genre",
      "Link",
      "Cover Image URL", // Added this header for novel cover
      "MC Name",
      "Special Characteristic",
      "Status",
      "Total Chapters",
      "Chapters Read",
      "Worth to Continue",
      "Last Updated",
      "Tags",
      "Description",
    ];

    // Map novels to rows of data
    const rows = filteredNovels.map((novel) => [
      novel.name || "",
      novel.originalName || "",
      novel.genre || "",
      novel.link || "",
      novel.novelDetails?.novelCover || "", // Added this field for novel cover URL
      novel.novelDetails?.mcName || "",
      novel.novelDetails?.specialCharacteristicOfMc || "",
      novel.novelDetails?.status || "",
      novel.novelDetails?.totalChapters || "",
      novel.novelOpinion?.chaptersRead || "",
      novel.novelOpinion?.worthToContinue ? "Yes" : "No",
      novel.novelDetails?.lastUpdatedOn
        ? new Date(novel.novelDetails.lastUpdatedOn).toLocaleDateString()
        : "",
      novel.novelDetails?.tags || "",
      novel.novelDetails?.description || "",
    ]);

    // Create worksheet from the data
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Format columns for better readability
    const wscols = [
      { wch: 20 }, // Name
      { wch: 20 }, // Original Name
      { wch: 15 }, // Genre
      { wch: 25 }, // Link
      { wch: 40 }, // Cover Image URL (wider column for URLs)
      { wch: 15 }, // MC Name
      { wch: 20 }, // Special Characteristic
      { wch: 12 }, // Status
      { wch: 12 }, // Total Chapters
      { wch: 12 }, // Chapters Read
      { wch: 12 }, // Worth to Continue
      { wch: 12 }, // Last Updated
      { wch: 20 }, // Tags
      { wch: 50 }, // Description
    ];
    ws["!cols"] = wscols;

    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Novels");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save the file
    saveAs(
      data,
      `novel-library-export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    logger.info("Exported novels to Excel format (.xlsx)");
  };

  // Render content
  let content;
  try {
    if (loading) {
      content = (
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
            style={{ color: darkMode ? "#f7f7fb" : "#333", fontSize: "1.2rem" }}
          >
            Loading your collection...
          </div>
        </div>
      );
    } else if (error) {
      content = (
        <div
          style={{
            textAlign: "center",
            color: darkMode ? "#ff6b6b" : "#e74c3c",
            fontSize: "1.2rem",
            marginTop: "40px",
            padding: "20px",
            background: darkMode
              ? "rgba(255,107,107,0.1)"
              : "rgba(231,76,60,0.05)",
            borderRadius: "12px",
            maxWidth: "800px",
            margin: "40px auto",
            border: `1px solid ${
              darkMode ? "rgba(255,107,107,0.2)" : "rgba(231,76,60,0.1)"
            }`,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Error</div>
          {error}
        </div>
      );
    } else if (!novels || novels.length === 0) {
      content = (
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
            border: `1px solid ${
              darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
            }`,
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <div style={{ marginBottom: "15px" }}>
            Your library is currently empty
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
            Start adding novels to explore your collection!
          </div>
        </div>
      );
    } else {
      content = (
        <div className={`library-container${darkMode ? " dark-mode" : ""}`}>
          {/* Header with total novels count and filters */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              padding: "0 10px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            {/* Left side - Collection count and export */}
            <div
              style={{
                color: darkMode ? "#f7f7fb" : "#333",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onClick={exportToExcel}
              title="Click to export library to Excel"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>
                Your Collection:{" "}
                <span style={{ color: darkMode ? "#61dafb" : "#0066cc" }}>
                  {novels.length} Novels
                </span>
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? "#61dafb" : "#0066cc"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "4px" }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>

            {/* Right side - Filters */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              {/* Genre Filter */}
              <div style={{ position: "relative", minWidth: "180px" }}>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#f7f7fb" : "#333",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={darkMode ? "#f7f7fb" : "#333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Status Filter */}
              <div style={{ position: "relative", minWidth: "180px" }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#f7f7fb" : "#333",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={darkMode ? "#f7f7fb" : "#333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Sort By */}
              <div style={{ position: "relative", minWidth: "180px" }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#f7f7fb" : "#333",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="default">Default Order</option>
                  <option value="name">Name</option>
                  <option value="genre">Genre</option>
                  <option value="status">Status</option>
                  <option value="rating">Rating</option>
                  <option value="lastUpdated">Last Updated</option>
                  <option value="totalChapters">Total Chapters</option>
                  <option value="chaptersRead">Chapters Read</option>
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={darkMode ? "#f7f7fb" : "#333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Sort Order */}
              <div style={{ position: "relative", minWidth: "140px" }}>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                    background: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#f7f7fb" : "#333",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={darkMode ? "#f7f7fb" : "#333"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Clear Filters Button - Only show when filters are applied */}
              {(genreFilter || statusFilter) && (
                <button
                  onClick={clearFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "8px 12px",
                    background: darkMode ? "#444" : "#f0f0f0",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: darkMode ? "#f7f7fb" : "#333",
                    fontSize: "0.9rem",
                  }}
                >
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
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Results Info - Show when filters are active */}
          {(genreFilter || statusFilter) && (
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: darkMode
                  ? "rgba(97, 218, 251, 0.1)"
                  : "rgba(0, 102, 204, 0.05)",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "0.95rem",
                color: darkMode ? "#f7f7fb" : "#333",
              }}
            >
              Showing {filteredNovels.length} of {novels.length} novels
              {genreFilter && ` • Genre: ${genreFilter}`}
              {statusFilter && ` • Status: ${statusFilter}`}
              {sortBy !== "default" && ` • Sorted by ${sortBy} (${sortOrder})`}
            </div>
          )}

          {/* Empty state for filtered results */}
          {filteredNovels.length === 0 && novels.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: darkMode
                  ? "rgba(255,255,255,0.03)"
                  : "#f9f9f9",
                borderRadius: "12px",
                marginBottom: "30px",
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke={darkMode ? "#61dafb" : "#0066cc"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: "15px" }}
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h3
                style={{
                  marginBottom: "10px",
                  color: darkMode ? "#f7f7fb" : "#333",
                }}
              >
                No novels match your filters
              </h3>
              <p
                style={{
                  color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                }}
              >
                Try changing your filter criteria or{" "}
                <button
                  onClick={clearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: darkMode ? "#61dafb" : "#0066cc",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "0 5px",
                    fontSize: "inherit",
                  }}
                >
                  clear all filters
                </button>
              </p>
            </div>
          )}

          {/* Novel list - one novel per row with description */}
          {filteredNovels.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
              {paginatedNovels.map((novel) => {
                const id = novel.novelDetails?.id || novel.id;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                      backgroundColor: darkMode ? "#1e1e1e" : "#fff",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
                      border: `1px solid ${darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"}`,
                      padding: "12px",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/novel/${id}?fromPage=${currentPage}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = darkMode ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = darkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)";
                    }}
                  >
                    {/* Cover */}
                    <div style={{ width: "140px", flex: "0 0 140px", borderRadius: "8px", overflow: "hidden", backgroundColor: darkMode ? "#272727" : "#f5f5f5" }}>
                      <img
                        src={getCoverImage(novel)}
                        alt={novel.name}
                        style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                        onError={handleImageError}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: darkMode ? "#f7f7fb" : "#222", cursor: "pointer" }}>{novel.name}</h3>
                        {novel.novelDetails?.status && (
                          <span style={{ padding: "6px 10px", borderRadius: "16px", fontSize: "0.75rem", fontWeight: 700, color: "#fff", backgroundColor: novel.novelDetails.status === "Reading" ? "#4CAF50" : novel.novelDetails.status === "Completed" ? "#2196F3" : novel.novelDetails.status === "Dropped" ? "#F44336" : novel.novelDetails.status === "On Hold" ? "#FF9800" : novel.novelDetails.status === "Plan to Read" ? "#9C27B0" : "#757575" }}>{novel.novelDetails.status}</span>
                        )}
                      </div>

                      {/* Description */}
                      <div style={{ color: darkMode ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)", fontSize: "0.95rem", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {novel.novelDetails?.description || "No description available."}
                      </div>

                      {/* Meta Row */}
                      <div style={{ display: "flex", gap: "18px", alignItems: "center", marginTop: "6px", flexWrap: "wrap" }}>
                        {novel.genre && (
                          <div style={{ color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: "0.9rem" }}><strong style={{ color: darkMode ? "#9fdcff" : "#0066cc" }}>Genre:</strong> <span style={{ marginLeft: "6px" }}>{novel.genre}</span></div>
                        )}

                        {novel.novelDetails?.mcName && (
                          <div style={{ color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: "0.9rem" }}><strong style={{ color: darkMode ? "#9fdcff" : "#0066cc" }}>MC:</strong> <span style={{ marginLeft: "6px" }}>{novel.novelDetails.mcName}</span></div>
                        )}

                        <div style={{ color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: "0.9rem" }}><strong style={{ color: darkMode ? "#9fdcff" : "#0066cc" }}>Chapters:</strong> <span style={{ marginLeft: "6px", fontWeight: 700 }}>{!novel.novelDetails?.totalChapters || novel.novelDetails.totalChapters === 0 ? "N/A" : `${novel.novelOpinion?.chaptersRead || 0}/${novel.novelDetails.totalChapters}`}</span></div>

                        {novel.link && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <a href={novel.link} target="_blank" rel="noopener noreferrer" style={{ color: darkMode ? "#61dafb" : "#0066cc", textDecoration: "none", fontSize: "0.95rem" }}>Visit Source</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination controls - adjusted for filteredNovels */}
          {filteredNovels.length > novelsPerPage && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "30px",
                marginBottom: "20px",
                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  background: darkMode
                    ? currentPage === 1
                      ? "#1a1a1a"
                      : "#333"
                    : currentPage === 1
                    ? "#f0f0f0"
                    : "#fff",
                  color:
                    currentPage === 1
                      ? darkMode
                        ? "#555"
                        : "#ccc"
                      : darkMode
                      ? "#f7f7fb"
                      : "#333",
                  border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                  borderRadius: "8px",
                  width: "40px",
                  height: "40px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: darkMode ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div
                style={{
                  background: darkMode ? "#1e1e1e" : "#fff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  color: darkMode ? "#f7f7fb" : "#333",
                  border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                  minWidth: "100px",
                  textAlign: "center",
                  boxShadow: darkMode ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                Page {currentPage} of {Math.ceil(filteredNovels.length / novelsPerPage)}
              </div>

              <button
                onClick={() =>
                  currentPage < Math.ceil(filteredNovels.length / novelsPerPage) &&
                  handlePageChange(currentPage + 1)
                }
                disabled={
                  currentPage >= Math.ceil(filteredNovels.length / novelsPerPage)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  background: darkMode
                    ? currentPage >= Math.ceil(filteredNovels.length / novelsPerPage)
                      ? "#1a1a1a"
                      : "#333"
                    : currentPage >= Math.ceil(filteredNovels.length / novelsPerPage)
                    ? "#f0f0f0"
                    : "#fff",
                  color:
                    currentPage >= Math.ceil(filteredNovels.length / novelsPerPage)
                      ? darkMode
                        ? "#555"
                        : "#ccc"
                      : darkMode
                      ? "#f7f7fb"
                      : "#333",
                  border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
                  borderRadius: "8px",
                  width: "40px",
                  height: "40px",
                  cursor:
                    currentPage >= Math.ceil(novels.length / novelsPerPage)
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    currentPage >= Math.ceil(novels.length / novelsPerPage)
                      ? 0.6
                      : 1,
                  transition: "all 0.2s ease",
                  boxShadow: darkMode ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    }
  } catch (err) {
    content = (
      <div style={{ color: "red" }}>
        Unexpected error occurred: {err?.message || String(err)}
      </div>
    );
  }

  return (
    <>
      {successModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "24px",
              minWidth: "320px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
              Update Successful
            </div>
            <div style={{ marginBottom: "12px" }}>
              The novel has been updated successfully.
            </div>
            <button
              onClick={() => setSuccessModal(false)} // Close modal
              style={{
                padding: "6px 18px",
                background: "#2980b9",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {content}
    </>
  );
}

export default Library;
