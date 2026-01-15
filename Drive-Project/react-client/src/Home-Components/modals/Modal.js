import { Icon } from '../Icon';

export default function Modal({
    show,
    onClose,
    title,
    children,
    footer,
    width = 400
}) {
    if (!show) return null;

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal-card shadow p-4"
                style={{ width }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex center between mb-3">
                    <h5 className="m-0">{title}</h5>
                    <button className="btn btn-sm" onClick={onClose}>
                        <Icon name="close" size={18} color="gray" />
                    </button>
                </div>
                <div className="mb-3">{children}</div>
                {footer && (
                    <div className="flex gap" style={{ justifyContent: 'flex-end' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
