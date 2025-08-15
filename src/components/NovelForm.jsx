import React, { useState } from "react";

function NovelForm({ onAddNovel, darkMode }) {
  console.log("NovelForm: onAddNovel prop received:", typeof onAddNovel);
  console.log("NovelForm: onAddNovel function:", onAddNovel);

  const [formData, setFormData] = useState({
    link: "",
    originalName: "",
    name: "",
    genre: "",
    novelDetails: {
      description: "",
      mcName: "",
      specialCharacteristicOfMc: "",
      novelCover: "",
      status: "",
      totalChapters: "",
      tags: "",
    },
    // Match backend: always include these keys so backend doesn't get null
    novelOpinion: {
      rating: null, // Integer (0-5)
      chaptersRead: 0,
      favorite: false,
      worthToContinue: false,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `Field changed: ${name}, Value: ${type === "checkbox" ? checked : value}`
    );

    if (name in formData.novelDetails) {
      setFormData({
        ...formData,
        novelDetails: {
          ...formData.novelDetails,
          [name]: type === "checkbox" ? checked : value,
        },
      });
    } else if (name in formData.novelOpinion) {
      setFormData({
        ...formData,
        novelOpinion: {
          ...formData.novelOpinion,
          // convert checkbox to boolean, number fields to Number(...)
          [name]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? Number(value)
              : // handle empty strings for numeric rating -> null
              name === "rating" && value === ""
              ? null
              : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    console.log("NovelForm: onAddNovel function:", typeof onAddNovel);
    console.log(
      "NovelForm: Parent component check - onAddNovel name:",
      onAddNovel?.name
    );

    // Structure the data properly for the API
    const novelData = {
      ...formData,
      novelDetails: {
        ...formData.novelDetails,
        addedOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
      },
      // Always include novelOpinion (use defaults if user didn't fill)
      novelOpinion: {
        ...formData.novelOpinion,
      },
    };

    console.log("Sending to API:", novelData);

    if (typeof onAddNovel === "function") {
      console.log("NovelForm: Calling onAddNovel function");
      onAddNovel(novelData);
    } else {
      console.error("NovelForm: onAddNovel is not a function!", onAddNovel);
    }

    // Reset form
    setFormData({
      link: "",
      originalName: "",
      name: "",
      genre: "",
      novelDetails: {
        description: "",
        mcName: "",
        specialCharacteristicOfMc: "",
        novelCover: "",
        status: "",
        totalChapters: "",
        tags: "",
      },
      novelOpinion: {
        rating: null,
        chaptersRead: 0,
        favorite: false,
        worthToContinue: false,
      },
    });
  };

  // Form styling based on dark mode
  const styles = {
    formContainer: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
      borderRadius: "10px",
      boxShadow: darkMode
        ? "0 4px 20px rgba(0, 0, 0, 0.5)"
        : "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    formSection: {
      marginBottom: "2rem",
      padding: "1.5rem",
      backgroundColor: darkMode ? "#333" : "#f8f9fa",
      borderRadius: "8px",
      borderLeft: `4px solid ${darkMode ? "#61dafb" : "#0066cc"}`,
    },
    sectionTitle: {
      fontSize: "1.2rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      color: darkMode ? "#61dafb" : "#0066cc",
      borderBottom: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
      paddingBottom: "0.5rem",
    },
    inputGroup: {
      marginBottom: "1rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: darkMode ? "#e0e0e0" : "#333",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
      backgroundColor: darkMode ? "#222" : "#fff",
      color: darkMode ? "#fff" : "#333",
      fontSize: "1rem",
      transition: "border-color 0.2s, box-shadow 0.2s",
      marginBottom: "1rem",
      "&:focus": {
        borderColor: darkMode ? "#61dafb" : "#0066cc",
        outline: "none",
        boxShadow: `0 0 0 2px ${
          darkMode ? "rgba(97, 218, 251, 0.2)" : "rgba(0, 102, 204, 0.2)"
        }`,
      },
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
      backgroundColor: darkMode ? "#222" : "#fff",
      color: darkMode ? "#fff" : "#333",
      fontSize: "1rem",
      minHeight: "100px",
      resize: "vertical",
      marginBottom: "1rem",
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: `1px solid ${darkMode ? "#555" : "#ddd"}`,
      backgroundColor: darkMode ? "#222" : "#fff",
      color: darkMode ? "#fff" : "#333",
      fontSize: "1rem",
      marginBottom: "1rem",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${
        darkMode ? "%23ffffff" : "%23333333"
      }' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "1em",
    },
    checkboxGroup: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    checkbox: {
      width: "18px",
      height: "18px",
      accentColor: darkMode ? "#61dafb" : "#0066cc",
    },
    submitButton: {
      backgroundColor: darkMode ? "#61dafb" : "#0066cc",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "0.75rem 1.5rem",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s, transform 0.1s",
      display: "block",
      margin: "2rem auto 0",
      "&:hover": {
        backgroundColor: darkMode ? "#4fa6d5" : "#0055aa",
        transform: "translateY(-2px)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    required: {
      color: darkMode ? "#ff6b6b" : "#dc3545",
      marginLeft: "0.25rem",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "1rem",
    },
    infoNote: {
      fontStyle: "italic",
      opacity: 0.7,
      marginTop: "0.5rem",
      fontSize: "0.9rem",
    },
    formTitle: {
      textAlign: "center",
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: darkMode ? "#61dafb" : "#0066cc",
      position: "relative",
      padding: "0 0 1rem 0",
    },
    formTitleUnderline: {
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "3px",
      background: darkMode
        ? "linear-gradient(to right, #61dafb, #4fa6d5)"
        : "linear-gradient(to right, #0066cc, #4285f4)",
      borderRadius: "4px",
    },
    formSubtitle: {
      textAlign: "center",
      fontSize: "1rem",
      color: darkMode ? "#aaa" : "#666",
      marginBottom: "2rem",
      fontWeight: "normal",
    },
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.formTitle}>
        Add New Novel
        <div style={styles.formTitleUnderline}></div>
      </div>
      <p style={styles.formSubtitle}>
        Complete the form below to add a novel to your collection
      </p>

      <form onSubmit={handleSubmit} className="novel-form">
        {/* Basic Novel Information */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Novel Title <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter the novel title"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Original Name</label>
              <input
                type="text"
                name="originalName"
                placeholder="Original title (if different)"
                value={formData.originalName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Novel Link</label>
            <input
              type="url"
              name="link"
              placeholder="URL to the novel"
              value={formData.link}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Genre</label>
            <input
              type="text"
              name="genre"
              placeholder="E.g., Fantasy, Sci-Fi, Romance"
              value={formData.genre}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        {/* Novel Details */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Novel Details</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              placeholder="Brief description of the novel"
              value={formData.novelDetails.description}
              onChange={handleChange}
              style={styles.textarea}
              rows="4"
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Main Character Name</label>
              <input
                type="text"
                name="mcName"
                placeholder="MC's name"
                value={formData.novelDetails.mcName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>MC's Special Characteristic</label>
              <input
                type="text"
                name="specialCharacteristicOfMc"
                placeholder="What makes the MC unique?"
                value={formData.novelDetails.specialCharacteristicOfMc}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Novel Cover Image URL</label>
            <input
              type="url"
              name="novelCover"
              placeholder="Link to cover image"
              value={formData.novelDetails.novelCover}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.novelDetails.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Status</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
                <option value="On Hold">On Hold</option>
                <option value="Plan to Read">Plan to Read</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Total Chapters</label>
              <input
                type="number"
                name="totalChapters"
                placeholder="If known"
                value={formData.novelDetails.totalChapters}
                onChange={handleChange}
                style={styles.input}
                min="0"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tags</label>
            <textarea
              name="tags"
              placeholder="Separate tags with commas (e.g., action, mystery, romance)"
              value={formData.novelDetails.tags}
              onChange={handleChange}
              style={styles.textarea}
              rows="2"
            />
          </div>
        </div>

        {/* Novel Opinion */}
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Your Opinion</h3>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                value={formData.novelOpinion.rating ?? ""}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Chapters Read</label>
              <input
                type="number"
                name="chaptersRead"
                min="0"
                value={formData.novelOpinion.chaptersRead}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem" }}>
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="favorite"
                name="favorite"
                checked={!!formData.novelOpinion.favorite}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="favorite" style={{ cursor: "pointer" }}>
                Mark as Favorite
              </label>
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="worthToContinue"
                name="worthToContinue"
                checked={!!formData.novelOpinion.worthToContinue}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="worthToContinue" style={{ cursor: "pointer" }}>
                Worth to Continue
              </label>
            </div>
          </div>

          <p style={styles.infoNote}>More opinion fields coming soon...</p>
        </div>

        <button type="submit" style={styles.submitButton}>
          Add Novel
        </button>
      </form>
    </div>
  );
}

export default NovelForm;
