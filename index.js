"use strict";
var nodemailer = require('nodemailer');
var fs = require('fs');
var ejs = require('ejs');
var inquirer = require('inquirer');
var path = require('path');
var chalk = require('chalk');
//After converting html if lower banner placement problem arrives then remove float from all inline css
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
  name: 'name',
  message: "Reciever name: ",
},{
  name: 'email',
  message: "Receiver Email *: ",
  validate: function(ips){
    var done = this.async();
    var emails = ips.split(',');
    for(var ip of emails){
      ip = ip.trim();
      if(ip.split('@').length!==2){
        return done("Invalid email id", false);
      }
      if(ip.split('@')[1].split('.').length<=1){
        return done("Invalid email id");
      }
    }
    return done(null, true);
  }
},{
  name: 'subject',
  message: "Subject *: ",
  validate: function(ip){
    var done = this.async();
    if(ip.length<5){
      return done("Subject cannot be less than 5 characters long", false);
    }
    return done(null, true);
  }
},{
  name: 'company',
  message: "Company *: ",
  validate: function(ip){
    var done = this.async();
    if(ip.length<=2){
      return done("Company name should be atleast 3 characters", false);
    }
    return done(null, true);
  }
},{
  name: "position",
  message: "What role are you applying for? ",
  default: "Software Developer"
},{
  type: "list",
  name: "template",
  choices: ['LinkedIn Listing', 'LinkedIn Listing With CTC', 'Standard Cover Letter', 'Other'],
  default: 0,
  message: "Which template to use? "
}]).then(function(answers){
  console.log(chalk.red("----------------Answers------------------"));
  console.log(answers);
  console.log(chalk.red("-----------------------------------------"));
  processAnswers(answers);
});



function processAnswers(answers){
  //Name Validation
  if(!answers.name){
    answers.name = "";
  }else{
    answers.name = " "+answers.name;
  }

  //Role setup
  if(!answers.position || answers.position.length<=3){
    answers.position = "Software Developer";
  }

  //Email splitting
  if(answers.email.indexOf(',')!==-1){
    answers.email = answers.email.split(',');
    for(var i=0;i<answers.email.length;i++){
      answers.email[i] = answers.email[i].trim();
    }
    answers.name = "";
  }

  //Company Name setup
  if(answers.company){
    answers.company = " at "+answers.company;
  }

  switch(answers.template){
    case "LinkedIn Listing With CTC":
      return getCTC(answers);
      break;
    case "Other":
      return otherTemplate(answers);
      break;
    case "Standard Cover Letter":
      answers.file = "letter";
      break;
    case "LinkedIn Listing":
    default:
      answers.file = "cover-linkedIn";
      break;
  }
  sendEmail(answers);
}

function sendEmail(answers){
  var textContent = fs.readFileSync(path.join(__dirname, 'templates', answers.file+".txt")).toString();
  textContent = textContent.replace(/<%= email.name %>/g, answers.name).replace(/<%= email.position %>/g, answers.position).replace(/<%= email.company %>/g, answers.company);

  ejs.renderFile(path.join(__dirname, 'templates', answers.file+"-converted.html"),{email: answers},{}, function(err, str){
    var mailOptions = {
      from: '"Jibin Mathews" <jibinmathews7@gmail.com>',
      to: answers.email,
      bcc: 'jibinmathews7@gmail.com',
      subject: answers.subject,
      text: textContent,
      html: str
    };

    inquirer.prompt([{
      type: 'confirm',
      name: "send",
      default: false,
      message: "Confirm sending email to: "+chalk.yellow(answers.name+" <"+answers.email+"> of "+answers.company.replace("at", ""))
    }]).then(function(sendConfirmation){
      console.log(chalk.red("-----------Send Confirmation--------------"));
      console.log(sendConfirmation);
      console.log(chalk.red("------------------------------------------"));
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
}

function getCTC(answers){
  inquirer.prompt([{
    name: "lower",
    message: "CTC Lower Limit: ",
    default: '14.00'
  },{
    name: "upper",
    message: "CTC Upper limit: ",
    default: '20.00'
  }]).then(function(ans){
    for(var key of Object.keys(ans)){
      answers[key] = ans[key];
    }
    answers.file = "linkedIn-withCTC";
    sendEmail(answers);
  });
}

function otherTemplate(answers){
  inquirer.prompt([{
    name: "file",
    message: "Template file name (without extention)",
    validate: function(ip){
      var done = this.async();
      var htmlFile = path.join(__dirname, 'templates', ip+"-converted.html");
      var textFile = path.join(__dirname, 'templates', ip+".txt");
      if(!fs.existsSync(htmlFile)){
        return done("Converted html file does not exists. Read readme.md for more details on how to create templates", false);
      }
      if(!fs.existsSync(textFile)){
        return done("Text file does not exists for this template. Read readme.md for more details", false);
      }
      return done(null, true);
    }
  }])
  .then(function(ans){
    answers.file = ans.file;
    sendEmail(answers);
  });
}
