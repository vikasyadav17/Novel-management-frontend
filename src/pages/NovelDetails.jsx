import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate import
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
  const navigate = useNavigate(); // Add this to use for navigation
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
      style={{
        ...styles.container,
        background: darkMode
          ? "linear-gradient(145deg, #1a1a1a 0%, #121212 100%)"
          : "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
        padding: "3rem 2rem 2rem",
        borderRadius: "16px",
        boxShadow: darkMode
          ? "0 10px 30px rgba(0, 0, 0, 0.3)"
          : "0 10px 30px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Top Navigation Bar - Improved */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          background: darkMode
            ? "linear-gradient(180deg, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0) 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          padding: "0 1.25rem",
          zIndex: 5,
        }}
      >
        {/* Back Button - Enhanced with better styling */}
        <button
          onClick={() => navigate("/library")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: darkMode
              ? "rgba(40, 40, 40, 0.9)"
              : "rgba(240, 240, 240, 0.9)",
            color: darkMode ? "#f7f7fb" : "#333",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease",
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

        {/* Edit/Cancel/Review Buttons - Polished design */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            padding: "0 1rem",
          }}
        >
          {!isEditing ? (
            <button
              onClick={startEditing}
              style={{
                maxWidth: "300px",
                flex: "1 0 auto",
                background: "linear-gradient(90deg, #007bff, #0062cc)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 2rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0, 123, 255, 0.25)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(0, 123, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 6px rgba(0, 123, 255, 0.25)";
              }}
            >
              Edit Novel
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "10px",
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <button
                onClick={cancelEditing}
                style={{
                  flex: "0 0 120px",
                  background: darkMode ? "#333" : "#e0e0e0",
                  color: darkMode ? "#f7f7fb" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
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
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 123, 255, 0.2)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(0, 123, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0, 123, 255, 0.2)";
                }}
              >
                Review Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Add padding top to account for fixed nav */}
      <div style={{ paddingTop: "30px" }}>
        <NovelHeader
          novel={novel}
          isEditing={isEditing}
          editedValues={editedValues}
          handleFieldChange={handleFieldChange}
          styles={{
            ...styles,
            title: {
              ...styles.title,
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              background: darkMode
                ? "linear-gradient(135deg, #61dafb, #80d8ff)"
                : "linear-gradient(135deg, #0066cc, #1a8cff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: darkMode
                ? "0 2px 10px rgba(97, 218, 251, 0.2)"
                : "0 2px 10px rgba(0, 102, 204, 0.1)",
            },
          }}
        />

        {/* Link to novel - With enhanced styling */}
        {(novel.link || isEditing) && (
          <div
            style={{
              marginBottom: "2rem",
              padding: "0 2rem",
              textAlign: "center",
              animation: "fadeIn 0.5s ease-out",
            }}
          >
            {isEditing ? (
              <>
                <label
                  style={{
                    ...styles.label,
                    fontSize: "1.1rem",
                    display: "block",
                    marginBottom: "0.75rem",
                    color: darkMode ? "#e1e1e6" : "#444",
                  }}
                >
                  Source Link:
                </label>
                <input
                  type="url"
                  value={editedValues.link || ""}
                  onChange={(e) => handleFieldChange("link", e.target.value)}
                  placeholder="Enter novel URL (e.g., https://example.com/novel)"
                  style={{
                    ...styles.input,
                    width: "100%",
                    maxWidth: "600px",
                    margin: "0 auto",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                    border: darkMode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                    background: darkMode ? "rgba(255,255,255,0.05)" : "#fff",
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
                    fontSize: "1.1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    background: darkMode
                      ? "rgba(97, 218, 251, 0.08)"
                      : "rgba(0, 102, 204, 0.05)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode
                      ? "rgba(97, 218, 251, 0.15)"
                      : "rgba(0, 102, 204, 0.1)";
                    e.currentTarget.style.transform =
                      "translateY(-2px) scale(1.01)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode
                      ? "rgba(97, 218, 251, 0.08)"
                      : "rgba(0, 102, 204, 0.05)";
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.05)";
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
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  {novel.link.length > 50
                    ? novel.link.substring(0, 47) + "..."
                    : novel.link}
                </a>
              )
            )}
          </div>
        )}

        {/* Novel Cover Image and Description - Enhanced with better styling */}
        <div
          style={{
            marginBottom: "2.5rem",
            padding: "0.5rem 2rem",
            display: "flex",
            gap: "2.5rem",
            alignItems: "flex-start",
            flexWrap: "wrap", // Make responsive
          }}
        >
          {/* Left side - Image with enhanced styling */}
          <div
            style={{
              flexShrink: 0,
              margin: "0 auto",
              perspective: "1000px",
            }}
          >
            <div
              style={{
                transform: "rotateY(10deg)",
                transformStyle: "preserve-3d",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotateY(0deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotateY(10deg)";
              }}
            >
              <img
                src={novel.novelDetails?.novelCover || defaultCoverImage}
                alt={novel.name}
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "auto",
                  maxHeight: "400px",
                  borderRadius: "16px",
                  boxShadow: darkMode
                    ? "0 15px 35px rgba(0, 0, 0, 0.6), 0 5px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
                    : "0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
                  objectFit: "cover",
                  transition: "all 0.3s ease",
                }}
                onError={(e) => {
                  e.target.src = defaultCoverImage;
                }}
              />
            </div>
          </div>

          {/* Description - Right side with enhanced styling */}
          {(novel.novelDetails?.description || isEditing) && (
            <div
              style={{
                flex: 1,
                minWidth: "280px",
                animation: "fadeIn 0.6s ease-out",
              }}
            >
              {isEditing ? (
                <>
                  <label
                    style={{
                      ...styles.label,
                      display: "block",
                      marginBottom: "0.75rem",
                      fontSize: "1.1rem",
                      color: darkMode ? "#e1e1e6" : "#444",
                    }}
                  >
                    Description:
                  </label>
                  <textarea
                    value={editedValues.description || ""}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Enter novel description"
                    style={{
                      ...styles.input,
                      minHeight: "320px",
                      resize: "vertical",
                      lineHeight: "1.7",
                      fontSize: "1rem",
                      width: "100%",
                      padding: "16px",
                      borderRadius: "12px",
                      border: darkMode
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid rgba(0,0,0,0.1)",
                      background: darkMode ? "rgba(255,255,255,0.03)" : "#fff",
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    ...styles.text,
                    padding: "1.5rem",
                    backgroundColor: darkMode
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.7)",
                    borderRadius: "12px",
                    borderLeft: darkMode
                      ? "5px solid #61dafb"
                      : "5px solid #0066cc",
                    lineHeight: "1.9",
                    whiteSpace: "pre-wrap",
                    textAlign: "left",
                    fontSize: "1.05rem",
                    minHeight: "320px",
                    boxShadow: darkMode
                      ? "0 4px 20px rgba(0,0,0,0.2)"
                      : "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  {novel.novelDetails.description || (
                    <span style={{ opacity: 0.5, fontStyle: "italic" }}>
                      No description available
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags section - Beautified */}
        {((novel.novelDetails?.tags &&
          novel.novelDetails.tags.trim &&
          novel.novelDetails.tags.trim() !== "") ||
          isEditing) && (
          <div
            style={{
              marginBottom: "2.5rem",
              padding: "0 2rem",
              animation: "fadeIn 0.7s ease-out",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Tags
            </h3>

            {isEditing ? (
              <>
                <textarea
                  value={editedValues.novelDetails_tags || ""}
                  onChange={(e) =>
                    handleFieldChange("novelDetails_tags", e.target.value)
                  }
                  placeholder="Enter tags separated by commas (e.g., Action, Fantasy, Romance)"
                  style={{
                    ...styles.input,
                    minHeight: "80px",
                    resize: "vertical",
                    width: "100%",
                    maxWidth: "600px",
                    margin: "0 auto",
                    display: "block",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                    border: darkMode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid rgba(0,0,0,0.1)",
                    background: darkMode ? "rgba(255,255,255,0.03)" : "#fff",
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
                    gap: "0.7rem",
                    justifyContent: "center",
                    padding: "0.5rem 1rem",
                  }}
                >
                  {novel.novelDetails.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.text,
                        backgroundColor: darkMode
                          ? index % 3 === 0
                            ? "rgba(97, 218, 251, 0.15)"
                            : index % 3 === 1
                            ? "rgba(138, 43, 226, 0.15)"
                            : "rgba(233, 30, 99, 0.15)"
                          : index % 3 === 0
                          ? "rgba(0, 102, 204, 0.1)"
                          : index % 3 === 1
                          ? "rgba(138, 43, 226, 0.1)"
                          : "rgba(233, 30, 99, 0.1)",
                        color: darkMode
                          ? index % 3 === 0
                            ? "#61dafb"
                            : index % 3 === 1
                            ? "#c39dff"
                            : "#ff86b4"
                          : index % 3 === 0
                          ? "#0066cc"
                          : index % 3 === 1
                          ? "#8a2be2"
                          : "#e91e63",
                        padding: "0.4rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        boxShadow: darkMode
                          ? "0 2px 8px rgba(0,0,0,0.2)"
                          : "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-2px) scale(1.05)";
                        e.currentTarget.style.boxShadow = darkMode
                          ? "0 4px 12px rgba(0,0,0,0.3)"
                          : "0 4px 12px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow = darkMode
                          ? "0 2px 8px rgba(0,0,0,0.2)"
                          : "0 2px 8px rgba(0,0,0,0.05)";
                      }}
                    >
                      {tag.trim().toUpperCase()}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Details Section - Beautified */}
        <div
          style={{
            ...styles.section,
            padding: "2rem",
            background: darkMode
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.01)",
            borderRadius: "16px",
            boxShadow: darkMode
              ? "0 8px 30px rgba(0, 0, 0, 0.15)"
              : "0 8px 30px rgba(0, 0, 0, 0.03)",
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              marginBottom: "1.5rem",
              color: darkMode ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
              fontWeight: "600",
              textAlign: "center",
              borderBottom: darkMode
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.05)",
              paddingBottom: "1rem",
            }}
          >
            Novel Information
          </h3>

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

          {/* Last updated info */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              opacity: 0.6,
              fontSize: "0.9rem",
              fontStyle: "italic",
              padding: "0.5rem",
              borderTop: darkMode
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            Last updated:{" "}
            {formatDate(novel.novelDetails?.lastUpdatedOn) || "Unknown"}
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

      {/* Add some global styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input, textarea, select {
          font-family: inherit;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: ${
            darkMode
              ? "2px solid rgba(97, 218, 251, 0.5)"
              : "2px solid rgba(0, 102, 204, 0.5)"
          };
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}

export default NovelDetails;
