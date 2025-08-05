const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test token verification
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhcmloYXJpc2gyNjA0QGdtYWlsLmNvbSIsImlkIjoiNjc3ZjU5YzI4YzY4YzI2ZjY4NzY4NzY4IiwiYWNjb3VudFR5cGUiOiJBZG1pbiIsImlhdCI6MTczNjQ0NzQ5NCwiZXhwIjoxNzM2NTMzODk0fQ.example"; // Replace with actual token from localStorage

console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
} catch (error) {
    console.log('Token verification failed:', error.message);
}
