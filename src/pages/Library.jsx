import { useState, useEffect, useRef } from "react";
import { novelApi } from "../services/novelApi";
import logger from "../utils/logger";
import { useNavigate } from "react-router-dom";
import "../styles/Library.css";
import defaultCoverImage from "../assets/images/Sword_god.jpg";

function Library({ darkMode }) {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingCell, setEditingCell] = useState(null); // { rowId, field }
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const [modal, setModal] = useState({
    show: false,
    field: "",
    oldValue: "",
    newValue: "",
    rowId: null,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const novelsPerPage = 20; // Changed from 10 to 20 novels per page
  const tableRef = useRef();

  // Error boundary state
  const [renderError, setRenderError] = useState(null);
  const [successModal, setSuccessModal] = useState(false); // Add success modal state

  useEffect(() => {
    document.title = "Novel Updates";
  }, []);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    logger.info("Loading novels...");
    try {
      const response = await novelApi.getAllNovels();
      logger.info("Novels loaded successfully:", response.data);
      setNovels(response.data);
    } catch (err) {
      logger.error("Failed to load novels:", err.message);
      setError("Failed to load novels");
    } finally {
      setLoading(false);
    }
  };

  const fetchNovelByName = async (name) => {
    logger.info("Fetching novel by name:", name);
    try {
      const response = await novelApi.getNovelByName(name); // Call the API method
      logger.info("Novel fetched successfully:", response.data);
      setNovels([response.data]); // Update the novels state with the fetched novel
    } catch (err) {
      logger.error("Failed to fetch novel by name:", err.message);
      setError("Failed to fetch novel by name.");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCellDoubleClick = (rowId, field) => {
    setEditId(rowId);
    setEditingCell({ rowId, field });
    const novel = novels.find((n) => (n.novelDetails?.id || n.id) === rowId);
    setEditData({
      name: novel.name,
      originalName: novel.originalName || "",
      genre: novel.genre,
      description: novel.novelDetails?.description || "", // Ensure description is fetched correctly
      link: novel.link || "",
    });
  };

  const handleCellBlur = (id) => {
    if (!editingCell) return;
    const field = editingCell.field;
    const novel = novels.find((n) => (n.novelDetails?.id || n.id) === id);
    let oldValue = "";
    if (field === "name") oldValue = novel.name;
    else if (field === "link") oldValue = novel.link;
    else if (field === "genre") oldValue = novel.genre;
    else if (field === "description")
      oldValue = novel.novelDetails?.description || "";
    const newValue = editData[field];

    // Prevent modal and request if the new value is empty
    if (!newValue || String(newValue).trim() === "") {
      logger.warn(`Field "${field}" cannot be empty. Changes discarded.`);
      setEditingCell(null);
      setEditId(null);
      setEditData({});
      return;
    }

    // Only show modal if value changed
    if (String(oldValue) !== String(newValue)) {
      setModal({
        show: true,
        field,
        oldValue,
        newValue,
        rowId: id,
      });
    } else {
      setEditingCell(null);
      setEditId(null);
      setEditData({});
    }
  };

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleModalConfirm = async () => {
    await handleEditSave(modal.rowId);
    setModal({
      show: false,
      field: "",
      oldValue: "",
      newValue: "",
      rowId: null,
    });
    setEditingCell(null);
    setEditId(null);
  };

  const handleModalCancel = () => {
    setModal({
      show: false,
      field: "",
      oldValue: "",
      newValue: "",
      rowId: null,
    });
    setEditingCell(null);
    setEditId(null);
    setEditData({});
  };

  const handleEditSave = async (id) => {
    logger.info("Saving edits for novel ID:", id, "with data:", editData);
    try {
      const novel = novels.find((n) => (n.novelDetails?.id || n.id) === id);

      const payload = {
        name: editData.name,
        originalName: editData.originalName,
        genre: editData.genre,
        link: editData.link,
        novelDetails: {
          ...novel.novelDetails, // Preserve existing novelDetails properties
          description: editData.description, // Update description
        },
      };

      logger.info("Request payload:", payload);
      await fetch(`http://localhost:8080/novels/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      logger.info("Edit saved successfully for novel ID:", id);
      setEditData({});
      setSuccessModal(true); // Show success modal
      loadNovels();
    } catch (err) {
      logger.error("Failed to save edits for novel ID:", id, err.message);
      setError(
        "Failed to update novel: " + (err?.message || JSON.stringify(err))
      );
    }
  };

  const handleTitleMouseEnter = (e, originalName) => {
    if (!originalName) return;
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      show: true,
      text: originalName,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 8, // show above the cell
    });
  };

  const handleTitleMouseLeave = () => {
    setTooltip({ show: false, text: "", x: 0, y: 0 });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedNovels = novels.slice(
    (currentPage - 1) * novelsPerPage,
    currentPage * novelsPerPage
  );

  // Replace the content rendering section (where the table is)
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
          {/* Header with total novels count */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              padding: "0 10px",
            }}
          >
            <div
              style={{
                color: darkMode ? "#f7f7fb" : "#333",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
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
            </div>
          </div>

          {/* Novel cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            {paginatedNovels.map((novel) => {
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
                      height: "250px", // Increased from 180px to 250px
                      overflow: "hidden",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      position: "relative",
                      backgroundColor: darkMode ? "#272727" : "#f5f5f5", // Added background color
                    }}
                  >
                    <img
                      src={novel.novelDetails?.novelCover || defaultCoverImage}
                      alt={novel.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain", // Changed from "cover" to "contain" to show full image
                        padding: "5px", // Added padding to prevent image from touching edges
                      }}
                      onError={(e) => {
                        e.target.src = defaultCoverImage;
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        height: "35%", // Reduced overlay height
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
                          style={{ fontSize: "0.95rem", fontWeight: "500" }}
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

                    {/* Updated Chapters display with read/total format or N/A */}
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

          {/* Pagination controls */}
          {novels.length > novelsPerPage && (
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
                Page {currentPage} of {Math.ceil(novels.length / novelsPerPage)}
              </div>

              <button
                onClick={() =>
                  currentPage < Math.ceil(novels.length / novelsPerPage) &&
                  handlePageChange(currentPage + 1)
                }
                disabled={
                  currentPage >= Math.ceil(novels.length / novelsPerPage)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  background: darkMode
                    ? currentPage >= Math.ceil(novels.length / novelsPerPage)
                      ? "#1a1a1a"
                      : "#333"
                    : currentPage >= Math.ceil(novels.length / novelsPerPage)
                    ? "#f0f0f0"
                    : "#fff",
                  color:
                    currentPage >= Math.ceil(novels.length / novelsPerPage)
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
    setRenderError(err);
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
