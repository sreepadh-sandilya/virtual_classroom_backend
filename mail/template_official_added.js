const TEMPLATE_OFFICIAL_ADDED = (officialName, officialEmail, officialPassword) => {
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>[Official Added] Virtual Classroom</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
        </style>
    </head>

    <body>
        <div style="margin: 0 auto; width: 80%; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
            <h1 style="text-align: center;">Official Added</h1>
            <p style="font-size: 1.2rem;">Hello ${officialName},</p>
            <p style="font-size: 1.2rem;">Your account has been created successfully. Here are your login credentials:</p>
            <p style="font-size: 1.2rem;">Email: ${officialEmail}</p>
            <p style="font-size: 1.2rem;">Password: ${officialPassword}</p>

            <p style="font-size: 1.2rem;">Please login to your account and change your password immediately.</p>
            <p style="font-size: 1.2rem;">Thank you.</p>
        </div>
    </body>

    </html>
    `
}

module.exports = TEMPLATE_OFFICIAL_ADDED;