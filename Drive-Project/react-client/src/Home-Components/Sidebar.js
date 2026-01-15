import { useState, useMemo } from 'react';
import { Icon } from './Icon';

const TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB in bytes

function formatStorage(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function FolderTree({ folders, files, onNavigate, onOpenFile, dark }) {
    const [open, setOpen] = useState({});

    const getId = (f) => f.FID || f.id || f._id;

    const getChildren = (parentId, isDir) => {
        const list = isDir ? folders : files;
        return list.filter(f => {
            const pid = f.parentID || '';
            if (isDir) {
                return parentId === ''
                    ? (pid === '' || pid === '/')
                    : String(pid) === String(parentId);
            }
            return !f.isDir && String(pid) === String(parentId);
        });
    };

    const hasKids = (id) => files.some(f => String(f.parentID) === String(id));

    const toggle = (e, id) => {
        e.stopPropagation();
        setOpen(p => ({ ...p, [id]: !p[id] }));
    };

    const renderFile = (file, depth) => (
        <button
            key={getId(file)}
            className="sidebar-item nav-link btn btn-link text-start w-100 py-2 px-3 flex center"
            style={{ marginLeft: depth * 10, textDecoration: 'none', border: 'none', color: 'gray' }}
            onClick={() => onOpenFile(file)}
        >
            <span style={{ width: 20 }} />
            <span className="me-3">
                <Icon name="description" size={20} color="gray" />
            </span>
            <span className="truncate">{file.name || file.fileName}</span>
        </button>
    );

    const renderFolder = (folder, depth = 1) => {
        const id = getId(folder);
        const isOpen = open[id];
        const kids = hasKids(id);

        return (
            <div key={id}>
                <button
                    className="sidebar-item nav-link btn btn-link text-start w-100 py-2 px-3 flex center"
                    style={{ marginLeft: depth * 10, textDecoration: 'none', border: 'none', color: 'gray' }}
                    onClick={() => onNavigate(id, folder.name || folder.fileName)}
                >
                    <span
                        className="flex center"
                        style={{
                            width: 20,
                            transform: isOpen ? 'rotate(90deg)' : 'none',
                            opacity: kids ? 1 : 0
                        }}
                        onClick={(e) => { e.stopPropagation(); kids && toggle(e, id); }}
                    >
                        <Icon name="arrow_right" size={18} color="gray" />
                    </span>
                    <span className="me-3">
                        <Icon name="folder" size={20} color="gray" />
                    </span>
                    {folder.name || folder.fileName}
                </button>
                {isOpen && (
                    <>
                        {getChildren(id, true).map(f => renderFolder(f, depth + 1))}
                        {getChildren(id, false).map(f => renderFile(f, depth + 1))}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="mt-1">
            {getChildren('', true).map(f => renderFolder(f, 1))}
        </div>
    );
}

export default function Sidebar({
    theme,
    currentView,
    currentPath,
    showMyDriveDropdown,
    setShowMyDriveDropdown,
    showNewMenu,
    setShowNewMenu,
    setShowNewModal,
    setCurrentView,
    setCurrentPath,
    allFolders,
    allFiles,
    onOpenFile
}) {
    const dark = theme === 'dark';

    const usedStorage = useMemo(() => {
        return allFiles.reduce((total, file) => {
            if (!file.isDir && file.size) {
                return total + file.size;
            }
            return total;
        }, 0);
    }, [allFiles]);

    const storagePercent = Math.min((usedStorage / TOTAL_STORAGE) * 100, 100);

    const navItems = [
        { id: 'home', icon: 'home', label: 'Home' },
        { id: 'myDrive', icon: 'cloud', label: 'My Drive', dropdown: true },
        { id: 'shared', icon: 'people', label: 'Shared with me' },
        { id: 'starred', icon: 'star', label: 'Starred' },
        { id: 'recent', icon: 'schedule', label: 'Recent' },
        { id: 'trash', icon: 'delete', label: 'Trash' }
    ];

    const isActive = (id) => {
        if (id === 'myDrive') return currentView === 'myDrive' && currentPath.length === 1;
        return currentView === id;
    };

    const handleNav = (id) => {
        setCurrentView(id);
        if (id === 'myDrive') {
            setCurrentPath([{ id: '', name: 'My Drive' }]);
        }
    };

    const handleFolderNav = (id, name) => {
        setCurrentView('myDrive');
        setCurrentPath([{ id: '', name: 'My Drive' }, { id, name }]);
    };

    return (
        <div className={`sidebar ${dark ? 'bg-dark' : ''}`}>
            <div className="position-relative mb-4 new-menu-container">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowNewMenu(!showNewMenu); }}
                    className={`btn border shadow-sm rounded-pill px-4 py-2 flex center gap btn-new ${dark ? 'btn-secondary' : 'btn-light'}`}
                >
                    <Icon name="add" size={24} color={dark ? 'white' : 'gray'} />
                    <span>{dark ? <span style={{ color: 'white' }}>New</span> : 'New'}</span>
                </button>

                {showNewMenu && (
                    <div
                        className={`position-absolute shadow rounded ${dark ? 'bg-dark' : 'bg-white'}`}
                        style={{ width: 200, zIndex: 1000, top: '100%', marginTop: 4 }}
                    >
                        <div
                            className={`menu-item ${dark ? 'text-white' : ''}`}
                            onClick={() => { setShowNewModal('folder'); setShowNewMenu(false); }}
                        >
                            <Icon name="folder" size={20} color={dark ? 'white' : 'gray'} />
                            New folder
                        </div>
                        <hr className="my-1 mx-3" style={{ borderColor: dark ? 'gray' : undefined }} />
                        <div
                            className={`menu-item ${dark ? 'text-white' : ''}`}
                            onClick={() => { setShowNewModal('file'); setShowNewMenu(false); }}
                        >
                            <Icon name="description" size={20} color={dark ? 'white' : 'gray'} />
                            New file
                        </div>
                    </div>
                )}
            </div>

            <ul className="nav flex-column" style={{ marginLeft: -12 }}>
                {navItems.map(item => (
                    <li key={item.id}>
                        <button
                            className={`sidebar-item nav-link btn btn-link text-start w-100 py-2 px-3 flex center ${isActive(item.id) ? 'active' : ''}`}
                            onClick={() => handleNav(item.id)}
                            style={{
                                textDecoration: 'none',
                                border: 'none',
                                color: isActive(item.id) ? 'dodgerblue' : 'gray'
                            }}
                        >
                            {item.dropdown ? (
                                <span
                                    className="flex center"
                                    style={{
                                        width: 20,
                                        transform: showMyDriveDropdown ? 'rotate(90deg)' : 'none'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMyDriveDropdown(!showMyDriveDropdown);
                                    }}
                                >
                                    <Icon
                                        name="arrow_right"
                                        size={18}
                                        color={isActive(item.id) ? 'dodgerblue' : 'gray'}
                                    />
                                </span>
                            ) : (
                                <span style={{ width: 20 }} />
                            )}
                            <span className="me-3">
                                <Icon
                                    name={item.icon}
                                    size={20}
                                    color={isActive(item.id) ? 'dodgerblue' : 'gray'}
                                />
                            </span>
                            {item.label}
                        </button>

                        {item.dropdown && showMyDriveDropdown && (
                            <FolderTree
                                folders={allFolders}
                                files={allFiles}
                                onNavigate={handleFolderNav}
                                onOpenFile={onOpenFile}
                                dark={dark}
                            />
                        )}
                    </li>
                ))}
            </ul>

            <div className="storage-indicator" style={{ marginTop: 'auto', padding: '16px 12px', borderTop: `1px solid ${dark ? '#5f6368' : '#e0e0e0'}` }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <Icon name="cloud" size={18} color={dark ? '#9aa0a6' : 'gray'} />
                    <span style={{ fontSize: 13, color: dark ? '#9aa0a6' : 'gray' }}>Storage</span>
                </div>
                <div
                    style={{
                        width: '100%',
                        height: 4,
                        backgroundColor: dark ? '#3c4043' : '#e0e0e0',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            width: `${storagePercent}%`,
                            height: '100%',
                            backgroundColor: storagePercent > 90 ? '#ea4335' : storagePercent > 70 ? '#fbbc05' : '#1a73e8',
                            borderRadius: 2,
                            transition: 'width 0.3s ease'
                        }}
                    />
                </div>
                <div style={{ fontSize: 12, color: dark ? '#9aa0a6' : 'gray', marginTop: 6 }}>
                    {formatStorage(usedStorage)} of 5 GB used
                </div>
            </div>
        </div>
    );
}
