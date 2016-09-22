"use strict";
var nodemailer = require('nodemailer');
var fs = require('fs');
var ejs = require('ejs');
var inquirer = require('inquirer');
var path = require('path');
var chalk = require('chalk');

var user = "jibinmathews7@gmail.com";
var password = process.env.MAIL_PASSWORD;

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('unhandledException', (error, m)=> {
  console.log("Unhandled Exception at: Error ", m, " reason: ", error);
});


var transporter = nodemailer.createTransport('smtps://'+user+':'+password+'@smtp.gmail.com');

inquirer.prompt([{
  name: 'subject',
  message: "Subject: ",
  validate: function(ip){
    var done = this.async();
    if(ip.length<5){
      return done("Subject cannot be less than 5 characters long", false);
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
},{
  type: "list",
  name: "template",
  choices: ['LinkedIn Listing - Cover Letter', 'Standard Cover Letter'],
  default: 1,
  message: "Which template to use? "
}]).then(function(answers){
  console.log(chalk.red("----------------Answers------------------"));
  console.log(answers);
  console.log(chalk.red('------------------------------------------'));
  if(!answers.name){
    answers.name = "";
  }
  var file = "letter";
  if(answers.template==="LinkedIn Listing - Cover Letter"){
    file = "cover-linkedIn";
  }
  var textContent = fs.readFileSync(path.join(__dirname, 'templates', file+".txt")).toString();
  ejs.renderFile(path.join(__dirname, 'templates', file+".html"),{email: answers},{}, function(err, str){
    var mailOptions = {
      from: '"Jibin Mathews" <jibinmathews7@gmail.com>', // sender address
      to: answers.email, // list of receivers
      bcc: 'jibinmathews7@gmail.com',
      subject: answers.subject, // Subject line
      text: textContent,
      html: str // html body
    };
    inquirer.prompt([{
      type: 'confirm',
      name: "send",
      default: false,
      message: "Confirm sending email to: "+answers.name+" <"+answers.email+"> of "+answers.company
    }]).then(function(sendConfirmation){
      console.log(chalk.red("-----------Send Confirmation--------------"));
      console.log(sendConfirmation);
      console.log(chalk.red('------------------------------------------'));
      if(sendConfirmation.send){
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(chalk.yellow("------------------Error----------------"));
            return console.log(error);
          }
          console.log(chalk.green('Message sent: ' + info.response));
        });
      }else{
        console.log(chalk.yellow("Aborted by user"));
        process.exit(0);
      }
    });
  });
});
