import { useState, useRef, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import SignatureCanvas from "react-signature-canvas";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/* ─── Signature session-storage key ────────────────────────────────────────── */
const SIG_KEY = "loanSignatureDataUrl";

const docConfig = [
  { id: "pan",          label: "PAN card copy",   required: true,  hint: "JPG, PNG or PDF • Max 5MB" },
  { id: "aadhaar",      label: "Aadhaar card",    required: true,  hint: "Front and back side • Max 5MB" },
  { id: "salarySlip",   label: "Salary slips",    required: false, hint: "Last 3 months • Max 5MB" },
  { id: "itr",          label: "ITR / Form 16",   required: false, hint: "Last 2 years • Max 5MB" },
  { id: "gst",          label: "GST certificate", required: false, hint: "For self-employed only • Max 5MB" },
  { id: "bankStatement",label: "Bank statement",  required: false, hint: "Last 6 months • Max 5MB" },
];

const docLabels = Object.fromEntries(docConfig.map((d) => [d.id, d.label]));

/* ─────────────────────────────────────────────────────────────────────────
   FileUploadCard
───────────────────────────────────────────────────────────────────────── */
function FileUploadCard({ doc, file, onUpload, onRemove }) {
  const [error, setError] = useState("");

  const validate = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) { setError("Only JPG, PNG or PDF allowed"); return false; }
    if (f.size > MAX_FILE_SIZE) { setError("File size must be under 5 MB"); return false; }
    setError("");
    return true;
  };

  const onDrop = (acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f && validate(f)) onUpload(doc.id, f);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop, multiple: false, maxSize: MAX_FILE_SIZE,
    accept: { "image/jpeg": [], "image/png": [], "application/pdf": [] },
  });

  return (
    <div
      {...getRootProps()}
      className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer
        ${file ? "border-[#1DB954]/50 bg-[#1a2e1e]" : isDragActive ? "border-[#1DB954] bg-[#1DB954]/5" : "border-[#2a2a2a] bg-[#1a1a1a]"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white text-sm font-medium">
            {doc.label}{doc.required && <span className="text-red-400 ml-1">*</span>}
          </p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">{doc.hint}</p>
        </div>
        {file && (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(doc.id); setError(""); }}
            className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors ml-2">
            ✕ Remove
          </button>
        )}
      </div>

      {file ? (
        <div className="flex items-center gap-3 mt-3 p-3 bg-[#121212] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center text-lg border border-[#2a2a2a]">📄</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{file.name}</p>
            <p className="text-[#1DB954] text-xs mt-0.5">✓ Uploaded • {(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
      ) : (
        <button type="button"
          className="w-full mt-3 py-4 border border-dashed border-[#3a3a3a] rounded-xl text-[#b3b3b3] text-xs hover:border-[#1DB954] hover:text-[#1DB954] transition-all duration-200 flex flex-col items-center gap-1">
          <input {...getInputProps()} />
          <span className="text-2xl">📁</span>
          <span>Click to upload or drag & drop</span>
        </button>
      )}

      {error && <p className="text-red-400 text-xs mt-2">⚠ {error}</p>}
      {fileRejections.length > 0 && <p className="text-red-400 text-xs mt-2">⚠ Invalid file or file too large</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SignaturePad — fixed version
   Key fixes:
   1. Canvas sized to match its actual rendered DOM width (ResizeObserver)
   2. Capture uses toDataURL directly on the canvas element (not getTrimmedCanvas)
      as a fallback when the trimmed version returns a blank image
   3. Saves to both RHF setValue AND sessionStorage on every stroke end
───────────────────────────────────────────────────────────────────────── */
function SignaturePad({ onSave, currentSignature }) {
  const sigCanvas    = useRef(null);
  const wrapperRef   = useRef(null);
  const [hasDrawn,   setHasDrawn]   = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 220 });

  /* ── Restore existing signature on mount ── */
  useEffect(() => {
    const saved = currentSignature || sessionStorage.getItem(SIG_KEY);
    if (saved) {
      setPreview(saved);
      setHasDrawn(true);
      // Restore drawing after canvas has rendered at correct size
      setTimeout(() => {
        if (sigCanvas.current) {
          sigCanvas.current.fromDataURL(saved, {
            width: canvasSize.width,
            height: canvasSize.height,
          });
        }
      }, 100);
      onSave(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keep canvas pixel dimensions in sync with its CSS width ── */
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.floor(entry.contentRect.width);
      if (w > 0 && w !== canvasSize.width) {
        setCanvasSize({ width: w, height: 220 });
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Capture signature after each stroke ── */
  const handleEnd = useCallback(() => {
    const sc = sigCanvas.current;
    if (!sc || sc.isEmpty()) return;

    // Try trimmed first; fall back to full canvas if trimmed is blank
    let dataUrl;
    try {
      const trimmed = sc.getTrimmedCanvas();
      // A "blank" trimmed canvas is 1×1 or has no actual pixel area
      if (trimmed.width > 2 && trimmed.height > 2) {
        dataUrl = trimmed.toDataURL("image/png");
      } else {
        // Fallback: export the full backing canvas
        dataUrl = sc.getCanvas().toDataURL("image/png");
      }
    } catch (_) {
      dataUrl = sc.getCanvas().toDataURL("image/png");
    }

    if (dataUrl && dataUrl !== "data:,") {
      setHasDrawn(true);
      setPreview(dataUrl);
      sessionStorage.setItem(SIG_KEY, dataUrl);
      onSave(dataUrl);
    }
  }, [onSave]);

  const handleClear = useCallback(() => {
    if (sigCanvas.current) sigCanvas.current.clear();
    setHasDrawn(false);
    setPreview(null);
    sessionStorage.removeItem(SIG_KEY);
    onSave(null);
  }, [onSave]);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white text-sm font-medium">
            Digital Signature <span className="text-red-400">*</span>
          </p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">Draw your signature in the box below</p>
        </div>
        {hasDrawn && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Canvas + Preview side by side */}
      <div className="flex gap-4 items-stretch">

        {/* Drawing area — ref wrapper lets ResizeObserver measure real width */}
        <div ref={wrapperRef} className="flex-1 border border-dashed border-[#3a3a3a] rounded-xl overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="white"
            onEnd={handleEnd}
            canvasProps={{
              width:  canvasSize.width,
              height: canvasSize.height,
              style: {
                width:           "100%",
                height:          `${canvasSize.height}px`,
                background:      "#121212",
                cursor:          "crosshair",
                display:         "block",
                touchAction:     "none",  // prevent scroll while signing on mobile
              },
            }}
          />
        </div>

        {/* Live preview panel — dark bg so white-ink signature is visible */}
        {preview && (
          <div className="w-44 flex-shrink-0 border border-[#1DB954]/30 rounded-xl bg-[#121212] flex flex-col items-center justify-center gap-2 p-3">
            <p className="text-[#5a5a5a] text-xs">Preview</p>
            <div
              style={{
                background:   "#1a1a1a",
                border:       "1px solid #2a2a2a",
                borderRadius: 8,
                padding:      6,
                width:        "100%",
              }}
            >
              <img
                src={preview}
                alt="signature preview"
                style={{
                  width:      "100%",
                  maxHeight:  90,
                  objectFit:  "contain",
                  display:    "block",
                }}
              />
            </div>
            <p className="text-[#1DB954] text-xs font-medium">✓ Saved</p>
          </div>
        )}
      </div>

      {/* Helper text */}
      {!hasDrawn && (
        <p className="text-[#3a3a3a] text-xs text-center mt-2">
          Use mouse or touch to draw your signature above
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step7Documents
───────────────────────────────────────────────────────────────────────── */
export default function Step7Documents() {
  const { setValue, watch, register } = useFormContext();

  useEffect(() => {
    register("signature");
    register("documents");
    register("documentsMeta");
  }, [register]);

  const signature = watch("signature");
  const [files,     setFiles]     = useState(watch("documents") || {});
  const [submitted, setSubmitted] = useState(false);

  const buildMeta = (fileMap) =>
    Object.fromEntries(
      Object.entries(fileMap).map(([id, f]) => [
        id,
        { name: f.name, size: f.size, type: f.type, label: docLabels[id] || id },
      ])
    );

  const handleUpload = (id, file) => {
    setFiles((prev) => {
      const updated = { ...prev, [id]: file };
      setValue("documents",     updated,            { shouldDirty: true });
      setValue("documentsMeta", buildMeta(updated), { shouldDirty: true });
      return updated;
    });
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[id];
      setValue("documents",     updated,            { shouldDirty: true });
      setValue("documentsMeta", buildMeta(updated), { shouldDirty: true });
      return updated;
    });
  };

  const handleSignatureSave = useCallback((dataUrl) => {
    setValue("signature", dataUrl, {
      shouldDirty:    true,
      shouldTouch:    true,
      shouldValidate: true,
    });
  }, [setValue]);

  const requiredDocs        = docConfig.filter((d) => d.required);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.id]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Documents & Signature</h2>
        <p className="text-[#5a5a5a] text-sm">Upload required documents and provide your digital signature.</p>
      </div>

      {/* Upload progress bar */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5">
          <div
            className="bg-[#1DB954] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(files).length / docConfig.length) * 100}%` }}
          />
        </div>
        <span className="text-[#5a5a5a] text-xs">{Object.keys(files).length}/{docConfig.length} uploaded</span>
      </div>

      {/* Upload grid */}
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

      {submitted && !allRequiredUploaded && (
        <p className="text-red-400 text-xs mt-2">⚠ Please upload PAN and Aadhaar (required)</p>
      )}

      {/* Signature pad */}
      <SignaturePad onSave={handleSignatureSave} currentSignature={signature} />

      {submitted && !signature && !sessionStorage.getItem(SIG_KEY) && (
        <p className="text-red-400 text-xs mt-2">⚠ Signature is required before proceeding</p>
      )}

      {/* Disclaimer */}
      <div className="mt-5 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <p className="text-[#b3b3b3] text-xs leading-relaxed">
          By uploading documents and signing above, I confirm that all documents submitted are genuine and accurate.
        </p>
      </div>

      <button type="button" id="step7-submit" onClick={() => setSubmitted(true)} className="hidden" />
    </div>
  );
}