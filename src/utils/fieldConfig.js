export const getFieldConfig = (novel, isEditing) => {
  // Make sure to always include certain fields even if they are empty
  const alwaysIncludeFields = ["mcName", "specialCharacteristicOfMc"];

  const novelDetailsFields = [];
  const novelOpinionFields = [];

  // Process novelDetails fields
  if (novel.novelDetails) {
    Object.entries(novel.novelDetails).forEach(([key, value]) => {
      // Special handling for novelCover - allow in edit mode even if null/empty
      if (key === "novelCover") {
        if (!isEditing) {
          return;
        }
        novelDetailsFields.push({
          key: "novelDetails_novelCover",
          type: "url",
          label: "Novel Cover URL",
          placeholder: "Enter cover image URL",
          value: value || "",
        });
        return;
      }

      // Skip certain fields but allow mcName and specialCharacteristicOfMc even if empty
      if (
        value === null ||
        value === undefined ||
        (value === "" &&
          key !== "totalChapters" &&
          key !== "mcName" &&
          key !== "specialCharacteristicOfMc") ||
        key === "_id" ||
        key === "id" ||
        key.toLowerCase().includes("id") ||
        key === "addedOn" ||
        key === "lastUpdatedOn" ||
        key === "description" ||
        key === "tags"
      ) {
        return;
      }

      let formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());

      // Special field configurations
      const fieldConfigs = {
        status: {
          key: "novelDetails_status",
          type: "select",
          label: "Status",
          options: [
            { value: "", label: "Select Status" },
            { value: "Reading", label: "Reading" },
            { value: "Completed", label: "Completed" },
            { value: "Dropped", label: "Dropped" },
            { value: "On Hold", label: "On Hold" },
            { value: "Plan to Read", label: "Plan to Read" },
          ],
        },
        totalChapters: {
          key: "novelDetails_totalChapters",
          type: "number",
          label: "Total Chapters",
          placeholder: "Enter total chapters",
        },
        mcName: {
          key: "novelDetails_mcName",
          type: "text",
          label: "Mc Name",
          placeholder: "Main Character Name",
        },
        specialCharacteristicOfMc: {
          key: "novelDetails_specialCharacteristicOfMc",
          type: "text",
          label: "Special Characteristic Of Mc",
          placeholder: "Enter MC's special characteristic",
        },
      };

      const config = fieldConfigs[key] || {
        key: `novelDetails_${key}`,
        type: "text",
        label: formattedKey,
        placeholder: `Enter ${formattedKey.toLowerCase()}`,
      };

      novelDetailsFields.push({ ...config, value });
    });
  }

  // Add missing fields in edit mode if they don't exist
  if (isEditing) {
    const fieldsToEnsure = [
      "novelCover",
      "mcName",
      "specialCharacteristicOfMc",
    ];

    fieldsToEnsure.forEach((fieldName) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          novel.novelDetails || {},
          fieldName
        )
      ) {
        const fieldConfigs = {
          novelCover: {
            key: "novelDetails_novelCover",
            type: "url",
            label: "Novel Cover URL",
            placeholder: "Enter cover image URL",
          },
          mcName: {
            key: "novelDetails_mcName",
            type: "text",
            label: "Mc Name",
            placeholder: "Main Character Name",
          },
          specialCharacteristicOfMc: {
            key: "novelDetails_specialCharacteristicOfMc",
            type: "text",
            label: "Special Characteristic Of Mc",
            placeholder: "Enter MC's special characteristic",
          },
        };

        if (fieldConfigs[fieldName]) {
          novelDetailsFields.push({
            ...fieldConfigs[fieldName],
            value: "",
          });
        }
      }
    });
  }

  // Filter to always include certain fields even if they are empty
  const filteredNovelDetailsFields = novelDetailsFields.filter((field) => {
    return (
      alwaysIncludeFields.includes(field.key.replace("novelDetails_", "")) ||
      novel?.novelDetails?.[field.key.replace("novelDetails_", "")] ||
      isEditing
    );
  });

  // Process novelOpinion fields
  if (novel.novelOpinion) {
    Object.entries(novel.novelOpinion).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        key === "_id" ||
        key === "id" ||
        key.toLowerCase().includes("id") ||
        key === "rating"
      ) {
        return;
      }

      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());

      novelOpinionFields.push({
        key: `novelOpinion_${key}`,
        type: typeof value === "boolean" ? "boolean" : "text",
        label: formattedKey,
        placeholder: `Enter ${formattedKey.toLowerCase()}`,
        value,
      });
    });
  }

  return { novelDetailsFields: filteredNovelDetailsFields, novelOpinionFields };
};
