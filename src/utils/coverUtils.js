import sword_god from "../assets/images/Sword_god.jpg";
import dragon from "../assets/images/dragon.jpg";
import spellmaster from "../assets/images/spellmaster.jpg";

// Array of all default cover images
export const defaultCovers = [sword_god, dragon, spellmaster];

/**
 * Returns a random cover image from the default covers
 * @param {string} novelId - Novel ID used to ensure the same novel always gets the same cover
 * @returns {string} URL to a default cover image
 */
export const getRandomCover = (novelId) => {
  // If we have a novel ID, use it to generate a consistent "random" cover for this novel
  if (novelId) {
    // Convert the novelId to a number by summing the character codes
    const numericId = novelId
      .toString()
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);

    // Use the numeric ID to select a consistent cover for this novel
    return defaultCovers[numericId % defaultCovers.length];
  }

  // If no novel ID, just pick a random cover
  const randomIndex = Math.floor(Math.random() * defaultCovers.length);
  return defaultCovers[randomIndex];
};

/**
 * Returns a cover image URL, either the novel's own cover or a random default
 * @param {object} novel - Novel object that may contain a cover URL
 * @returns {string} URL to a cover image
 */
export const getCoverImage = (novel) => {
  if (novel?.novelDetails?.novelCover) {
    return novel.novelDetails.novelCover;
  }

  // Use the novel ID to get a consistent random cover
  return getRandomCover(novel?.id || novel?._id);
};

// Create an error handler that's consistent between components
export const handleImageError = (event) => {
  // Always fall back to sword_god if image loading fails
  import("../assets/images/Sword_god.jpg").then(
    (defaultImg) => (event.target.src = defaultImg.default)
  );
};
