import { useState, useEffect, useRef } from "react";
import { novelApi } from "../services/novelApi";
import logger from "../utils/logger"; // Import the logger
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Library({ darkMode }) {
  const navigate = useNavigate(); // Initialize navigate
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
  const novelsPerPage = 10; // Number of novels per page
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

  let content;
  try {
    if (loading) {
      content = (
        <div
          style={{
            textAlign: "center",
            color: darkMode ? "#f7f7fb" : "#333",
            fontSize: "1.2rem",
            marginTop: "40px",
            padding: "20px",
          }}
        >
          Loading novels...
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
          }}
        >
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
            fontWeight: "bold",
            marginTop: "40px",
            padding: "20px",
            background: darkMode ? "#444" : "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "600px",
            margin: "40px auto",
          }}
        >
          Your library is currently empty. Start adding novels to explore your
          collection!
        </div>
      );
    } else {
      content = (
        <div
          className={`library-table-container${darkMode ? " dark-mode" : ""}`}
        >
          <table
            className="library-table"
            style={{
              width: "100%",
              tableLayout: "fixed", // This forces the columns to distribute evenly
            }}
          >
            <colgroup>
              <col style={{ width: "4%" }} /> {/* ID */}
              <col style={{ width: "18%" }} /> {/* Title */}
              <col style={{ width: "13%" }} /> {/* Link */}
              <col style={{ width: "10%" }} /> {/* Genre */}
              <col style={{ width: "10%" }} /> {/* Status */}
              <col style={{ width: "8%" }} /> {/* Total Chapters */}
              <col style={{ width: "22%" }} /> {/* Rating */}
              <col style={{ width: "15%" }} /> {/* Worth to Continue */}
            </colgroup>
            <thead>
              <tr>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Title
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Link
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Genre
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  Chapters
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  Rating
                </th>
                <th
                  style={{
                    color: darkMode ? "#f7f7fb" : undefined,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  Worth to Continue
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedNovels.map((novel) => {
                const id = novel.novelDetails?.id || novel.id;
                return (
                  <tr key={id} style={{ minHeight: "48px" }}>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                      }}
                    >
                      {id}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        position: "relative",
                        color: darkMode ? "#6ec6ff" : "#2980b9",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate(`/novel/${id}`)}
                    >
                      {novel.name}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                      }}
                    >
                      {novel.link ? (
                        <a
                          href={novel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: darkMode ? "#6ec6ff" : "#2980b9",
                            textDecoration: "none",
                          }}
                        >
                          {novel.link}
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                      }}
                    >
                      {novel.genre}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                        textAlign: "center",
                      }}
                    >
                      {novel.novelDetails?.status ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
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
                          }}
                        >
                          {novel.novelDetails.status}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                        textAlign: "center",
                      }}
                    >
                      {novel.novelDetails?.totalChapters ? (
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                            color: darkMode ? "#61dafb" : "#0066cc",
                          }}
                        >
                          {novel.novelDetails.totalChapters}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                        textAlign: "center",
                        paddingRight: "10px",
                      }}
                    >
                      {novel.novelOpinion?.rating !== undefined &&
                      novel.novelOpinion?.rating !== null ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#FFD700",
                              fontSize: "1.5rem",
                              letterSpacing: "3px",
                            }}
                          >
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ display: "inline-block" }}>
                                {i < Math.round(novel.novelOpinion.rating / 2)
                                  ? "★"
                                  : "☆"}
                              </span>
                            ))}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : "#000",
                        textAlign: "center",
                      }}
                    >
                      {novel.novelOpinion?.worthToContinue !== undefined ? (
                        <span
                          style={{
                            color: novel.novelOpinion.worthToContinue
                              ? "#4CAF50"
                              : "#F44336",
                            fontSize: "1.4rem",
                            fontWeight: "bold",
                          }}
                        >
                          {novel.novelOpinion.worthToContinue ? "✓" : "✗"}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "16px",
            }}
          >
            {Array.from(
              { length: Math.ceil(novels.length / novelsPerPage) },
              (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  style={{
                    margin: "0 4px",
                    padding: "8px 12px",
                    background: currentPage === index + 1 ? "#2980b9" : "#fff",
                    color: currentPage === index + 1 ? "#fff" : "#000",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
          {/* Custom tooltip */}
          {tooltip.show && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                background: darkMode ? "#444" : "#fff", // Fix tooltip background
                color: darkMode ? "#f7f7fb" : "#000", // Set tooltip text color to black for normal mode
                border: "1px solid #ccc",
                padding: "4px 8px",
                borderRadius: "4px",
                zIndex: 9999,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                pointerEvents: "auto",
                fontSize: "14px",
                transform: "translateY(-100%)",
              }}
              onMouseEnter={() =>
                setTooltip((prev) => ({ ...prev, show: true }))
              }
              onMouseLeave={handleTitleMouseLeave}
            >
              {tooltip.text}
            </div>
          )}
          {/* Confirmation Modal */}
          {modal.show && (
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
                  color: "#222",
                  borderRadius: "8px",
                  padding: "24px",
                  minWidth: "320px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
                  Confirm Update
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <span>
                    Change <b>{modal.field}</b>?
                  </span>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div>
                    <span style={{ color: "#888" }}>Old Value:</span>
                    <div
                      style={{
                        background: "#f6f6f6",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        margin: "4px 0",
                      }}
                    >
                      {modal.oldValue || <i>(empty)</i>}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#888" }}>New Value:</span>
                    <div
                      style={{
                        background: "#eaf6ff",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        margin: "4px 0",
                      }}
                    >
                      {modal.newValue || <i>(empty)</i>}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    marginRight: "12px",
                    padding: "6px 18px",
                    background: "#2980b9",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={handleModalConfirm}
                >
                  Confirm
                </button>
                <button
                  style={{
                    padding: "6px 18px",
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={handleModalCancel}
                >
                  Cancel
                </button>
              </div>
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

  if (renderError) {
    return (
      <div style={{ color: "red" }}>
        Unexpected error occurred: {renderError?.message || String(renderError)}
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
              color: "#222",
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
              style={{
                padding: "6px 18px",
                background: "#2980b9",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setSuccessModal(false)} // Close modal
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
