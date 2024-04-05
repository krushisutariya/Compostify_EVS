const User = require("../models/user.js");
const Points = require("../models/userPoints.js");
const Agency = require("../models/compostAgency.js");
const History = require("../models/history.js");
const Transaction = require("../models/transaction.js");
const { redeemReward } = require("../mailer/rewardRedeem.js");
const { suppliesRequest } = require("../mailer/suppliesRequest.js");
import dotenv from 'dotenv'
dotenv.config();

// Controller to provide the list of all nearby composting agencies to the user
module.exports.nearby_agency = async (req, res) => {
    try {
        const role = req.params.role;

        let users = await User.find({ role: role }, {name: 1, username: 1, role: 1, location: 1, contact: 1, address: 1}).lean();
        let nearbyAgency = [];
    
        let location = await User.findById(req.user.id);
        location = location.location;

        if(!location) {
            return res.redirect('/profile');
        }

        // find the nearby hospitals
        for (const user of users) {
            const apiKey = process.env.API_KEY;

            const startCoordinates = location;
            const traffic = true;

            const tomtomApiEndpoint = 'https://api.tomtom.com/routing/1/calculateRoute/';
            const url = `${tomtomApiEndpoint}${startCoordinates}:${endCoordinates}/json?key=${apiKey}&traffic=${traffic}`;

            const response = await axios.get(url);
            const data = response.data;
            const route = data.routes && data.routes[0];

            if (route) {
                const distance = route.summary.lengthInMeters / 1000; // in km
                const travelTime = route.summary.travelTimeInSeconds / 3600; // in hrs

                if (distance < 10) {
                    user.distance = distance;
                    user.travelTime = travelTime;
                    await nearbyAgency.push(user);
                }
            } else {
                console.error('No route found.');
            }
        }
    
        return res.render('nearby_agency', {
            title: "Compsostify | Nearby Agency",
            nearbyAgency: nearbyAgency
        });

    } catch (error) {
        console.log('Error: ', error.message);
        return res.redirect('back');
    }
}

// Making a donation request to compost agency or ngo
module.exports.donate_supplies = async (req, res) => {
    try {
        let agency = await User.findOne({ username: req.body.username });
        let status = 'pending';
        if (req.body.type === 'ngo')
            status = 'confirm';
        let transaction = await Transaction.create({
            sender: agency.username,
            receiver: req.body.username,
            type: req.body.type,
            quantity: req.body.quantity,
            points: req.body.quantity*10, //1kg = 10points
            status: status
        });

        suppliesRequest(agency, req.user, transaction);

        req.flash('success', 'Request sent successfully!');
        return res.redirect('/');

    } catch (error) {
        console.log('Error: ', error.message);
        return res.redirect('back');
    }
}

// Displaying the list of agencies where user has donated from where he can get the reward
module.exports.reward_store = async (req, res) => {
    try {
        let agencies = await Points.findOne({ user: req.user.id }, { availablePoints: 1 }); 
        
        let userRewards = [];
        for (let agency of agencies) {
            let rewards = await Agency.find({ user: agency.agency }, { reward: 1 });
            let { username, name } = await User.findById(agency.agency, {username: 1, name: 1});
            userRewards.push({ username: username, name: name, rewards: rewards, userPoints: agency.point });
        }

        return res.render('reward_store', {
            title: "Compsostify | Reward Store",
            userRewards: userRewards
        });

    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}

// Reedem the reward and subtract the money
module.exports.reedem_reward = async (req, res) => {
    try {
        const { reward } = req.body;
        let sender = await User.findOne({ username: req.body.username });
        await History.create({
            sender: req.body.username,
            receiver: req.user.username,
            reward: reward
        });
    
        await Points.findOneAndUpdate(
            { user: req.body.user.id, "reward.agency": sender.id },
            { $set: { "reward.$.points": -reward.point } },
            { new: true }
          );

        redeemReward(sender, req.user, reward);

        req.flash('success', 'Reward redeemed successfully!');
        return res.redirect('back');

    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}