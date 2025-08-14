import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { novelApi } from "../services/novelApi";
import { ThemeContext } from "../context/ThemeContext";
import swordGodImage from "../assets/images/sword_god.jpg";
import "./NovelDetails.css";
import moment from "moment";

function NovelDetails() {
  const { id } = useParams();
  const { darkMode } = useContext(ThemeContext);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Add editing state variables
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Force re-render when darkMode changes
  const [_, forceUpdate] = useState({});

  useEffect(() => {
    console.log("Dark mode state:", darkMode);
    // Force component update when dark mode changes
    forceUpdate({});
  }, [darkMode]);

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        const response = await novelApi.getNovelById(id);
        setNovel(response.data);

        // Check if novel is favorite from localStorage
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

  // Function to toggle favorite status
  const toggleFavorite = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    // Update localStorage
    const favorites = JSON.parse(
      localStorage.getItem("favoriteNovels") || "[]"
    );
    if (newFavoriteStatus) {
      // Add to favorites if not already there
      if (!favorites.includes(novel._id)) {
        localStorage.setItem(
          "favoriteNovels",
          JSON.stringify([...favorites, novel._id])
        );
      }
    } else {
      // Remove from favorites
      localStorage.setItem(
        "favoriteNovels",
        JSON.stringify(favorites.filter((favId) => favId !== novel._id))
      );
    }
  };

  // Enhanced styling for container with subtle gradient
  const containerStyle = {
    color: darkMode ? "#ffffff" : "#333333",
    background: darkMode
      ? "linear-gradient(145deg, #121212 0%, #1a1a1a 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)",
    padding: "2.5rem",
    borderRadius: "16px",
    boxShadow: darkMode
      ? "0 10px 25px rgba(0, 0, 0, 0.5)"
      : "0 10px 25px rgba(0, 0, 0, 0.08)",
    maxWidth: "900px",
    margin: "2.5rem auto",
    transition: "all 0.4s ease",
    position: "relative",
    overflowX: "hidden", // Prevent horizontal scrolling
  };

  // Improved text styling with better readability
  const textStyle = {
    color: darkMode ? "#ffffff" : "#333333",
    lineHeight: "1.8",
    fontSize: "1.05rem",
    transition: "color 0.3s ease",
  };

  // Enhanced heading style with accent underline
  const headingStyle = {
    color: darkMode ? "#ffffff" : "#222222",
    fontSize: "2.75rem",
    fontWeight: "700",
    marginBottom: "2rem",
    paddingBottom: "0.75rem",
    position: "relative",
    textShadow: darkMode ? "2px 2px 4px rgba(0, 0, 0, 0.5)" : "none",
    borderBottom: "none",
    textAlign: "center",
    "&:after": {
      content: "''",
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "4px",
      background: darkMode ? "#61dafb" : "#0066cc",
      borderRadius: "4px",
    },
  };

  // Enhanced styling for labels with accent color
  const labelStyle = {
    ...textStyle,
    fontWeight: "700",
    fontSize: "1.1rem",
    display: "inline-block",
    minWidth: "150px", // Slightly wider for better alignment
    color: darkMode ? "#61dafb" : "#0066cc",
    transition: "all 0.3s ease",
  };

  // Enhanced styling for links with hover effect
  const linkStyle = {
    color: darkMode ? "#61dafb" : "#0066cc",
    textDecoration: "none",
    borderBottom: "1px dotted",
    paddingBottom: "2px",
    transition: "all 0.2s ease-in-out",
    fontWeight: "500",
    "&:hover": {
      color: darkMode ? "#a6e9ff" : "#004499",
      borderBottomStyle: "solid",
    },
  };

  // New style for content sections
  const sectionStyle = {
    backgroundColor: darkMode
      ? "rgba(255, 255, 255, 0.03)"
      : "rgba(0, 0, 0, 0.01)",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: darkMode
      ? "inset 0 1px 3px rgba(255, 255, 255, 0.05)"
      : "inset 0 1px 3px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  };

  // Add function to handle bulk upload of novel details and opinion
  const handleBulkUpload = async () => {
    if (!novel) return;

    try {
      // Prepare the data to include both novel details and opinion
      const bulkData = {
        novelId: novel._id,
        novelDetails: novel.novelDetails || {},
        novelOpinion: novel.novelOpinion || {},
      };

      console.log("Sending bulk data:", bulkData);

      // Send the bulk data to the backend
      const response = await novelApi.bulkUpload(bulkData);

      // Handle successful upload
      if (response.status === 200) {
        alert("Novel details and opinion uploaded successfully");
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      alert("Failed to upload novel details and opinion");
    }
  };

  // Add effect to automatically send both novelDetails and novelOpinion
  // when the tab for bulk upload is active
  useEffect(() => {
    // Check if we're in bulk upload mode - this could be based on a prop or URL parameter
    const isBulkUploadMode = window.location.search.includes("bulkUpload=true");

    if (isBulkUploadMode && novel && !loading) {
      handleBulkUpload();
    }
  }, [novel, loading]);

  // Function to handle field changes
  const handleFieldChange = (field, value) => {
    setEditedValues({
      ...editedValues,
      [field]: value,
    });
  };

  // Function to enter edit mode - include only fields that exist in your data model
  const startEditing = () => {
    setIsEditing(true);
    // Initialize editedValues with only fields that exist in your data model
    setEditedValues({
      name: novel.name,
      originalName: novel.originalName || "",
      link: novel.link || "",
      tags: novel.tags || "",
      // Include these fields only if they exist in your data model
      ...(novel.mcName !== undefined && { mcName: novel.mcName || "" }),
      ...(novel.specialCharacteristicOfMc !== undefined && {
        specialCharacteristicOfMc: novel.specialCharacteristicOfMc || "",
      }),
      // Remove author, status, and releaseYear if they don't exist in your model
    });
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedValues({});
  };

  // Function to show the comparison modal
  const showChanges = () => {
    // Only proceed if there are actual changes
    const hasChanges = Object.keys(editedValues).some(
      (key) => editedValues[key] !== (novel[key] || "")
    );

    if (hasChanges) {
      setShowComparisonModal(true);
    } else {
      alert("No changes detected");
    }
  };

  // Function to save changes after confirmation
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // Only send fields that have changed
      const changedFields = {};
      Object.keys(editedValues).forEach((key) => {
        if (editedValues[key] !== (novel[key] || "")) {
          changedFields[key] = editedValues[key];
        }
      });

      // Make the API call to update the novel
      const response = await novelApi.updateNovel(novel._id, changedFields);

      // Update the local state with the new values
      setNovel({
        ...novel,
        ...changedFields,
      });

      // Exit edit mode and reset
      setIsEditing(false);
      setEditedValues({});
      setShowComparisonModal(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Add style for edit button
  const editButtonStyle = {
    position: "absolute",
    top: "1.25rem",
    left: "1.25rem",
    padding: "0.5rem 1rem",
    backgroundColor: darkMode ? "#61dafb" : "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: darkMode ? "#50c8f0" : "#0055b0",
      transform: "translateY(-2px)",
    },
  };

  // Add style for input fields
  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
    border: darkMode ? "1px solid #444" : "1px solid #ddd",
    borderRadius: "4px",
    color: darkMode ? "#ffffff" : "#333333",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: darkMode ? "#61dafb" : "#0066cc",
      boxShadow: `0 0 0 2px ${
        darkMode ? "rgba(97, 218, 251, 0.2)" : "rgba(0, 102, 204, 0.2)"
      }`,
    },
  };

  // Modal styles
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  };

  // Helper function to format dates using moment
  const formatDate = (dateString) => {
    console.log(dateString);
    if (!dateString) return "";
    return moment(dateString).format("DD MMM YYYY");
  };

  if (loading)
    return (
      <div
        className="loading-indicator"
        style={{
          ...containerStyle,
          textAlign: "center",
          padding: "3rem",
          fontSize: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div>
          <div
            className="spinner"
            style={{
              border: `4px solid ${darkMode ? "#333" : "#f3f3f3"}`,
              borderTop: `4px solid ${darkMode ? "#61dafb" : "#0066cc"}`,
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              margin: "0 auto 20px auto",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Loading novel details...
        </div>
      </div>
    );

  if (error) return <div style={containerStyle}>{error}</div>;

  return (
    <div
      className={`novel-details ${darkMode ? "dark-mode" : ""}`}
      style={containerStyle}
    >
      {/* Gradient decoration at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: `linear-gradient(90deg, ${
            darkMode ? "#61dafb" : "#0066cc"
          } 0%, ${darkMode ? "#a64dff" : "#8c43ff"} 100%)`,
          borderRadius: "16px 16px 0 0",
        }}
      ></div>

      {/* Add Edit Button */}
      {!isEditing ? (
        <button onClick={startEditing} style={editButtonStyle}>
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
              ...editButtonStyle,
              backgroundColor: darkMode ? "#444" : "#ccc",
            }}
          >
            Cancel
          </button>
          <button onClick={showChanges} style={editButtonStyle}>
            Review Changes
          </button>
        </div>
      )}

      {/* Bookmark icon */}
      <div
        className="bookmark-icon"
        onClick={toggleFavorite}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.2s ease",
          transform: "scale(1)",
          "&:hover": {
            transform: "scale(1.15)",
          },
        }}
      >
        <svg
          width="32"
          height="40"
          viewBox="0 0 32 40"
          fill={isFavorite ? "#000000" : "none"}
          stroke={darkMode ? "#ffffff" : "#333333"}
          strokeWidth="1.5"
          style={{
            transition: "all 0.3s ease",
          }}
        >
          {/* Flag/bookmark shape */}
          <path d="M2 2V38L16 30L30 38V2H2Z" />

          {/* Star in the middle */}
          <path
            d="M16 7L18.5 12.5L24.5 13L20 17L21.5 23L16 20L10.5 23L12 17L7.5 13L13.5 12.5L16 7Z"
            fill={isFavorite ? "#ffffff" : "none"}
            stroke={isFavorite ? "none" : darkMode ? "#ffffff" : "#333333"}
          />
        </svg>
      </div>

      {/* Header section with image and title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            position: "relative",
            marginBottom: "2rem",
            padding: "0.5rem",
            borderRadius: "12px",
            background: darkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            boxShadow: darkMode
              ? "0 8px 20px rgba(0, 0, 0, 0.4)"
              : "0 8px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src={novel.imageUrl || swordGodImage}
            alt={`Cover of ${novel.name}`}
            style={{
              maxWidth: "280px",
              minHeight: "400px",
              width: "100%",
              height: "420px",
              objectFit: "cover",
              borderRadius: "8px",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
              },
            }}
          />
        </div>

        {/* Original Name - editable */}
        {isEditing ? (
          <input
            type="text"
            value={editedValues.originalName || ""}
            onChange={(e) => handleFieldChange("originalName", e.target.value)}
            placeholder="Original Name (Optional)"
            style={{
              ...inputStyle,
              textAlign: "center",
              fontStyle: "italic",
              marginBottom: "0.75rem",
              fontSize: "1.2rem",
            }}
          />
        ) : (
          novel.originalName && (
            <div
              style={{
                ...textStyle,
                fontSize: "1.2rem",
                marginBottom: "0.75rem",
                color: darkMode ? "#aaaaaa" : "#666666",
                fontStyle: "italic",
                fontWeight: "bold",
              }}
            >
              {novel.originalName}
            </div>
          )
        )}

        {/* Novel Name - editable */}
        {isEditing ? (
          <input
            type="text"
            value={editedValues.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="Novel Name"
            style={{
              ...inputStyle,
              textAlign: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
            }}
          />
        ) : (
          <h1 style={{ ...headingStyle, marginBottom: "1rem" }}>
            {novel.name}
          </h1>
        )}

        {/* Personal Rating - show stars under name */}
        {novel.novelOpinion?.rating >= 0 && (
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                style={{
                  color:
                    i < novel.novelOpinion.rating
                      ? "#FFD700" // Golden color for filled stars
                      : darkMode
                      ? "rgba(255, 215, 0, 0.3)" // More visible transparent golden for dark mode
                      : "rgba(255, 215, 0, 0.4)", // More visible transparent golden for light mode
                  fontSize: "2rem", // Increased size
                  marginRight: "8px", // Increased spacing
                  textShadow:
                    i < novel.novelOpinion.rating
                      ? "0 0 8px rgba(255, 215, 0, 0.6)"
                      : "none",
                  filter:
                    i < novel.novelOpinion.rating
                      ? "drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))"
                      : "none",
                }}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>

      {/* All details in a single continuous section */}
      <div style={{ ...sectionStyle, padding: "2rem" }}>
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
            <div>
              <strong style={labelStyle}>Genre:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedValues.genre || ""}
                  onChange={(e) => handleFieldChange("genre", e.target.value)}
                  placeholder="Genre"
                  style={inputStyle}
                />
              ) : (
                <span
                  style={{
                    ...textStyle,
                    backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.95rem",
                  }}
                >
                  {novel.genre}
                </span>
              )}
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

              // For ratings, show with stars
              if (key.toLowerCase().includes("rating")) {
                return (
                  <div key={key}>
                    <strong style={labelStyle}>{formattedKey}:</strong>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={textStyle}>{value}/10</span>
                      <div
                        style={{
                          marginLeft: "0.5rem",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color:
                                i < Math.round(value / 2)
                                  ? darkMode
                                    ? "#61dafb"
                                    : "#0066cc"
                                  : darkMode
                                  ? "#444"
                                  : "#ddd",
                              marginRight: "2px",
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // For all other values
              return (
                <div key={key}>
                  <strong style={labelStyle}>{formattedKey}:</strong>
                  <span style={textStyle}>
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : value}
                  </span>
                </div>
              );
            })}

          {/* Show all fields from novel.novelOpinion (except rating) */}
          {novel.novelOpinion &&
            Object.entries(novel.novelOpinion).map(([key, value]) => {
              // Skip if value is empty, it's an ID field, or it's the rating
              if (
                value === undefined ||
                value === null ||
                key === "_id" ||
                key === "id" ||
                key.toLowerCase().includes("id") ||
                key === "rating" // Skip rating as it's now shown under the title
              ) {
                return null;
              }

              // Format the key name for display
              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/^\w/, (c) => c.toUpperCase());

              // For boolean values like worthToContinue
              if (typeof value === "boolean") {
                return (
                  <div key={key}>
                    <strong style={labelStyle}>{formattedKey}:</strong>
                    <span
                      style={{
                        ...textStyle,
                        color: value
                          ? darkMode
                            ? "#4CAF50"
                            : "#2E7D32"
                          : darkMode
                          ? "#F44336"
                          : "#C62828",
                        fontWeight: "600",
                      }}
                    >
                      {value ? "Yes" : "No"}
                    </span>
                  </div>
                );
              }

              // For all other values
              return (
                <div key={key}>
                  <strong style={labelStyle}>{formattedKey}:</strong>
                  <span style={textStyle}>{value}</span>
                </div>
              );
            })}

          {/* Main Character (mcName) */}
          {novel.mcName && (
            <div>
              <strong style={labelStyle}>Main Character:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedValues.mcName || ""}
                  onChange={(e) => handleFieldChange("mcName", e.target.value)}
                  placeholder="Main Character Name"
                  style={inputStyle}
                />
              ) : (
                <span style={textStyle}>{novel.mcName}</span>
              )}
            </div>
          )}

          {/* MC Trait */}
          {novel.specialCharacteristicOfMc && (
            <div>
              <strong style={labelStyle}>MC Trait:</strong>
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
                  style={inputStyle}
                />
              ) : (
                <span style={textStyle}>{novel.specialCharacteristicOfMc}</span>
              )}
            </div>
          )}

          {/* Added On date */}
          {novel.novelDetails?.addedOn && (
            <div>
              <strong style={labelStyle}>Added On:</strong>
              <span style={textStyle}>
                {formatDate(novel.novelDetails.addedOn)}
              </span>
            </div>
          )}

          {/* Last Updated date */}
          {novel.novelDetails?.lastUpdatedOn && (
            <div>
              <strong style={labelStyle}>Last Updated:</strong>
              <span style={textStyle}>
                {formatDate(novel.novelDetails.lastUpdatedOn)}
              </span>
            </div>
          )}
        </div>

        {/* Tags section */}
        {(novel.tags || isEditing) && (
          <div style={{ marginBottom: "1.5rem" }}>
            <strong
              style={{
                ...labelStyle,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Tags:
            </strong>
            {isEditing ? (
              <textarea
                value={editedValues.tags || ""}
                onChange={(e) => handleFieldChange("tags", e.target.value)}
                placeholder="Enter tags separated by commas"
                style={{
                  ...inputStyle,
                  minHeight: "80px",
                  resize: "vertical",
                }}
              />
            ) : (
              novel.tags &&
              novel.tags.trim() !== "" && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  {novel.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        ...textStyle,
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
          <strong style={labelStyle}>Link:</strong>
          {isEditing ? (
            <input
              type="url"
              value={editedValues.link || ""}
              onChange={(e) => handleFieldChange("link", e.target.value)}
              placeholder="Novel URL"
              style={inputStyle}
            />
          ) : (
            <a
              href={novel.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...linkStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {novel.link}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                <path d="M15 3h6v6"></path>
                <path d="M10 14L21 3"></path>
              </svg>
            </a>
          )}
        </div>

        {/* Description */}
        {novel.novelDetails?.description && (
          <div style={{ marginBottom: "1.5rem" }}>
            <strong
              style={{
                ...labelStyle,
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              Description:
            </strong>
            <div
              style={{
                ...textStyle,
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
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
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
                const originalValue = novel[key] || "";
                const newValue = editedValues[key] || "";

                // Only show fields that have changed
                if (originalValue === newValue) return null;

                // Format the key name for display
                const formattedKey = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/_/g, " ")
                  .replace(/^\w/, (c) => c.toUpperCase());

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
                onClick={saveChanges}
                disabled={isSaving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: darkMode ? "#61dafb" : "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Confirm Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "1rem",
          opacity: 0.6,
          fontSize: "0.9rem",
        }}
      >
        Last updated: {formatDate(novel.novelDetails.lastUpdatedOn)}
      </div>
    </div>
  );
}

// Add this to your CSS file
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }

export default NovelDetails;
