export const createStyles = (darkMode) => ({
  container: {
    color: darkMode ? "#ffffff" : "#333333",
    background: darkMode
      ? "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #121212 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f9ff 50%, #f5f7fa 100%)",
    padding: "3rem",
    borderRadius: "24px",
    boxShadow: darkMode
      ? "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    maxWidth: "1000px",
    margin: "3rem auto",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflowX: "hidden",
    backdropFilter: "blur(10px)",
    border: darkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.05)",
  },

  text: {
    color: darkMode ? "#ffffff" : "#333333",
    lineHeight: "1.8",
    fontSize: "1.05rem",
    transition: "color 0.3s ease",
  },

  heading: {
    background: darkMode
      ? "linear-gradient(135deg, #61dafb 0%, #4ecdc4 50%, #45b7d1 100%)"
      : "linear-gradient(135deg, #0066cc 0%, #0099ff 50%, #00bcd4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontSize: "3.5rem",
    fontWeight: "800",
    marginBottom: "1.5rem",
    textAlign: "center",
    position: "relative",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
    textShadow: "none",
    animation: "fadeInUp 0.8s ease-out",
  },

  label: {
    fontWeight: "700",
    fontSize: "1.15rem",
    display: "inline-block",
    minWidth: "160px",
    background: darkMode
      ? "linear-gradient(135deg, #61dafb, #4ecdc4)"
      : "linear-gradient(135deg, #0066cc, #0099ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    transition: "all 0.3s ease",
    marginBottom: "0.5rem",
  },

  section: {
    backgroundColor: darkMode
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.8)",
    padding: "2.5rem",
    borderRadius: "20px",
    marginBottom: "2.5rem",
    boxShadow: darkMode
      ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      : "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(20px)",
    border: darkMode
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.8)",
    position: "relative",
    overflow: "hidden",
  },

  editButton: {
    position: "absolute",
    top: "1.25rem",
    left: "1.25rem",
    padding: "0.5rem 1rem",
    backgroundColor: darkMode ? "#61dafb" : "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease",
  },

  input: {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
    border: darkMode ? "1px solid #444" : "1px solid #ddd",
    borderRadius: "4px",
    color: darkMode ? "#ffffff" : "#333333",
    fontSize: "1rem",
    transition: "all 0.2s ease",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
});
