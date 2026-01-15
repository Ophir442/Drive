const BASE_URL = 'http://localhost:3000/api';

export const api = {
    // Helper to get headers with JWT
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' // Include token if exists
        };
    },

    // --- User & Auth ---
    login: async (username, password) => {
        const res = await fetch(`${BASE_URL}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                gmail: username,
                password: password
            })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.text(); // Returns the JWT string
    },

    register: async (userData) => {
        const res = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Registration failed');
    },

    getUser: async (id) => {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
            headers: api.getHeaders()
        });
        return res.json();
    },

    // --- Files ---
    getFiles: async () => {
        const res = await fetch(`${BASE_URL}/files`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch files');
        return res.json();
    },

    createFile: async (fileData) => {
        const res = await fetch(`${BASE_URL}/files`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(fileData)
        });
        if (!res.ok) throw new Error('Failed to create file');
    },

    deleteFile: async (id) => {
        await fetch(`${BASE_URL}/files/${id}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
    },

    getFileContent: async (id) => {
        const res = await fetch(`${BASE_URL}/files/${id}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch file content');
        return res.json();
    },

    updateFile: async (id, data) => {
        const res = await fetch(`${BASE_URL}/files/${id}`, {
            method: 'PATCH',
            headers: api.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update file');
        return res.json();
    },

    getSharedFiles: async () => {
        const res = await fetch(`${BASE_URL}/files/shared`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch shared files');
        return res.json();
    },

    getStarredFiles: async () => {
        const res = await fetch(`${BASE_URL}/files/starred`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch starred files');
        return res.json();
    },

    getRecentFiles: async () => {
        const res = await fetch(`${BASE_URL}/files/recent`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch recent files');
        return res.json();
    },

    searchFiles: async (query) => {
        const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to search files');
        return res.json();
    },

    toggleStar: async (fileId) => {
        const res = await fetch(`${BASE_URL}/files/${fileId}/star`, {
            method: 'POST',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to toggle star');
        return res.json();
    },

    // Trash functions
    getTrashedFiles: async () => {
        const res = await fetch(`${BASE_URL}/files/trash`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch trashed files');
        return res.json();
    },

    restoreFile: async (fileId) => {
        const res = await fetch(`${BASE_URL}/files/${fileId}/restore`, {
            method: 'POST',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to restore file');
        return res.json();
    },

    permanentlyDeleteFile: async (fileId) => {
        const res = await fetch(`${BASE_URL}/files/${fileId}/permanent`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to permanently delete file');
    },

    removeAccess: async (fileId) => {
        const res = await fetch(`${BASE_URL}/files/${fileId}/access`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to remove access');
        return res.json();
    },

    emptyTrash: async () => {
        const res = await fetch(`${BASE_URL}/files/trash`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to empty trash');
        return res.json();
    },

    addPermission: async (fileID, email, permission = 'view') => {
        const res = await fetch(`${BASE_URL}/files/${fileID}/permissions`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ email: email, privilege: permission.toUpperCase() })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Share Error:", errorData);
            throw new Error(errorData.message || 'Failed to share file');
        }
    }
};