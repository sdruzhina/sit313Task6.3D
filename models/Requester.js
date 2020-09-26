const mongoose = require("mongoose");
const validator = require("validator");
const passportLocalMongoose = require('passport-local-mongoose');

// Bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

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
        // password: {
        //     type: String,
        //     required: [true, 'This field is required'],
        //     trim: true,
        //     minlength: 6,
        //     maxlength: 30
        // },
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
        }  
    }
)

// Add the Passport local plugin
requesterSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// requesterSchema.virtual('passwordConfirm')
// .get(function() {
//   return this._passwordConfirm;
// })
// .set(function(value) {
//   this._passwordConfirm = value;
// });

// Check that the password matches password confirmation
// requesterSchema.path('password').validate(function(v) {
//     if (this.password !== this.passwordConfirm) {
//         this.invalidate('passwordConfirm', 'Passwords must match.');
//     }
// }, null);

// Use Bcrypt to hash the password
// requesterSchema.pre("save", function(next) {
//     if(!this.isModified("password")) {
//         return next();
//     }
//     this.password = bcrypt.hashSync(this.password, SALT_ROUNDS);
//     next();
// });

module.exports  =  mongoose.model("Requester", requesterSchema)
