import React, { useEffect, useState } from 'react';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

const Home: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data'); // Adjust the API endpoint as needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (data.length === 0) {
        return <EmptyState message="No data available." />;
    }

    return (
        <div>
            <h1>Home Page</h1>
            <ul>
                {data.map((item, index) => (
                    <li key={index}>{item.name}</li> // Adjust the property as needed
                ))}
            </ul>
        </div>
    );
};

export default Home;