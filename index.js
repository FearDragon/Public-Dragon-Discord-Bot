const Discord = require('discord.js');
const Bot = new Discord.Client();
const ms = require('ms')

const ytdl = require("ytdl-core");
require('dotenv').config();

const token = process.env.TOKEN;

const PREFIX = '$';

var servers = {};

Bot.on('ready', () => {
    console.log('Dragon Is Online!');
})

Bot.on('message', message => {

    let args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0]) {
        case 'welcome':
            message.channel.send('Welcome to the Dragon server!')
            break;
        case 'version':
            message.channel.sendMessage('Version 2.1.0 Beta')
            break;
        case 'patch':
            message.channel.send({embed: {
                color: 3447003,
                title: "Patch Notes:",
                fields: [
                  { name: "2.0.0", value: "Bot can now play music with YT video link", inline: true},
                  { name: "2.1.0", value: "Moderators can now mute people for a custom duration of time.", inline: true}
                ]
              }
            })
            break;     
        case 'youtube':
            if (args[1] === 'FearDragonGaming') {
                message.channel.send('https://www.youtube.com/channel/UCvR6_c5hxYv0-KhHINHSZJg');
            } else {
                message.channel.send('Invalid')
            }
            break;
        case 'kick':
            if (!message.member.roles.find(r => r.name === "Mods")) return message.channel.send('YOU DO NOT HAVE PERMISSION')
            if (!args[1]) message.channel.send('you need to say a players Name')
            const user = message.mentions.users.first();

            if (user) {
                const member = message.guild.member(user);

                if (member) {
                    member.kick('Your were kicked!').then(() => {
                        message.relpy(`Sucessfully kicked ${user.tag}`);
                    }).catch(err => {
                        message.reply('unable to kick');
                        console.log(err);
                    })
                } else {
                    message.reply("that user isn\'t in the server")
                }
            } else {
                message.reply('you need to say a plaryers Name')
            }
            
            break;    
        case 'play':

            function play(connection, message){
                var server = servers[message.guild.id];

                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

                server.queue.shift();

                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message);
                    }else {
                        connection.disconnect();
                    }
                });

            }

            if(!args[1]){
                message.channel.send("You need to provide a link.");
                return;
            }

            if(!message.member.voiceChannel){
                message.channel.send("You must be in a Voice Channel.");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            })
       
    
    
    
        break;

        case 'skip':
            var server = servers[message.guild.id];
             if(server.dispatcher) server.dispatcher.end();
             message.channel.send("Skipping the song.")
        break;

        case 'stop':
            var server = servers[message.guild.id];
             if(message.guild.voiceConnection){
                 for(var i = server.queue.length -1; i >=0; i--){
                     server.queue.splice(i, 1);
                 }

                 server.dispatcher.end();
                 message.channel.send("Ending the queue, leaving the channel.")
                 console.log('stopped the queue')
             }

             if(message.guild.connection) message.guild.voiceConnection.disconnect();
        break;

        case 'mute':
        if (!message.member.roles.find(r => r.name === "Mods")) return message.channel.send('YOU DO NOT HAVE PERMISSION')
        let person = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]))
        if(!person) return message.reply("Couldn't find member.");

        let mainrole = message.guild.roles.find(role => role.name === "Normal");
        let muterole = message.guild.roles.find(role => role.name === "Mute");

        if(!muterole) return message.reply("Can not find the mute role.")

        let time = args[2]

        if(!time){
            return message.reply("You did not specify a time.")
        }

        person.removeRole(mainrole.id);
        person.addRole(muterole.id);

        message.channel.send(`@${person.user.tag} has now been muted for ${ms(ms(time))}`);

        setTimeout(function(){
            person.addRole(mainrole.id);
            person.removeRole(muterole.id);
            message.channel.send(`@${person.user.tag} has been unmuted.`)
        }, ms(time));

        break;
    }
})

Bot.login(token);