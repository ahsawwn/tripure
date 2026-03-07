const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testSearch() {
    try {
        const token = jwt.sign(
            { id: 1, email: 'admin@tripure.com', username: 'superadmin', role: 'super_admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        const response = await axios.get('http://localhost:5000/api/search?q=Vatistsa', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Search API Response:");
        console.log(JSON.stringify(response.data, null, 2));

    } catch (e) {
        console.error("Test failed", e.response ? e.response.data : e.message);
    }
}

testSearch();
