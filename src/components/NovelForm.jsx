import React, { useState } from "react";

function NovelForm({ onAddNovel, darkMode }) {
  const [formData, setFormData] = useState({
    link: "",
    originalName: "",
    name: "",
    genre: "",
    novelDetails: {
      description: "",
      mcName: "",
      mcCheating: false,
      specialCharacteristicOfMc: "",
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in formData.novelDetails) {
      setFormData({
        ...formData,
        novelDetails: {
          ...formData.novelDetails,
          [name]: type === "checkbox" ? checked : value,
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
    onAddNovel({ ...formData, id: Date.now() });
    setFormData({
      link: "",
      originalName: "",
      name: "",
      genre: "",
      novelDetails: {
        description: "",
        mcName: "",
        mcCheating: false,
        specialCharacteristicOfMc: "",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="novel-form">
      {/* Novel main fields */}
      <input
        type="text"
        name="name"
        placeholder="Novel Title"
        value={formData.name}
        onChange={handleChange}
        className={darkMode ? "dark-mode-input" : ""}
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
        type="text"
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
      <textarea
        name="description"
        placeholder="Description"
        value={formData.novelDetails.description}
        onChange={handleChange}
        className={darkMode ? "dark-mode-input" : ""}
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
      <label>
        MC Cheating:
        <input
          type="checkbox"
          name="mcCheating"
          checked={formData.novelDetails.mcCheating}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Add Novel</button>
    </form>
  );
}

export default NovelForm;
