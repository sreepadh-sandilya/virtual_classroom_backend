const paseto = require('paseto');
const { V4: { verify } } = paseto;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const secret_key = "E$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3424343244243o4uq0409uqujIODKQJNHDOLQJNDIUHO#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBASSFBASFHAFAHFBHABFHADBFE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3o4uq0409uqujIODKQJNHDOLQJNDIUHO#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBAE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)356536432424341#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBASSFBASFHAFAHFBHABFHADBFSSFBAE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3o4uq0409uqujIODKQJNHDOLQJNDIUHO#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBASSFBASFHAFAHFBHABFHADBFE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3o4uq0409uqujIODKQJNHDOLQJNDIUHO#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBASSFBASFHAFAHFBHABFHADBFSFHAFAHFBHABFHADE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3o4uq0409uqujIODKQJNHDOLQJNE$#^!$%!^$*!$(UHIANJKfnkjasnfkansdklandkOIJJ()#Q$)3o4uq0409uqujIODKQJNHDOLQJNDIUHO#984u32048024uhiusjJAbdsafdjsafhbBbhBFBVHFFIWJRQO9U432432843243284OIQJFKJNJBAHFB*($!)($*!(*!$#($*#!($&!HAFKAFJBAHFBAFDABHFBASSFBASFHAFAHFBHA"
// const jwt = require('jsonwebtoken');
async function resetPasswordValidator(req, res, next) {
    // console.log(req)
    const tokenHeader = req.headers.authorization;
    console.log(req.headers);
    const token = tokenHeader && tokenHeader.split(' ')[1];
    console.log("token:", token);

    if (tokenHeader == null || token == null) {
        res.status(401).send({
            "ERROR": "No Token. Warning." 
        });
        return;
    }

    const public_key = fs.readFileSync('C:/Users/win10/OneDrive/Desktop/backend/virtual_classroom_backend/middleware/key/public_key.pem');
    // console.log("public_key:", public_key);
    try {
        const payLoad = await verify(token, public_key);
        console.log(payLoad);
        if (payLoad["secret_key"] == secret_key) {
            req.body.authorization_tier = payLoad["userRole"];
            req.body.userEmail = payLoad["userEmail"];
            next(); 
            return;
        } else {
            res.status(401).send({
                "ERROR": "Unauthorized access. Warning."
            });
            return;
        }
    }  catch (err) {
        console.error(err);
        return res.status(401).send({ error: 'Token verification failed.' });
    }

}

module.exports = resetPasswordValidator;