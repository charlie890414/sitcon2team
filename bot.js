var TelegramBot = require('node-telegram-bot-api');
var monk = require('monk');

var token = '357517342:AAH-Jxo1i0AgwDGAHzUcekgEiCNeide_hfI';
var bot = new TelegramBot(token, {polling: true});
var db = monk('localhost:27017/team2');

console.log('bot running');

bot.onText(/\/start/, message => {
    var group = message.chat.id;
    var collection = db.get('grouprunning');
    console.log(message);
    collection.findOne({"group":group},function(e,confirm){
		console.log(confirm);
        if(confirm!=null){
            if(confirm.running==false){
                collection.update({"group":group,"running":false},{$set:{"running":true}},function(e,docs){
                    if (e) {
                        console.log("There was a problem adding the information to the database.");
                    }
                    else {
                        console.log("Update success");
                        bot.sendMessage(group, 'Start listening');
                    }
                });
            }
            else {
                bot.sendMessage(group, 'Already listening');
            }
        }
        else {
            collection.insert({
                "group" : group,
                "running" : true
            }, function (err, doc) {
        	   if (err) {
        		   console.log("There was a problem adding the information to the database.");
        	   }
        	   else {
        		   console.log("Insert success");
                   bot.sendMessage(group, 'Start listening');
        	   }
           });
        }
    });
});

bot.onText(/^((?!\/).)*$/,message => {
    var group = message.chat.id;
    var collection = db.get('grouprunning');
    console.log(message);
    collection.findOne({"group":group,"running":true},function(e,confirm){
        console.log(confirm);
		if(confirm!=null){
            collection = db.get('message');
            var time = new Date().toString();
            collection.insert({
                'group': message.chat.id,
                'userid' : message.from.id,
                'user' : message.from.first_name + message.from.last_name,
                'text' : message.text,
                'date' : time
            }, function (err, doc) {
        	   if (err) {
        		   console.log("There was a problem adding the information to the database.");
        	   }
        	   else {
        		   console.log("Insert message success");
        	   }
           });
        }
    });
    //bot.sendMessage(group, 'listening');
});

bot.onText(/\/end/, message => {
    var group = message.chat.id;
    var collection = db.get('grouprunning');
    console.log(message);
    collection.findOne({"group":group,"running":true},function(e,confirm){
		console.log(confirm);
		if(confirm!=null){
            collection.update({"group":group,"running":true},{$set:{"running":false}},function(e,docs){
                if (e) {
                    console.log("There was a problem adding the information to the database.");
                }
                else {
                    console.log("Update success");
                    bot.sendMessage(group, 'End listening');
                }
            });
        }
        else {
            bot.sendMessage(group, 'Unlistening');
        }
    });
});
