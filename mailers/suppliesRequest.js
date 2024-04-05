const nodemailer = require('../config/nodemailer');

exports.suppliesRequest = (agency, donor, data) => {
    let htmlString = nodemailer.renderTemplate({donor: donor, data: data}, '/suppliesRequest.ejs');
    nodemailer.transporter.sendMail({
        from: 'dharmeshkota123@gmail.com',
        to: agency.email,
        subject: 'Reward redeemed by user!',
        html: htmlString
    }, (err, info) => {
        if(err){
            console.log('Error while sending the Mail! ', err);
            return;
        }
        console.log('Link Sent!');
    });
}