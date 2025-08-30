import React from 'react';
import { formatCurrency } from '../utils/helpers';

/**
 * A reusable component for displaying prices in Indian Rupees (₹)
 * @param {Object} props - Component props
 * @param {number} props.amount - The amount to display
 * @param {boolean} props.bold - Whether to display the price in bold
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @returns {React.ReactElement} - The price component
 */
const RupeePrice = ({ amount, bold = false, className = '', size = 'md' }) => {
    // Handle null/undefined values
    if (amount === undefined || amount === null) {
        amount = 0;
    }
    
    // Default styling based on size
    let sizeClass = 'text-base'; // Default medium size
    if (size === 'sm') sizeClass = 'text-sm';
    if (size === 'lg') sizeClass = 'text-xl';
    if (size === 'xl') sizeClass = 'text-2xl';
    
    const boldClass = bold ? 'font-bold' : '';
    
    return (
        <span className={`${sizeClass} ${boldClass} ${className}`}>
            ₹{typeof amount === 'number' ? amount.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0
            }) : '0'}
        </span>
    );
};

export default RupeePrice;
