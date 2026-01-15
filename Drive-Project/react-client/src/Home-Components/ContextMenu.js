import { Icon } from './Icon';

function MenuItem({ icon, label, onClick, danger, dark }) {
    return (
        <div
            className={`menu-item ${dark ? 'bg-dark text-white' : ''}`}
            style={{ color: danger ? 'crimson' : undefined }}
            onClick={onClick}
        >
            <Icon name={icon} size={18} color={danger ? 'crimson' : 'gray'} />
            {label}
        </div>
    );
}

export default function ContextMenu({
    contextMenu,
    theme,
    currentView,
    isOwner,
    onClose,
    onOpen,
    onToggleStar,
    onDetails,
    onShare,
    onRename,
    onMove,
    onDelete,
    onRestore,
    onPermanentDelete,
    onRemoveAccess
}) {
    if (!contextMenu) return null;

    const file = contextMenu.file;
    const owner = isOwner(file);
    const dark = theme === 'dark';
    const inTrash = currentView === 'trash';
    const isShared = currentView === 'shared' || (!owner && !inTrash);

    // Calculate menu height based on number of items
    // Each menu item is ~36px, each hr is ~8px
    let menuHeight;
    if (inTrash) {
        menuHeight = 90; // Restore + hr + Delete forever
    } else if (owner) {
        menuHeight = 280; // Open + Star + Details + Share + Rename + Move + hr + Trash
    } else {
        menuHeight = 170; // Open + Star + Details + hr + Remove (shared files)
    }

    const openUpward = contextMenu.y + menuHeight > window.innerHeight;
    const left = Math.min(contextMenu.x, window.innerWidth - 210);
    const top = openUpward ? contextMenu.y - menuHeight : contextMenu.y;

    return (
        <div
            className={`context-menu shadow ${dark ? 'bg-dark' : 'bg-white'}`}
            style={{ top: Math.max(0, top), left }}
        >
            {inTrash ? (
                <>
                    <MenuItem
                        icon="restore"
                        label="Restore"
                        dark={dark}
                        onClick={() => { onRestore(file); onClose(); }}
                    />
                    <hr className="my-1 mx-3" />
                    <MenuItem
                        icon="delete_forever"
                        label="Delete forever"
                        dark={dark}
                        danger
                        onClick={() => onPermanentDelete(file)}
                    />
                </>
            ) : (
                <>
                    <MenuItem
                        icon={file.isDir ? 'folder_open' : 'description'}
                        label={file.isDir ? 'Open folder' : 'Open'}
                        dark={dark}
                        onClick={() => { onOpen(file); onClose(); }}
                    />
                    <MenuItem
                        icon="star"
                        label={file.starred ? 'Unstar' : 'Star'}
                        dark={dark}
                        onClick={(e) => { onToggleStar(e, file); onClose(); }}
                    />
                    <MenuItem
                        icon="info"
                        label="Details"
                        dark={dark}
                        onClick={() => onDetails(file)}
                    />
                    {owner && (
                        <>
                            <MenuItem
                                icon="people"
                                label="Share"
                                dark={dark}
                                onClick={() => onShare(file)}
                            />
                            <MenuItem
                                icon="edit"
                                label="Rename"
                                dark={dark}
                                onClick={() => onRename(file)}
                            />
                            <MenuItem
                                icon="drive_file_move"
                                label="Move"
                                dark={dark}
                                onClick={() => onMove(file)}
                            />
                            <hr className="my-1 mx-3" />
                            <MenuItem
                                icon="delete"
                                label="Trash"
                                dark={dark}
                                danger
                                onClick={() => onDelete(file)}
                            />
                        </>
                    )}
                    {isShared && !owner && (
                        <>
                            <hr className="my-1 mx-3" />
                            <MenuItem
                                icon="remove_circle"
                                label="Remove"
                                dark={dark}
                                danger
                                onClick={() => onRemoveAccess(file)}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
