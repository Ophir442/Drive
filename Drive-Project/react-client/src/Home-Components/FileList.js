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

function getFileType(file) {
    const mimeType = file.mimeType || '';
    const name = (file.fileName || file.name || '').toLowerCase();

    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(name)) {
        return 'image';
    }
    if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
        return 'pdf';
    }
    if (file.isDir) {
        return 'folder';
    }
    return 'document';
}

function getFileIcon(file) {
    const type = getFileType(file);
    switch (type) {
        case 'folder': return 'folder';
        case 'image': return 'image';
        case 'pdf': return 'picture_as_pdf';
        default: return 'description';
    }
}

function FileRow({
    file,
    index,
    theme,
    currentView,
    focusedIndex,
    dragOverFolder,
    isOwner,
    onToggleStar,
    onClick,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    getOwnerDisplay,
    formatDate
}) {
    const id = file.FID || file.id || file._id;
    const focused = focusedIndex === index;
    const dragOver = dragOverFolder === id;
    const inTrash = currentView === 'trash';
    const dark = theme === 'dark';

    return (
        <tr
            className="row-hover pointer"
            style={{
                background: focused ? 'lightblue' : dragOver ? 'lightcyan' : undefined,
                outline: focused ? '2px solid dodgerblue' : undefined,
                borderBottom: `1px solid ${dark ? '#3c4043' : '#e0e0e0'}`
            }}
            onClick={onClick}
            onContextMenu={onContextMenu}
            draggable={isOwner && !inTrash}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
        >
            {!inTrash && (
                <td style={{ border: 'none', verticalAlign: 'middle' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm p-0" onClick={onToggleStar}>
                        <Icon
                            name={file.starred ? 'star' : 'star_border'}
                            size={20}
                            color={file.starred ? 'gold' : 'gray'}
                        />
                    </button>
                </td>
            )}
            <td style={{ border: 'none', verticalAlign: 'middle', color: dark ? 'white' : 'inherit' }}>
                <Icon name={getFileIcon(file)} size={20} color="gray" className="me-2" />
                {file.fileName || file.name}
            </td>
            <td style={{ border: 'none', verticalAlign: 'middle', color: dark ? '#9aa0a6' : 'gray', fontSize: 13 }}>
                {inTrash
                    ? formatDate(file.trashedAt)
                    : getOwnerDisplay(file)
                }
            </td>
            <td style={{ border: 'none', verticalAlign: 'middle', color: dark ? '#9aa0a6' : 'gray', fontSize: 13 }}>
                {currentView === 'recent'
                    ? (file.lastAccessed ? formatDate(file.lastAccessed, true) : '-')
                    : (file.modifiedAt ? formatDate(file.modifiedAt, true) : '-')
                }
            </td>
            <td style={{ border: 'none', verticalAlign: 'middle', color: dark ? '#9aa0a6' : 'gray', fontSize: 13 }}>
                {file.isDir ? '-' : formatFileSize(file.size)}
            </td>
            <td style={{ border: 'none', verticalAlign: 'middle' }}>
                <button className="btn btn-sm p-1" onClick={e => { e.stopPropagation(); onContextMenu(e); }}>
                    <Icon name="more_vert" size={20} color={dark ? 'white' : 'gray'} />
                </button>
            </td>
        </tr>
    );
}

function FileCard({
    file,
    index,
    theme,
    currentView,
    focusedIndex,
    dragOverFolder,
    isOwner,
    onToggleStar,
    onClick,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    getOwnerDisplay,
    formatDate
}) {
    const id = file.FID || file.id || file._id;
    const focused = focusedIndex === index;
    const dragOver = dragOverFolder === id;
    const dark = theme === 'dark';
    const inTrash = currentView === 'trash';
    const fileType = getFileType(file);

    const renderPreview = () => {
        // Show image preview if content is base64 image data
        if (fileType === 'image' && file.content && file.content.startsWith('data:image')) {
            return (
                <div
                    style={{
                        width: '100%',
                        height: 80,
                        backgroundImage: `url(${file.content})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 4
                    }}
                />
            );
        }

        // Show PDF preview with icon and red accent
        if (fileType === 'pdf') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: 80,
                        background: dark ? '#3d3d3d' : '#f5f5f5',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon name="picture_as_pdf" size={48} color="#ea4335" />
                </div>
            );
        }

        // Show image icon with blue accent for images without preview
        if (fileType === 'image') {
            return (
                <div
                    style={{
                        width: '100%',
                        height: 80,
                        background: dark ? '#3d3d3d' : '#f5f5f5',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon name="image" size={48} color="#4285f4" />
                </div>
            );
        }

        // Default icon for folders and documents
        return (
            <div className="flex" style={{ justifyContent: 'center', height: 80, alignItems: 'center' }}>
                <Icon name={getFileIcon(file)} size={48} color="gray" />
            </div>
        );
    };

    return (
        <div className="col-6 col-md-4 col-lg-2">
            <div
                className={`card h-100 p-3 text-center position-relative card-hover pointer ${dark ? 'text-white' : ''}`}
                style={{
                    borderRadius: 8,
                    border: focused ? '2px solid dodgerblue' : 'none',
                    background: dragOver ? 'lightcyan' : (dark ? '#2d2d2d' : undefined)
                }}
                onClick={onClick}
                onContextMenu={onContextMenu}
                draggable={isOwner && !inTrash}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
            >
                {!inTrash && (
                    <>
                        <button
                            className="btn btn-sm p-0 position-absolute"
                            style={{ top: 8, left: 8, zIndex: 10 }}
                            onClick={e => { e.stopPropagation(); onToggleStar(e); }}
                        >
                            <Icon
                                name={file.starred ? 'star' : 'star_border'}
                                size={18}
                                color={file.starred ? 'gold' : 'gray'}
                            />
                        </button>
                        <button
                            className="btn btn-sm p-0 position-absolute"
                            style={{ top: 8, right: 8, zIndex: 10 }}
                            onClick={e => { e.stopPropagation(); onContextMenu(e); }}
                        >
                            <Icon name="more_vert" size={18} color={dark ? 'white' : 'gray'} />
                        </button>
                    </>
                )}
                {renderPreview()}
                <small className="truncate d-block mt-2">{file.fileName || file.name}</small>
                {file.modifiedAt && (
                    <small style={{ fontSize: 10, color: dark ? '#9aa0a6' : 'gray' }}>
                        {formatDate(file.modifiedAt, true)}
                    </small>
                )}
            </div>
        </div>
    );
}

export function ViewToggle({ viewMode, setViewMode, theme }) {
    const dark = theme === 'dark';
    return (
        <div className="flex" style={{ border: `1px solid ${dark ? 'gray' : 'lightgray'}`, borderRadius: 20, overflow: 'hidden' }}>
            <button
                className={`view-btn btn btn-sm ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                style={{ borderRadius: '20px 0 0 20px', background: viewMode === 'list' ? (dark ? '#4a4a4a' : 'lightblue') : 'transparent' }}
            >
                {viewMode === 'list' && <Icon name="check" size={12} color="dodgerblue" />}
                <Icon name="menu" size={18} color={viewMode === 'list' ? 'dodgerblue' : (dark ? 'white' : 'gray')} />
            </button>
            <button
                className={`view-btn btn btn-sm ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                style={{ borderRadius: '0 20px 20px 0', background: viewMode === 'grid' ? (dark ? '#4a4a4a' : 'lightblue') : 'transparent' }}
            >
                {viewMode === 'grid' && <Icon name="check" size={12} color="dodgerblue" />}
                <Icon name="grid_view" size={18} color={viewMode === 'grid' ? 'dodgerblue' : (dark ? 'white' : 'gray')} />
            </button>
        </div>
    );
}

export function EmptyState({ currentView, isSearching, theme }) {
    const dark = theme === 'dark';
    const states = {
        myDrive: { icon: 'folder', msg: 'No files here' },
        shared: { icon: 'people', msg: 'No shared files' },
        starred: { icon: 'star', msg: 'No starred files' },
        recent: { icon: 'schedule', msg: 'No recent files' },
        search: { icon: 'search', msg: isSearching ? 'Searching...' : 'No results' },
        trash: { icon: 'delete', msg: 'Trash is empty' }
    };
    const s = states[currentView] || states.myDrive;

    return (
        <div className="text-center mt-5">
            <Icon name={s.icon} size={64} color={dark ? '#9aa0a6' : 'lightgray'} />
            <p className="mt-2" style={{ color: dark ? 'white' : 'gray' }}>{s.msg}</p>
        </div>
    );
}

export default function FileList({
    files,
    viewMode,
    theme,
    currentView,
    focusedIndex,
    setFocusedIndex,
    dragOverFolder,
    isOwner,
    onToggleStar,
    onOpenFile,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    getOwnerDisplay,
    formatDate
}) {
    const inTrash = currentView === 'trash';

    const rowProps = (file, i) => ({
        file,
        index: i,
        theme,
        currentView,
        focusedIndex,
        dragOverFolder,
        isOwner: isOwner(file),
        onToggleStar: (e) => onToggleStar(e, file),
        onClick: () => { setFocusedIndex(i); !inTrash && onOpenFile(file); },
        onContextMenu: (e) => onContextMenu(e, file),
        onDragStart: (e) => onDragStart(e, file),
        onDragOver: (e) => onDragOver(e, file),
        onDragLeave,
        onDrop: (e) => onDrop(e, file),
        onDragEnd,
        getOwnerDisplay,
        formatDate
    });

    if (viewMode === 'list') {
        return (
            <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`} style={{ '--bs-table-bg': theme === 'dark' ? '#2d2d2d' : undefined }}>
                <thead>
                    <tr style={{ color: theme === 'dark' ? '#9aa0a6' : 'gray', fontSize: 12, borderBottom: `1px solid ${theme === 'dark' ? '#3c4043' : '#e0e0e0'}` }}>
                        {!inTrash && <th style={{ border: 'none', width: 40 }} />}
                        <th style={{ border: 'none', width: inTrash ? '40%' : '30%' }}>Name</th>
                        <th style={{ border: 'none' }}>
                            {inTrash ? 'Trashed' : 'Owner'}
                        </th>
                        <th style={{ border: 'none' }}>{currentView === 'recent' ? 'Opened' : 'Modified'}</th>
                        <th style={{ border: 'none' }}>Size</th>
                        <th style={{ border: 'none' }} />
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, i) => (
                        <FileRow key={file.id || file._id || file.FID} {...rowProps(file, i)} />
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <div className="row g-3">
            {files.map((file, i) => (
                <FileCard key={file.id || file._id || file.FID} {...rowProps(file, i)} />
            ))}
        </div>
    );
}
