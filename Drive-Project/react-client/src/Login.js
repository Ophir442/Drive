import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import { AuthContext, ThemeContext } from './App';

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

function DefaultAvatar({ name, size = 80 }) {
    const letter = (name || 'U')[0].toUpperCase();
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF5722'];
    const colorIndex = letter.charCodeAt(0) % colors.length;

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: colors[colorIndex],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.45,
                fontWeight: 500,
                color: 'white'
            }}
        >
            {letter}
        </div>
    );
}

export default function Login() {
    const savedUsername = localStorage.getItem('username') || '';
    const savedPic = localStorage.getItem('profilePic');
    const savedName = localStorage.getItem('displayName');

    const [username, setUsername] = useState(savedUsername);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const { setUser } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const dark = theme === 'dark';

    useEffect(() => {
        if (savedUsername && passwordRef.current) {
            passwordRef.current.focus();
        } else if (usernameRef.current) {
            usernameRef.current.focus();
        }
    }, [savedUsername]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await api.login(username, password);
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);

            const userData = await api.getUser(token);
            localStorage.setItem('displayName', userData.name || username);
            localStorage.setItem('profilePic', userData.image || '');

            setUser({
                username,
                displayName: userData.name || username,
                profilePic: userData.image || null
            });

            navigate('/');
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    const forgetMe = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('profilePic');
        localStorage.removeItem('displayName');
        window.location.reload();
    };

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

                {savedUsername && savedName ? (
                    <div className="text-center mb-4">
                        {savedPic ? (
                            <img
                                src={savedPic}
                                alt="Profile"
                                className="rounded-circle mb-3"
                                style={{ width: 80, height: 80, objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="d-flex justify-content-center mb-3">
                                <DefaultAvatar name={savedName} size={80} />
                            </div>
                        )}
                        <h4 style={{ color: dark ? 'white' : '#202124', fontWeight: 400 }}>Welcome back</h4>
                        <p style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 14 }}>{savedName}</p>
                    </div>
                ) : (
                    <div className="text-center mb-4">
                        <h4 style={{ color: dark ? 'white' : '#202124', fontWeight: 400, marginBottom: 8 }}>Sign in</h4>
                        <p style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 16 }}>to continue to Drive</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger py-2" style={{ fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            ref={usernameRef}
                            type="text"
                            className={`form-control ${dark ? 'dark-input' : ''}`}
                            placeholder="Email"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            ref={passwordRef}
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control ${dark ? 'dark-input' : ''}`}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                style={{ marginRight: 8 }}
                            />
                            <span style={{ fontSize: 14, color: dark ? '#9aa0a6' : '#5f6368' }}>Show password</span>
                        </label>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <Link
                            to="/register"
                            style={{ color: '#1a73e8', textDecoration: 'none', fontSize: 14 }}
                        >
                            Create account
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
                            Sign in
                        </button>
                    </div>
                </form>

                {savedUsername && (
                    <div className="text-center mt-4">
                        <button
                            onClick={forgetMe}
                            className="btn btn-link"
                            style={{ color: dark ? '#9aa0a6' : '#5f6368', fontSize: 13, textDecoration: 'none' }}
                        >
                            Not you? Sign in with a different account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export { DefaultAvatar };
