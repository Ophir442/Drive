import Modal from './Modal';

export default function RenameModal({
    show,
    name,
    setName,
    onClose,
    onRename
}) {
    const footer = (
        <>
            <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="btn btn-primary" onClick={onRename} disabled={!name.trim()}>
                Rename
            </button>
        </>
    );

    return (
        <Modal show={show} onClose={onClose} title="Rename" footer={footer}>
            <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onRename()}
                autoFocus
            />
        </Modal>
    );
}
