const Discord = require('discord.js');
const {ownerID} = require('../config.json');
module.exports = {
    name: "testembed",
    description: "Test embed",
    hidden: true,
    execute(message, args) {
        if (message.author.id !== ownerID) return;
        let dispMessage = args[0];
        let scores = new Discord.Collection();
        //scores[message.author] = Math.floor(Math.random()*20);
        let questionOrder = [1,5,7,12,12,6,456,45,3,4,5,6,5,4,2,3,4,2,3,3,3,4,4,4,2,2,1,2,2,3,3,1,1,1,32,1,3,1,1,1,12];


        //console.log(message.member.displayName);
        //console.log('\n');
        //console.log(message.channel.members);
        for (const member of message.channel.members) {
            scores.set(member, Math.floor(Math.random()*20));
        }




        //scores.set(message.member, Math.floor(Math.random()*20));
        //console.log(`Score: ${JSON.stringify(scores)}`);
        //scores.set(message.member, scores.get(message.member)+50);
        //console.log(scores);


        const scoreSheet = new Discord.MessageEmbed()
            .setTitle("Final Scores")
            .setColor(0x3b8c2e)
            //.setDescription(`Maximum Possible Points: ${questionOrder.length}`)
            .setThumbnail("https://www.vippng.com/png/full/21-213669_halo-logo-png.png");

        //console.log(scores.keys());
        let desc = `Maximum Possible Points: ${questionOrder.length}`;
        let pCount = 1;
        scores.sort((v1, v2) => v2-v1);
        let firstVals = scores.values();
        console.log(firstVals);
        if (firstVals.next().value === firstVals.next().value) {
            desc += "\nThere's a tie!";
        } else {
            desc += `\n${scores.firstKey()[1]} wins!`
        }
        scoreSheet.setDescription(desc);
        //console.log(sortedScores.values());
        for (const player of scores.keys()) {
            let inline = true;
            if (pCount%2 === 0) {
                //inline = false;
            };
            scoreSheet.addField(player[1].displayName, scores.get(player), inline);
            pCount++;
        }
        return message.channel.send(dispMessage, scoreSheet);
    }
}