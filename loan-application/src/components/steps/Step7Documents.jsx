import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  useFormContext,
} from "react-hook-form";

import {
  useDropzone,
} from "react-dropzone";
import SignatureCanvas from "react-signature-canvas";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const docConfig = [
  {
    id: "pan",
    label: "PAN card copy",
    required: true,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "JPG, PNG or PDF • Max 5MB",
  },

  {
    id: "aadhaar",
    label: "Aadhaar card",
    required: true,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "Front and back side • Max 5MB",
  },

  {
    id: "salarySlip",
    label: "Salary slips",
    required: false,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "Last 3 months • Max 5MB",
  },

  {
    id: "itr",
    label: "ITR / Form 16",
    required: false,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "Last 2 years • Max 5MB",
  },

  {
    id: "gst",
    label: "GST certificate",
    required: false,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "For self-employed only • Max 5MB",
  },

  {
    id: "bankStatement",
    label: "Bank statement",
    required: false,
    accept:
      ".jpg,.jpeg,.png,.pdf",
    hint:
      "Last 6 months • Max 5MB",
  },
];

function FileUploadCard({
  doc,
  file,
  onUpload,
  onRemove,
}) {

  const [error, setError] =
    useState("");

  const validate = (f) => {

    if (
      !ACCEPTED_TYPES.includes(
        f.type
      )
    ) {

      setError(
        "Only JPG, PNG or PDF allowed"
      );

      return false;
    }

    if (
      f.size > MAX_FILE_SIZE
    ) {

      setError(
        "File size must be under 5MB"
      );

      return false;
    }

    setError("");

    return true;
  };

  const handleFile = (f) => {

    if (
      f &&
      validate(f)
    ) {

      onUpload(
        doc.id,
        f
      );
    }
  };

  const onDrop = (
    acceptedFiles
  ) => {

    const f =
      acceptedFiles[0];

    if (f) {

      handleFile(f);

    }

  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({

    onDrop,

    multiple: false,

    maxSize:
      MAX_FILE_SIZE,

    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
    },

  });

  const isPdf =
    file?.type ===
    "application/pdf";

  const previewUrl =
    file && !isPdf
      ? URL.createObjectURL(
          file
        )
      : null;

  return (

    <div
      {...getRootProps()}
      className={`border rounded-2xl p-4 transition-all duration-200 cursor-pointer
      ${
        file
          ? "border-[#1DB954]/50 bg-[#1a2e1e]"
          : isDragActive
          ? "border-[#1DB954] bg-[#1DB954]/5"
          : "border-[#2a2a2a] bg-[#1a1a1a]"
      }`}
    >

      <div className="flex items-start justify-between mb-2">

        <div>

          <p className="text-white text-sm font-medium">

            {doc.label}

            {doc.required && (
              <span className="text-red-400 ml-1">
                *
              </span>
            )}

          </p>

          <p className="text-[#5a5a5a] text-xs mt-0.5">

            {doc.hint}

          </p>

        </div>

        {file && (

          <button
            type="button"
            onClick={(e) => {

              e.stopPropagation();

              onRemove(
                doc.id
              );

              setError("");

            }}
            className="text-[#5a5a5a] hover:text-red-400 text-xs transition-colors ml-2"
          >
            ✕ Remove
          </button>

        )}

      </div>

      {file ? (

        <div className="flex items-center gap-3 mt-3 p-3 bg-[#121212] rounded-xl">

          {previewUrl ? (

            <img
              src={previewUrl}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover border border-[#2a2a2a]"
            />

          ) : (

            <div className="w-10 h-10 rounded-lg bg-[#282828] flex items-center justify-center text-lg border border-[#2a2a2a]">
              📄
            </div>

          )}

          <div className="flex-1 min-w-0">

            <p className="text-white text-xs font-medium truncate">

              {file.name}

            </p>

            <p className="text-[#1DB954] text-xs mt-0.5">

              ✓ Uploaded •{" "}

              {(
                file.size / 1024
              ).toFixed(0)}

              {" "}KB

            </p>

          </div>

        </div>

      ) : (

        <button
          type="button"
          className="w-full mt-3 py-4 border border-dashed border-[#3a3a3a] rounded-xl text-[#b3b3b3] text-xs hover:border-[#1DB954] hover:text-[#1DB954] transition-all duration-200 flex flex-col items-center gap-1"
        >

          <input
            {...getInputProps()}
          />

          <span className="text-2xl">
            📁
          </span>

          <span>
            Click to upload or
            drag & drop
          </span>

        </button>

      )}

      {error && (

        <p className="text-red-400 text-xs mt-2">
          ⚠ {error}
        </p>

      )}

      {fileRejections.length > 0 && (

        <p className="text-red-400 text-xs mt-2">
          ⚠ Invalid file or file too large
        </p>

      )}

    </div>

  );
}

function SignaturePad({
  onSave,
}) {

  const sigCanvas = useRef(null);

  

  const [
    hasSignature,
    setHasSignature,
  ] = useState(false);

  

  const clearCanvas = () => {
  sigCanvas.current.clear();

  setHasSignature(false);

  onSave(null);
};
const handleEnd = () => {
  if (!sigCanvas.current.isEmpty()) {
    setHasSignature(true);

    const dataUrl =
      sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

    onSave(dataUrl);
  }
};




  return (

    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mt-6">

      <div className="flex items-center justify-between mb-1">

        <div>

          <p className="text-white text-sm font-medium">

            Digital signature

            <span className="text-red-400 ml-1">
              *
            </span>

          </p>

        </div>

        {hasSignature && (

          <button
            type="button"
            onClick={
              clearCanvas
            }
            className="text-[#5a5a5a] hover:text-red-400 text-xs"
          >
            ✕ Clear
          </button>

        )}

      </div>

      <div className="mt-3 border border-dashed border-[#3a3a3a] rounded-xl overflow-hidden">

        <SignatureCanvas
  ref={sigCanvas}
  penColor="white"
  onEnd={handleEnd}
  canvasProps={{
    width: 900,
    height: 220,
    className:
      "w-full bg-[#1a1a1a] cursor-crosshair",
  }}
/>

      </div>

    </div>

  );
}

function Step7Documents() {

const {
  setValue,
  watch,
  register,
} =
  useFormContext();

useEffect(() => {

  register("signature");

}, [register]);


 const [files, setFiles] =
  useState(
    watch("documents") || {}
  );

  const [
  signature,
  setSignature,
] = useState(
  watch("signature") || null
);
  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const handleUpload = (
    id,
    file
  ) => {

    setFiles((prev) => {

      const updated = {
        ...prev,
        [id]: file,
      };

      setValue(
        "documents",
        updated
      );

      return updated;

    });

  };

  const handleRemove = (
    id
  ) => {

    setFiles((prev) => {

      const updated = {
        ...prev,
      };

      delete updated[id];

      setValue(
        "documents",
        updated
      );

      return updated;

    });

  };

  const requiredDocs =
    docConfig.filter(
      (d) =>
        d.required
    );

  const allRequiredUploaded =
    requiredDocs.every(
      (d) =>
        files[d.id]
    );
const canProceed =
  allRequiredUploaded &&
  signature;
 useEffect(() => {

  setValue(
    "signature",
    signature
  );

}, [
  signature,
  setValue,
]);

  const handleSubmit = () => {

    setSubmitted(
      true
    );

    if (canProceed) {

      setValue(
        "documents",
        files
      );

      setValue(
        "signature",
        signature
      );

    }

  };

  return (

    <div>

      {/* Intro */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white mb-1">

          Documents &
          Signature

        </h2>

      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">

        <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5">

          <div
            className="bg-[#1DB954] h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${
                (
                  Object.keys(
                    files
                  ).length /
                  docConfig.length
                ) * 100
              }%`,
            }}
          />

        </div>

      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">

        {docConfig.map(
          (doc) => (

            <FileUploadCard
              key={doc.id}
              doc={doc}
              file={
                files[doc.id]
              }
              onUpload={
                handleUpload
              }
              onRemove={
                handleRemove
              }
            />

          )
        )}

      </div>

      {/* Validation */}
      {submitted &&
        !allRequiredUploaded && (

          <p className="text-red-400 text-xs mt-2">

            ⚠ Please upload PAN and Aadhaar

          </p>

      )}

      {/* Signature */}
     <SignaturePad
  onSave={(img) => {

    setSignature(img);

    setValue(
      "signature",
      img,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

  }}
/>


      {submitted &&
        !signature && (

          <p className="text-red-400 text-xs mt-2">

            ⚠ Signature required

          </p>

      )}

      {/* Consent */}
      <div className="mt-5 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">

        <p className="text-[#b3b3b3] text-xs leading-relaxed">

          By uploading documents
          and signing above, I
          confirm all documents
          are genuine.

        </p>

      </div>

      <button
        type="button"
        id="step7-submit"
        onClick={
          handleSubmit
        }
        className="hidden"
      />

    </div>

  );
}

export default Step7Documents;