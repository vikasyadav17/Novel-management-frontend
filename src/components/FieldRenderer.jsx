import React from "react";

const FieldRenderer = ({
  field,
  value,
  isEditing,
  editedValues,
  handleFieldChange,
  styles,
  darkMode,
}) => {
  const { key, type, label, placeholder, options } = field;

  const fieldStyle = {
    padding: "1.5rem",
    borderRadius: "15px",
    background: darkMode
      ? "rgba(255, 255, 255, 0.03)"
      : "rgba(255, 255, 255, 0.6)",
    border: darkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.8)",
  };

  const renderInput = () => {
    if (!isEditing) {
      return (
        <span style={styles.text}>
          {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
        </span>
      );
    }

    const inputValue = editedValues[key] || "";

    switch (type) {
      case "select":
        return (
          <select
            value={inputValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            style={{
              ...styles.input,
              background: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              border: darkMode
                ? "1px solid rgba(255, 255, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={placeholder}
            min="0"
            style={{
              ...styles.input,
              background: darkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
              border: darkMode
                ? "1px solid rgba(255, 255, 255, 0.2)"
                : "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
            }}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={placeholder}
            style={styles.input}
          />
        );

      case "boolean":
        return (
          <select
            value={inputValue !== undefined ? inputValue : value}
            onChange={(e) => handleFieldChange(key, e.target.value === "true")}
            style={styles.input}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={placeholder}
            style={styles.input}
          />
        );
    }
  };

  return (
    <div style={fieldStyle}>
      <strong style={styles.label}>{label}:</strong>
      <div style={{ marginTop: "0.5rem" }}>{renderInput()}</div>
    </div>
  );
};

export default FieldRenderer;
