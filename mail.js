const https = require("https");
const config = require("./config");

module.exports = {
    // SUbscribe the user to mailing list and send the welcome email (set up in Mailchimp)
    subscribe(first_name, last_name, email) {
        const data = {
            members:[{
                email_address: email,
                status : 'subscribed',
                merge_fields:{
                    FNAME: first_name,
                    LNAME:last_name
                }
            }]
        }
        jsonData = JSON.stringify(data)
        
        const url = 'https://us17.api.mailchimp.com/3.0/lists/' + config.list_id;
        const options = {
            method: 'POST',
            auth: 'iCrowdTask:' + config.api_key
        }
    
        // Send the request to Mailchimp
        const request = https.request(url, options , (response)=>{
            response.on('data', (data) => {
                console.log(JSON.parse(data))
            })
        })
        request.write(jsonData)
        request.end()
    }
}