const {ownerID} = require('../config.json')
module.exports = {
    name: 'shutdown',
    description: 'Shuts down the bot',
    hidden: true,
    execute(message, args) {
        if (message.author.id !== ownerID) return;
        console.log("shutting down");
        message.client.destroy();
    },
};