// Format date to a readable string
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
};

// Get relative time (e.g., "2 hours ago", "3 days ago")
export const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// Check if date is today
export const isToday = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
};

// Check if date is within last 7 days
export const isWithinLastWeek = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return date >= weekAgo;
};

// Get days until expiry
export const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffInMs = expiry - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
};

// Format date in short format (for compatibility)
export const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
};
