/**
 * Helper function to load external scripts dynamically
 * @param {string} src - URL of the script to load
 * @returns {Promise} - Resolves when the script is loaded
 */
export const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

/**
 * Format currency amounts in Indian Rupees (₹)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} - Formatted amount string with ₹ symbol
 */
export const formatCurrency = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null) return 'N/A';
    
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
};

/**
 * Format date to locale string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format option ('short', 'medium', 'long', 'full')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
    if (!date) return 'N/A';
    
    try {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-IN', { 
            dateStyle: format 
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

/**
 * Generate a random string for transaction IDs etc.
 * @param {number} length - Length of the string
 * @returns {string} - Random alphanumeric string
 */
export const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
};
