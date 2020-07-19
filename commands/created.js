module.exports = {
    name: 'created',
    description: 'Find when an account was created',
    execute(message, args) {
        let id = message.author.id;

        if (!args.length) {
            id = message.author.id;
        } else {
            const matches = args[0].match(/^<@!?(\d+)>$/);
            if (!matches) {
                return message.channel.send("Could not find that user");
            } else {
                id = matches[1];
            }
        }

        const target = message.guild.members.cache.get(id);
        return message.channel.send(`${target} joined Discord on ${target.user.createdAt}`);
    },
};