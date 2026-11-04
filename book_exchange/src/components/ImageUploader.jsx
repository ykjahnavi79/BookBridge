import { useState, useRef, useEffect } from "react";

const PRESET_IMAGES = [
  { label: "Classic Book", url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80" },
  { label: "Vintage Open", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" },
  { label: "Cozy Bookshelf", url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80" },
  { label: "Modern Reader", url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80" }
];

// Helper to resize and compress client images to keep database payloads lightweight
function compressImageFile(file, maxWidth = 800, maxHeight = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function ImageUploader({ image, onChange }) {
  const [activeTab, setActiveTab] = useState("file"); // 'file' | 'camera' | 'url'
  const [urlInput, setUrlInput] = useState(image && !image.startsWith("data:") ? image : "");
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera when unmounting or switching tabs
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleTabChange = (tab) => {
    if (activeTab === "camera" && tab !== "camera") {
      stopCamera();
    }
    setActiveTab(tab);
    setCameraError("");
  };

  // 1. File Upload Handler (From PC)
  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file);
      onChange(compressedDataUrl);
      stopCamera();
    } catch (err) {
      console.error("Image processing error:", err);
      alert("Failed to read image file.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 2. Camera Handlers
  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Unable to access camera directly. Please check browser permissions, or use the mobile camera button below."
      );
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
    onChange(dataUrl);
    stopCamera();
  };

  // 3. URL Handler
  const handleUrlSubmit = (url) => {
    setUrlInput(url);
    onChange(url.trim());
  };

  // Remove current image
  const handleRemoveImage = () => {
    onChange("");
    setUrlInput("");
    stopCamera();
  };

  return (
    <div className="card border-0 bg-light rounded-3 p-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <label className="form-label fw-bold mb-0">
          Cover Image <span className="text-muted fw-normal">(Optional)</span>
        </label>

        {/* Upload Mode Switcher */}
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn ${activeTab === "file" ? "btn-primary-custom" : "btn-outline-secondary"}`}
            onClick={() => handleTabChange("file")}
          >
            📁 Upload from PC
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "camera" ? "btn-primary-custom" : "btn-outline-secondary"}`}
            onClick={() => handleTabChange("camera")}
          >
            📷 Take Photo
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "url" ? "btn-primary-custom" : "btn-outline-secondary"}`}
            onClick={() => handleTabChange("url")}
          >
            🔗 Web URL / Presets
          </button>
        </div>
      </div>

      {/* --- TAB 1: UPLOAD FROM PC / FILES --- */}
      {activeTab === "file" && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div
            className={`border-2 border-dashed rounded-3 p-4 text-center cursor-pointer ${
              isDragging ? "bg-primary-subtle border-primary" : "bg-white border-secondary-subtle"
            }`}
            style={{ borderStyle: "dashed", cursor: "pointer", transition: "all 0.2s" }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: "2.5rem" }}>💻</div>
            <h6 className="fw-bold mt-2 mb-1">Click to browse or drag & drop book cover</h6>
            <p className="text-muted small mb-3">Supports JPG, PNG, WEBP (automatically optimized)</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary px-3 rounded-pill"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose File from PC
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: TAKE PHOTO (CAMERA) --- */}
      {activeTab === "camera" && (
        <div className="bg-white rounded-3 p-3 border text-center">
          {cameraError && (
            <div className="alert alert-warning small mb-3 text-start">
              {cameraError}
            </div>
          )}

          {!cameraActive ? (
            <div className="py-3">
              <div style={{ fontSize: "2.8rem" }}>📸</div>
              <h6 className="fw-bold mt-2">Take a Photo of the Book</h6>
              <p className="text-muted small mb-3">
                Use your webcam or mobile camera to snap the front cover directly.
              </p>

              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-primary-custom btn-sm px-4 rounded-pill"
                  onClick={startCamera}
                >
                  ▶ Open Webcam
                </button>

                {/* Mobile Camera Direct Shutter Button */}
                <input
                  type="file"
                  ref={mobileCameraInputRef}
                  className="d-none"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm px-3 rounded-pill"
                  onClick={() => mobileCameraInputRef.current?.click()}
                >
                  📱 Device Camera App
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="position-relative mx-auto rounded-3 overflow-hidden bg-black shadow-sm mb-3"
                style={{ maxWidth: "480px", maxHeight: "320px" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 fw-bold rounded-pill"
                  onClick={capturePhoto}
                >
                  📸 Capture Photo
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                  onClick={stopCamera}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: IMAGE URL & PRESETS --- */}
      {activeTab === "url" && (
        <div>
          <div className="input-group mb-2">
            <input
              type="url"
              className="form-control"
              placeholder="https://images.unsplash.com/photo-..."
              value={urlInput}
              onChange={(e) => handleUrlSubmit(e.target.value)}
            />
            {urlInput && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => handleUrlSubmit("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
            <small className="text-muted">Or pick sample cover:</small>
            {PRESET_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small"
                style={{ fontSize: "0.8rem" }}
                onClick={() => handleUrlSubmit(img.url)}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- PREVIEW BOX (IF IMAGE SELECTED) --- */}
      {image && (
        <div className="mt-3 p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "56px",
                height: "76px",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundColor: "#1e293b",
                flexShrink: 0
              }}
            >
              <img
                src={image}
                alt="Selected Book Cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div>
              <span className="fw-semibold d-block text-dark small">✓ Cover image attached</span>
              <span className="text-muted small">
                {image.startsWith("data:")
                  ? "Custom photo uploaded (optimized)"
                  : "Web link attached"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleRemoveImage}
            title="Remove image"
          >
            Remove ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;

