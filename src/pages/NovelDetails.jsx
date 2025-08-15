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

      {/* Link to novel - moved here between title and original name */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        {isEditing ? (
          <>
            <strong style={styles.label}>Link:</strong>
            <input
              type="url"
              value={editedValues.link || ""}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="Novel URL"
              style={{ ...styles.input, marginTop: "0.5rem" }}
            />
          </>
        ) : (
          <a
            href={novel.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: darkMode ? "#61dafb" : "#0066cc",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "1.2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {novel.link}
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
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        )}
      </div>

      {/* Novel Cover Image and Description - side by side */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "0 2rem",
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left side - Image only (link moved above) */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={
              novel.novelDetails?.novelCover ||
              "https://i.imgur.com/sword-god-image.jpg"
            }
            alt={novel.name}
            style={{
              maxWidth: "250px",
              maxHeight: "350px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.src = "https://i.imgur.com/sword-god-image.jpg";
            }}
          />
        </div>

        {/* Description - Right */}
        {(novel.novelDetails?.description || isEditing) && (
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <>
                <strong
                  style={{
                    ...styles.label,
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Description:
                </strong>
                <textarea
                  value={editedValues.description || ""}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Enter novel description"
                  style={{
                    ...styles.input,
                    minHeight: "300px",
                    resize: "vertical",
                    lineHeight: "1.6",
                    width: "100%",
                  }}
                />
              </>
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
                  textAlign: "left",
                  fontSize: "1.1rem",
                  minHeight: "300px",
                }}
              >
                {novel.novelDetails.description}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags section */}
      {((novel.novelDetails?.tags &&
        novel.novelDetails.tags.trim &&
        novel.novelDetails.tags.trim() !== "") ||
        isEditing) && (
        <div style={{ marginBottom: "2rem", padding: "0 2rem" }}>
          {isEditing ? (
            <>
              <strong
                style={{
                  ...styles.label,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Tags:
              </strong>
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
            </>
          ) : (
            novel.novelDetails?.tags &&
            novel.novelDetails.tags.trim() !== "" && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
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
                value === null ||
                value === undefined ||
                (value === "" &&
                  key !== "totalChapters" &&
                  key !== "novelCover") ||
                key === "_id" ||
                key === "id" ||
                key.toLowerCase().includes("id") ||
                key === "addedOn" ||
                key === "lastUpdatedOn" ||
                key === "description" ||
                key === "tags"
              ) {
                return null;
              }

              // Special handling for novelCover field - only show in edit mode
              if (key === "novelCover" && !isEditing) {
                return null;
              }

              // Format the key name for display
              let formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase());

              // Special formatting for mcName
              if (key === "mcName") {
                formattedKey = "Mc Name";
              }

              // Special formatting for specialCharacteristicOfMc
              if (key === "specialCharacteristicOfMc") {
                formattedKey = "Special Characteristic Of Mc";
              }

              // Special handling for status field with editing capability
              if (key === "status") {
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
                    <strong style={styles.label}>Status:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {isEditing ? (
                        <select
                          value={editedValues.novelDetails_status || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "novelDetails_status",
                              e.target.value
                            )
                          }
                          style={{
                            ...styles.input,
                            background: darkMode
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(255, 255, 255, 0.9)",
                            border: darkMode
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "1px solid rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                          }}
                        >
                          <option value="">Select Status</option>
                          <option value="Reading">Reading</option>
                          <option value="Completed">Completed</option>
                          <option value="Dropped">Dropped</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Plan to Read">Plan to Read</option>
                        </select>
                      ) : (
                        <span style={styles.text}>{value}</span>
                      )}
                    </div>
                  </div>
                );
              }

              // Special handling for totalChapters field with numeric input
              if (key === "totalChapters") {
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
                    <strong style={styles.label}>Total Chapters:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedValues.novelDetails_totalChapters || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "novelDetails_totalChapters",
                              e.target.value
                            )
                          }
                          placeholder="Enter total chapters"
                          min="0"
                          style={{
                            ...styles.input,
                            background: darkMode
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(255, 255, 255, 0.9)",
                            border: darkMode
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "1px solid rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                          }}
                        />
                      ) : (
                        <span style={styles.text}>{value}</span>
                      )}
                    </div>
                  </div>
                );
              }

              // Special handling for mcName field
              if (key === "mcName") {
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
                    <strong style={styles.label}>Mc Name:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedValues.novelDetails_mcName || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "novelDetails_mcName",
                              e.target.value
                            )
                          }
                          placeholder="Main Character Name"
                          style={styles.input}
                        />
                      ) : (
                        <span style={styles.text}>{value}</span>
                      )}
                    </div>
                  </div>
                );
              }

              // Special handling for novelCover field
              if (key === "novelCover") {
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
                    <strong style={styles.label}>Novel Cover URL:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      <input
                        type="url"
                        value={editedValues.novelDetails_novelCover || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "novelDetails_novelCover",
                            e.target.value
                          )
                        }
                        placeholder="Enter cover image URL"
                        style={styles.input}
                      />
                    </div>
                  </div>
                );
              }

              // Special handling for specialCharacteristicOfMc field
              if (key === "specialCharacteristicOfMc") {
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
                    <strong style={styles.label}>
                      Special Characteristic Of Mc:
                    </strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={
                            editedValues.novelDetails_specialCharacteristicOfMc ||
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              "novelDetails_specialCharacteristicOfMc",
                              e.target.value
                            )
                          }
                          placeholder="Enter MC's special characteristic"
                          style={styles.input}
                        />
                      ) : (
                        <span style={styles.text}>{value}</span>
                      )}
                    </div>
                  </div>
                );
              }

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

          {/* Novel Cover field - always show in edit mode even if not in novelDetails */}
          {isEditing && !novel.novelDetails?.hasOwnProperty("novelCover") && (
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
              <strong style={styles.label}>Novel Cover URL:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="url"
                  value={editedValues.novelDetails_novelCover || ""}
                  onChange={(e) =>
                    handleFieldChange("novelDetails_novelCover", e.target.value)
                  }
                  placeholder="Enter cover image URL"
                  style={styles.input}
                />
              </div>
            </div>
          )}

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
                    {isEditing ? (
                      typeof value === "boolean" ? (
                        <select
                          value={
                            editedValues[`novelOpinion_${key}`] !== undefined
                              ? editedValues[`novelOpinion_${key}`]
                              : value
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              `novelOpinion_${key}`,
                              e.target.value === "true"
                            )
                          }
                          style={styles.input}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editedValues[`novelOpinion_${key}`] || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              `novelOpinion_${key}`,
                              e.target.value
                            )
                          }
                          placeholder={`Enter ${formattedKey.toLowerCase()}`}
                          style={styles.input}
                        />
                      )
                    ) : (
                      <span style={styles.text}>
                        {typeof value === "boolean"
                          ? value
                            ? "Yes"
                            : "No"
                          : value}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

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

                // Format boolean values for display
                const formatValue = (value) => {
                  if (typeof value === "boolean") {
                    return value ? "Yes" : "No";
                  }
                  return value || "";
                };

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
                      {formatValue(originalValue) || (
                        <em style={{ opacity: 0.5 }}>Empty</em>
                      )}
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
                      {formatValue(newValue) || (
                        <em style={{ opacity: 0.5 }}>Empty</em>
                      )}
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
