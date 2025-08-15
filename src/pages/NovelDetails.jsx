import { useParams, useNavigate } from "react-router-dom";
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
import { getCoverImage, handleImageError } from "../utils/coverUtils";

function NovelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (err) {
        setError("Failed to load novel details.");
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("DD MMM YYYY");
  };

  // Simple save function without extra functionality
  const handleSaveChanges = async () => {
    const success = await saveChanges();
    if (success) {
      setShowComparisonModal(false);
      setShowSuccessModal(true);
    }
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

  // Essential fields to always display, even if empty
  const essentialFields = [
    "novelDetails_mcName",
    "novelDetails_specialCharacteristicOfMc",
    "novelDetails_status",
    "novelDetails_totalChapters",
  ];

  // Ensure essential fields are always included
  essentialFields.forEach((fieldKey) => {
    const exists = novelDetailsFields.some((field) => field.key === fieldKey);

    if (!exists) {
      // Extract the actual field name from the key
      const fieldName = fieldKey.replace("novelDetails_", "");

      // Create default field configuration
      const defaultValue = novel?.novelDetails?.[fieldName] || "";

      // Generate display label from field name (convert camelCase to Title Case)
      const label = fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      // Add the field to novelDetailsFields
      novelDetailsFields.push({
        key: fieldKey,
        type: fieldName === "totalChapters" ? "number" : "text",
        label,
        value: defaultValue,
        placeholder: label,
      });
    }
  });

  // Sort the fields to ensure consistent display order
  const fieldOrder = essentialFields;

  novelDetailsFields.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.key);
    const indexB = fieldOrder.indexOf(b.key);

    // If both fields are in the specified order, sort accordingly
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only a is in the list, it comes first
    if (indexA !== -1) return -1;
    // If only b is in the list, it comes first
    if (indexB !== -1) return 1;
    // For other fields, keep original order
    return 0;
  });

  return (
    <div
      className={`novel-details ${darkMode ? "dark-mode" : ""}`}
      style={{
        ...styles.container,
        background: darkMode
          ? "linear-gradient(145deg, #1a1a1a 0%, #121212 100%)"
          : "linear-gradient(145deg, #f9f9f9 0%, #ffffff 100%)",
      }}
    >
      {/* Back Button - Enhanced */}
      <button
        onClick={() => navigate("/library")}
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: darkMode
            ? "rgba(51, 51, 51, 0.8)"
            : "rgba(240, 240, 240, 0.8)",
          color: darkMode ? "#f7f7fb" : "#333",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "8px", // More rounded
          cursor: "pointer",
          fontWeight: "500",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 5,
          transition: "all 0.2s ease",
          backdropFilter: "blur(5px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {/* Edit/Cancel/Review Buttons - Fixed to show proper buttons based on state */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "7rem", // Position after the Back button
          right: "1.25rem", // More space on right since bookmark is removed
          display: "flex",
          height: "40px",
        }}
      >
        {!isEditing ? (
          // When not editing, show only the Edit button
          <button
            onClick={startEditing}
            style={{
              flex: 1,
              background: "linear-gradient(90deg, #007bff, #0062cc)",
              color: "white",
              border: "none",
              borderRadius: "8px", // Fully rounded since it's a single button
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(90deg, #0062cc, #004799)";
              e.currentTarget.style.boxShadow =
                "0 6px 8px rgba(0, 123, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(90deg, #007bff, #0062cc)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px rgba(0, 123, 255, 0.2)";
            }}
          >
            Edit
          </button>
        ) : (
          // When in edit mode, show Cancel and Review Changes buttons
          <>
            <button
              onClick={cancelEditing}
              style={{
                flex: "0 0 100px",
                backgroundColor: darkMode
                  ? "rgba(68, 68, 68, 0.9)"
                  : "rgba(204, 204, 204, 0.9)",
                color: darkMode ? "#f7f7fb" : "#333",
                border: "none",
                borderRadius: "8px 0 0 8px", // More rounded on left side
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backdropFilter: "blur(5px)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={showChanges}
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #007bff, #0062cc)",
                color: "white",
                border: "none",
                borderRadius: "0 8px 8px 0", // More rounded on right side
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(90deg, #0062cc, #004799)";
                e.currentTarget.style.boxShadow =
                  "0 6px 8px rgba(0, 123, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(90deg, #007bff, #0062cc)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(0, 123, 255, 0.2)";
              }}
            >
              Review Changes
            </button>
          </>
        )}
      </div>

      <NovelHeader
        novel={novel}
        isEditing={isEditing}
        editedValues={editedValues}
        handleFieldChange={handleFieldChange}
        styles={styles}
      />

      {/* Link to novel - Enhanced with better styling */}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "0 2rem",
          textAlign: "center",
        }}
      >
        {isEditing ? (
          <>
            <strong style={{ ...styles.label, fontSize: "1.1rem" }}>
              Link:
            </strong>
            <input
              type="url"
              value={editedValues.link || ""}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="Novel URL"
              style={{
                ...styles.input,
                marginTop: "0.5rem",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
              }}
            />
          </>
        ) : (
          novel.link && (
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
                gap: "0.5rem",
                padding: "8px 16px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                background: darkMode
                  ? "rgba(97, 218, 251, 0.1)"
                  : "rgba(0, 102, 204, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "rgba(97, 218, 251, 0.2)"
                  : "rgba(0, 102, 204, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "rgba(97, 218, 251, 0.1)"
                  : "rgba(0, 102, 204, 0.05)";
                e.currentTarget.style.transform = "translateY(0)";
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
          )
        )}
      </div>

      {/* Novel Cover Image and Description - Fixed vertical alignment */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "0 2rem",
          position: "relative", // Use relative positioning for better control
        }}
      >
        {/* Left side - Image with vertical centering */}
        <div
          style={{
            position: "absolute",
            left: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: "250px",
            height: "250px", // Match Library component's fixed height
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: darkMode ? "#272727" : "#f5f5f5", // Move background to container
            borderRadius: "15px",
            boxShadow: darkMode
              ? "0 12px 32px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3)"
              : "0 12px 32px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden", // Ensure content stays within rounded corners
          }}
        >
          <img
            src={getCoverImage(novel)}
            alt={novel.name}
            style={{
              width: "100%", // Exactly like Library
              height: "100%", // Exactly like Library
              objectFit: "contain", // Exactly like Library
              padding: "5px", // Exactly like Library
            }}
            onError={handleImageError}
          />
        </div>

        {/* Description - With left margin to accommodate the image */}
        <div
          style={{
            marginLeft: "280px", // Space for the image (250px) plus some gap
            minHeight: "350px", // Ensure enough height for the image to be centered
          }}
        >
          {(novel.novelDetails?.description || isEditing) && (
            <div>
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

          {/* Novel Details Fields - Ensure these are always displayed */}
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
                onClick={handleSaveChanges}
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
