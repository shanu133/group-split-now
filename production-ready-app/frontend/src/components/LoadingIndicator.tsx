import React from 'react';

const LoadingIndicator: React.FC = () => {
    return (
        <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading, please wait...</p>
        </div>
    );
};

export default LoadingIndicator;