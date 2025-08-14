import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import React from "react"; // Add this import
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

        // Debug: Check what tags data we're getting
        console.log("Novel data:", response.data);
        console.log("Tags value:", response.data.tags);
        console.log("Tags type:", typeof response.data.tags);

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
    if (!novel?._id) return; // Add null check

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
      ? "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #121212 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f9ff 50%, #f5f7fa 100%)",
    padding: "3rem",
    borderRadius: "24px",
    boxShadow: darkMode
      ? "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    maxWidth: "1000px",
    margin: "3rem auto",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflowX: "hidden",
    backdropFilter: "blur(10px)",
    border: darkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.05)",
  };

  // Improved text styling with better readability
  const textStyle = {
    color: darkMode ? "#ffffff" : "#333333",
    lineHeight: "1.8",
    fontSize: "1.05rem",
    transition: "color 0.3s ease",
  };

  // Enhanced heading style with gradient text
  const headingStyle = {
    background: darkMode
      ? "linear-gradient(135deg, #61dafb 0%, #4ecdc4 50%, #45b7d1 100%)"
      : "linear-gradient(135deg, #0066cc 0%, #0099ff 50%, #00bcd4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontSize: "3.5rem",
    fontWeight: "800",
    marginBottom: "1.5rem",
    textAlign: "center",
    position: "relative",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
    textShadow: "none",
    animation: "fadeInUp 0.8s ease-out",
  };

  // Enhanced styling for labels with gradient accent
  const labelStyle = {
    ...textStyle,
    fontWeight: "700",
    fontSize: "1.15rem",
    display: "inline-block",
    minWidth: "160px",
    background: darkMode
      ? "linear-gradient(135deg, #61dafb, #4ecdc4)"
      : "linear-gradient(135deg, #0066cc, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    transition: "all 0.3s ease",
    marginBottom: "0.5rem",
  };

  // Enhanced styling for links with hover effect
  const linkStyle = {
    background: darkMode
      ? "linear-gradient(135deg, #61dafb, #4ecdc4)"
      : "linear-gradient(135deg, #0066cc, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textDecoration: "none",
    borderBottom: "2px dotted rgba(97, 218, 251, 0.5)",
    paddingBottom: "2px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontWeight: "600",
    fontSize: "1rem",
    "&:hover": {
      borderBottomStyle: "solid",
      transform: "translateY(-1px)",
      filter: "brightness(1.2)",
    },
  };

  // Enhanced section style with glassmorphism
  const sectionStyle = {
    backgroundColor: darkMode
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.8)",
    padding: "2.5rem",
    borderRadius: "20px",
    marginBottom: "2.5rem",
    boxShadow: darkMode
      ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(20px)",
    border: darkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.8)",
    position: "relative",
    overflow: "hidden",
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
    if (!novel) return; // Add null check

    setIsEditing(true);
    // Initialize editedValues with only fields that exist in your data model
    setEditedValues({
      name: novel.name,
      originalName: novel.originalName || "",
      link: novel.link || "",
      tags: novel.tags || "",
      description: novel.novelDetails?.description || "",
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
    const hasChanges = Object.keys(editedValues).some((key) => {
      if (key === "description") {
        // Special handling for description (nested in novelDetails)
        return editedValues[key] !== (novel.novelDetails?.description || "");
      } else {
        return editedValues[key] !== (novel[key] || "");
      }
    });

    if (hasChanges) {
      setShowComparisonModal(true);
    } else {
      alert("No changes detected");
    }
  };

  // Function to save changes after confirmation
  const saveChanges = async () => {
    console.log("saveChanges function called");
    console.log("Current novel object:", novel);
    console.log("Novel ID:", novel?._id);
    console.log("URL ID:", id);

    // Use the ID from URL as fallback
    const novelId = novel?._id || id;

    if (!novelId) {
      console.log("No novel ID found in novel object or URL, returning");
      alert(
        "Error: Novel ID not found. Please refresh the page and try again."
      );
      return;
    }

    console.log("Using novel ID:", novelId);
    console.log("Setting isSaving to true");
    setIsSaving(true);

    try {
      console.log("Starting to process changed fields");
      console.log("editedValues:", editedValues);
      console.log("novel:", novel);

      // Only send fields that have changed
      const changedFields = {};
      Object.keys(editedValues).forEach((key) => {
        if (key === "description") {
          // Special handling for description (nested in novelDetails)
          const originalDesc = novel?.novelDetails?.description || "";
          const newDesc = editedValues[key];
          console.log(
            `Description - Original: "${originalDesc}", New: "${newDesc}"`
          );
          if (newDesc !== originalDesc) {
            changedFields[key] = newDesc;
          }
        } else {
          const originalValue = novel?.[key] || "";
          const newValue = editedValues[key];
          console.log(
            `${key} - Original: "${originalValue}", New: "${newValue}"`
          );
          if (newValue !== originalValue) {
            changedFields[key] = newValue;
          }
        }
      });

      console.log("changedFields:", changedFields);

      if (Object.keys(changedFields).length === 0) {
        console.log("No changes detected, skipping API call");
        alert("No changes detected");
        setIsSaving(false);
        return;
      }

      console.log("Making API call to update novel with ID:", novelId);
      // Make the API call to update the novel - use the novelId we determined above
      const response = await novelApi.updateNovel(novelId, changedFields);
      console.log("API response:", response);

      // Update the local state with the new values
      const updatedNovel = { ...novel, ...changedFields };

      // Handle description update (since it's nested in novelDetails)
      if (changedFields.description !== undefined) {
        updatedNovel.novelDetails = {
          ...novel.novelDetails,
          description: changedFields.description,
        };
      }

      console.log("Updating novel state with:", updatedNovel);
      setNovel(updatedNovel);

      // Exit edit mode and reset
      console.log("Exiting edit mode");
      setIsEditing(false);
      setEditedValues({});
      setShowComparisonModal(false);

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        `Failed to save changes: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      console.log("Setting isSaving to false");
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

  // Add this check to prevent rendering when novel is null
  if (!novel) return <div style={containerStyle}>Novel not found</div>;

  return (
    <div
      className={`novel-details ${darkMode ? "dark-mode" : ""}`}
      style={containerStyle}
    >
      {/* Gradient decoration at top - Enhanced */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: `linear-gradient(90deg, 
            ${darkMode ? "#61dafb" : "#0066cc"} 0%, 
            ${darkMode ? "#4ecdc4" : "#0099ff"} 33%, 
            ${darkMode ? "#45b7d1" : "#00bcd4"} 66%, 
            ${darkMode ? "#26d0ce" : "#00acc1"} 100%)`,
          borderRadius: "24px 24px 0 0",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      ></div>

      {/* Remove or comment out the floating particles background if it's causing issues */}
      {/* 
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          opacity: 0.1,
          background: darkMode
            ? "radial-gradient(circle at 20% 50%, #61dafb 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4ecdc4 0%, transparent 50%), radial-gradient(circle at 40% 80%, #45b7d1 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 50%, #0066cc 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0099ff 0%, transparent 50%), radial-gradient(circle at 40% 80%, #00bcd4 0%, transparent 50%)",
          borderRadius: "24px",
        }}
      ></div>
      */}

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
        {/* Enhanced image container with hover effects */}
        <div
          style={{
            position: "relative",
            marginBottom: "2.5rem",
            padding: "1rem",
            borderRadius: "20px",
            background: darkMode
              ? "linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))"
              : "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6))",
            boxShadow: darkMode
              ? "0 15px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            "&:hover": {
              transform: "translateY(-5px) scale(1.02)",
              boxShadow: darkMode
                ? "0 25px 50px rgba(0, 0, 0, 0.6)"
                : "0 25px 50px rgba(0, 0, 0, 0.15)",
            },
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 25px 50px rgba(0, 0, 0, 0.6)"
              : "0 25px 50px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = darkMode
              ? "0 15px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)";
          }}
        >
          <img
            src={novel.imageUrl || swordGodImage}
            alt={`Cover of ${novel.name}`}
            style={{
              maxWidth: "300px",
              minHeight: "420px",
              width: "100%",
              height: "450px",
              objectFit: "cover",
              borderRadius: "15px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: "contrast(1.1) saturate(1.1)",
            }}
          />
          {/* Image overlay gradient */}
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "1rem",
              right: "1rem",
              height: "100px",
              background: "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
              borderRadius: "0 0 15px 15px",
              pointerEvents: "none",
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
          <div
            style={{
              marginBottom: "2rem",
              textAlign: "center",
              animation: "fadeIn 1s ease-out 0.3s both",
            }}
          >
            <div
              style={{
                padding: "1rem 2rem",
                borderRadius: "50px",
                background: darkMode
                  ? "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))"
                  : "linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 215, 0, 0.2)",
                display: "inline-block",
              }}
            >
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    color:
                      i < novel.novelOpinion.rating
                        ? "#FFD700"
                        : "rgba(255, 215, 0, 0.3)",
                    fontSize: "2.2rem",
                    marginRight: i < 4 ? "8px" : "0",
                    textShadow:
                      i < novel.novelOpinion.rating
                        ? "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)"
                        : "none",
                    filter:
                      i < novel.novelOpinion.rating
                        ? "drop-shadow(0 0 8px rgba(255, 215, 0, 1))"
                        : "none",
                    transition: "all 0.3s ease",
                    animation:
                      i < novel.novelOpinion.rating
                        ? `starGlow 2s ease-in-out infinite ${i * 0.2}s`
                        : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (i < novel.novelOpinion.rating) {
                      e.target.style.transform = "scale(1.2)";
                      e.target.style.filter =
                        "drop-shadow(0 0 15px rgba(255, 215, 0, 1))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.filter =
                      i < novel.novelOpinion.rating
                        ? "drop-shadow(0 0 8px rgba(255, 215, 0, 1))"
                        : "none";
                  }}
                >
                  ★
                </span>
              ))}
            </div>
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: darkMode
                    ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                    : "0 10px 25px rgba(0, 0, 0, 0.1)",
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                  : "0 10px 25px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <strong style={labelStyle}>Genre:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedValues.genre || ""}
                  onChange={(e) => handleFieldChange("genre", e.target.value)}
                  placeholder="Genre"
                  style={{
                    ...inputStyle,
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
                <span
                  style={{
                    ...textStyle,
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(97, 218, 251, 0.2), rgba(78, 205, 196, 0.2))"
                      : "linear-gradient(135deg, rgba(0, 102, 204, 0.1), rgba(0, 153, 255, 0.1))",
                    padding: "0.5rem 1rem",
                    borderRadius: "25px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    border: darkMode
                      ? "1px solid rgba(97, 218, 251, 0.3)"
                      : "1px solid rgba(0, 102, 204, 0.3)",
                    display: "inline-block",
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
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = darkMode
                        ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                        : "0 10px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <strong style={labelStyle}>{formattedKey}:</strong>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginTop: "0.5rem",
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
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = darkMode
                      ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                      : "0 10px 25px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <strong style={labelStyle}>{formattedKey}:</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={textStyle}>
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
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = darkMode
                        ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                        : "0 10px 25px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <strong style={labelStyle}>{formattedKey}:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
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
                  </div>
                );
              }

              // For all other values
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
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = darkMode
                      ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                      : "0 10px 25px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <strong style={labelStyle}>{formattedKey}:</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={textStyle}>{value}</span>
                  </div>
                </div>
              );
            })}

          {/* Main Character (mcName) */}
          {novel.mcName && (
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                  : "0 10px 25px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <strong style={labelStyle}>Main Character:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedValues.mcName || ""}
                    onChange={(e) =>
                      handleFieldChange("mcName", e.target.value)
                    }
                    placeholder="Main Character Name"
                    style={inputStyle}
                  />
                ) : (
                  <span style={textStyle}>{novel.mcName}</span>
                )}
              </div>
            </div>
          )}

          {/* MC Trait */}
          {novel.specialCharacteristicOfMc && (
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                  : "0 10px 25px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <strong style={labelStyle}>MC Trait:</strong>
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
                    style={inputStyle}
                  />
                ) : (
                  <span style={textStyle}>
                    {novel.specialCharacteristicOfMc}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Added On date */}
          {novel.novelDetails?.addedOn && (
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                  : "0 10px 25px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <strong style={labelStyle}>Added On:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={textStyle}>
                  {formatDate(novel.novelDetails.addedOn)}
                </span>
              </div>
            </div>
          )}

          {/* Last Updated date */}
          {novel.novelDetails?.lastUpdatedOn && (
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 10px 25px rgba(0, 0, 0, 0.3)"
                  : "0 10px 25px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <strong style={labelStyle}>Last Updated:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <span style={textStyle}>
                  {formatDate(novel.novelDetails.lastUpdatedOn)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tags section - Fixed condition */}
        {(novel.tags && novel.tags.trim && novel.tags.trim() !== "") ||
        isEditing ? (
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
        ) : null}

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
        {(novel.novelDetails?.description || isEditing) && (
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
            {isEditing ? (
              <textarea
                value={editedValues.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Enter novel description"
                style={{
                  ...inputStyle,
                  minHeight: "150px",
                  resize: "vertical",
                  lineHeight: "1.6",
                  fontFamily: "inherit",
                }}
              />
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div style={modalOverlayStyle} onClick={(e) => e.stopPropagation()}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
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
                const originalValue =
                  key === "description"
                    ? novel.novelDetails?.description || ""
                    : novel[key] || "";
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Cancel button clicked");
                  setShowComparisonModal(false);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: darkMode ? "#444" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Confirm button clicked, isSaving:", isSaving);
                  if (!isSaving) {
                    saveChanges();
                  }
                }}
                disabled={isSaving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: darkMode ? "#61dafb" : "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                  fontSize: "1rem",
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
