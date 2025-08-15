import React, { useState } from "react";

const NovelHeader = ({
  novel,
  isEditing,
  editedValues,
  handleFieldChange,
  styles,
}) => {
  const [hoveredStar, setHoveredStar] = useState(-1);

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
        {/* <img
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
        /> */}
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

      {/* Rating Stars - Hidden */}
      {false && (
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isEditing ? (
              <div
                style={{ display: "flex", gap: "0.3rem" }}
                onMouseLeave={() => setHoveredStar(-1)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const currentRating =
                    editedValues.novelOpinion_rating ||
                    novel.novelOpinion?.rating ||
                    0;
                  const shouldFill =
                    hoveredStar >= 0 ? i <= hoveredStar : i < currentRating;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        handleFieldChange("novelOpinion_rating", i + 1)
                      }
                      onMouseEnter={() => setHoveredStar(i)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "2rem",
                        color: shouldFill ? "#FFD700" : "#DDD",
                        padding: "0.3rem",
                        transition: "color 0.2s ease",
                      }}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    style={{
                      color:
                        i < (novel.novelOpinion?.rating || 0)
                          ? "#FFD700"
                          : "#DDD",
                      fontSize: "2rem",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelHeader;
