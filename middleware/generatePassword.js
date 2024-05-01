const otpGenerator = require('otp-generator')

const generatePassword = () => {
    return otpGenerator.generate(10, {
        lowerCaseAlphabets: true, 
        upperCaseAlphabets: true, 
        specialChars: true,
        digits: true
    });
}

module.exports = generatePassword;