import { useState, useEffect, useRef } from "react";
import { novelApi } from "../services/novelApi";
import logger from "../utils/logger"; // Import the logger

function Library({ darkMode }) {
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
  const tableRef = useRef();

  // Error boundary state
  const [renderError, setRenderError] = useState(null);

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
      description: novel.novelDetails?.description || "",
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
      const payload = {
        name: editData.name,
        originalName: editData.originalName,
        genre: editData.genre,
        link: editData.link,
        description: editData.description,
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

  let content;
  try {
    if (loading) content = <div>Loading novels...</div>;
    else if (error) content = <div>{error}</div>;
    else {
      content = (
        <div
          className={`library-table-container${darkMode ? " dark-mode" : ""}`}
        >
          <table className="library-table">
            <thead>
              <tr>
                <th style={{ color: darkMode ? "#f7f7fb" : undefined }}>ID</th>
                <th style={{ color: darkMode ? "#f7f7fb" : undefined }}>
                  Title
                </th>
                <th style={{ color: darkMode ? "#f7f7fb" : undefined }}>
                  Link
                </th>
                <th style={{ color: darkMode ? "#f7f7fb" : undefined }}>
                  Genre
                </th>
                <th style={{ color: darkMode ? "#f7f7fb" : undefined }}>
                  Description
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {novels.map((novel) => {
                const id = novel.novelDetails?.id || novel.id;
                return (
                  <tr key={id} style={{ minHeight: "48px" }}>
                    <td
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : undefined,
                      }}
                    >
                      {id}
                    </td>
                    <td
                      onDoubleClick={() => handleCellDoubleClick(id, "name")}
                      style={{
                        minHeight: "48px",
                        position: "relative",
                        color: darkMode ? "#f7f7fb" : undefined,
                      }}
                    >
                      {editingCell?.rowId === id &&
                      editingCell?.field === "name" ? (
                        <input
                          name="name"
                          value={editData.name}
                          autoFocus
                          onChange={handleEditChange}
                          onBlur={() => handleCellBlur(id)}
                          onKeyDown={handleCellKeyDown}
                          style={{
                            width: "100%",
                            minHeight: "32px",
                          }}
                          placeholder="Title"
                          className={darkMode ? "dark-mode-input" : ""}
                        />
                      ) : (
                        <span
                          onMouseEnter={(e) =>
                            handleTitleMouseEnter(e, novel.originalName)
                          }
                          onMouseLeave={handleTitleMouseLeave}
                          style={{
                            cursor: novel.originalName ? "pointer" : "default",
                            color: darkMode ? "#f7f7fb" : undefined,
                          }}
                        >
                          {novel.name}
                        </span>
                      )}
                    </td>
                    <td
                      onDoubleClick={() => handleCellDoubleClick(id, "link")}
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : undefined,
                      }}
                    >
                      {editingCell?.rowId === id &&
                      editingCell?.field === "link" ? (
                        <input
                          name="link"
                          value={editData.link}
                          autoFocus
                          onChange={handleEditChange}
                          onBlur={() => handleCellBlur(id)}
                          onKeyDown={(e) => handleCellKeyDown(e, id)}
                          style={{
                            width: "100%",
                            minHeight: "32px",
                            color: darkMode ? "#f7f7fb" : undefined,
                            background: darkMode ? "#222" : undefined,
                          }}
                          // Fix placeholder color in dark mode
                          placeholder="Link"
                          className={darkMode ? "dark-mode-input" : ""}
                        />
                      ) : novel.link ? (
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
                      onDoubleClick={() => handleCellDoubleClick(id, "genre")}
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : undefined,
                      }}
                    >
                      {editingCell?.rowId === id &&
                      editingCell?.field === "genre" ? (
                        <input
                          name="genre"
                          value={editData.genre}
                          autoFocus
                          onChange={handleEditChange}
                          onBlur={() => handleCellBlur(id)}
                          onKeyDown={(e) => handleCellKeyDown(e, id)}
                          style={{
                            width: "100%",
                            minHeight: "32px",
                            color: darkMode ? "#f7f7fb" : undefined,
                            background: darkMode ? "#222" : undefined,
                          }}
                          // Fix placeholder color in dark mode
                          placeholder="Genre"
                          className={darkMode ? "dark-mode-input" : ""}
                        />
                      ) : (
                        novel.genre
                      )}
                    </td>
                    <td
                      onDoubleClick={() =>
                        handleCellDoubleClick(id, "description")
                      }
                      style={{
                        minHeight: "48px",
                        color: darkMode ? "#f7f7fb" : undefined,
                      }}
                    >
                      {editingCell?.rowId === id &&
                      editingCell?.field === "description" ? (
                        <textarea
                          name="description"
                          value={editData.description}
                          autoFocus
                          onChange={handleEditChange}
                          onBlur={() => handleCellBlur(id)}
                          onKeyDown={(e) => handleCellKeyDown(e, id)}
                          rows={3}
                          style={{
                            width: "100%",
                            minHeight: "48px",
                            resize: "none",
                          }}
                          placeholder="Description"
                          className={darkMode ? "dark-mode-input" : ""}
                        />
                      ) : (
                        <div
                          style={{
                            minHeight: "48px",
                            whiteSpace: "pre-line",
                            color: darkMode ? "#f7f7fb" : undefined,
                          }}
                        >
                          {novel.novelDetails?.description || ""}
                        </div>
                      )}
                    </td>
                    <td>{/* Pencil button removed */}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Custom tooltip */}
          {tooltip.show && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                background: "#fff",
                color: "#000",
                border: "1px solid #ccc",
                padding: "4px 8px",
                borderRadius: "4px",
                zIndex: 9999,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                pointerEvents: "none",
                fontSize: "14px",
                transform: "translateY(-100%)", // ensure it's above
              }}
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

  return content;
}

export default Library;
