import { Icon } from './Icon';

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getFileIcon(file) {
    if (file.isDir) return 'folder';
    const mimeType = file.mimeType || '';
    const name = (file.fileName || file.name || '').toLowerCase();
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)) return 'image';
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'picture_as_pdf';
    return 'description';
}

function getFileType(file) {
    if (file.isDir) return 'Folder';
    const mimeType = file.mimeType || '';
    const name = (file.fileName || file.name || '').toLowerCase();
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)) return 'Image';
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) return 'PDF';
    return 'Document';
}

export default function DetailsPanel({
    file,
    onClose,
    getOwnerDisplay,
    getFolderName,
    formatDate,
    theme
}) {
    if (!file) return null;

    const dark = theme === 'dark';
    const icon = getFileIcon(file);
    const name = file.name || file.fileName;

    return (
        <div className="panel flex col" style={{ background: dark ? '#2d2d2d' : 'white', color: dark ? 'white' : 'black' }}>
            <div className="flex center between p-3" style={{ borderBottom: `1px solid ${dark ? 'gray' : 'lightgray'}` }}>
                <h6 className="m-0">Details</h6>
                <button className="btn btn-sm" onClick={onClose}>
                    <Icon name="close" size={18} color={dark ? 'white' : 'gray'} />
                </button>
            </div>

            <div className="grow scroll">
                <div className="p-3 text-center" style={{ borderBottom: `1px solid ${dark ? 'gray' : 'lightgray'}` }}>
                    <Icon name={icon} size={64} color="gray" />
                    <h6 className="mt-2 m-0" style={{ wordBreak: 'break-word' }}>
                        {name}
                    </h6>
                </div>

                <div className="p-3">
                    <h6 style={{ fontSize: 12, color: 'gray' }}>File details</h6>
                    <Info label="Type" value={getFileType(file)} dark={dark} />
                    {!file.isDir && (
                        <Info label="Size" value={formatFileSize(file.size)} dark={dark} />
                    )}
                    <Info label="Owner" value={getOwnerDisplay(file)} dark={dark} />
                    <Info label="Location" value={getFolderName(file.parentID)} dark={dark} />
                    <Info label="Starred" value={file.starred ? 'Yes' : 'No'} dark={dark} />

                    <h6 style={{ fontSize: 12, color: 'gray', marginTop: 16 }}>Activity</h6>
                    {file.createdAt && (
                        <Info label="Created" value={formatDateTime(file.createdAt)} dark={dark} />
                    )}
                    {file.modifiedAt && (
                        <Info label="Modified" value={formatDateTime(file.modifiedAt)} dark={dark} />
                    )}
                    {file.lastAccessed && (
                        <Info label="Opened" value={formatDateTime(file.lastAccessed)} dark={dark} />
                    )}
                </div>
            </div>

        </div>
    );
}

function Info({ label, value, dark }) {
    return (
        <div className="mb-2">
            <div style={{ fontSize: 11, color: 'gray' }}>{label}</div>
            <div style={{ fontSize: 13, color: dark ? 'white' : 'black' }}>{value}</div>
        </div>
    );
}
