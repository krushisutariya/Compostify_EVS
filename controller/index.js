const User = require('../models/user.js');

// Render the home page
module.exports.home = (req, res) => {
    return res.render('home', {
        title: 'Compsostify | Sign-Up'
    });
}

// Render the sign up page
module.exports.sign_up = (req, res) => {
    return res.render('sign_up', {
        title: 'Compsostify | Sign-Up'
    });
}

// Register the new user into the database
module.exports.create_user = async (req, res) => {
    try {
        if (req.body.re_password != req.body.password) {
            req.flash('error', 'Passwords are not matching');
            return res.redirect('back');
        }
        let user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        if (user) {
            req.flash('error', 'User already exists!');
            return res.redirect('/sign_in');
        }
        
        user = await User.create(req.body);

        req.flash('success', 'User Registered Successfully!');
        return res.redirect('/sign_in');

    } catch (error) {
        console.log(error.message);
        return res.redirect('back');
    }
}

// Render the login page
module.exports.sign_in = (req, res) => {
    return res.render('sign_in', {
        title: 'Compsostify | Sign-In'
    });
}

// User logged in to the system
module.exports.create_session = async (req, res) => {
    return res.redirect('/');
};

// Profile details of the user
module.exports.profile = async (req, res) => {
    try {
        let user = await User.findById(req.user.id, {name: 1, username: 1, email: 1, role: 1, contact: 1, address: 1, location: 1});
        return res.render('profile', {
            title: "Compostify | Profile",
            user: user
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}

// Update the user's profile
module.exports.update_profile = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            { _id: req.user.id },
            req.body,
            { new: true }
        );
        req.flash('success', 'Profile Updated Successfully!');
        return res.redirect('back');
    } catch (error) {
        console.log('Error: ', error);
        return res.redirect('back');
    }
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return res.status(401).send({error: err});
        }
        req.flash('success', 'Logged Out Successfully!');
        res.redirect('/sign-in');
    });
};

// Render the guidelines page
module.exports.guidelines = (req, res) => {
    return res.render('guidelines', {
        title: 'Compostify | Guidelines'
    });
}