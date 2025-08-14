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

  // Apply dark mode to the entire component container
  const containerStyle = {
    color: darkMode ? "#ffffff" : "#333333",
    backgroundColor: darkMode ? "#121212" : "#ffffff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: darkMode
      ? "0 6px 12px rgba(0, 0, 0, 0.5)"
      : "0 6px 12px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    margin: "2rem auto",
    transition: "all 0.3s ease",
    position: "relative", // Add position relative so absolute positioning works inside
  };

  // Apply dark mode to text elements
  const textStyle = {
    color: darkMode ? "#ffffff" : "#333333",
    lineHeight: "1.8",
    fontSize: "1.05rem",
  };

  // Apply style to headings
  const headingStyle = {
    color: darkMode ? "#ffffff" : "#222222",
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    borderBottom: darkMode ? "2px solid #444" : "2px solid #ddd",
    paddingBottom: "0.75rem",
    textShadow: darkMode ? "2px 2px 4px rgba(0, 0, 0, 0.5)" : "none",
  };

  // Style for labels (strong elements)
  const labelStyle = {
    ...textStyle,
    fontWeight: "700",
    fontSize: "1.1rem",
    display: "inline-block",
    minWidth: "120px",
    color: darkMode ? "#61dafb" : "#0066cc",
  };

  // Apply dark mode to links
  const linkStyle = {
    color: darkMode ? "#61dafb" : "#0066cc",
    textDecoration: "none",
    borderBottom: "1px dotted",
    paddingBottom: "2px",
    transition: "all 0.2s ease-in-out",
    fontWeight: "500",
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
        }}
      >
        Loading novel details...
      </div>
    );

  if (error) return <div style={containerStyle}>{error}</div>;

  return (
    <div
      className={`novel-details ${darkMode ? "dark-mode" : ""}`}
      style={containerStyle}
    >
      {/* Updated bookmark icon to match the flag with star design */}
      <div
        className="bookmark-icon"
        onClick={toggleFavorite}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.2s ease",
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

      {/* Add image above original name with increased size */}
      <div
        style={{ textAlign: "center", marginBottom: "2.5rem", padding: "1rem" }}
      >
        <img
          src={novel.imageUrl || swordGodImage} // Use sword_god image as default
          alt={`Cover of ${novel.name}`}
          style={{
            maxWidth: "300px",
            minHeight: "400px",
            width: "100%",
            height: "450px", // Fixed height to ensure consistent size
            objectFit: "cover", // Changed from contain to cover to stretch and fill
            borderRadius: "10px",
            boxShadow: darkMode
              ? "0 8px 16px rgba(0, 0, 0, 0.6)"
              : "0 8px 16px rgba(0, 0, 0, 0.25)",
            padding: "0.5rem",
            backgroundColor: darkMode ? "#1a1a1a" : "#f8f8f8",
          }}
        />
      </div>

      {novel.originalName && (
        <div
          style={{
            ...textStyle,
            fontSize: "1.2rem",
            marginBottom: "0.5rem",
            color: darkMode ? "#aaaaaa" : "#666666",
            fontStyle: "italic",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {novel.originalName}
        </div>
      )}

      <h1 style={headingStyle}>{novel.name}</h1>

      {/* All novel information without section headers */}
      <div style={{ marginBottom: "1rem" }}>
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
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Author:</strong>
          <span style={textStyle}>{novel.author}</span>
        </div>
      )}

      {/* Status information */}
      {novel.status && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Status:</strong>
          <span style={textStyle}>{novel.status}</span>
        </div>
      )}

      {/* Release year */}
      {novel.releaseYear && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Released:</strong>
          <span style={textStyle}>{novel.releaseYear}</span>
        </div>
      )}

      {/* Tags section */}
      {novel.tags && novel.tags.trim() !== "" && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Tags:</strong>
          <div
            style={{
              display: "inline-flex",
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
        </div>
      )}

      {/* Link to novel */}
      <div style={{ marginBottom: "1rem" }}>
        <strong style={labelStyle}>Link:</strong>
        <a
          href={novel.link}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {novel.link}
        </a>
      </div>

      {/* Description */}
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
            padding: "1rem",
            backgroundColor: darkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
            borderRadius: "8px",
            borderLeft: darkMode ? "3px solid #61dafb" : "3px solid #0066cc",
          }}
        >
          {novel.novelDetails?.description || "No description available"}
        </div>
      </div>

      {/* Chapters */}
      {novel.novelDetails?.chapters && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Chapters:</strong>
          <span style={textStyle}>{novel.novelDetails.chapters}</span>
        </div>
      )}

      {/* Word Count */}
      {novel.novelDetails?.wordCount && (
        <div style={{ marginBottom: "1rem" }}>
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
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Update Frequency:</strong>
          <span style={textStyle}>{novel.novelDetails.frequency}</span>
        </div>
      )}

      {/* Language */}
      {novel.novelDetails?.language && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Language:</strong>
          <span style={textStyle}>{novel.novelDetails.language}</span>
        </div>
      )}

      {/* Overall Rating */}
      {novel.novelDetails?.rating && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Overall Rating:</strong>
          <span style={textStyle}>{novel.novelDetails.rating}/10</span>
        </div>
      )}

      {/* Story Rating */}
      {novel.novelDetails?.storyRating && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Story Rating:</strong>
          <span style={textStyle}>{novel.novelDetails.storyRating}/10</span>
        </div>
      )}

      {/* Character Rating */}
      {novel.novelDetails?.characterRating && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Character Rating:</strong>
          <span style={textStyle}>{novel.novelDetails.characterRating}/10</span>
        </div>
      )}

      {/* Writing Quality Rating */}
      {novel.novelDetails?.writingRating && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Writing Quality:</strong>
          <span style={textStyle}>{novel.novelDetails.writingRating}/10</span>
        </div>
      )}

      {/* Personal Rating - updated to use the correct field name */}
      {novel.novelOpinion?.rating !== undefined && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>My Rating:</strong>
          <span style={textStyle}>{novel.novelOpinion.rating}/5</span>
        </div>
      )}

      {/* Chapters Read - new field from screenshot */}
      {novel.novelOpinion?.chaptersRead !== undefined && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Chapters Read:</strong>
          <span style={textStyle}>{novel.novelOpinion.chaptersRead}</span>
        </div>
      )}

      {/* Worth To Continue - new field from screenshot */}
      {novel.novelOpinion?.worthToContinue !== undefined && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Worth To Continue:</strong>
          <span style={textStyle}>
            {novel.novelOpinion.worthToContinue ? "Yes" : "No"}
          </span>
        </div>
      )}

      {/* Chapters Frequency - new field from screenshot */}
      {novel.novelOpinion?.chaptersFrequency && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={labelStyle}>Chapters Frequency:</strong>
          <span style={textStyle}>{novel.novelOpinion.chaptersFrequency}</span>
        </div>
      )}

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
            key.toLowerCase().includes("id") // Skip any field containing 'id'
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
            if (typeof sanitizedValue === "object" && sanitizedValue !== null) {
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
  );
}

// Add this function to the novelApi service (to be implemented in novelApi.js)
// novelApi.bulkUpload = async (data) => {
//   return await axios.post('/api/novels/bulk-upload', data);
// };

export default NovelDetails;
