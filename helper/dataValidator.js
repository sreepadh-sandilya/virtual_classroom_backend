function validateEmail(email) {
    // Regular expression pattern for validating email addresses
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check if the email matches the pattern
    return pattern.test(email);
}
module.exports = [validateEmail];