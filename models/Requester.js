const mongoose = require("mongoose");
const validator = require("validator");
const passportLocalMongoose = require('passport-local-mongoose');

const requesterSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        },
        firstName: {
            type: String,
            required: [true, 'This field is required']
        },
        lastName: {
            type: String,
            required: [true, 'This field is required']
        },
        email: {
            type: String,
            trim: true,
            required: [true, 'This field is required'],
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)){
                    throw new Error('Email is not valid!');
                }
            }
        },
        address1: {
            type: String,
            required: false,
            trim: true
        },
        address2: String,
        city: {
            type: String,
            trim: true,
            required: false
        },
        state: {
            type: String,
            required: false,
            validate: [
                function (value) {
                    const states = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
                    if (this.country === 'AU') {
                        return states.includes(value);
                    }
                    else {
                        return true;
                    }
                }
            ]
        },
        postcode: {
            type: String,
            trim: true
        },
        mobile: {
            type: String,
            trim: true
        },  
        createdAt: {
            type: Date
        },
        resetToken: {
            type: String,
            required: false
        }
    }
)

// Add the Passport local plugin
requesterSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports  =  mongoose.model("Requester", requesterSchema)
