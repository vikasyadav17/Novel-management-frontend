// hooks/useNovelEdit.jsx — Custom hook to manage edit state, edited values, and saving logic for a single novel
import { useState } from "react";
import { novelApi } from "../services/novelApi";

export const useNovelEdit = (novel, setNovel, id) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

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
      setError(null);
      setShowComparisonModal(true);
      return true;
    }

    setError("No changes detected");
    return false;
  };

  const saveChanges = async () => {
    const novelId = novel?._id || id;
    if (!novelId) {
      const message =
        "Error: Novel ID not found. Please refresh the page and try again.";
      setError(message);
      return { success: false, message };
    }

    const totalChaptersValue = Number(
      editedValues.novelDetails_totalChapters ?? novel?.novelDetails?.totalChapters ?? 0
    );
    const chaptersReadValue = Number(
      editedValues.novelOpinion_chaptersRead ?? novel?.novelOpinion?.chaptersRead ?? 0
    );

    if (
      totalChaptersValue > 0 &&
      chaptersReadValue > totalChaptersValue
    ) {
      const message =
        "Chapters read cannot be greater than total chapters. Please correct the value before saving.";
      setError(message);
      setIsSaving(false);
      return { success: false, message };
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
        const message = "No changes detected";
        setError(message);
        setIsSaving(false);
        return { success: false, message };
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
      setError(null);
      return { success: true, message: "Changes saved successfully!" };
    } catch (error) {
      console.error("Error saving changes:", error);
      const message = `Failed to save changes: ${
        error.response?.data?.message || error.message
      }`;
      setError(message);
      return { success: false, message };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    editedValues,
    showComparisonModal,
    isSaving,
    error,
    startEditing,
    cancelEditing,
    handleFieldChange,
    showChanges,
    saveChanges,
    setShowComparisonModal,
  };
};
