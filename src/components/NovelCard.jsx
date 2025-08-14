import React from "react";

function NovelCard({ id, link, originalName, name, genre }) {
  return (
    <div className="novel-card novel-card-horizontal">
      <div className="novel-card-row">
        <div>
          <strong>ID:</strong> {id}
        </div>
        <div>
          <strong>Title:</strong>{" "}
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {name}
            </a>
          ) : (
            name
          )}
        </div>
        <div>
          <strong>Original Name:</strong> {originalName}
        </div>
        <div>
          <strong>Genre:</strong> {genre}
        </div>
      </div>
    </div>
  );
}

export default NovelCard;
