import React from "react";

function NovelCard({ link, originalName, name, genre, novelDetails }) {
  return (
    <div className="novel-card">
      <h3>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        ) : (
          name
        )}
      </h3>
      <p>ID: {novelDetails?.id}</p>
      <p>Original Name: {originalName}</p>
      <p>Genre: {genre}</p>
    </div>
  );
}

export default NovelCard;
