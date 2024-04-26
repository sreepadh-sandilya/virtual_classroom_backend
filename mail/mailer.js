const mailer = require('nodemailer');
const TEMPLATE_PWRESET_OTP = require('./template_otp');

const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'sreepadhkadapa@gmail.com',
        pass: 'lixjaiyrczgwgqqr'
    }
});

module.exports = {
    reset_PW_OTP: (userName, otp, userEmail) => {
        var mailOptions = {
            from: {
                name: "Virtual Classroom",
                address: 'auth.amrita.placements@gmail.com'
            },
            to: userEmail,
            subject: '[Forgot Password OTP] Virtual Classroom',
            html: TEMPLATE_PWRESET_OTP(otp, userName)
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('PasswordResetOTP Email sent: ' + userEmail);
            }
        });
    },    
}

// // File for Mailer
// const nodemailer = require('nodemailer');

// // Function to send password reset OTP via email
// function reset_PW_OTP(name, otp, userEmail) {
//     // Create a nodemailer transporter
//     const transporter = nodemailer.createTransport({
        
//         service: 'gmail', // e.g., 'gmail', 'outlook', etc.
//         port:465,
//         secure:true,
//         logger:true,
//         debug:true,
//         secureConnection:false, 
//         auth: {
//             user: 'sreepadhkadapa@gmail.com',
//             pass: 'lixj aiyr czgw gqqr'
//         },
//         tls:{
//             rejectUnauthorized:true
//         }
//     });


 
//     // Email content 
//     const mailOptions = {
//         from: 'sreepadhkadapa@gmail.com',
//         to: userEmail, 
//         subject: 'Password Reset OTP',
//         text: `Hello ${name}, Your OTP for password reset is ${otp}. This OTP is valid for a short period of time. Please use it to reset your password.`,
//         // You can also use HTML content instead of plain text
//         // html: `<p>Hello ${name}, Your OTP for password reset is <strong>${otp}</strong>. Please use it to reset your password.</p>`
//     };

//     // Send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log('Error sending email:', error);
//         } else {
//             console.log('Email sent:', info.response); 
//         }
//     });
// }

// // Example usage


// module.exports=reset_PW_OTP;


