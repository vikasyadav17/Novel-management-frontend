import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import React from "react";
import { novelApi } from "../services/novelApi";
import { ThemeContext } from "../context/ThemeContext";
import { createStyles } from "../styles/novelDetailsStyles";
import { useNovelEdit } from "../hooks/useNovelEdit";
import NovelHeader from "../components/NovelHeader";
import FieldRenderer from "../components/FieldRenderer";
import { getFieldConfig } from "../utils/fieldConfig";
import moment from "moment";
import "./NovelDetails.css";
import defaultCoverImage from "../assets/images/Sword_god.jpg";

function NovelDetails() {
  const { id } = useParams();
  const { darkMode } = useContext(ThemeContext);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Get field configs from utility
  const { novelDetailsFields, novelOpinionFields } = getFieldConfig(
    novel,
    isEditing
  );

  // Ensure mcName and totalChapters are always displayed
  const ensureMcNameField = novelDetailsFields.some(
    (field) => field.key === "novelDetails_mcName"
  );

  const ensureTotalChaptersField = novelDetailsFields.some(
    (field) => field.key === "novelDetails_totalChapters"
  );

  // If mcName is not in the fields, add it manually
  if (!ensureMcNameField) {
    // Insert mcName at index 0 to ensure consistent position
    novelDetailsFields.splice(0, 0, {
      key: "novelDetails_mcName",
      type: "text",
      label: "Main Character Name",
      value: novel?.novelDetails?.mcName || "",
      placeholder: "Main Character Name",
    });
  }

  // If totalChapters is not in the fields, add it manually
  if (!ensureTotalChaptersField) {
    novelDetailsFields.push({
      key: "novelDetails_totalChapters",
      type: "number",
      label: "Total Chapters",
      value: novel?.novelDetails?.totalChapters || "",
      placeholder: "Total Chapters",
    });
  }

  // Sort the fields to ensure consistent order between edit/view modes
  const fieldOrder = [
    "novelDetails_mcName",
    "novelDetails_specialCharacteristicOfMc",
    "novelDetails_status",
    "novelDetails_totalChapters",
    // Add other fields in the order you prefer
  ];

  // Sort the fields based on the defined order
  novelDetailsFields.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.key);
    const indexB = fieldOrder.indexOf(b.key);

    // If both fields are in our order list, sort by that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only a is in the list, it comes first
    if (indexA !== -1) return -1;
    // If only b is in the list, it comes first
    if (indexB !== -1) return 1;
    // If neither is in the list, maintain original order
    return 0;
  });

  // Replace the enhanced save function with a simpler version
  const handleEnhancedSaveChanges = async () => {
    // Directly call the normal save function without auto-filling chapters frequency
    const success = await saveChanges();
    if (success) {
      setShowComparisonModal(false);
      setShowSuccessModal(true);
    }
  };

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
            src={novel.novelDetails?.novelCover || defaultCoverImage}
            alt={novel.name}
            style={{
              maxWidth: "250px",
              maxHeight: "350px",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.src = defaultCoverImage;
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
                      textTransform: "uppercase", // Added this line to ensure tags are uppercase
                      fontWeight: "500", // Added slightly bolder font for better uppercase readability
                      letterSpacing: "0.5px", // Added slight letter spacing for better uppercase readability
                    }}
                  >
                    {tag.trim().toUpperCase()} {/* Changed to uppercase */}
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
            <FieldRenderer
              field={{
                key: "genre",
                type: "text",
                label: "Genre",
                placeholder: "Genre",
              }}
              value={novel.genre}
              isEditing={isEditing}
              editedValues={editedValues}
              handleFieldChange={handleFieldChange}
              styles={styles}
              darkMode={darkMode}
            />
          )}

          {/* Novel Details Fields */}
          {novelDetailsFields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={field.value}
              isEditing={isEditing}
              editedValues={editedValues}
              handleFieldChange={handleFieldChange}
              styles={styles}
              darkMode={darkMode}
            />
          ))}

          {/* Novel Opinion Fields */}
          {novelOpinionFields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={field.value}
              isEditing={isEditing}
              editedValues={editedValues}
              handleFieldChange={handleFieldChange}
              styles={styles}
              darkMode={darkMode}
            />
          ))}
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
                onClick={handleEnhancedSaveChanges}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                color: darkMode ? "#61dafb" : "#0066cc",
              }}
            >
              Changes Saved Successfully!
            </h2>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              Your changes have been saved.
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: darkMode ? "#61dafb" : "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NovelDetails;
