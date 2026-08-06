// pages/AddNovel.jsx — Page wrapper that provides theme context and handles submit for adding a new novel
import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { novelApi } from "../services/novelApi";
import NovelForm from "../components/NovelForm";
import NotificationDialog from "../components/NotificationDialog";

function AddNovel() {
  const { darkMode } = useContext(ThemeContext);
  const [notification, setNotification] = useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  console.log("AddNovel component rendered");

  const handleAddNovel = async (novelData) => {
    console.log("AddNovel: handleAddNovel function called!");
    console.log("AddNovel: Received data:", novelData);

    try {
      console.log("AddNovel: About to call novelApi.addNovel");
      const response = await novelApi.addNovel(novelData);
      console.log("AddNovel: API response received:", response);
      setNotification({
        visible: true,
        type: "success",
        title: "Novel Added",
        message: "The novel has been added successfully.",
      });
      return response;
    } catch (error) {
      console.error("AddNovel: Error adding novel:", error);
      setNotification({
        visible: true,
        type: "error",
        title: "Add Failed",
        message:
          error?.response?.data?.message || error?.message ||
          "There was an error adding the novel.",
      });
      throw error;
    }
  };

  console.log(
    "AddNovel: handleAddNovel function created:",
    typeof handleAddNovel
  );

  // Create styles based on dark mode
  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
      color: darkMode ? "#f8fafc" : "#0f172a",
      background: darkMode
        ? "linear-gradient(135deg, #0f172a 0%, #111827 100%)"
        : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
      minHeight: "100vh",
      borderRadius: "24px",
      boxShadow: darkMode
        ? "0 20px 60px rgba(0, 0, 0, 0.35)"
        : "0 20px 60px rgba(15, 23, 42, 0.08)",
      position: "relative",
      overflow: "hidden",
    },
    heroCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1.5rem",
      marginBottom: "1.5rem",
      padding: "1.5rem 1.75rem",
      borderRadius: "20px",
      background: darkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.82)",
      border: darkMode ? "1px solid rgba(148, 163, 184, 0.2)" : "1px solid rgba(148, 163, 184, 0.18)",
      backdropFilter: "blur(12px)",
      boxShadow: darkMode
        ? "0 12px 30px rgba(0, 0, 0, 0.24)"
        : "0 12px 30px rgba(15, 23, 42, 0.08)",
    },
    header: {
      textAlign: "left",
      marginBottom: "0.5rem",
      color: darkMode ? "#60a5fa" : "#2563eb",
      fontSize: "2rem",
      fontWeight: "700",
      letterSpacing: "-0.02em",
    },
    subheader: {
      marginBottom: 0,
      opacity: 0.8,
      fontSize: "1rem",
      lineHeight: 1.6,
      color: darkMode ? "#dbeafe" : "#334155",
    },
    accentBadge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "54px",
      height: "54px",
      borderRadius: "16px",
      background: darkMode ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "linear-gradient(135deg, #dbeafe, #bfdbfe)",
      color: darkMode ? "#eff6ff" : "#1d4ed8",
      fontSize: "1.4rem",
      fontWeight: 700,
      boxShadow: darkMode
        ? "0 12px 30px rgba(37, 99, 235, 0.25)"
        : "0 12px 30px rgba(37, 99, 235, 0.16)",
    },
    formContainer: {
      background: darkMode ? "rgba(17, 24, 39, 0.92)" : "rgba(255, 255, 255, 0.95)",
      padding: "2rem",
      borderRadius: "24px",
      border: darkMode ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid rgba(148, 163, 184, 0.18)",
      boxShadow: darkMode
        ? "0 18px 40px rgba(2, 6, 23, 0.35)"
        : "0 18px 40px rgba(15, 23, 42, 0.08)",
      backdropFilter: "blur(10px)",
    },
  };

  return (
    <div style={styles.container} className={darkMode ? "dark-mode" : ""}>
      <div style={styles.heroCard}>
        <div>
          <div style={styles.accentBadge}>✚</div>
          <h1 style={styles.header}>Add New Novel</h1>
          <p style={styles.subheader}>
            Capture the details of a new novel and keep your library organized in a polished, modern layout.
          </p>
        </div>
      </div>

      <div style={styles.formContainer}>
        <NovelForm onAddNovel={handleAddNovel} darkMode={darkMode} />
      </div>
      <NotificationDialog
        visible={notification.visible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        darkMode={darkMode}
        onClose={() => setNotification((current) => ({ ...current, visible: false }))}
      />
    </div>
  );
}

export default AddNovel;
