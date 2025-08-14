import { useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { novelApi } from "../services/novelApi";
import { ThemeContext } from "../context/ThemeContext";
import swordGodImage from "../assets/images/sword_god.jpg";
import "./NovelDetails.css";

function NovelDetails() {
  const { id } = useParams();
  const { darkMode } = useContext(ThemeContext);
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add favorite state
  const [isFavorite, setIsFavorite] = useState(false);

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
      {/* Add a beautiful accent decoration to the top of the card */}
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

      {/* Updated bookmark icon */}
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

        {novel.originalName && (
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
        )}

        <h1
          style={{
            ...headingStyle,
            marginBottom: "1.5rem",
            "&::after": {
              content: "''",
              display: "block",
              width: "60px",
              height: "4px",
              backgroundColor: darkMode ? "#61dafb" : "#0066cc",
              margin: "0.75rem auto 0",
              borderRadius: "2px",
            },
          }}
        >
          {novel.name}
        </h1>
      </div>

      {/* All details in a single continuous section */}
      <div
        style={{
          ...sectionStyle,
          padding: "2rem",
        }}
      >
        {/* Unified grid for all details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Genre information */}
          <div>
            <strong style={labelStyle}>Genre:</strong>
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
          </div>

          {/* Author information */}
          {novel.author && (
            <div>
              <strong style={labelStyle}>Author:</strong>
              <span style={textStyle}>{novel.author}</span>
            </div>
          )}

          {/* Main Character Name - New field */}
          {novel.mcName && (
            <div>
              <strong style={labelStyle}>Main Character:</strong>
              <span style={textStyle}>{novel.mcName}</span>
            </div>
          )}

          {/* Special Characteristic Of MC - New field */}
          {novel.specialCharacteristicOfMc && (
            <div>
              <strong style={labelStyle}>MC Trait:</strong>
              <span style={textStyle}>{novel.specialCharacteristicOfMc}</span>
            </div>
          )}

          {/* Status information */}
          {novel.status && (
            <div>
              <strong style={labelStyle}>Status:</strong>
              <span style={textStyle}>{novel.status}</span>
            </div>
          )}

          {/* Release year */}
          {novel.releaseYear && (
            <div>
              <strong style={labelStyle}>Released:</strong>
              <span style={textStyle}>{novel.releaseYear}</span>
            </div>
          )}

          {/* Added On date - New field */}
          {novel.addedOn && (
            <div>
              <strong style={labelStyle}>Added On:</strong>
              <span style={textStyle}>
                {new Date(novel.addedOn).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Last Updated date - New field */}
          {novel.lastUpdatedOn && (
            <div>
              <strong style={labelStyle}>Last Updated:</strong>
              <span style={textStyle}>
                {new Date(novel.lastUpdatedOn).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Chapters */}
          {novel.novelDetails?.chapters && (
            <div>
              <strong style={labelStyle}>Chapters:</strong>
              <span style={textStyle}>{novel.novelDetails.chapters}</span>
            </div>
          )}

          {/* Word Count */}
          {novel.novelDetails?.wordCount && (
            <div>
              <strong style={labelStyle}>Word Count:</strong>
              <span style={textStyle}>
                {typeof novel.novelDetails.wordCount === "number"
                  ? novel.novelDetails.wordCount.toLocaleString()
                  : novel.novelDetails.wordCount}
              </span>
            </div>
          )}

          {/* Publishing Frequency */}
          {novel.novelDetails?.frequency && (
            <div>
              <strong style={labelStyle}>Update Frequency:</strong>
              <span style={textStyle}>{novel.novelDetails.frequency}</span>
            </div>
          )}

          {/* Language */}
          {novel.novelDetails?.language && (
            <div>
              <strong style={labelStyle}>Language:</strong>
              <span style={textStyle}>{novel.novelDetails.language}</span>
            </div>
          )}

          {/* Overall Rating */}
          {novel.novelDetails?.rating && (
            <div>
              <strong style={labelStyle}>Rating:</strong>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <span style={textStyle}>{novel.novelDetails.rating}/10</span>
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
                          i < Math.round(novel.novelDetails.rating / 2)
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
          )}

          {/* Story Rating */}
          {novel.novelDetails?.storyRating && (
            <div>
              <strong style={labelStyle}>Story Rating:</strong>
              <span style={textStyle}>{novel.novelDetails.storyRating}/10</span>
            </div>
          )}

          {/* Character Rating */}
          {novel.novelDetails?.characterRating && (
            <div>
              <strong style={labelStyle}>Character Rating:</strong>
              <span style={textStyle}>
                {novel.novelDetails.characterRating}/10
              </span>
            </div>
          )}

          {/* Writing Quality Rating */}
          {novel.novelDetails?.writingRating && (
            <div>
              <strong style={labelStyle}>Writing Quality:</strong>
              <span style={textStyle}>
                {novel.novelDetails.writingRating}/10
              </span>
            </div>
          )}

          {/* User's rating */}
          {novel.novelOpinion?.rating !== undefined && (
            <div>
              <strong style={labelStyle}>Personal Rating:</strong>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <span style={textStyle}>{novel.novelOpinion.rating}/5</span>
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
                          i < novel.novelOpinion.rating
                            ? darkMode
                              ? "#FFC107"
                              : "#FFA000"
                            : darkMode
                            ? "#444"
                            : "#ddd",
                        marginRight: "2px",
                        fontSize: "1.1rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chapters Read */}
          {novel.novelOpinion?.chaptersRead !== undefined && (
            <div>
              <strong style={labelStyle}>Chapters Read:</strong>
              <span style={textStyle}>{novel.novelOpinion.chaptersRead}</span>
            </div>
          )}

          {/* Worth To Continue */}
          {novel.novelOpinion?.worthToContinue !== undefined && (
            <div>
              <strong style={labelStyle}>Worth To Continue:</strong>
              <span
                style={{
                  ...textStyle,
                  color: novel.novelOpinion.worthToContinue
                    ? darkMode
                      ? "#4CAF50"
                      : "#2E7D32"
                    : darkMode
                    ? "#F44336"
                    : "#C62828",
                  fontWeight: "600",
                }}
              >
                {novel.novelOpinion.worthToContinue ? "Yes" : "No"}
              </span>
            </div>
          )}

          {/* Chapters Frequency */}
          {novel.novelOpinion?.chaptersFrequency && (
            <div>
              <strong style={labelStyle}>Reading Frequency:</strong>
              <span style={textStyle}>
                {novel.novelOpinion.chaptersFrequency}
              </span>
            </div>
          )}
        </div>

        {/* Tags section */}
        {novel.tags && novel.tags.trim() !== "" && (
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
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: darkMode ? "#3a3a3a" : "#e0e0e0",
                    },
                  }}
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Link to novel */}
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={labelStyle}>Link:</strong>
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
        </div>

        {/* Description at the bottom for better readability */}
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
              borderLeft: darkMode ? "4px solid #61dafb" : "4px solid #0066cc",
              lineHeight: "1.9",
            }}
          >
            {novel.novelDetails?.description || "No description available"}
          </div>
        </div>

        {/* Display all other opinion fields that aren't already shown */}
        {novel.novelOpinion &&
          Object.entries(novel.novelOpinion).map(([key, value]) => {
            // Skip fields we've already explicitly handled and any ID fields
            if (
              [
                "rating",
                "chaptersRead",
                "favorite",
                "worthToContinue",
                "chaptersFrequency",
              ].includes(key) ||
              key === "_id" ||
              key === "id" ||
              key.toLowerCase().includes("id")
            ) {
              return null;
            }

            // Format the key name for display (capitalize, replace underscores with spaces)
            const formattedKey = key
              .replace(/([A-Z])/g, " $1") // Insert space before capital letters
              .replace(/_/g, " ") // Replace underscores with spaces
              .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter

            // Handle different value types
            let displayValue;
            if (typeof value === "boolean") {
              displayValue = value ? "Yes" : "No";
            } else if (value === null || value === undefined) {
              displayValue = "N/A";
            } else if (typeof value === "object") {
              // For object values, convert to JSON string but remove any ID fields
              const sanitizedValue = { ...value };
              if (
                typeof sanitizedValue === "object" &&
                sanitizedValue !== null
              ) {
                // Remove ID fields from objects
                ["_id", "id", "novelId"].forEach((idField) => {
                  if (idField in sanitizedValue) {
                    delete sanitizedValue[idField];
                  }
                });
              }
              displayValue = JSON.stringify(sanitizedValue, null, 2);
            } else {
              displayValue = value.toString();
            }

            // Determine if this should be a long-form field (for text that might be lengthy)
            const isLongForm = typeof value === "string" && value.length > 100;

            if (isLongForm) {
              return (
                <div key={key} style={{ marginBottom: "1.5rem" }}>
                  <strong
                    style={{
                      ...labelStyle,
                      display: "block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {formattedKey}:
                  </strong>
                  <div
                    style={{
                      ...textStyle,
                      padding: "1rem",
                      backgroundColor: darkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.02)",
                      borderRadius: "8px",
                      borderLeft: darkMode
                        ? "3px solid #61dafb"
                        : "3px solid #0066cc",
                    }}
                  >
                    {displayValue}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <strong style={labelStyle}>{formattedKey}:</strong>
                  <span style={textStyle}>{displayValue}</span>
                </div>
              );
            }
          })}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "1rem",
          opacity: 0.6,
          fontSize: "0.9rem",
        }}
      >
        Last updated: {new Date().toLocaleDateString()}
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
