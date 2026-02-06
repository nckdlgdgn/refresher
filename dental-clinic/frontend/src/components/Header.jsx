import React, { useState, useRef } from 'react';
import './Header.css';
import { API_URL } from '../config';

export default function Header({
    username,
    role,
    onNavigate,
    onLogout,
    profilePic,
    onProfilePicChange
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const fileInputRef = useRef(null);

    const roleLabels = {
        admin: { label: 'Administrator', icon: '👑', color: '#6366f1' },
        dentist: { label: 'Dentist', icon: '🦷', color: '#14b8a6' },
        staff: { label: 'Staff', icon: '👤', color: '#f59e0b' },
    };

    const roleInfo = roleLabels[role] || { label: role, icon: '👤', color: '#64748b' };

    const getInitial = () => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        setShowProfileMenu(!showProfileMenu);
    };

    const handleMenuItemClick = (action) => {
        setShowProfileMenu(false);
        if (action === 'profile') {
            onNavigate('Profile');
        } else if (action === 'logout') {
            onLogout();
        } else if (action === 'upload') {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                localStorage.setItem('profilePic', base64);
                onProfilePicChange && onProfilePicChange(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setShowProfileMenu(false);
        if (showProfileMenu) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showProfileMenu]);

    return (
        <header className="top-header">
            <div className="header-left">
                {/* Space for mobile hamburger handled by sidebar */}
            </div>

            <div className="header-right">
                {/* Settings Button */}
                <button
                    className="header-icon-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('Settings');
                    }}
                    title="Settings"
                >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                </button>

                {/* Profile Button */}
                <div className="profile-dropdown">
                    <button
                        className="header-profile-btn"
                        onClick={handleProfileClick}
                        title="Profile"
                    >
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="profile-avatar-img" />
                        ) : (
                            <span className="profile-avatar-initial">{getInitial()}</span>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
                            <div className="profile-menu-header">
                                <div className="profile-menu-avatar">
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile" />
                                    ) : (
                                        <span>{getInitial()}</span>
                                    )}
                                </div>
                                <div className="profile-menu-info">
                                    <span className="profile-menu-name">{username}</span>
                                    <span className="profile-menu-role" style={{ background: roleInfo.color }}>
                                        {roleInfo.icon} {roleInfo.label}
                                    </span>
                                </div>
                            </div>

                            <div className="profile-menu-divider"></div>

                            <button className="profile-menu-item" onClick={() => handleMenuItemClick('profile')}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                View Profile
                            </button>

                            <button className="profile-menu-item" onClick={() => handleMenuItemClick('upload')}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21,15 16,10 5,21" />
                                </svg>
                                Change Photo
                            </button>

                            <button className="profile-menu-item logout" onClick={() => handleMenuItemClick('logout')}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                    <polyline points="16,17 21,12 16,7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file input for profile picture upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </header>
    );
}
