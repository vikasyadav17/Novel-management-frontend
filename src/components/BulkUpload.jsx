import React, { useState } from "react";
import * as XLSX from "xlsx";

function BulkUpload({ onBulkUpload }) {
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Validate and pass the data to the parent component
        if (jsonData.length === 0) {
          setError("The uploaded file is empty.");
        } else {
          setError(null);
          onBulkUpload(jsonData);
        }
      } catch (err) {
        setError(
          "Failed to process the file. Please upload a valid Excel file."
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
