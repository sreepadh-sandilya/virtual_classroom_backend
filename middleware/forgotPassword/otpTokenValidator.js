const paseto = require('paseto');
const { V4: { verify } } = paseto;
const fs = require('fs');
const secret_key = "f02f38c30add021a819cd28df4fbdd4f535e10d747ae11dc5b45f31966d25c5e"

async function otpTokenValidator(req, res, next) {
    const tokenHeader = req.headers.authorization;
    // console.log(req.headers);
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (tokenHeader == null || token == null) {
        res.status(401).send({
            "message": "No Token. Warning." 
        });
        return;
    }

    const public_key = fs.readFileSync('./middleware/key/public_key.pem');
    try {
        const payLoad = await verify(token, public_key);

        if (typeof (payLoad["userRole"]) != 'string' || (payLoad["userRole"] != "S" && payLoad["userRole"] != "M") || typeof (payLoad["userId"]) != 'number' || typeof (payLoad["userEmail"]) != 'string') {
            res.status(401).send({
                "message": "Unauthorized access. Warning."
            });
            return;
        }


        if (payLoad["secret_key"] == secret_key) {

            req.body.userId = payLoad["userId"];
            req.body.userEmail = payLoad["userEmail"];
            req.body.userRole = payLoad["userRole"];

            next(); 
            return;
        } else {
            res.status(401).send({
                "message": "Unauthorized access. Warning."
            });
            return;
        }
    }  catch (err) {
        // console.error(err);
        return res.status(401).send({ message: 'Unauthorized access.' });
    }

}

module.exports = otpTokenValidator;