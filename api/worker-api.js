var express  = require('express');
var router = express.Router();
const https = require("https");
const bodyParser = require("body-parser");
const Worker = require("../models/Worker");

// Bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Get all workers
router.get('/workers', (req, res) => {
    Worker.find((err, workerList) => {
        if (err) {
            res.json(err);
        }
        else {
            res.json(workerList);
        }
    });
});

// Create a new worker
router.post('/workers', (req, res) => {
    const worker = new Worker({
        country: req.body.country,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        postcode: req.body.postcode,
        mobile: req.body.mobile
    });
    worker.save((err) => {
        if (err) {
            res.json(err);
        }
        else {
            res.json({ 
                status: 'success', 
                message: 'Worker successfully added.' 
            })
        }
    });
});

// Delete all workers
router.delete('/workers', (req, res) => {
    Worker.deleteMany((err) => {
        if (err) {
            res.json(err);
        }
        else {
            res.json({ 
                status: 'success', 
                message: 'All workers deleted.' 
            });
        }
    });
});

// Get a specific worker by id
router.get('/workers/:id', (req, res) => {
    Worker.findOne({ _id: req.params.id }, (err, worker) => {
        if (worker) {
            res.json(worker);
        }
        else {
            res.json({ 
                status: 'error', 
                message: 'Worker not found.' 
            });
        }
    });
});

// Update a specific worker by id (overwrite entire record)
router.put('/workers/:id', (req, res) => {
        Worker.updateOne(
            { _id: req.params.id },
            {
                country: req.body.country,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, SALT_ROUNDS),
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                postcode: req.body.postcode,
                mobile: req.body.mobile
            },
            (err) => {
                if (err) {
                    res.json(err);
                }
                else {
                    res.json({ 
                        status: 'success', 
                        message: 'Worker successfully updated.' 
                    })
                }
        })
});


// Update a specific worker by id (update only fields in the request)
// Allows updating specific fields only, such as password or email
router.patch('/workers/:id', (req, res) => {
    // If password is passed in, hash it
    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
    }
    Worker.updateOne(
        { _id: req.params.id },
        { $set: req.body },
        (err) => {
            if (err) {
                res.json(err);
            }
            else {
                res.json({ 
                    status: 'success', 
                    message: 'Worker successfully updated.'
                })
            }
    })
});

module.exports = router;
