import { useState } from 'react';
import { Icon, DriveLogo } from './Icon';
import { DefaultAvatar } from '../Login';

export default function Header({
    theme,
    toggleTheme,
    user,
    logout,
    searchQuery,
    setSearchQuery,
    onSearch,
    onClearSearch,
    currentView,
    onGoHome
}) {
    const dark = theme === 'dark';
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <div className="header flex center">
            <div
                className="flex center gap pointer"
                style={{ width: 220 }}
                onClick={onGoHome}
            >
                <DriveLogo size={40} />
                <span style={{ fontSize: 22, color: dark ? 'white' : 'gray' }}>Drive</span>
            </div>

            <div
                className="search-box grow mx-4 px-4"
                style={{
                    maxWidth: 720,
                    background: dark ? 'dimgray' : 'whitesmoke',
                    border: '1px solid lightgray'
                }}
            >
                <Icon name="search" size={22} color="gray" />
                <input
                    type="text" 
                    className={`form-control border-0 bg-transparent ms-3 ${dark ? 'text-white' : ''}`}
                    placeholder="Search in Drive"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={onSearch}
                />
                {(currentView === 'search' || searchQuery) && (
                    <button className="btn btn-sm p-0 ms-2" onClick={onClearSearch}>
                        <Icon name="close" size={20} color="gray" />
                    </button>
                )}
            </div>

            <div className="flex center gap" style={{ marginLeft: 180 }}>
                <button
                    onClick={toggleTheme}
                    className="btn btn-sm rounded-circle p-2"
                    style={{ width: 40, height: 40 }}
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <Icon
                        name={dark ? 'light_mode' : 'dark_mode'}
                        size={20}
                        color={dark ? 'gold' : 'gray'}
                    />
                </button>

                <div className="position-relative">
                    <button
                        className="btn btn-sm p-0 rounded-circle"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{ width: 40, height: 40, overflow: 'hidden' }}
                        title="Account"
                    >
                        {user?.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt=""
                                className="rounded-circle"
                                style={{ width: 36, height: 36, objectFit: 'cover' }}
                            />
                        ) : (
                            <DefaultAvatar name={user?.displayName || 'U'} size={36} />
                        )}
                    </button>

                    {showUserMenu && (
                        <>
                            <div
                                className="position-fixed"
                                style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div
                                className={`position-absolute shadow rounded py-2 ${dark ? 'bg-dark' : 'bg-white'}`}
                                style={{ right: 0, top: '100%', marginTop: 8, width: 220, zIndex: 1000 }}
                            >
                                <div className="px-3 py-2 text-center" style={{ borderBottom: `1px solid ${dark ? '#444' : '#eee'}` }}>
                                    {user?.profilePic ? (
                                        <img
                                            src={user.profilePic}
                                            alt=""
                                            className="rounded-circle mb-2"
                                            style={{ width: 60, height: 60, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center mb-2">
                                            <DefaultAvatar name={user?.displayName || 'U'} size={60} />
                                        </div>
                                    )}
                                    <div style={{ fontWeight: 500, color: dark ? 'white' : 'black' }}>
                                        Hi, {user?.displayName || 'User'}!
                                    </div>
                                    <small style={{ color: dark ? '#9aa0a6' : 'gray' }}>
                                        {user?.username || 'user@email.com'}
                                    </small>
                                </div>
                                <button
                                    className={`btn btn-link text-start w-100 px-3 py-2 flex center gap ${dark ? 'text-white' : 'text-dark'}`}
                                    style={{ textDecoration: 'none' }}
                                    onClick={() => { setShowUserMenu(false); logout(); }}
                                >
                                    <Icon name="logout" size={20} color={dark ? 'white' : 'gray'} />
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
