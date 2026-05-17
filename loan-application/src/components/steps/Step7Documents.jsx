import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import SignatureCanvas from "react-signature-canvas";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const docConfig = [
  { id: "pan",          label: "PAN card copy",   required: true,  hint: "JPG, PNG or PDF • Max 5MB" },
  { id: "aadhaar",      label: "Aadhaar card",    required: true,  hint: "Front and back side • Max 5MB" },
  { id: "salarySlip",   label: "Salary slips",    required: false, hint: "Last 3 months • Max 5MB" },
  { id: "itr",          label: "ITR / Form 16",   required: false, hint: "Last 2 years • Max 5MB" },
  { id: "gst",          label: "GST certificate", required: false, hint: "For self-employed only • Max 5MB" },
  { id: "bankStatement",label: "Bank statement",  required: false, hint: "Last 6 months • Max 5MB" },
];

// Human-readable labels for Step 8
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
   SignaturePad
───────────────────────────────────────────────────────────────────────── */
function SignaturePad({ onSave, currentSignature }) {
  const sigCanvas = useRef(null);
  const [hasSignature, setHasSignature] = useState(!!currentSignature);
  const [preview, setPreview] = useState(currentSignature || null);

  useEffect(() => {
    if (currentSignature && sigCanvas.current) {
      sigCanvas.current.fromDataURL(currentSignature);
      setHasSignature(true);
      setPreview(currentSignature);
    }
  }, []);

  const handleEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      setHasSignature(true);
      setPreview(dataUrl);
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    sigCanvas.current.clear();
    setHasSignature(false);
    setPreview(null);
    onSave(null);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mt-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-white text-sm font-medium">Digital Signature <span className="text-red-400">*</span></p>
          <p className="text-[#5a5a5a] text-xs mt-0.5">Draw your signature in the box below</p>
        </div>
        {hasSignature && (
          <button type="button" onClick={handleClear} className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-4 items-stretch">
        <div className="flex-1 border border-dashed border-[#3a3a3a] rounded-xl overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="white"
            onEnd={handleEnd}
            canvasProps={{ width: 900, height: 220, className: "w-full bg-[#121212] cursor-crosshair" }}
          />
        </div>
        {preview && (
          <div className="w-48 flex-shrink-0 border border-[#1DB954]/30 rounded-xl bg-[#121212] flex flex-col items-center justify-center gap-2 p-3">
            <p className="text-[#5a5a5a] text-xs">Preview</p>
            <img src={preview} alt="signature preview" className="w-full rounded-lg object-contain"
              style={{ background: "#fff", padding: 8, maxHeight: 100, border: "1px solid #333" }} />
            <p className="text-[#1DB954] text-xs">✓ Captured</p>
          </div>
        )}
      </div>
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
    register("documentsMeta"); // serialisable metadata — used by Step 8 to display files
  }, [register]);

  const signature = watch("signature");
  const [files, setFiles] = useState(watch("documents") || {});
  const [submitted, setSubmitted] = useState(false);

  // Builds a plain-object metadata snapshot from the current File objects
  const buildMeta = (fileMap) =>
    Object.fromEntries(
      Object.entries(fileMap).map(([id, f]) => [
        id,
        {
          name:  f.name,
          size:  f.size,
          type:  f.type,
          label: docLabels[id] || id,
        },
      ])
    );

  const handleUpload = (id, file) => {
    setFiles((prev) => {
      const updated = { ...prev, [id]: file };
      setValue("documents",     updated,            { shouldDirty: true });
      setValue("documentsMeta", buildMeta(updated), { shouldDirty: true }); // ← always in sync
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

  const handleSignatureSave = (dataUrl) => {
    setValue("signature", dataUrl, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const requiredDocs        = docConfig.filter((d) => d.required);
  const allRequiredUploaded = requiredDocs.every((d) => files[d.id]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Documents & Signature</h2>
        <p className="text-[#5a5a5a] text-sm">Upload required documents and provide your digital signature.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5">
          <div className="bg-[#1DB954] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(Object.keys(files).length / docConfig.length) * 100}%` }} />
        </div>
        <span className="text-[#5a5a5a] text-xs">{Object.keys(files).length}/{docConfig.length} uploaded</span>
      </div>

      {/* Upload grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {docConfig.map((doc) => (
          <FileUploadCard key={doc.id} doc={doc} file={files[doc.id]} onUpload={handleUpload} onRemove={handleRemove} />
        ))}
      </div>

      {submitted && !allRequiredUploaded && (
        <p className="text-red-400 text-xs mt-2">⚠ Please upload PAN and Aadhaar (required)</p>
      )}

      <SignaturePad onSave={handleSignatureSave} currentSignature={signature} />

      {submitted && !signature && (
        <p className="text-red-400 text-xs mt-2">⚠ Signature is required before proceeding</p>
      )}

      <div className="mt-5 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <p className="text-[#b3b3b3] text-xs leading-relaxed">
          By uploading documents and signing above, I confirm that all documents submitted are genuine and accurate.
        </p>
      </div>

      <button type="button" id="step7-submit" onClick={() => setSubmitted(true)} className="hidden" />
    </div>
  );
}