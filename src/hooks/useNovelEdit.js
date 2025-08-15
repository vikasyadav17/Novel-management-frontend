import { useState } from "react";
import { novelApi } from "../services/novelApi";

export const useNovelEdit = (novel, setNovel, id) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({});
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    if (!novel) return;
    setIsEditing(true);
    setEditedValues({
      name: novel.name,
      originalName: novel.originalName || "",
      link: novel.link || "",
      tags: novel.tags || "",
      description: novel.novelDetails?.description || "",
      ...(novel.mcName !== undefined && { mcName: novel.mcName || "" }),
      ...(novel.specialCharacteristicOfMc !== undefined && {
        specialCharacteristicOfMc: novel.specialCharacteristicOfMc || "",
      }),
    });
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
      } else {
        return editedValues[key] !== (novel[key] || "");
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

    setIsSaving(true);
    try {
      const changedFields = {};
      Object.keys(editedValues).forEach((key) => {
        if (key === "description") {
          const originalDesc = novel?.novelDetails?.description || "";
          const newDesc = editedValues[key];
          if (newDesc !== originalDesc) {
            changedFields[key] = newDesc;
          }
        } else {
          const originalValue = novel?.[key] || "";
          const newValue = editedValues[key];
          if (newValue !== originalValue) {
            changedFields[key] = newValue;
          }
        }
      });

      if (Object.keys(changedFields).length === 0) {
        alert("No changes detected");
        setIsSaving(false);
        return;
      }

      await novelApi.updateNovel(novelId, changedFields);

      const updatedNovel = { ...novel, ...changedFields };
      if (changedFields.description !== undefined) {
        updatedNovel.novelDetails = {
          ...novel.novelDetails,
          description: changedFields.description,
        };
      }

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
