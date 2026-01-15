import { useEffect, useState } from 'react';
import { Icon } from '../Icon';

// Convert base64 data URL to Blob URL (more efficient for large files)
function base64ToObjectUrl(base64DataUrl) {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return null;

    try {
        const [header, base64] = base64DataUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error('Failed to convert base64 to blob:', e);
        return null;
    }
}

function getFileType(file, content) {
    const mimeType = file.mimeType || '';
    const name = (file.fileName || file.name || '').toLowerCase();

    // Check if content is base64 image data
    if (content && content.startsWith('data:image')) {
        return 'image';
    }
    // Check if content is base64 PDF data
    if (content && content.startsWith('data:application/pdf')) {
        return 'pdf';
    }

    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)) {
        return 'image';
    }
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
        return 'pdf';
    }
    return 'document';
}

function getFileIcon(file, content) {
    const type = getFileType(file, content);
    switch (type) {
        case 'image': return 'image';
        case 'pdf': return 'picture_as_pdf';
        default: return 'description';
    }
}

export default function FileModal({
    file,
    content,
    setContent,
    isEditing,
    setIsEditing,
    isLoading,
    canEdit,
    theme,
    onClose,
    onSave,
    onToggleStar
}) {
    const [pdfUrl, setPdfUrl] = useState(null);

    const dark = theme === 'dark';
    const fileType = file ? getFileType(file, content) : 'document';
    const isMediaFile = fileType === 'image' || fileType === 'pdf';

    // Convert PDF base64 to Object URL for better performance with large files
    useEffect(() => {
        if (fileType === 'pdf' && content && content.startsWith('data:')) {
            const url = base64ToObjectUrl(content);
            setPdfUrl(url);
            return () => {
                if (url) URL.revokeObjectURL(url);
            };
        } else {
            setPdfUrl(null);
        }
    }, [content, fileType]);

    if (!file) return null;

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className={`modal-card shadow ${dark ? 'bg-dark text-white' : ''}`}
                style={{ width: '80%', height: '80%', maxWidth: 900 }}
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="flex center between p-3"
                    style={{ borderBottom: '1px solid lightgray' }}
                >
                    <div className="flex center gap">
                        <button className="btn btn-sm p-0" onClick={(e) => onToggleStar(e, file)}>
                            <Icon
                                name={file.starred ? 'star' : 'star_border'}
                                size={22}
                                color={file.starred ? 'gold' : 'gray'}
                            />
                        </button>
                        <Icon
                            name={getFileIcon(file, content)}
                            size={22}
                            color="gray"
                        />
                        <h5 className="m-0">{file.fileName || file.name}</h5>
                    </div>

                    <div className="flex gap">
                        {canEdit && !isMediaFile && (
                            isEditing ? (
                                <>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={onSave}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-sm btn-outline-primary flex center gap-sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Icon name="edit" size={14} color="dodgerblue" />
                                    Edit
                                </button>
                            )
                        )}
                        {isMediaFile && content && (
                            <a
                                href={content}
                                download={file.fileName || file.name}
                                className="btn btn-sm btn-outline-primary flex center gap-sm"
                                onClick={e => e.stopPropagation()}
                            >
                                <Icon name="download" size={14} color="dodgerblue" />
                                Download
                            </a>
                        )}
                        <button className="btn btn-sm" onClick={onClose}>
                            <Icon name="close" size={18} color="gray" />
                        </button>
                    </div>
                </div>

                <div className="scroll p-0" style={{ height: 'calc(100% - 60px)' }}>
                    {isLoading ? (
                        <div className="flex center" style={{ justifyContent: 'center', height: '100%' }}>
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : fileType === 'image' && content ? (
                        <div
                            className="flex center"
                            style={{
                                justifyContent: 'center',
                                height: '100%',
                                padding: 16,
                                background: dark ? '#1a1a1a' : '#f5f5f5'
                            }}
                        >
                            <img
                                src={content}
                                alt={file.fileName || file.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 4
                                }}
                            />
                        </div>
                    ) : fileType === 'pdf' && content ? (
                        pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                title={file.fileName || file.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                }}
                            />
                        ) : (
                            <div
                                className="flex center"
                                style={{
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    height: '100%',
                                    gap: 16
                                }}
                            >
                                <Icon name="picture_as_pdf" size={64} color="#ea4335" />
                                <p className="text-muted">Loading PDF...</p>
                            </div>
                        )
                    ) : isEditing ? (
                        <textarea
                            className={`form-control h-100 border-0 ${dark ? 'bg-dark text-white' : ''}`}
                            style={{ resize: 'none', padding: 16 }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        <pre
                            className="p-4 m-0 h-100"
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        >
                            {content || '(Empty file)'}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}
