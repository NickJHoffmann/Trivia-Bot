const {ownerID} = require('../config.json');
module.exports = {
    name: "setstatus",
    description: "Set bot status to a given string",
    usage: "<status>",
    hidden: true,
    execute(message, args) {
        if (message.author.id !== ownerID) return;
        message.client.user.setPresence({
            activity: {
                name: args.join(' ')
            }
        }).then(m => console.log(`Set status to "${m.activities[0].name}"`)).catch(console.error);
    }
}