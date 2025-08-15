import React from "react";
import swordGodImage from "../assets/images/sword_god.jpg";

const NovelHeader = ({
  novel,
  isEditing,
  editedValues,
  handleFieldChange,
  styles,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          marginBottom: "2.5rem",
          padding: "1rem",
          borderRadius: "20px",
        }}
      >
        <img
          src={novel.imageUrl || swordGodImage}
          alt={`Cover of ${novel.name}`}
          style={{
            maxWidth: "300px",
            minHeight: "420px",
            width: "100%",
            height: "450px",
            objectFit: "cover",
            borderRadius: "15px",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "contrast(1.1) saturate(1.1)",
          }}
        />
      </div>

      {/* Original Name */}
      {isEditing ? (
        <input
          type="text"
          value={editedValues.originalName || ""}
          onChange={(e) => handleFieldChange("originalName", e.target.value)}
          placeholder="Original Name (Optional)"
          style={{
            ...styles.input,
            textAlign: "center",
            fontStyle: "italic",
            marginBottom: "0.75rem",
            fontSize: "1.2rem",
          }}
        />
      ) : (
        novel.originalName && (
          <div
            style={{
              ...styles.text,
              fontSize: "1.2rem",
              marginBottom: "0.75rem",
              fontStyle: "italic",
              fontWeight: "bold",
            }}
          >
            {novel.originalName}
          </div>
        )
      )}

      {/* Novel Name */}
      {isEditing ? (
        <input
          type="text"
          value={editedValues.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="Novel Name"
          style={{
            ...styles.input,
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
          }}
        />
      ) : (
        <h1 style={{ ...styles.heading, marginBottom: "1rem" }}>
          {novel.name}
        </h1>
      )}

      {/* Rating Stars */}
      {novel.novelOpinion?.rating >= 0 && (
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div
            style={{
              padding: "1rem 2rem",
              borderRadius: "50px",
              display: "inline-block",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                style={{
                  color:
                    i < novel.novelOpinion.rating
                      ? "#FFD700"
                      : "rgba(255, 215, 0, 0.3)",
                  fontSize: "2.2rem",
                  marginRight: i < 4 ? "8px" : "0",
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelHeader;
