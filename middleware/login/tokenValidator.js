const paseto = require('paseto');
const { V4: { verify } } = paseto;
const fs = require('fs');
const secret_key = "f02f38c30add021a819cd28df4fbdd4f535e10d747ae11dc5b45f31966d25c5e"

async function validateToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (tokenHeader == null || token == null) {
        res.status(401).send({
            "message": "Unauthorized access."
        });
        return;
    }

    const public_key = fs.readFileSync('./middleware/key/public_key.pem');
    try {
        const payLoad = await verify(token, public_key);

        if (typeof (payLoad["userRole"]) != 'string' || (payLoad["userRole"] != "S" && payLoad["userRole"] != "M") || typeof (payLoad["userId"]) != 'number') {
            res.status(401).send({
                "message": "Unauthorized access."
            });
            return;
        }

        if (payLoad["secret_key"] == secret_key) {
            req.body.userRole = payLoad["userRole"];
            req.body.userId = payLoad["userId"];
            next();
            return;
        } else {
            res.status(401).send({
                "message": "Unauthorized access."
            });
            return;
        }
    } catch (err) {
        res.status(401).send({
            "message": "Unauthorized access."
        });
        return;
    }

}

module.exports = validateToken;