import { useState, useRef } from 'react';
import Modal from './Modal';
import { Icon } from '../Icon';

export default function NewItemModal({
    show,
    type,
    name,
    setName,
    onClose,
    onCreate,
    onUpload
}) {
    const isFolder = type === 'folder';
    const [mode, setMode] = useState('create'); // 'create' or 'upload'
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setName(file.name);
        }
    };

    const handleSubmit = () => {
        if (isFolder) {
            onCreate();
        } else if (mode === 'create') {
            onCreate();
        } else if (mode === 'upload' && selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpload(selectedFile.name, reader.result, selectedFile.type);
                handleClose();
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleClose = () => {
        setMode('create');
        setSelectedFile(null);
        onClose();
    };

    const footer = (
        <>
            <button className="btn btn-outline-secondary" onClick={handleClose}>
                Cancel
            </button>
            <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!isFolder && mode === 'upload' && !selectedFile}
            >
                {isFolder ? 'Create' : (mode === 'create' ? 'Create' : 'Upload')}
            </button>
        </>
    );

    if (isFolder) {
        return (
            <Modal
                show={show}
                onClose={handleClose}
                title="New folder"
                footer={footer}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder="Untitled folder"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
            </Modal>
        );
    }

    return (
        <Modal
            show={show}
            onClose={handleClose}
            title="New file"
            footer={footer}
        >
            <div className="mb-3">
                <div className="btn-group w-100" role="group">
                    <button
                        type="button"
                        className={`btn ${mode === 'create' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => { setMode('create'); setSelectedFile(null); }}
                    >
                        <Icon name="edit" size={16} color={mode === 'create' ? 'white' : 'dodgerblue'} />
                        <span className="ms-2">Create empty</span>
                    </button>
                    <button
                        type="button"
                        className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setMode('upload')}
                    >
                        <Icon name="upload" size={16} color={mode === 'upload' ? 'white' : 'dodgerblue'} />
                        <span className="ms-2">Upload file</span>
                    </button>
                </div>
            </div>

            {mode === 'create' ? (
                <input
                    type="text"
                    className="form-control"
                    placeholder="Untitled document"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                />
            ) : (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                    <div
                        className="border rounded p-4 text-center"
                        style={{
                            cursor: 'pointer',
                            background: selectedFile ? '#e8f5e9' : '#f5f5f5',
                            borderStyle: 'dashed'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {selectedFile ? (
                            <div>
                                <Icon
                                    name={selectedFile.type.startsWith('image/') ? 'image' : 'picture_as_pdf'}
                                    size={32}
                                    color={selectedFile.type.startsWith('image/') ? '#4285f4' : '#ea4335'}
                                />
                                <p className="mb-0 mt-2">{selectedFile.name}</p>
                                <small className="text-muted">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </small>
                            </div>
                        ) : (
                            <div>
                                <Icon name="cloud_upload" size={32} color="gray" />
                                <p className="mb-0 mt-2 text-muted">Click to select image or PDF</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}
