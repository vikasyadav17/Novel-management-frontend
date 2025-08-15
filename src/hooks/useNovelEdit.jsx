import { useState } from "react";
import { novelApi } from "../services/novelApi";

export const useNovelEdit = (novel, setNovel, id) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    if (!novel) return;
    console.log("Starting edit with novel:", novel);

    const initialValues = {
      name: novel.name,
      originalName: novel.originalName || "",
      link: novel.link || "",
      genre: novel.genre || "",
      description: novel.novelDetails?.description || "",

      // Include all novelDetails fields
      ...(novel.novelDetails &&
        Object.keys(novel.novelDetails).reduce((acc, key) => {
          if (key !== "_id" && key !== "description") {
            acc[`novelDetails_${key}`] = novel.novelDetails[key] ?? "";
          }
          return acc;
        }, {})),

      // Include all novelOpinion fields (including rating)
      ...(novel.novelOpinion &&
        Object.keys(novel.novelOpinion).reduce((acc, key) => {
          if (key !== "_id") {
            acc[`novelOpinion_${key}`] =
              novel.novelOpinion[key] ?? (key === "rating" ? 0 : "");
          }
          return acc;
        }, {})),
    };

    console.log("Initial edited values:", initialValues);
    setIsEditing(true);
    setEditedValues(initialValues);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedValues({});
  };

  const handleFieldChange = (field, value) => {
    setEditedValues({ ...editedValues, [field]: value });
  };

  const showChanges = () => {
    const hasChanges = Object.keys(editedValues).some((key) => {
      if (key === "description") {
        return editedValues[key] !== (novel.novelDetails?.description || "");
      } else if (key.startsWith("novelDetails_")) {
        const originalKey = key.replace("novelDetails_", "");
        return editedValues[key] !== (novel?.novelDetails?.[originalKey] || "");
      } else if (key.startsWith("novelOpinion_")) {
        const originalKey = key.replace("novelOpinion_", "");
        return editedValues[key] !== (novel?.novelOpinion?.[originalKey] || "");
      } else {
        return editedValues[key] !== (novel?.[key] || "");
      }
    });

    if (hasChanges) {
      setShowComparisonModal(true);
    } else {
      alert("No changes detected");
    }
  };

  const saveChanges = async () => {
    const novelId = novel?._id || id;
    if (!novelId) {
      alert(
        "Error: Novel ID not found. Please refresh the page and try again."
      );
      return;
    }

    console.log("Saving with editedValues:", editedValues);
    setIsSaving(true);

    try {
      // Check if there are any changes first
      const hasChanges = Object.keys(editedValues).some((key) => {
        if (key === "description") {
          return editedValues[key] !== (novel?.novelDetails?.description || "");
        } else if (key.startsWith("novelDetails_")) {
          const originalKey = key.replace("novelDetails_", "");
          return (
            editedValues[key] !== (novel?.novelDetails?.[originalKey] ?? "")
          );
        } else if (key.startsWith("novelOpinion_")) {
          const originalKey = key.replace("novelOpinion_", "");
          return (
            editedValues[key] !== (novel?.novelOpinion?.[originalKey] ?? "")
          );
        } else {
          return editedValues[key] !== (novel?.[key] || "");
        }
      });

      if (!hasChanges) {
        alert("No changes detected");
        setIsSaving(false);
        return;
      }

      // Prepare the data structure for the backend
      const updateData = {
        name: editedValues.name,
        originalName: editedValues.originalName,
        link: editedValues.link,
        genre: editedValues.genre,

        novelDetails: {
          ...novel.novelDetails,
          description: editedValues.description,
        },

        novelOpinion: {
          ...novel.novelOpinion,
        },
      };

      // Add novelDetails fields
      Object.keys(editedValues).forEach((key) => {
        if (key.startsWith("novelDetails_")) {
          const originalKey = key.replace("novelDetails_", "");
          updateData.novelDetails[originalKey] = editedValues[key];
        }
      });

      // Add novelOpinion fields
      Object.keys(editedValues).forEach((key) => {
        if (key.startsWith("novelOpinion_")) {
          const originalKey = key.replace("novelOpinion_", "");
          updateData.novelOpinion[originalKey] = editedValues[key];
        }
      });

      console.log("Sending updateData to backend:", updateData);

      // Send all data to backend
      await novelApi.updateNovel(novelId, updateData);

      // Update the local state
      const updatedNovel = {
        ...novel,
        ...updateData,
        novelDetails: updateData.novelDetails,
        novelOpinion: updateData.novelOpinion,
      };

      setNovel(updatedNovel);
      setIsEditing(false);
      setEditedValues({});
      setShowComparisonModal(false);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert(
        `Failed to save changes: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    editedValues,
    showComparisonModal,
    isSaving,
    startEditing,
    cancelEditing,
    handleFieldChange,
    showChanges,
    saveChanges,
    setShowComparisonModal,
  };
};
