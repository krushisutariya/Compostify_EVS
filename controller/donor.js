const axios = require('axios');
const User = require("../models/user.js");
const Points = require("../models/userPoints.js");
const Agency = require("../models/compostAgency.js");
const History = require("../models/history.js");
const Transaction = require("../models/transaction.js");
const { redeemReward } = require("../mailers/rewardRedeem.js");
const { suppliesRequest } = require("../mailers/suppliesRequest.js");
const dotenv = require('dotenv');
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
            const endCoordinates = user.location;
            if (!endCoordinates) {
                continue;
            }
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
                    user.type=role;
                    await nearbyAgency.push(user);
                }
            } else {
                console.error('No route found.');
            }
        }
    
        return res.render('nearby_agency', {
            title: "Compostify | Nearby Agency",
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
            status = 'accepted';
        let transaction = await Transaction.create({
            sender: req.user.username,
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
        let agencies = await Points.findOne({ user: req.user.username }, { availablePoints: 1 }); 
        agencies = agencies.availablePoints;
        let userRewards = [];
        if(agencies)
        {
            for (let agency of agencies) {
                let rewards = await Agency.findOne({ user: agency.agency }, { reward: 1 });
                rewards = rewards.reward;
                let { username, name } = await User.findOne({username: agency.agency}, {username: 1, name: 1});
                userRewards.push({ username: username, name: name, rewards: rewards, userPoints: agency.points });
            }
        }
        return res.render('reward_store', {
            title: "Compostify | Reward Store",
            userRewards: userRewards
        });

    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}

// Reedem the reward and subtract the money
module.exports.redeem_reward = async (req, res) => {
    try {
        const { rewards } = req.body;
        console.log(req.body);
        let sender = await User.findOne({ username: req.body.username });
        await History.create({
            sender: req.body.username,
            receiver: req.user.username,
            reward: rewards
        });
    
        await Points.findOneAndUpdate(
            { 
                user: req.user.username,
            },
            { 
                $inc: { "availablePoints.$[elem].points": -rewards.point },
            },
            { 
                new: true,
                arrayFilters: [{ "elem.agency": req.body.username }],
            }
        );

        redeemReward(sender, req.user, rewards);

        req.flash('success', 'Reward redeemed successfully!');
        return res.redirect('back');

    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}