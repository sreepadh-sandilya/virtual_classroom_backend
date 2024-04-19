const paseto = require('paseto');
const {V4: {sign}} = paseto;
const fs = require('fs');

const secret_key = "f02f38c30add021a819cd28df4fbdd4f535e10d747ae11dc5b45f31966d25c5e"

async function generateToken(data) {
    data.secret_key = secret_key;
    const private_key = fs.readFileSync('./middleware/key/private_key.pem');
    var token = "";
    token = await sign(data, private_key, { expiresIn: '240 m' });

    return token;
}

module.exports = {generateToken};