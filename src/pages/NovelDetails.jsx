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
      } catch (err) {
        setError("Failed to load novel details.");
      } finally {
        setLoading(false);
      }
    };
    fetchNovel();
  }, [id]);

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

      <div style={{ marginBottom: "1.5rem" }}>
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

      {/* Add tags section - handling as a string */}
      {novel.tags && novel.tags.trim() !== "" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={labelStyle}>Tags:</strong>
          <span
            style={{
              ...textStyle,
              backgroundColor: darkMode ? "#2a2a2a" : "#f0f0f0",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.95rem",
              marginLeft: "8px",
            }}
          >
            {novel.tags}
          </span>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
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
          {novel.novelDetails?.description || "N/A"}
        </div>
      </div>

      <div>
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
    </div>
  );
}

// Add this function to the novelApi service (to be implemented in novelApi.js)
// novelApi.bulkUpload = async (data) => {
//   return await axios.post('/api/novels/bulk-upload', data);
// };

export default NovelDetails;
