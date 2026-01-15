import Modal from './Modal';
import { Icon } from '../Icon';

export default function ShareModal({
    show,
    file,
    email,
    setEmail,
    permission,
    setPermission,
    onClose,
    onShare
}) {
    if (!file) return null;

    const footer = (
        <>
            <button className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="btn btn-primary" onClick={onShare} disabled={!email.trim()}>
                Share
            </button>
        </>
    );

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={`Share "${file.name || file.fileName}"`}
            width={450}
            footer={footer}
        >
            <div className="mb-3">
                <label className="form-label small text-muted">Add people</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label small text-muted">Permission</label>
                <div className="flex gap">
                    <button
                        className={`btn grow flex center gap ${permission === 'view' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPermission('view')}
                    >
                        <Icon
                            name="visibility"
                            size={16}
                            color={permission === 'view' ? 'white' : 'gray'}
                        />
                        Viewer
                    </button>
                    <button
                        className={`btn grow flex center gap ${permission === 'edit' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPermission('edit')}
                    >
                        <Icon
                            name="edit"
                            size={16}
                            color={permission === 'edit' ? 'white' : 'gray'}
                        />
                        Editor
                    </button>
                </div>
                <small className="text-muted mt-2 d-block">
                    {permission === 'view' ? 'Can only read' : 'Can modify'}
                </small>
            </div>
        </Modal>
    );
}
