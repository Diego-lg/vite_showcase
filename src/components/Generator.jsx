import React, { useState } from "react";

const ImageGenerator = () => {
  const [inputValue, setInputValue] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageSrc(null);

    try {
      const response = await fetch("https://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob(); // Get the image as a blob
      const imgUrl = URL.createObjectURL(blob);
      setImageSrc(imgUrl); // Store the image URL in state
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // You can use imageSrc here as needed
  const generatedImage = imageSrc ? (
    <img src={imageSrc} alt="Generated" />
  ) : null;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter prompt"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {generatedImage} {/* Display the image here, or use it elsewhere */}
    </div>
  );
};

export default ImageGenerator;
