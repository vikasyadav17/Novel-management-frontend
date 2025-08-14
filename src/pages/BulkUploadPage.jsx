import React, { useState } from "react";
import BulkUpload from "../components/BulkUpload";
import logger from "../utils/logger"; // Import the logger

function BulkUploadPage({ onBulkUpload }) {
  const [uploadedNovels, setUploadedNovels] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBulkUpload = async (novels) => {
    logger.info("Bulk upload initiated with data:", novels);
    try {
      logger.info("Processing bulk upload...");
      setUploadedNovels(novels); // Save the uploaded novels to state
      setSuccessMessage("Novels uploaded successfully!");
      setErrorMessage(null);
      logger.info("Bulk upload successful.");
    } catch (err) {
      logger.error("Bulk upload failed:", err.message);
      setErrorMessage("Failed to upload novels in bulk.");
      setSuccessMessage(null);
    }
  };

  return (
    <div
      style={{
        padding: "48px",
        maxWidth: "800px",
        margin: "0 auto",
        background: "#f7f7fb",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2980b9",
          fontSize: "2.4rem",
          fontWeight: "bold",
          marginBottom: "24px",
        }}
      >
        Bulk Upload Novels
      </h1>
      <BulkUpload onBulkUpload={handleBulkUpload} />
      {successMessage && (
        <div
          style={{
            color: "green",
            marginTop: "24px",
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
            marginTop: "24px",
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {errorMessage}
        </div>
      )}
      {uploadedNovels.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2
            style={{
              textAlign: "center",
              color: "#2980b9",
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Uploaded Novels
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#2980b9", color: "#fff" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Title</th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Original Name
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>Genre</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Link</th>
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
                  <td style={{ padding: "12px" }}>{novel.name || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    {novel.originalName || "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>{novel.genre || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    {novel.link ? (
                      <a
                        href={novel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2980b9", textDecoration: "none" }}
                      >
                        Visit
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
