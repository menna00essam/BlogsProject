export function validatePost({ title, description, imageUrl }) {
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!description || description.trim() === '') {
    errors.push('Description is required');
  }

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const isValidExtension = validExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
      if (!isValidExtension) {
        errors.push('Image URL must be a valid image format (jpg, png, gif)');
      }
    } catch {
      errors.push('Image URL is not a valid URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
