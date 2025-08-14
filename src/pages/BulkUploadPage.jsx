import React, { useState } from "react";
import BulkUpload from "../components/BulkUpload";
import logger from "../utils/logger"; // Import the logger
import { novelApi } from "../services/novelApi"; // Import novelApi

function BulkUploadPage() {
  const [uploadedNovels, setUploadedNovels] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBulkUpload = async (novels) => {
    logger.info("Bulk upload initiated with data:", novels);
    try {
      if (!novels || novels.length === 0) {
        setErrorMessage("No novels found in the uploaded file.");
        setSuccessMessage(null);
        return;
      }

      // Log each novel for debugging
      novels.forEach((novel, index) => {
        logger.info(`Novel ${index + 1}:`, novel);
      });

      // Ensure the data has the correct keys (case-insensitive handling)
      const formattedNovels = novels.map((novel) => ({
        name: novel.Name || novel.name || "N/A",
        originalName:
          novel.OriginalName ||
          novel.originalName ||
          novel.ORIGINALNAME ||
          "N/A",
        genre: novel.Genre || novel.genre || "N/A",
        link: novel.Link || novel.link || "N/A",
      }));

      logger.info("Formatted novels:", formattedNovels);

      // Use novelApi to send the bulk upload request
      const result = await novelApi.bulkUploadNovels(formattedNovels);

      setUploadedNovels(formattedNovels); // Save the formatted novels to state
      setSuccessMessage(result);
      setErrorMessage(null);
      logger.info("Bulk upload successful.");
    } catch (err) {
      logger.error("Bulk upload failed:", err.message);
      setErrorMessage(err.message || "Failed to upload novels in bulk.");
      setSuccessMessage(null);
    }
  };

  const handleUploadComplete = (successMessage, errorMessage) => {
    if (successMessage) {
      setSuccessMessage(successMessage);
      setErrorMessage(null);
    } else {
      setErrorMessage(errorMessage);
      setSuccessMessage(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start", // Align content to the top like other pages
        alignItems: "center",
        minHeight: "100vh", // Full viewport height
        width: "100%", // Full viewport width
        maxWidth: "1600px", // Set max width to 1600px
        margin: "0 auto", // Center the content horizontally
        background: "#f7f7fb",
        padding: "16px", // Standard padding
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#000", // Set text color to black
          fontSize: "2.4rem",
          fontWeight: "bold",
          marginBottom: "16px", // Adjust margin for consistency
        }}
      >
        Bulk Upload Novels
      </h1>
      <BulkUpload onUploadComplete={handleUploadComplete} />
      {successMessage && (
        <div
          style={{
            color: "green",
            marginTop: "16px", // Adjust margin for consistency
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div
          style={{
            color: "red",
            marginTop: "16px", // Adjust margin for consistency
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {errorMessage}
        </div>
      )}
      {uploadedNovels.length > 0 && (
        <div style={{ marginTop: "24px", width: "100%" }}>
          <h2
            style={{
              textAlign: "center",
              color: "#000", // Set text color to black
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "12px", // Adjust margin for consistency
            }}
          >
            Uploaded Novels
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "12px", // Adjust margin for consistency
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "#000", // Set text color to black
            }}
          >
            <thead>
              <tr style={{ background: "#2980b9", color: "#fff" }}>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "#000" }}
                >
                  Title
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "#000" }}
                >
                  Genre
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "#000" }}
                >
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {uploadedNovels.map((novel, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <td
                    style={{
                      padding: "12px",
                      color: "#000",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        cursor: "pointer",
                      }}
                      title={novel.originalName || "N/A"} // Tooltip for original name
                    >
                      {novel.name || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#000" }}>
                    {novel.genre || "N/A"}
                  </td>
                  <td style={{ padding: "12px", color: "#000" }}>
                    {novel.link ? (
                      <a
                        href={novel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2980b9", textDecoration: "none" }}
                      >
                        {novel.link} {/* Display the full link */}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BulkUploadPage;
