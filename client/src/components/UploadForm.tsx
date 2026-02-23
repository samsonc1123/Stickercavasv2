import React, { useState } from 'react';

function UploadForm() {
  const [image, setImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  const handleUpload = async () => {
    if (!image) return alert("Please select a file first.");
    alert("Supabase upload removed. Migration to Convex in progress.");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ color: "#0ff" }}>Upload a New Sticker</h3>
      <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload</button>
      {url && (
        <div>
          <p>Uploaded Image:</p>
          <img src={url} alt="uploaded sticker" style={{ height: "150px", marginTop: "1rem" }} />
        </div>
      )}
    </div>
  );
}

export default UploadForm;
