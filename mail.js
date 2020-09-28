const config = require('./config');
const mailgun = require('mailgun-js');
const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY || config.mailgun.api_key,  domain: process.env.MAILGUN_DOMAIN || config.mailgun.domain});

module.exports = {

    sendPasswordReset(email, name, url) {
        
    // Email Template
        const body = `
            <p>Dear ${name},</p>
            <p>We have received a password reset request for your acount.</p>
            <p>Please use the following link to reset your password:</p>
            <a href=${url}>${url}</a>
            <p>This link will expire within 30 minutes.</p>
            <p>If this was not requested by you, please ignore this email.</p>
            <p>Kind regards, the iCrowdTask team.</p>`;

        const data = {
            from: 'iCrowdTask <admin@icrowdtask.net>',
            to: email,
            subject: 'Password Reset',
            html: body
        };
        
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
    }

}