const config = require('./config');
const mailgun = require('mailgun-js');
const mg = mailgun({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});

module.exports = {

    sendPasswordReset(recipient, url) {
        const data = {
            from: 'iCrowdTask <admin@icrowdtask.net>',
            to: recipient,
            subject: 'Hello',
            text: 'You have requested a password reset.'
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