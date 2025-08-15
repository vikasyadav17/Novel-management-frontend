import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import React from "react";
import { novelApi } from "../services/novelApi";
import { ThemeContext } from "../context/ThemeContext";
import { createStyles } from "../styles/novelDetailsStyles";
import { useNovelEdit } from "../hooks/useNovelEdit";
import NovelHeader from "../components/NovelHeader";
import moment from "moment";
import "./NovelDetails.css";

function NovelDetails() {
  const { id } = useParams();
  const { darkMode } = useContext(ThemeContext);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const styles = createStyles(darkMode);
  const {
    isEditing,
    editedValues,
    showComparisonModal,
    isSaving,
    startEditing,
    cancelEditing,
    handleFieldChange,
    showChanges,
    saveChanges,
    setShowComparisonModal,
  } = useNovelEdit(novel, setNovel, id);

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await novelApi.getNovelById(id);
        setNovel(response.data);

        const favorites = JSON.parse(
          localStorage.getItem("favoriteNovels") || "[]"
        );
        setIsFavorite(favorites.includes(response.data._id));
      } catch (err) {
        setError("Failed to load novel details.");
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [id]);

  const toggleFavorite = () => {
    if (!novel?._id) return;
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    const favorites = JSON.parse(
      localStorage.getItem("favoriteNovels") || "[]"
    );
    if (newFavoriteStatus) {
      if (!favorites.includes(novel._id)) {
        localStorage.setItem(
          "favoriteNovels",
          JSON.stringify([...favorites, novel._id])
        );
      }
    } else {
      localStorage.setItem(
        "favoriteNovels",
        JSON.stringify(favorites.filter((favId) => favId !== novel._id))
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("DD MMM YYYY");
  };

  if (loading) {
    return (
      <div
        style={{ ...styles.container, textAlign: "center", minHeight: "400px" }}
      >
        <div>Loading novel details...</div>
      </div>
    );
  }

  if (error) return <div style={styles.container}>{error}</div>;
  if (!novel) return <div style={styles.container}>Novel not found</div>;

  return (
    <div
      className={`novel-details ${darkMode ? "dark-mode" : ""}`}
      style={styles.container}
    >
      {/* Edit Buttons */}
      {!isEditing ? (
        <button onClick={startEditing} style={styles.editButton}>
          Edit
        </button>
      ) : (
        <div
          style={{
            position: "absolute",
            top: "1.25rem",
            left: "1.25rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={cancelEditing}
            style={{
              ...styles.editButton,
              backgroundColor: darkMode ? "#444" : "#ccc",
            }}
          >
            Cancel
          </button>
          <button onClick={showChanges} style={styles.editButton}>
            Review Changes
          </button>
        </div>
      )}

      {/* Bookmark */}
      <div
        onClick={toggleFavorite}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          cursor: "pointer",
        }}
      >
        <svg
          width="32"
          height="40"
          viewBox="0 0 32 40"
          fill={isFavorite ? "#000000" : "none"}
          stroke={darkMode ? "#ffffff" : "#333333"}
        >
          <path d="M2 2V38L16 30L30 38V2H2Z" />
          <path
            d="M16 7L18.5 12.5L24.5 13L20 17L21.5 23L16 20L10.5 23L12 17L7.5 13L13.5 12.5L16 7Z"
            fill={isFavorite ? "#ffffff" : "none"}
          />
        </svg>
      </div>

      <NovelHeader
        novel={novel}
        isEditing={isEditing}
        editedValues={editedValues}
        handleFieldChange={handleFieldChange}
        styles={styles}
      />

      {/* Details Section */}
      <div style={{ ...styles.section, padding: "2rem" }}>
        {/* Unified grid for all details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Genre field */}
          {(novel.genre || isEditing) && (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "15px",
                background: darkMode
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(255, 255, 255, 0.6)",
                border: darkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.8)",
              }}
            >
              <strong style={styles.label}>Genre:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedValues.genre || ""}
                    onChange={(e) => handleFieldChange("genre", e.target.value)}
                    placeholder="Genre"
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.text}>{novel.genre}</span>
                )}
              </div>
            </div>
          )}

          {/* Show all fields from novel.novelDetails */}
          {novel.novelDetails &&
            Object.entries(novel.novelDetails).map(([key, value]) => {
              // Skip if value is empty, it's an ID field, or special fields
              if (
                !value ||
                key === "_id" ||
                key === "id" ||
                key.toLowerCase().includes("id") ||
                key === "addedOn" ||
                key === "lastUpdatedOn" ||
                key === "description"
              ) {
                return null;
              }

              // Format the key name for display
              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase());

              return (
                <div
                  key={key}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "15px",
                    background: darkMode
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(255, 255, 255, 0.6)",
                    border: darkMode
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <strong style={styles.label}>{formattedKey}:</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={styles.text}>
                      {typeof value === "boolean"
                        ? value
                          ? "Yes"
                          : "No"
                        : value}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Show all fields from novel.novelOpinion (except rating) */}
          {novel.novelOpinion &&
            Object.entries(novel.novelOpinion).map(([key, value]) => {
              if (
                value === undefined ||
                value === null ||
                key === "_id" ||
                key === "id" ||
                key.toLowerCase().includes("id") ||
                key === "rating"
              ) {
                return null;
              }

              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase());

              return (
                <div
                  key={key}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "15px",
                    background: darkMode
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(255, 255, 255, 0.6)",
                    border: darkMode
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <strong style={styles.label}>{formattedKey}:</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={styles.text}>
                      {typeof value === "boolean"
                        ? value
                          ? "Yes"
                          : "No"
                        : value}
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Main Character (mcName) */}
          {(novel.mcName || isEditing) && (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "15px",
                background: darkMode
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(255, 255, 255, 0.6)",
                border: darkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.8)",
              }}
            >
              <strong style={styles.label}>Main Character:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedValues.mcName || ""}
                    onChange={(e) =>
                      handleFieldChange("mcName", e.target.value)
                    }
                    placeholder="Main Character Name"
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.text}>{novel.mcName}</span>
                )}
              </div>
            </div>
          )}

          {/* MC Trait */}
          {(novel.specialCharacteristicOfMc || isEditing) && (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: "15px",
                background: darkMode
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(255, 255, 255, 0.6)",
                border: darkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "1px solid rgba(255, 255, 255, 0.8)",
              }}
            >
              <strong style={styles.label}>MC Trait:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedValues.specialCharacteristicOfMc || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "specialCharacteristicOfMc",
                        e.target.value
                      )
                    }
                    placeholder="MC Trait"
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.text}>
                    {novel.specialCharacteristicOfMc}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags section */}
        {((novel.novelDetails?.tags &&
          novel.novelDetails.tags.trim &&
          novel.novelDetails.tags.trim() !== "") ||
          isEditing) && (
          <div style={{ marginBottom: "1.5rem" }}>
            <strong
              style={{
                ...styles.label,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Tags:
            </strong>
            {isEditing ? (
              <textarea
                value={editedValues.novelDetails_tags || ""}
                onChange={(e) =>
                  handleFieldChange("novelDetails_tags", e.target.value)
                }
                placeholder="Enter tags separated by commas"
                style={{
                  ...styles.input,
                  minHeight: "80px",
                  resize: "vertical",
                }}
              />
            ) : (
              novel.novelDetails?.tags &&
              novel.novelDetails.tags.trim() !== "" && (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {novel.novelDetails.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.text,
                        backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.95rem",
                      }}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Link to novel */}
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={styles.label}>Link:</strong>
          {isEditing ? (
            <input
              type="url"
              value={editedValues.link || ""}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="Novel URL"
              style={styles.input}
            />
          ) : (
            <a
              href={novel.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: darkMode ? "#61dafb" : "#0066cc",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              {novel.link}
            </a>
          )}
        </div>

        {/* Description */}
        {(novel.novelDetails?.description || isEditing) && (
          <div style={{ marginBottom: "1.5rem" }}>
            <strong
              style={{
                ...styles.label,
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              Description:
            </strong>
            {isEditing ? (
              <textarea
                value={editedValues.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Enter novel description"
                style={{
                  ...styles.input,
                  minHeight: "150px",
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
              />
            ) : (
              <div
                style={{
                  ...styles.text,
                  padding: "1.25rem",
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.01)",
                  borderRadius: "10px",
                  borderLeft: darkMode
                    ? "4px solid #61dafb"
                    : "4px solid #0066cc",
                  lineHeight: "1.9",
                  whiteSpace: "pre-wrap",
                }}
              >
                {novel.novelDetails.description}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            opacity: 0.6,
            fontSize: "0.9rem",
          }}
        >
          Last updated: {formatDate(novel.novelDetails?.lastUpdatedOn)}
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                color: darkMode ? "#61dafb" : "#0066cc",
              }}
            >
              Review Changes
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "0.5rem",
                  backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                Original Value
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "0.5rem",
                  backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                New Value
              </div>

              {/* Display changed fields */}
              {Object.keys(editedValues).map((key) => {
                let originalValue = "";
                let newValue = editedValues[key] || "";

                // Get original value based on field type
                if (key === "description") {
                  originalValue = novel.novelDetails?.description || "";
                } else if (key.startsWith("novelDetails_")) {
                  const originalKey = key.replace("novelDetails_", "");
                  originalValue = novel?.novelDetails?.[originalKey] || "";
                } else if (key.startsWith("novelOpinion_")) {
                  const originalKey = key.replace("novelOpinion_", "");
                  originalValue = novel?.novelOpinion?.[originalKey] || "";
                } else {
                  originalValue = novel?.[key] || "";
                }

                // Only show fields that have changed
                if (originalValue === newValue) return null;

                // Format the key name for display
                let formattedKey = key;
                if (key.startsWith("novelDetails_")) {
                  formattedKey = key
                    .replace("novelDetails_", "")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^\w/, (c) => c.toUpperCase());
                } else if (key.startsWith("novelOpinion_")) {
                  formattedKey = key
                    .replace("novelOpinion_", "")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^\w/, (c) => c.toUpperCase());
                } else {
                  formattedKey = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^\w/, (c) => c.toUpperCase());
                }

                return (
                  <React.Fragment key={key}>
                    <div
                      style={{
                        gridColumn: "1 / span 2",
                        fontWeight: "bold",
                        marginTop: "1rem",
                        color: darkMode ? "#61dafb" : "#0066cc",
                      }}
                    >
                      {formattedKey}:
                    </div>
                    <div
                      style={{
                        padding: "0.5rem",
                        backgroundColor: darkMode
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                        borderRadius: "4px",
                        maxHeight: "100px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {originalValue || <em style={{ opacity: 0.5 }}>Empty</em>}
                    </div>
                    <div
                      style={{
                        padding: "0.5rem",
                        backgroundColor: darkMode
                          ? "rgba(97, 218, 251, 0.1)"
                          : "rgba(0, 102, 204, 0.05)",
                        borderRadius: "4px",
                        fontWeight: "500",
                        maxHeight: "100px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {newValue || <em style={{ opacity: 0.5 }}>Empty</em>}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setShowComparisonModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: darkMode ? "#444" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={isSaving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: darkMode ? "#61dafb" : "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Confirm Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NovelDetails;
