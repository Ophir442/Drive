import React, { useEffect, useState, useContext, useCallback } from 'react';
import { ThemeContext, AuthContext } from '../App';
import { api } from '../api';
import './Home.css';
import Header from './Header';
import Sidebar from './Sidebar';
import FileList, { ViewToggle, EmptyState } from './FileList';
import ContextMenu from './ContextMenu';
import DetailsPanel from './DetailsPanel';
import { NewItemModal, ShareModal, MoveModal, RenameModal, FileModal } from './modals';

export default function Home() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { logout, user } = useContext(AuthContext);
    const dark = theme === 'dark';

    const [files, setFiles] = useState([]);
    const [view, setView] = useState('home');
    const [viewMode, setViewMode] = useState('list');
    const [path, setPath] = useState([{ id: '', name: 'My Drive' }]);
    const [loading, setLoading] = useState(false);

    const [sugFolders, setSugFolders] = useState([]);
    const [sugFiles, setSugFiles] = useState([]);

    const [driveOpen, setDriveOpen] = useState(false);
    const [allFolders, setAllFolders] = useState([]);
    const [allFiles, setAllFiles] = useState([]);

    const [newMenu, setNewMenu] = useState(false);
    const [newModal, setNewModal] = useState(null);
    const [newName, setNewName] = useState('');

    const [openFile, setOpenFile] = useState(null);
    const [content, setContent] = useState('');
    const [editing, setEditing] = useState(false);

    const [menu, setMenu] = useState(null);
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const [shareModal, setShareModal] = useState(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePerm, setSharePerm] = useState('view');

    const [moveModal, setMoveModal] = useState(null);
    const [folders, setFolders] = useState([]);
    const [moveTarget, setMoveTarget] = useState('');

    const [renameModal, setRenameModal] = useState(null);
    const [renameName, setRenameName] = useState('');
    const [detailsFile, setDetailsFile] = useState(null);

    const [dragged, setDragged] = useState(null);
    const [dragOver, setDragOver] = useState(null);
    const [focused, setFocused] = useState(-1);

    const userId = localStorage.getItem('token');

    const getId = (f) => f.FID || f.id || f._id;
    const isOwner = (f) => String(f.ownerID) === String(userId);

    const getOwner = (f) => {
        if (isOwner(f)) return f.ownerName || user?.displayName || 'me';
        return f.ownerName || 'Unknown';
    };

    const getFolder = (id) => {
        if (!id) return 'My Drive';
        const found = folders.find(f => String(getId(f)) === String(id));
        return found?.name || 'My Drive';
    };

    const fmtDate = (ts, includeTime = false) => {
        if (!ts) return '';
        const date = new Date(ts);
        if (includeTime) {
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return date.toLocaleDateString();
    };

    const load = useCallback(async () => {
        try {
            let data;
            if (view === 'home') {
                const all = await api.getFiles();
                const recent = await api.getRecentFiles();
                setAllFiles(all);
                const dirs = all.filter(f => f.isDir);
                setSugFolders(dirs.slice(0, 5));
                setSugFiles((recent || []).filter(f => !f.isDir).slice(0, 10));
                setAllFolders(dirs);
                return;
            }
            if (view === 'myDrive') {
                const all = await api.getFiles();
                setAllFiles(all);
                const pid = path[path.length - 1].id;
                // For root (pid=''), match files with parentID of '', '/', or falsy
                const isRoot = pid === '';
                data = all.filter(f => {
                    const fPid = f.parentID || '';
                    if (isRoot) {
                        return fPid === '' || fPid === '/';
                    }
                    return String(fPid) === String(pid);
                });
                setAllFolders(all.filter(f => f.isDir));
            }
            else if (view === 'shared') data = await api.getSharedFiles();
            else if (view === 'starred') data = await api.getStarredFiles();
            else if (view === 'recent') data = await api.getRecentFiles();
            else if (view === 'trash') data = await api.getTrashedFiles();
            else if (view === 'search') return;

            setFiles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Load failed', e);
        }
    }, [view, path]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setFocused(-1); }, [view, path]);

    useEffect(() => {
        const click = (e) => {
            if (!e.target.closest('.new-menu-container')) setNewMenu(false);
            if (!e.target.closest('.mydrive-dropdown-container')) setDriveOpen(false);
            setMenu(null);
        };
        window.addEventListener('click', click);
        return () => window.removeEventListener('click', click);
    }, []);

    useEffect(() => {
        const key = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // ESC closes any open modal/panel first
            if (e.key === 'Escape') {
                if (openFile) {
                    closeFile();
                } else if (newModal) {
                    setNewModal(null);
                } else if (shareModal) {
                    setShareModal(null);
                } else if (moveModal) {
                    setMoveModal(null);
                } else if (renameModal) {
                    setRenameModal(null);
                } else if (detailsFile) {
                    setDetailsFile(null);
                } else {
                    setFocused(-1);
                }
                return;
            }

            // Other shortcuts only work when no modal is open
            if (newModal || shareModal || moveModal || renameModal || openFile) return;

            const f = files[focused];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocused(p => Math.min(p + 1, files.length - 1));
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocused(p => Math.max(p - 1, 0));
            }
            else if (e.key === 'Enter' && f) {
                e.preventDefault();
                open(f);
            }
            else if ((e.key === 'Delete' || e.key === 'Backspace') && f && isOwner(f)) {
                e.preventDefault();
                trash(f);
            }
            else if (e.key === 'F2' && f && isOwner(f)) {
                e.preventDefault();
                openRename(f);
            }
            else if (e.key === 'i' && (e.ctrlKey || e.metaKey) && f) {
                e.preventDefault();
                openDetails(f);
            }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, focused, newModal, shareModal, moveModal, renameModal, openFile, detailsFile]);

    const search = async (e) => {
        if (e.key !== 'Enter' || !query.trim()) return;
        setSearching(true);
        setView('search');
        try {
            const data = await api.searchFiles(query.trim());
            setFiles(Array.isArray(data) ? data : []);
        } catch (e) {
            setFiles([]);
        }
        setSearching(false);
    };

    const clearSearch = () => {
        setQuery('');
        setView('myDrive');
        setPath([{ id: '', name: 'My Drive' }]);
    };

    const toggleStar = async (e, f) => {
        e.stopPropagation();
        try {
            const id = getId(f);
            const res = await api.toggleStar(id);
            const upd = (arr) => arr.map(x => getId(x) === id ? { ...x, starred: res.starred } : x);
            setFiles(upd);
            setSugFiles(upd);
            setSugFolders(upd);
            if (openFile && getId(openFile) === id) {
                setOpenFile({ ...openFile, starred: res.starred });
            }
            if (view === 'starred' && !res.starred) {
                setFiles(p => p.filter(x => getId(x) !== id));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const buildPathToFolder = (folderId, folderName, filesArray) => {
        const pathItems = [{ id: folderId, name: folderName }];
        let currentId = filesArray.find(f => String(getId(f)) === String(folderId))?.parentID;

        while (currentId && currentId !== '' && currentId !== '/') {
            const searchId = currentId;
            const parentFolder = filesArray.find(f => String(getId(f)) === String(searchId));
            if (parentFolder) {
                pathItems.unshift({ id: getId(parentFolder), name: parentFolder.name || parentFolder.fileName });
                currentId = parentFolder.parentID;
            } else {
                break;
            }
        }

        pathItems.unshift({ id: '', name: 'My Drive' });
        return pathItems;
    };

    const updateRecentFiles = (file) => {
        // Only track files, not folders
        if (file.isDir) return;

        const fileId = getId(file);
        const now = Date.now();
        const updatedFile = { ...file, lastAccessed: now };

        // Update file in all states with new lastAccessed
        const updateFileAccessed = (f) => {
            if (getId(f) === fileId) {
                return { ...f, lastAccessed: now };
            }
            return f;
        };

        // Update sugFiles - move to front or add
        setSugFiles(prev => {
            const filtered = prev.filter(f => getId(f) !== fileId);
            return [updatedFile, ...filtered].slice(0, 10);
        });

        // Update files list if in recent view - move to front
        if (view === 'recent') {
            setFiles(prev => {
                const filtered = prev.filter(f => getId(f) !== fileId);
                return [updatedFile, ...filtered].slice(0, 20);
            });
        } else {
            // Update lastAccessed in current files list
            setFiles(prev => prev.map(updateFileAccessed));
        }

        // Update in allFiles
        setAllFiles(prev => prev.map(updateFileAccessed));

        // Update detailsFile if it's the same file
        if (detailsFile && getId(detailsFile) === fileId) {
            setDetailsFile(prev => prev ? { ...prev, lastAccessed: now } : prev);
        }
    };

    const open = async (f) => {
        if (f.isDir) {
            // Update lastAccessed for folder
            api.getFileContent(getId(f)).catch(() => {});
            updateRecentFiles(f);

            if (view !== 'myDrive') {
                // Fetch all files to build proper path
                let filesArray = allFiles;
                if (allFiles.length === 0) {
                    filesArray = await api.getFiles();
                    setAllFiles(filesArray);
                    setAllFolders(filesArray.filter(x => x.isDir));
                }
                setView('myDrive');
                setPath(buildPathToFolder(getId(f), f.name || f.fileName, filesArray));
            } else {
                setPath([...path, { id: getId(f), name: f.name || f.fileName }]);
            }
            return;
        }
        const now = Date.now();
        const fileWithAccess = { ...f, lastAccessed: now };
        setOpenFile(fileWithAccess);
        setLoading(true);
        setEditing(false);
        try {
            const data = await api.getFileContent(getId(f));
            setContent(data.content || '');
            updateRecentFiles(fileWithAccess);
        } catch (e) {
            setContent('Error loading');
        }
        setLoading(false);
    };

    const save = async () => {
        if (!openFile) return;
        setLoading(true);
        try {
            const result = await api.updateFile(getId(openFile), { newContent: content });
            const fileId = getId(openFile);
            const now = Date.now();

            // Update file in all states with new modifiedAt and size
            const updateFileData = (f) => {
                if (getId(f) === fileId) {
                    return {
                        ...f,
                        modifiedAt: result.modifiedAt || now,
                        size: result.size || f.size
                    };
                }
                return f;
            };

            setFiles(prev => prev.map(updateFileData));
            setSugFiles(prev => prev.map(updateFileData));
            setAllFiles(prev => prev.map(updateFileData));
            setOpenFile(prev => prev ? updateFileData(prev) : prev);
            if (detailsFile && getId(detailsFile) === fileId) {
                setDetailsFile(prev => prev ? updateFileData(prev) : prev);
            }

            setEditing(false);
            alert('Saved!');
        } catch (e) {
            alert('Save failed');
        }
        setLoading(false);
    };

    const create = async () => {
        const isFolder = newModal === 'folder';
        const defaultName = isFolder ? 'Untitled folder' : 'Untitled document';
        const finalName = newName.trim() || defaultName;
        try {
            await api.createFile({
                nameOfFile: finalName,
                isDir: isFolder,
                content: '',
                parentID: path[path.length - 1].id
            });
            setNewName('');
            setNewModal(null);
            load();
        } catch (e) {
            alert('Create failed');
        }
    };

    const uploadFile = async (fileName, base64Content, mimeType) => {
        try {
            await api.createFile({
                nameOfFile: fileName,
                isDir: false,
                content: base64Content,
                parentID: path[path.length - 1].id,
                mimeType: mimeType
            });
            load();
        } catch (e) {
            alert('Upload failed');
        }
    };

    const trash = async (f) => {
        if (!window.confirm(`Move "${f.name || f.fileName}" to trash?`)) return;
        try {
            await api.deleteFile(getId(f));
            load();
            setMenu(null);
        } catch (e) {
            alert('Delete failed');
        }
    };

    const restore = async (f) => {
        try {
            await api.restoreFile(getId(f));
            load();
            setMenu(null);
        } catch (e) {
            alert('Restore failed');
        }
    };

    const permDelete = async (f) => {
        if (!window.confirm(`Permanently delete "${f.name || f.fileName}"?`)) return;
        try {
            await api.permanentlyDeleteFile(getId(f));
            load();
            setMenu(null);
        } catch (e) {
            alert('Delete failed');
        }
    };

    const removeAccess = async (f) => {
        if (!window.confirm(`Remove "${f.name || f.fileName}" from your shared files?`)) return;
        try {
            await api.removeAccess(getId(f));
            load();
            setMenu(null);
        } catch (e) {
            alert('Failed to remove access');
        }
    };

    const emptyTrash = async () => {
        if (!window.confirm('Empty trash?')) return;
        try {
            await api.emptyTrash();
            load();
        } catch (e) {
            alert('Failed');
        }
    };

    const openShare = (f) => {
        setShareModal(f);
        setShareEmail('');
        setSharePerm('view');
        setMenu(null);
    };

    const share = async () => {
        if (!shareEmail.trim() || !shareModal) return;
        try {
            await api.addPermission(getId(shareModal), shareEmail.trim(), sharePerm);
            alert('Shared!');
            setShareModal(null);
        } catch (e) {
            alert('Share failed');
        }
    };

    const openMove = async (f) => {
        setMoveModal(f);
        setMoveTarget('');
        setMenu(null);
        try {
            const all = await api.getFiles();
            setFolders(all.filter(x => x.isDir && getId(x) !== getId(f)));
        } catch (e) {
            console.error(e);
        }
    };

    const move = async () => {
        if (!moveModal) return;
        try {
            // Use '/' for root (My Drive) to match how files are created
            const targetParentID = moveTarget === '' ? '/' : moveTarget;
            await api.updateFile(getId(moveModal), { newParentID: targetParentID });
            setMoveModal(null);
            load();
        } catch (e) {
            alert('Move failed');
        }
    };

    const openRename = (f) => {
        setRenameModal(f);
        setRenameName(f.name || f.fileName || '');
        setMenu(null);
    };

    const rename = async () => {
        if (!renameModal || !renameName.trim()) return;
        try {
            await api.updateFile(getId(renameModal), { newNameOfFile: renameName.trim() });
            setRenameModal(null);
            load();
        } catch (e) {
            alert('Rename failed');
        }
    };

    const openDetails = async (f) => {
        setDetailsFile(f);
        setMenu(null);
        try {
            const all = await api.getFiles();
            setFolders(all.filter(x => x.isDir));
        } catch (e) {
            console.error(e);
        }
    };

    const dragStart = (e, f) => {
        if (!isOwner(f)) return;
        setDragged(f);
        e.dataTransfer.effectAllowed = 'move';
    };

    const dragOverHandler = (e, f) => {
        e.preventDefault();
        if (f.isDir && dragged && getId(f) !== getId(dragged)) {
            setDragOver(getId(f));
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const dragLeave = () => setDragOver(null);

    const drop = async (e, target) => {
        e.preventDefault();
        setDragOver(null);
        if (!dragged || !target.isDir || getId(target) === getId(dragged)) return;
        try {
            await api.updateFile(getId(dragged), { newParentID: getId(target) });
            load();
        } catch (e) {
            alert('Move failed');
        }
        setDragged(null);
    };

    const dragEnd = () => {
        setDragged(null);
        setDragOver(null);
    };

    const ctxMenu = (e, f) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY, file: f });
    };

    const closeFile = () => {
        setOpenFile(null);
        setContent('');
        setEditing(false);
    };

    const fileListProps = {
        viewMode,
        theme,
        currentView: view,
        dragOverFolder: dragOver,
        isOwner,
        onToggleStar: toggleStar,
        onContextMenu: ctxMenu,
        onDragStart: dragStart,
        onDragOver: dragOverHandler,
        onDragLeave: dragLeave,
        onDrop: drop,
        onDragEnd: dragEnd,
        getOwnerDisplay: getOwner,
        formatDate: fmtDate
    };

    const homeView = () => (
        <>
            <div className="flex center between mb-4">
                <h2 style={{ fontWeight: 400, color: dark ? 'white' : 'black', fontSize: 22, margin: 0 }}>
                    Welcome to Drive
                </h2>
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} theme={theme} />
            </div>

            {sugFolders.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3" style={{ fontSize: 14, color: dark ? 'white' : 'gray' }}>
                        Suggested folders
                    </h6>
                    <FileList
                        files={sugFolders}
                        focusedIndex={-1}
                        setFocusedIndex={() => {}}
                        onOpenFile={(f) => {
                            api.getFileContent(getId(f)).catch(() => {});
                            setView('myDrive');
                            setPath(buildPathToFolder(getId(f), f.name || f.fileName, allFiles));
                        }}
                        {...fileListProps}
                    />
                </div>
            )}

            <div>
                <h6 className="mb-3" style={{ fontSize: 14, color: dark ? 'white' : 'gray' }}>
                    Suggested files
                </h6>
                {sugFiles.length === 0 ? (
                    <p className="text-center" style={{ color: dark ? 'white' : 'gray' }}>No recent files</p>
                ) : (
                    <FileList
                        files={sugFiles}
                        focusedIndex={-1}
                        setFocusedIndex={() => {}}
                        onOpenFile={open}
                        {...fileListProps}
                    />
                )}
            </div>
        </>
    );

    return (
        <div className="flex col" style={{ height: '100vh', background: dark ? undefined : 'whitesmoke' }}>
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                user={user}
                logout={logout}
                searchQuery={query}
                setSearchQuery={setQuery}
                onSearch={search}
                onClearSearch={clearSearch}
                currentView={view}
                onGoHome={() => setView('home')}
            />

            <div className="flex grow hidden">
                <Sidebar
                    theme={theme}
                    currentView={view}
                    currentPath={path}
                    showMyDriveDropdown={driveOpen}
                    setShowMyDriveDropdown={setDriveOpen}
                    showNewMenu={newMenu}
                    setShowNewMenu={setNewMenu}
                    setShowNewModal={setNewModal}
                    setCurrentView={setView}
                    setCurrentPath={setPath}
                    allFolders={allFolders}
                    allFiles={allFiles}
                    onOpenFile={open}
                />

                <div className="main grow flex col hidden" style={{ background: dark ? '#2d2d2d' : 'white' }}>
                    {/* Page titles and headers */}
                    {view !== 'home' && (
                        <div className="flex center between px-3 pt-3">
                            <div>
                                {view === 'myDrive' && (
                                    path.length > 1 ? (
                                        <div className="flex center gap-sm" style={{ fontSize: 14 }}>
                                            {path.map((f, i) => (
                                                <span key={f.id || 'root'} className="flex center">
                                                    {i > 0 && <span className="mx-1 text-muted">›</span>}
                                                    <span
                                                        className="crumb"
                                                        onClick={() => setPath(path.slice(0, i + 1))}
                                                        style={{
                                                            color: i === path.length - 1 ? (dark ? 'white' : 'black') : 'gray',
                                                            fontWeight: i === path.length - 1 ? 500 : 'normal'
                                                        }}
                                                    >
                                                        {f.name}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                            My Drive
                                        </h5>
                                    )
                                )}
                                {view === 'shared' && (
                                    <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                        Shared with me
                                    </h5>
                                )}
                                {view === 'starred' && (
                                    <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                        Starred
                                    </h5>
                                )}
                                {view === 'recent' && (
                                    <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                        Recent
                                    </h5>
                                )}
                                {view === 'trash' && (
                                    <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                        Trash
                                    </h5>
                                )}
                                {view === 'search' && (
                                    <h5 style={{ margin: 0, fontWeight: 400, color: dark ? 'white' : 'black' }}>
                                        {searching ? 'Searching...' : `Results for "${query}"`}
                                    </h5>
                                )}
                            </div>
                            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} theme={theme} />
                        </div>
                    )}

                    {view === 'trash' && files.length > 0 && (
                        <div className="flex center between px-3 pt-2">
                            <span style={{ fontSize: 13, color: dark ? 'white' : 'gray' }}>
                                Items in trash will be deleted after 30 days
                            </span>
                            <button onClick={emptyTrash} className="btn btn-sm btn-outline-danger">
                                Empty trash
                            </button>
                        </div>
                    )}

                    <div className="p-3 grow scroll">
                        {view === 'home' ? homeView() : files.length === 0 ? (
                            <EmptyState currentView={view} isSearching={searching} theme={theme} />
                        ) : (
                            <FileList
                                files={files}
                                focusedIndex={focused}
                                setFocusedIndex={setFocused}
                                onOpenFile={open}
                                {...fileListProps}
                            />
                        )}
                    </div>
                </div>

                <DetailsPanel
                    file={detailsFile}
                    onClose={() => setDetailsFile(null)}
                    getOwnerDisplay={getOwner}
                    getFolderName={getFolder}
                    formatDate={fmtDate}
                    theme={theme}
                />
            </div>

            <ContextMenu
                contextMenu={menu}
                theme={theme}
                currentView={view}
                isOwner={isOwner}
                onClose={() => setMenu(null)}
                onOpen={open}
                onToggleStar={toggleStar}
                onDetails={openDetails}
                onShare={openShare}
                onRename={openRename}
                onMove={openMove}
                onDelete={trash}
                onRestore={restore}
                onPermanentDelete={permDelete}
                onRemoveAccess={removeAccess}
            />

            <NewItemModal
                show={!!newModal}
                type={newModal}
                name={newName}
                setName={setNewName}
                onClose={() => setNewModal(null)}
                onCreate={create}
                onUpload={uploadFile}
            />

            <FileModal
                file={openFile}
                content={content}
                setContent={setContent}
                isEditing={editing}
                setIsEditing={setEditing}
                isLoading={loading}
                canEdit={openFile && (isOwner(openFile) || openFile.role?.toLowerCase() === 'edit')}
                theme={theme}
                onClose={closeFile}
                onSave={save}
                onToggleStar={toggleStar}
            />

            <ShareModal
                show={!!shareModal}
                file={shareModal}
                email={shareEmail}
                setEmail={setShareEmail}
                permission={sharePerm}
                setPermission={setSharePerm}
                onClose={() => setShareModal(null)}
                onShare={share}
            />

            <MoveModal
                show={!!moveModal}
                file={moveModal}
                folders={folders}
                selectedFolder={moveTarget}
                setSelectedFolder={setMoveTarget}
                onClose={() => setMoveModal(null)}
                onMove={move}
            />

            <RenameModal
                show={!!renameModal}
                name={renameName}
                setName={setRenameName}
                onClose={() => setRenameModal(null)}
                onRename={rename}
            />
        </div>
    );
}
