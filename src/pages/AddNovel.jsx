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

  return (
    <div>
      <h1>Add New Novel</h1>
      <NovelForm onAddNovel={handleAddNovel} darkMode={darkMode} />
    </div>
  );
}

export default AddNovel;
