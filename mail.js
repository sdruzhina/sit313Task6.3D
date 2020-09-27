const config = require('./config');
const mailgun = require('mailgun-js');
const mg = mailgun({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});

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

    // // Subscribe the user to mailing list and send the welcome email (set up in Mailchimp)
    // subscribe(first_name, last_name, email) {
    //     const data = {
    //         members:[{
    //             email_address: email,
    //             status : 'subscribed',
    //             merge_fields:{
    //                 FNAME: first_name,
    //                 LNAME:last_name
    //             }
    //         }]
    //     }
    //     jsonData = JSON.stringify(data)
        
    //     const url = 'https://us17.api.mailchimp.com/3.0/lists/' + config.list_id;
    //     const options = {
    //         method: 'POST',
    //         auth: 'iCrowdTask:' + config.api_key
    //     }
    
    //     // Send the request to Mailchimp
    //     const request = https.request(url, options , (response)=>{
    //         response.on('data', (data) => {
    //             console.log(JSON.parse(data))
    //         })
    //     })
    //     request.write(jsonData)
    //     request.end()
    // }
}