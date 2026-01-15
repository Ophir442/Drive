import Modal from './Modal';
import { Icon } from '../Icon';

export default function MoveModal({
    show,
    file,
    folders,
    selectedFolder,
    setSelectedFolder,
    onClose,
    onMove
}) {
    if (!file) return null;

    const getId = (f) => f.FID || f.id || f._id;

    const footer = (
        <>
            <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="btn btn-primary" onClick={onMove}>
                Move
            </button>
        </>
    );

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={`Move "${file.name || file.fileName}"`}
            footer={footer}
        >
            <label className="form-label small text-muted">Select destination</label>
            <div className="folder-list list-group">
                <button
                    type="button"
                    className={`list-group-item list-group-item-action flex center gap ${selectedFolder === '' ? 'active' : ''}`}
                    onClick={() => setSelectedFolder('')}
                >
                    <Icon
                        name="folder"
                        size={18}
                        color={selectedFolder === '' ? 'white' : 'gray'}
                    />
                    My Drive
                </button>

                {folders.map(f => {
                    const id = getId(f);
                    const sel = selectedFolder === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            className={`list-group-item list-group-item-action flex center gap ${sel ? 'active' : ''}`}
                            onClick={() => setSelectedFolder(id)}
                        >
                            <Icon name="folder" size={18} color={sel ? 'white' : 'gray'} />
                            {f.name || f.fileName}
                        </button>
                    );
                })}

                {folders.length === 0 && (
                    <div className="list-group-item text-muted">No folders</div>
                )}
            </div>
        </Modal>
    );
}
