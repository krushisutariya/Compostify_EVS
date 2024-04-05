const mongoose = require('mongoose');

const agencyScehma = new mongoose.Schema({
    reward: [
        {
            name: {
                type: String,
                required: true
            },
            point: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Agency = mongoose.model('Agency', agencyScehma);

module.exports = Agency;