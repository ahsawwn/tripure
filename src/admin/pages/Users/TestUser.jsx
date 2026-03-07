import React from 'react';

const TestUser = () => {
    return (
        <div style={{ 
            padding: '40px', 
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            margin: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ 
                fontSize: '32px', 
                color: '#0369a1',
                marginBottom: '16px'
            }}>
                ✅ TEST PAGE IS WORKING!
            </h1>
            <p style={{ fontSize: '18px', color: '#075985' }}>
                If you can see this, React is rendering properly.
            </p>
            <div style={{ 
                marginTop: '24px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '4px'
            }}>
                <p style={{ color: '#374151' }}>
                    Current time: {new Date().toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default TestUser;