var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log(`server name: ${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
    /*bot.on('typing', function () {
        // User is typing
        session.send(`haha, t'es entrain d'écrire...`);
    });*/
    
    if(session.message.text=='list' || session.message.text=='status') {
        session.send({ type: "typing", channel: message.channel });
    }
    //bot.say(
    setTimeout(() => {
        session.send(`${session.message.text}`);
    }, 10000);

    bot.on('typing', function() {
        session.send(`U writing`);
    });
/*
    session.send(`OK, ça fonctionne !! | [Message.length = ${session.message.text.length}]`);
    session.send(`DialogData = ${JSON.stringify(session.dialogData)}]`);
    session.send(`Session = ${JSON.stringify(session.sessionState)}]`);*/
});
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        var membersAdded = message.membersAdded
            .map(function (m) {
                var isSelf = m.id === message.address.bot.id;
                return (isSelf ? message.address.bot.name : m.name) || '' + ' (Id: ' + m.id + ')';
            })
            .join(', ');

        bot.send(new builder.Message()
            .address(message.address)
            .text('Welcome ' + membersAdded));
    }
});
