

async function tokenValidator(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (tokenHeader == null || token == null) {
        res.status(401).send({
            "ERROR": "No Token. Warning."
        });
        return;
    }

    const public_key = fs.readFileSync('C:/Users/win10/OneDrive/Desktop/backend/virtual_classroom_backend/middleware/key/public_key.pem');
    try {
        const payLoad = await verify(token, public_key);
        if (payLoad["secret_key"] == secret_key) {

            req.authorization_tier = payLoad["userRole"];
            req.body.userEmail = payLoad["userEmail"];
            req.body.userRole = payLoad["userRole"];

            next();
            return;
        } else {
            res.status(401).send({
                "ERROR": "Unauthorized access. Warning."
            });
            return;
        }
    } catch (err) {
        res.status(401).send({
            "ERROR": "Unauthorized access. Warning."
        });
        return;
    }

}
module.exports = tokenValidator;