import { useState, useRef, useEffect } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const docConfig = [
  {
    id: "pan",
    label: "PAN card copy",
    required: true,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "JPG, PNG or PDF • Max 5MB",
  },
  {
    id: "aadhaar",
    label: "Aadhaar card",
    required: true,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "Front and back side • Max 5MB",
  },
  {
    id: "salarySlip",
    label: "Salary slips",
    required: false,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "Last 3 months • Max 5MB",
  },
  {
    id: "itr",
    label: "ITR / Form 16",
    required: false,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "Last 2 years • Max 5MB",
  },
  {
    id: "gst",
    label: "GST certificate",
    required: false,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "For self-employed only • Max 5MB",
  },
  {
    id: "bankStatement",
    label: "Bank statement",
    required: false,
    accept: ".jpg,.jpeg,.png,.pdf",
    hint: "Last 6 months • Max 5MB",
  },
];

function FileUploadCard({ doc, file, onUpload, onRemove }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const validate = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Only JPG, PNG or PDF allowed");
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File size must be under 5MB");
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (f) => {
    if (f && validate(f)) onUpload(doc.id, f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const isPdf = file?.type === "application/pdf";
  const previewUrl = file && !isPdf ? URL.createObjectURL(file) : null;

  return (
    <div
      className={`border rounded-2xl p-4 transition-all duration-200 ${
        file
          ? "border-[#1DB954]/50 bg-[#1a2e1e]"
          : dragOver
          ? "border-[#1DB954] bg-[#1DB954]/5"
          : "border-[#2a2a2a] bg-[#1a1a1a]"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white text-sm font-medium">
            {doc.label}
            {doc.required && <span className="text-red-400 ml-1">*</span>}
          </p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">{doc.hint}</p>
        </div>
        {file && (
          <button
            type="button"
            onClick={() => { onRemove(doc.id); setError(""); }}
            className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors ml-2"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {file ? (
        <div className="flex items-center gap-3 mt-3 p-3 bg-[#121212] rounded-xl">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-[#2a2a2a]" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center text-lg border border-[#2a2a2a]">
              📄
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{file.name}</p>
            <p className="text-[#1DB954] text-xs mt-0.5">
              ✓ Uploaded • {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full mt-3 py-4 border border-dashed border-[#3a3a3a] rounded-xl text-[#b3b3b3] text-xs hover:border-[#1DB954] hover:text-[#1DB954] transition-all duration-200 flex flex-col items-center gap-1"
        >
          <span className="text-2xl">📁</span>
          <span>Click to upload or drag & drop</span>
        </button>
      )}

      {error && <p className="text-red-400 text-xs mt-2">⚠ {error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={doc.accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

function SignaturePad({ onSave }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const stopDraw = () => {
    setDrawing(false);
    if (hasSignature) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave(null);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mt-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-white text-sm font-medium">
            Digital signature <span className="text-red-400">*</span>
          </p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">Draw your signature in the box below</p>
        </div>
        {hasSignature && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div className="mt-3 border border-dashed border-[#3a3a3a] rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {hasSignature ? (
        <p className="text-[#1DB954] text-xs mt-2">✓ Signature captured</p>
      ) : (
        <p className="text-[#5a5a5a] text-xs mt-2">Sign above using mouse or touch</p>
      )}
    </div>
  );
}

function Step7Documents({ onDataChange }) {
  const [files, setFiles] = useState({});
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleUpload = (id, file) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const requiredDocs = docConfig.filter((d) => d.required);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.id]);
  const canProceed = allRequiredUploaded && signature;

  const handleSubmit = () => {
    setSubmitted(true);
    if (canProceed) {
      onDataChange?.({ files, signature });
    }
  };

  return (
    <div>
      {/* Intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Documents & Signature</h2>
        <p className="text-[#b3b3b3] text-sm">
          Upload clear copies of your documents. PAN and Aadhaar are mandatory.
        </p>
      </div>

      {/* Upload progress */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5">
          <div
            className="bg-[#1DB954] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(files).length / docConfig.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#b3b3b3] whitespace-nowrap">
          {Object.keys(files).length} / {docConfig.length} uploaded
        </span>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {docConfig.map((doc) => (
          <FileUploadCard
            key={doc.id}
            doc={doc}
            file={files[doc.id]}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Validation message */}
      {submitted && !allRequiredUploaded && (
        <p className="text-red-400 text-xs mt-2">
          ⚠ Please upload PAN card and Aadhaar card to proceed
        </p>
      )}

      {/* Signature Pad */}
      <SignaturePad onSave={setSignature} />

      {submitted && !signature && (
        <p className="text-red-400 text-xs mt-2">⚠ Please provide your signature to proceed</p>
      )}

      {/* Consent */}
      <div className="mt-5 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <p className="text-[#b3b3b3] text-xs leading-relaxed">
          By uploading documents and signing above, I confirm that all documents are genuine,
          belong to me, and I authorize{" "}
          <span className="text-white font-medium">Zetheta Finance</span> to use them
          for loan processing and verification purposes.
        </p>
      </div>

      <button
        type="button"
        id="step7-submit"
        onClick={handleSubmit}
        className="hidden"
      />
    </div>
  );
}

export default Step7Documents;