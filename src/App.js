import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { novelApi } from "../services/novelApi";
import NovelForm from "../components/NovelForm";

function AddNovel() {
  const { darkMode } = useContext(ThemeContext);

  const handleAddNovel = async (novelData) => {
    console.log("AddNovel: handleAddNovel called with:", novelData);

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

  return (
    <div>
      <h1>Add New Novel</h1>
      <NovelForm onAddNovel={handleAddNovel} darkMode={darkMode} />
    </div>
  );
}

export default AddNovel;

// In your App.js or wherever your routes are defined
import AddNovel from "./pages/AddNovel";

// ...existing code...

// Make sure this route exists
<Route path="/add-novel" element={<AddNovel />} />
// or 
<Route path="/add" element={<AddNovel />} />
