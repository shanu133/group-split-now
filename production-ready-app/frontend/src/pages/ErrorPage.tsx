import React from 'react';

const ErrorPage: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', margin: '50px' }}>
            <h1>Something Went Wrong</h1>
            <p>We're sorry, but an unexpected error has occurred. Please try again later.</p>
            <a href="/">Go back to Home</a>
        </div>
    );
};

export default ErrorPage;