import React from "react";

const NotificationDialog = ({
  visible,
  title,
  message,
  type = "info",
  darkMode = false,
  onClose,
  buttonText = "OK",
}) => {
  if (!visible) return null;

  const backgroundColor = darkMode ? "#111827" : "#fff";
  const borderColor =
    type === "success"
      ? "#2ecc71"
      : type === "error"
      ? "#e74c3c"
      : "#3498db";
  const accentColor =
    type === "success"
      ? "#2ecc71"
      : type === "error"
      ? "#e74c3c"
      : "#3498db";
  const titleColor = darkMode ? "#f7f7fb" : "#222";
  const textColor = darkMode ? "#ddd" : "#333";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.35)",
        zIndex: 20000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: backgroundColor,
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)"}`,
          borderRadius: "20px",
          boxShadow: darkMode ? "0 18px 60px rgba(0, 0, 0, 0.45)" : "0 18px 60px rgba(0, 0, 0, 0.25)",
          padding: "28px 26px 22px",
          color: textColor,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: `${accentColor}20`,
            color: accentColor,
            fontSize: "1.75rem",
            fontWeight: "700",
          }}
        >
          {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
        </div>
        <h2
          style={{
            margin: 0,
            marginBottom: "12px",
            color: titleColor,
            fontSize: "1.5rem",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: "24px",
            lineHeight: 1.7,
            color: textColor,
            fontSize: "1rem",
            opacity: 0.92,
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            background: accentColor,
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "0.85rem 1.75rem",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: `0 12px 24px ${accentColor}33`,
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default NotificationDialog;
