import React, { useState } from "react";
import BulkUpload from "../components/BulkUpload";
import logger from "../utils/logger"; // Import the logger
import { novelApi } from "../services/novelApi"; // Import novelApi

function BulkUploadPage() {
  const [uploadedNovels, setUploadedNovels] = useState([]);
  const [successModal, setSuccessModal] = useState(false); // Success modal state
  const [failureModal, setFailureModal] = useState(false); // Failure modal state
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBulkUpload = async (novels) => {
    logger.info("Bulk upload initiated with data:", novels);
    try {
      if (!novels || novels.length === 0) {
        setErrorMessage("No novels found in the uploaded file.");
        setFailureModal(true); // Show failure modal
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

      // Use novelApi to send the bulk upload request and get the response
      const response = await novelApi.bulkUploadNovels(formattedNovels);

      setUploadedNovels([]); // Clear the uploaded novels state
      setSuccessModal(response.data.message || "Bulk upload successful!"); // Use the response message
      setErrorMessage(null);
      logger.info("Bulk upload successful.");
    } catch (err) {
      logger.error("Bulk upload failed:", err);

      // Log the full error response for debugging
      if (err.response) {
        logger.error("Backend response:", err.response.data);
      }

      // Display backend error message if available
      const backendError =
        err.response?.data?.message ||
        err.message ||
        "Failed to upload novels in bulk.";
      setErrorMessage(backendError);
      setFailureModal(true); // Show failure modal
    }
  };

  const onUploadComplete = (uploadedData) => {
    logger.info("Upload completed with data:", uploadedData);
    setUploadedNovels(uploadedData); // Update the state with uploaded data
    setSuccessModal("No of records inserted: " + uploadedData.length); // Show success modal with record count
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "1600px",
        margin: "0 auto",
        background: "#f7f7fb",
        padding: "16px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#000",
          fontSize: "2.4rem",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        Bulk Upload Novels
      </h1>
      <BulkUpload
        onBulkUpload={handleBulkUpload}
        onUploadComplete={onUploadComplete}
      />
      {successModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#222",
              borderRadius: "8px",
              padding: "24px",
              minWidth: "320px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
              Upload Successful
            </div>
            <div style={{ marginBottom: "12px" }}>
              {successModal} {/* Display the success message */}
            </div>
            <button
              style={{
                padding: "6px 18px",
                background: "#2980b9",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setSuccessModal(false)} // Close modal
            >
              OK
            </button>
          </div>
        </div>
      )}
      {failureModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#222",
              borderRadius: "8px",
              padding: "24px",
              minWidth: "320px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
              Upload Failed
            </div>
            <div style={{ marginBottom: "12px" }}>{errorMessage}</div>
            <button
              style={{
                padding: "6px 18px",
                background: "#e74c3c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setFailureModal(false)} // Close modal
            >
              OK
            </button>
          </div>
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
                  style={{ padding: "12px", textAlign: "left", color: "#fff" }}
                >
                  Title
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "#fff" }}
                >
                  Genre
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "#fff" }}
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
