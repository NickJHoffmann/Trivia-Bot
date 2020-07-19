const {prefix, defaultCooldown} = require("../config.json");
module.exports = {
    name: 'help',
    description: 'Gives info on all available commands',
    args: true,
    usage: '[command name]',
    cooldown: 3,
    execute(message, args) {
        const data = [];
        const {commands} = message.client;
        if (!args.length) {
            data.push('Here\'s a list of all my commands:');

            data.push('```'+commands.filter(function(command) {
                if (!command.hidden) return command;
            }).map(command => command.name + ` - ${command.description}`).join('\n')+'```');

            data.push(`You can send \`${prefix}help [command name]\` to get info on a specific command!`);

            return message.channel.send(data, {split: true});
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.extendedDescription) {
            data.push(`**Description:** ${command.extendedDescription}`)
        } else if (command.description) {
            data.push(`**Description:** ${command.description}`)}
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || defaultCooldown} second(s)`);

        message.channel.send(data, { split: true });
    },
};