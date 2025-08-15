import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { novelApi } from "../services/novelApi";
import NovelForm from "../components/NovelForm";

function AddNovel() {
  const { darkMode } = useContext(ThemeContext);

  console.log("AddNovel component rendered");

  const handleAddNovel = async (novelData) => {
    console.log("AddNovel: handleAddNovel function called!");
    console.log("AddNovel: Received data:", novelData);

    try {
      console.log("AddNovel: About to call novelApi.addNovel");
      const response = await novelApi.addNovel(novelData);
      console.log("AddNovel: API response received:", response);
      alert("Novel added successfully!");
    } catch (error) {
      console.error("AddNovel: Error adding novel:", error);
      alert("Error adding novel: " + error.message);
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
      color: darkMode ? "#ffffff" : "#333333",
      backgroundColor: darkMode ? "#1a1a1a" : "#f8f9fa",
      minHeight: "100vh",
      borderRadius: "8px",
      boxShadow: darkMode
        ? "0 4px 20px rgba(0, 0, 0, 0.5)"
        : "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
      borderBottom: `2px solid ${darkMode ? "#61dafb" : "#0066cc"}`,
      paddingBottom: "1rem",
      color: darkMode ? "#61dafb" : "#0066cc",
      fontSize: "2.2rem",
      fontWeight: "600",
    },
    subheader: {
      textAlign: "center",
      marginBottom: "2.5rem",
      opacity: 0.8,
      fontSize: "1.1rem",
    },
    formContainer: {
      backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: darkMode
        ? "0 4px 12px rgba(0, 0, 0, 0.3)"
        : "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <div style={styles.container} className={darkMode ? "dark-mode" : ""}>
      <h1 style={styles.header}>Add New Novel</h1>
      <p style={styles.subheader}>
        Fill out the form below to add a new novel to your collection
      </p>

      <div style={styles.formContainer}>
        <NovelForm onAddNovel={handleAddNovel} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default AddNovel;
