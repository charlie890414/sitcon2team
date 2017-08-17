var TelegramBot = require('node-telegram-bot-api');
var crypto = require('crypto');
var monk = require('monk');

var token = '357517342:AAH-Jxo1i0AgwDGAHzUcekgEiCNeide_hfI';
var bot = new TelegramBot(token, {polling: true});
var db = monk('localhost:27017/team2');

console.log('bot running');

bot.onText(/\/start/, message => {
    var hash = crypto.createHash('md5').update(message.chat.id.toString()+message.date.toString()).digest('hex')
    console.log(hash);
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
    var user = message.from.id;
    bot.getUserProfilePhotos(user, 0, 1).then(function(data){
        console.log(data.photos[0][0].file_id);
        //bot.sendPhoto(group,data.photos[0][0].file_id,{caption: "It's your photo!"});
        if(data.photos[0][0].file_id!="undefined")bot.getFileLink(data.photos[0][0].file_id, 0, 1).then(function(link){
            console.log(link);
            var collection = db.get('grouprunning');
            console.log(message);
            collection.findOne({"group":group,"running":true},function(e,confirm){
                console.log(confirm);
        		if(confirm!=null){
                    collection = db.get('message');
                    var date = new Date().toLocaleDateString();
                    var time = new Date().toLocaleTimeString();
                    collection.insert({
                        'group': message.chat.id,
                        'userid' : message.from.id,
                        'user' : message.from.first_name + message.from.last_name,
                        'text' : message.text,
                        'date' : date,
                        'time' : time,
                        'photo' : link
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
        });
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
