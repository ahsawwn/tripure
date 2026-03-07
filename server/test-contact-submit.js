const axios = require('axios');

async function testSubmit() {
    try {
        const res = await axios.post('http://localhost:5000/api/contact/submit', {
            name: 'Test User',
            email: 'test@example.com',
            message: 'This is a test message from the testing script.'
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error:', e.response ? e.response.data : e.message);
    }
}
testSubmit();
