const messageModel = require("../models/messageData");

var nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 3000,
    secure: false,
    service:'gmail',
    requireTLS: true,
    auth: {
        user: 'knowledgebase.4711.xd@gmail.com',
        pass: '4711-Project-4G_A'
    }
});

  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

//!!-- Function: LOADS THE PAGE.
exports.sendMessage = async (req, res, next) => {

    let messageReceiverid =  req.query.id;
    
    let  userBeingMessaged = await messageModel.getUserProfile(messageReceiverid);
    res.render('sendMessage', {
        header: true,
        imageurl: userBeingMessaged[0].imageurl,
        receiverid: userBeingMessaged[0].userprofileid,
        sender_id: req.session.SID
    });

}




//!!-- Function: SENDS ALL THE MESSAGSE TO MESSAGES PAGE AND RENDERS THAT MESSAGES PAGE.
exports.messages = async(req,res,next) =>{
//    req.session.userId = 7;
    let allMessages = await messageModel.getAllMessages(req.session.SID);
    res.render('message',{
        header:true,
        'conversation':allMessages,
        'sessionid': req.session.SID

    });
}
exports.sendMessageToUser=async(req,res, next)=>{
  //  req.session.userId = 7;
    let senderid = req.body.senderid;
    let receiverid = req.body.receiverid;
    let detailsString = req.body.details;
    const messageObject = {
        receiver:receiverid,
        details:detailsString,
        sender:senderid

    }
    let userBeingMessaged = await messageModel.createMessage(messageObject);
    res.redirect('/message');

}

exports.sendFirstMessageToUser = async(req, res, next)=>{
    let subjectString = req.body.subject;
    let receiverid = req.body.receiverid;
    let detailsString = req.body.details;
    const messageObject = {
        subject:subjectString,
        receiver:receiverid,
        details:detailsString,
        sender:req.session.SID



    }
    let userBeingMessaged = await messageModel.createConversation(messageObject);
    userBeingMessaged = userBeingMessaged[0];


    let  userBeingMessagedProf = await messageModel.getUserProfile(userBeingMessaged.receiverid);
    userBeingMessagedProf=userBeingMessagedProf[0];
    var mailOptions = {
        from: 'knowledgebase.4711.xd@gmail.com',
        to: userBeingMessagedProf.email,
        subject: userBeingMessaged.subject,
        text: 'This message is from' + userBeingMessaged.sendername +"\n\nmessage: " + userBeingMessaged.body
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log("emailError"+error);
        }
    });
    
    await messageModel.increaseMsgCount(req.body.receiverid, req.session.SID);
    res.redirect("/profile/" + req.body.receiverid);
}




