import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateFile, formatBytes } from '../../utils/fileValidation';
import { FILE_LIMITS } from '../../utils/constants';

export default function FileUploadWidget({ files, onFilesChange, maxFiles = 5 }) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const allAcceptedTypes = Object.values(FILE_LIMITS).flatMap((limit) => limit.types).join(',');

  function addFiles(fileList) {
    setError('');
    const incoming = Array.from(fileList);
    const accepted = [];

    for (const file of incoming) {
      if (files.length + accepted.length >= maxFiles) {
        setError(`You can attach up to ${maxFiles} files.`);
        break;
      }
      const result = validateFile(file);
      if (!result.valid) {
        setError(t('evidence.invalidFileType', 'One of the selected files is not an accepted type or is too large.'));
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length) {
      onFilesChange([...files, ...accepted]);
    }
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-700/40' : 'border-sand-light dark:border-teal-600'
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sand">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M17 8l-5-5-5 5M12 3v12" />
        </svg>
        <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-medium text-teal-500 hover:underline dark:text-teal-100">
          {t('complaint.uploadFile')}
        </button>
        <p className="text-xs text-sand">{t('complaint.dragDropHere')}</p>
        <p className="text-xs text-sand">{t('complaint.imageDocVideo')}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={allAcceptedTypes}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-xs text-rust-500">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded border border-sand-light px-3 py-2 text-sm dark:border-teal-600">
              <span className="truncate">{file.name}</span>
              <span className="ml-2 shrink-0 text-xs text-sand">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                className="ml-3 shrink-0 text-rust-500 hover:text-rust-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
