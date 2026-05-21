import { useState } from 'react';

function PrescriptionUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (selected && /\.(jpg|jpeg|png|pdf)$/i.test(selected.name)) {
      setFile(selected);
    } else {
      setFile(null);
      alert('Please select a valid image (JPG, PNG) or PDF.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !onUpload) return;
    setLoading(true);
    try {
      await onUpload(file);
      setFile(null);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-gray-700">
          Upload prescription (JPG, PNG, or PDF)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-[#00c6e6] file:px-4 file:py-2 file:text-sm file:text-white file:hover:bg-[#253045]"
        />
      </div>
      {file && (
        <p className="text-xs text-gray-500">
          Selected: {file.name}
        </p>
      )}
      <button
        type="submit"
        disabled={!file || loading}
        className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload prescription'}
      </button>
    </form>
  );
}

export default PrescriptionUpload;
