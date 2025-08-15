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

  return (
    <div>
      <form onSubmit={handleSubmit} className="novel-form">
        {/* Basic Novel Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Novel Title *"
            value={formData.name}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
            required
          />
          <input
            type="text"
            name="originalName"
            placeholder="Original Name"
            value={formData.originalName}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
          <input
            type="url"
            name="link"
            placeholder="Novel Link"
            value={formData.link}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={formData.genre}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
        </div>

        {/* Novel Details */}
        <div className="form-section">
          <h3>Novel Details</h3>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.novelDetails.description}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
            rows="4"
          />
          <input
            type="text"
            name="mcName"
            placeholder="Main Character Name"
            value={formData.novelDetails.mcName}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
          <input
            type="text"
            name="specialCharacteristicOfMc"
            placeholder="Special Characteristic of MC"
            value={formData.novelDetails.specialCharacteristicOfMc}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
          <input
            type="url"
            name="novelCover"
            placeholder="Novel Cover Image URL"
            value={formData.novelDetails.novelCover}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          />
          <select
            name="status"
            value={formData.novelDetails.status}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
          >
            <option value="">Select Status</option>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
            <option value="On Hold">On Hold</option>
            <option value="Plan to Read">Plan to Read</option>
          </select>
          <input
            type="number"
            name="totalChapters"
            placeholder="Total Chapters"
            value={formData.novelDetails.totalChapters}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
            min="0"
          />
          <textarea
            name="tags"
            placeholder="Tags (separated by commas)"
            value={formData.novelDetails.tags}
            onChange={handleChange}
            className={darkMode ? "dark-mode-input" : ""}
            rows="2"
          />
        </div>

        {/* Novel Opinion */}
        <div className="form-section">
          <h3>Your Opinion</h3>
          {/* Inputs matching backend fields */}
          <label>
            Rating (0-5)
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              value={formData.novelOpinion.rating ?? ""}
              onChange={handleChange}
              className={darkMode ? "dark-mode-input" : ""}
            />
          </label>
          <label>
            Chapters read
            <input
              type="number"
              name="chaptersRead"
              min="0"
              value={formData.novelOpinion.chaptersRead}
              onChange={handleChange}
              className={darkMode ? "dark-mode-input" : ""}
            />
          </label>
          <label>
            Favorite
            <input
              type="checkbox"
              name="favorite"
              checked={!!formData.novelOpinion.favorite}
              onChange={handleChange}
            />
          </label>
          <label>
            Worth to continue
            <input
              type="checkbox"
              name="worthToContinue"
              checked={!!formData.novelOpinion.worthToContinue}
              onChange={handleChange}
            />
          </label>
          <p style={{ fontStyle: "italic", opacity: 0.7 }}>
            More opinion fields coming soon...
          </p>
        </div>

        <button type="submit" className="submit-button">
          Add Novel
        </button>
      </form>
    </div>
  );
}

export default NovelForm;
