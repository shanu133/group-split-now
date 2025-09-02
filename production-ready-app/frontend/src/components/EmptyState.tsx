import React from 'react';

const EmptyState: React.FC<{ message?: string }> = ({ message = "No data available." }) => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>{message}</h2>
            <p>Please check back later or try a different search.</p>
        </div>
    );
};

export default EmptyState;