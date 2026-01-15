import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { AuthContext, ThemeContext } from './App';
import { DefaultAvatar } from './Login';

function GoogleLogo({ size = 48 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
    );
}

export default function Register() {
    const [formData, setFormData] = useState({
        gmail: '',
        name: '',
        password: '',
        confirmPassword: '',
        picture: ''
    });
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const emailRef = useRef(null);
    const { setUser } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const dark = theme === 'dark';

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, picture: reader.result });
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, picture: '' });
        setPreview(null);
    };

    const validate = () => {
        if (!formData.gmail.includes('@')) return "Please enter a valid email";
        if (!formData.name.trim()) return "Please enter your name";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (!/^[a-zA-Z0-9]+$/.test(formData.password)) return "Password must contain only letters and numbers";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return setError(err);

        try {
            await api.register({
                gmail: formData.gmail,
                name: formData.name,
                password: formData.password,
                image: formData.picture || '' // Empty string if no picture (will use default avatar)
            });

            const token = await api.login(formData.gmail, formData.password);

            localStorage.setItem('token', token);
            localStorage.setItem('username', formData.gmail);
            localStorage.setItem('displayName', formData.name);
            localStorage.setItem('profilePic', formData.picture || '');

            setUser({
                username: formData.gmail,
                displayName: formData.name,
                profilePic: formData.picture || null
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setError("Registration failed. User may already exist.");
        }
    };

    const updateField = (field, value) => setFormData({ ...formData, [field]: value });

    const inputStyle = {
        backgroundColor: dark ? 'transparent' : 'white',
        border: `1px solid ${dark ? '#5f6368' : '#dadce0'}`,
        color: dark ? 'white' : '#202124',
        padding: '14px 16px',
        borderRadius: 4
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: dark ? '#202124' : '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
            }}
        >
            <div
                style={{
                    backgroundColor: dark ? '#202124' : 'white',
                    border: `1px solid ${dark ? '#5f6368' : '#dadce0'}`,
                    borderRadius: 8,
                    padding: '48px 40px',
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                <div className="text-center mb-4">
                    <GoogleLogo size={48} />
                </div>

                <div className="text-center mb-4">
                    <h4 style={{ color: dark ? 'white' : '#202124', fontWeight: 400, marginBottom: 8 }}>Create account</h4>
                    <p style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 16 }}>to continue to Drive</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2" style={{ fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            ref={emailRef}
                            type="email"
                            className={`form-control ${dark ? 'dark-input' : ''}`}
                            placeholder="Email"
                            value={formData.gmail}
                            onChange={e => updateField('gmail', e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className={`form-control ${dark ? 'dark-input' : ''}`}
                            placeholder="Full name"
                            value={formData.name}
                            onChange={e => updateField('name', e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="row mb-2">
                        <div className="col-6">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`form-control ${dark ? 'dark-input' : ''}`}
                                placeholder="Password"
                                value={formData.password}
                                onChange={e => updateField('password', e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div className="col-6">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`form-control ${dark ? 'dark-input' : ''}`}
                                placeholder="Confirm"
                                value={formData.confirmPassword}
                                onChange={e => updateField('confirmPassword', e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <small style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 12 }}>
                            Use 8 or more characters with only letters and numbers
                        </small>
                        <label className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                style={{ marginRight: 6 }}
                            />
                            <span style={{ fontSize: 12, color: dark ? '#9aa0a6' : '#5f6368' }}>Show</span>
                        </label>
                    </div>

                    <div className="mb-4">
                        <label style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 14, marginBottom: 8, display: 'block' }}>
                            Profile picture (optional)
                        </label>
                        <div className="d-flex align-items-center gap-3">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                    }}
                                />
                            ) : (
                                <DefaultAvatar name={formData.name || 'U'} size={60} />
                            )}
                            <div>
                                <input
                                    type="file"
                                    id="profilePic"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <label
                                    htmlFor="profilePic"
                                    className="btn btn-sm"
                                    style={{
                                        border: `1px solid ${dark ? '#5f6368' : '#dadce0'}`,
                                        color: '#1a73e8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {preview ? 'Change' : 'Upload'}
                                </label>
                                {preview && (
                                    <button
                                        type="button"
                                        className="btn btn-sm ms-2"
                                        onClick={removeImage}
                                        style={{ color: dark ? '#9aa0a6' : '#5f6368' }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                        <small style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 12 }}>
                            If no picture is uploaded, your initial will be used
                        </small>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <Link
                            to="/login"
                            style={{ color: '#1a73e8', textDecoration: 'none', fontSize: 14 }}
                        >
                            Sign in instead
                        </Link>
                        <button
                            type="submit"
                            className="btn"
                            style={{
                                backgroundColor: '#1a73e8',
                                color: 'white',
                                fontWeight: 500,
                                padding: '10px 24px',
                                borderRadius: 4
                            }}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
