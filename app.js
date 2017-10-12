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

// Main menu
var menuItems = { 
    "Message de bienvenu": {
        item: "greeting"
    },
    "Réservation": {
        item: "askName"
    },
}

var bot = new builder.UniversalBot(connector, [
    function(session){
        session.send("Welcome!!!");
        session.beginDialog("mainMenu");
    },
    function (session, results) {
        session.dialogData.nameC = results.response;
        session.beginDialog('phonePrompt');
    },
    function (session, results) {
        session.dialogData.phoneNumber = results.response;
        session.beginDialog('askForDateTime');
    },
    function (session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.beginDialog('askForPartySize');
    },
    function (session, results) {
        session.dialogData.partySize = results.response;
        session.beginDialog('askForReserverName');
    },
    function (session, results) {
        session.dialogData.reservationName = results.response;
        // Process request and display reservation details
        session.send(`Reservation confirmée. Détails de la réservation: <br/>Date/Heure: ${session.dialogData.reservationDate} <br/>Nombre de personne: ${session.dialogData.partySize} <br/>Au nom de : ${session.dialogData.reservationName}`);
        session.endDialog();
    }
]);

bot.dialog("mainMenu", [
    function(session){
        builder.Prompts.choice(session, "Main Menu:", menuItems);
    },
    function(session, results){
        if(results.response){
            session.beginDialog(menuItems[results.response.entity].item);
        }
    }
])
.triggerAction({
    // The user can request this at any time.
    // Once triggered, it clears the stack and prompts the main menu again.
    matches: /^main menu$/i,
    confirmPrompt: "This will cancel your request. Are you sure?"
});

bot.dialog('askName', [
    function (session){
        builder.Prompts.text(session, 'What is your name?');
    },
    function(session, results){
        session.endDialogWithResult(results);
    }
]);

bot.dialog('phonePrompt', [
    function (session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Votre numéro doit respecter ce format: '06-94-07-23-12' ou '0694072312'")
        } else {
            builder.Prompts.text(session, "Entrer votre numéro de téléphone");
        }
    },
    function (session, results) {
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        if (number.length == 10 || number.length == 11) {
            session.userData.phoneNumber = number; // Save the number.
            session.endDialogWithResult({ response: number });
        } else {
            // Repeat the dialog
            session.replaceDialog('phonePrompt', { reprompt: true });
        }
    }
]);

bot.dialog('askForDateTime', [
    function (session) {
        builder.Prompts.time(session, "Date et heure de la réservation");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('askForPartySize', [
    function (session) {
        builder.Prompts.text(session, "Pour combien de personne?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
])

bot.dialog('askForReserverName', [
    function (session) {
        builder.Prompts.text(session, "A quel nom?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('greeting', [
    function(session) {
        session.beginDialog('askName1');
    },
    function(session, results) {
        session.send(`Hello ${results.response}!`);
    }
]);

bot.dialog('askName1', [
    function (session){
        builder.Prompts.text(session, 'HI! What is your name?');
    },
    function(session, results){
        session.endDialogWithResult(results);
    }
]);