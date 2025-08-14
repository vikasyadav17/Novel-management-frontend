import React, { useState } from "react";
import * as XLSX from "xlsx";
import { novelApi } from "../services/novelApi"; // Import novelApi
import logger from "../utils/logger"; // Import logger

function BulkUpload({ onBulkUpload, onUploadComplete }) {
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) {
      setError("No file selected. Please upload a valid file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          setError("The uploaded file is empty.");
          return;
        }

        setError(null); // Clear any previous errors

        logger.info("Bulk upload initiated with data:", jsonData);

        const formattedNovels = jsonData.map((novel) => ({
          name: novel.Name || novel.name || "N/A",
          originalName:
            novel.OriginalName ||
            novel.originalName ||
            novel.ORIGINALNAME ||
            "N/A",
          genre: novel.Genre || novel.genre || "N/A",
          link: novel.Link || novel.link || "N/A",
          novelDetails: {
            description: novel.Description || novel.description || "N/A",
            mcName: novel.McName || novel.mcName || null,
            tags: novel.Tags || novel.tags || "", // Changed to empty string as default
            specialCharacteristicOfMc:
              novel.SpecialCharacteristicOfMc ||
              novel.specialCharacteristicOfMc ||
              null,
          },
          // Add novelOpinion to the formatted data
          novelOpinion: {
            rating: novel.Rating || novel.rating || 0,
            chaptersRead: novel.ChaptersRead || novel.chaptersRead || 0,
            favorite: novel.Favorite || novel.favorite || false,
            worthToContinue:
              novel.WorthToContinue || novel.worthToContinue || false,
            comments: novel.Comments || novel.comments || "",
          },
        }));

        logger.info(
          "Formatted novels with details and opinions:",
          formattedNovels
        );

        await novelApi.bulkUploadNovels(formattedNovels);
        onUploadComplete(formattedNovels, null); // Pass success message to parent
      } catch (err) {
        setError(
          "Failed to process the file. Please upload a valid Excel file."
        );
        logger.error("Bulk upload failed:", err.message);
        onUploadComplete(
          null,
          err.message || "Failed to upload novels in bulk."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: dragging ? "2px dashed #2980b9" : "2px dashed #ccc",
        borderRadius: "8px",
        padding: "32px",
        textAlign: "center",
        background: dragging ? "#eaf6ff" : "#f7f7fb",
        transition: "background 0.3s, border-color 0.3s",
        cursor: "pointer",
      }}
    >
      <p style={{ fontSize: "1.2rem", color: "#2980b9", marginBottom: "16px" }}>
        Drag and drop your Excel file here, or click to select a file
      </p>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        style={{
          display: "none",
        }}
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "#2980b9",
          color: "#fff",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Choose File
      </label>
      {error && (
        <div
          style={{
            color: "red",
            marginTop: "12px",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

export default BulkUpload;
