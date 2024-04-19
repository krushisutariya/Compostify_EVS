const Transaction = require("../models/transaction.js");

// Send the pending requests data to the agency home page
module.exports.requests = async (req, res) => {
    try {
        let requests = await Transaction.find({ status: 'accepted', receiver: req.user.username }, {sender: 1, quantity: 1});
        return res.render('supply_requests_ngo', {
            title: "Compsostify | Supply requests",
            requests: requests
        });
    } catch (error) {
        console.log('Error: ', error.message);
        return res.redirect('back');
    }
}