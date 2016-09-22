var nodemailer = require('nodemailer');
var fs = require('fs');
var ejs = require('ejs');
var inquirer = require('inquirer');

var user = "jibinmathews7@gmail.com";
var password = process.env.MAIL_PASSWORD;

var transporter = nodemailer.createTransport('smtps://'+user+':'+password+'@smtp.gmail.com');

inquirer.prompt([{
  name: 'subject',
  message: "Subject: ",
  validate: function(ip){
    var done = this.async();
    if(ip.length<=5){
      return async("Subject cannot be less than 5 characters long", false);
    }
    return done(null, true);
  }
},{
  name: 'email',
  message: "Receiver Email: ",
  validate: function(ip){
    var done = this.async();
    if(ip.split('@').length!==2){
      return done("Invalid email id", false);
    }
    if(ip.split('@')[1].split('.').length<=1){
      return done("Invalid email id");
    }
    return done(null, true);
  }
},{
  name: 'name',
  message: "Reciever name: ",
  default: ''
},{
  name: 'company',
  message: "Company: ",
  validate: function(ip){
    var done = this.async();
    if(ip.length<=2){
      return done("Company name should be atleast 3 characters", false);
    }
    return done(null, true);
  }
}], function(answers){
  if(!answers.name){
    answers.name = "";
  }
  ejs.renderFile(path.join(__dirname, 'letter.html'),{email: answers},{}, function(err, str){
  var mailOptions = {
    from: '"Jibin Mathews" <jibinmathews7@gmail.com>', // sender address
    to: 'gbnrox@gmail.com', // list of receivers
    bcc: 'jibinmathews7@gmail.com',
    subject: answers.subject, // Subject line
    html: str // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
});
});
