import { useTranslation } from 'react-i18next';

export default function EvidenceGallery({ files }) {
  const { t } = useTranslation();

  if (!files || files.length === 0) {
    return <p className="text-sm text-sand">{t('common.noResults')}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((file) => (
        <a
          key={file._id}
          href={file.storageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="card flex flex-col items-center gap-2 p-3 text-center transition-shadow hover:shadow-md"
        >
          <FileTypeIcon fileType={file.fileType} />
          <span className="w-full truncate text-xs text-sand">{file.originalFileName}</span>
        </a>
      ))}
    </div>
  );
}

function FileTypeIcon({ fileType }) {
  if (fileType === 'IMAGE') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
  if (fileType === 'VIDEO') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500">
        <rect x="2" y="5" width="14" height="14" rx="2" />
        <path d="M16 9l6-4v14l-6-4" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
