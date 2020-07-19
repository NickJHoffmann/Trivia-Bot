const Discord = require('discord.js');
const _ = require('underscore');
const axios = require('axios');

const {trivia_categories} = require('../trivia/categories.json');

let catData = '```\nAll\n';
for (const cat of trivia_categories) {
    catData += (cat.name + '\n');
}
catData += '```'


module.exports = {
    name: 'trivia',
    description: 'Start a game of trivia',
    extendedDescription: "Starts a game of trivia with the specified topic and the specified amount of questions. " +
        "Defaults to `All` and `25` questions long.\n" +
        `Current topics are: ${catData}`,
    usage: "<topic> <number of questions>",
    async execute(message, args) {
        const timePerQuestion = 10;      //In seconds
        const questionsBeforeEnd = 5;    //Number of questions that dont receive answers before automatically stopping the game
        const stopPhrase = 'STOP THINE QUESTIONS';

        const topic = args[0] ? args[0] : 'all';
        let numQuestions = 25;

        let questionOrder = [];

        const scores = new Discord.Collection();
        let blanksInARow = 0;
        let totalBlanks = 0;


        const triviaChannel = message.channel;
        let trivia = {};
        let thumbURL = undefined;

        //Parse args to get the topic and number of questions
        try {
            numQuestions = args[1] ? parseInt(args[1]) : 25;
        } catch (error) {
            return message.channel.send("Invalid number of questions");
        };
        try {
            trivia = require(`../trivia/${topic}.json`);
            questionOrder = _.sample(trivia['results'], Math.min(numQuestions, trivia['results'].length));
            thumbURL = require('../trivia/logos.json')[topic];
        } catch (error) {
            try {
                questionOrder = await getTriviaQuestions(topic, numQuestions);
            } catch (e) {
                console.log(e);
                return message.channel.send("Cannot find that topic");
            };

        };


        //Error to call when stopping the game before all questions have been asked
        class StopGame extends Error {
            constructor(message) {
                super(message);
                this.name = "StopGame";
            }
        };

        //Gets data from the OpenTriviaDB API
        async function getTriviaQuestions(category, num) {
            let url = 'https://opentdb.com/api.php?encode=base64';
            let specificCategory = true;
            if (category !== 'all') {
                for (const cat of trivia_categories) {
                    if (cat.name.toLowerCase() === category) {
                        url += `category=${cat.id}&`;
                        specificCategory = true;
                        break;
                    }
                }
            }
            let amountPrefix = specificCategory ? '&' : '';
            if (num > 50) {
                let rawData = [];
                let sessionToken = await getAPIData('https://opentdb.com/api_token.php?command=request&');
                for (let i=0; i < Math.ceil(num/50); i++) {
                    let numRemaining = num-(50*i);
                    rawData.concat((await getAPIData(`${url}${amountPrefix}amount=${numRemaining}&token=${sessionToken}`))['results']);
                }
                return rawData;
            } else {
                url += `${amountPrefix}amount=${num}`;
                let data = (await getAPIData(url))['results'];
                for (let i=0; i<data.length; i++) {
                    let buff = new Buffer(data[i]['question'], 'base64');
                    data[i]['question'] = buff.toString('ascii');
                    buff = new Buffer(data[i]['correct_answer'], 'base64');
                    data[i]['correct_answer'] = buff.toString('ascii');
                }
                return data;
            }
        };

        //Get data from API. Returns parsed JSON
         async function getAPIData(url) {
             try {
                 const response = await axios.get(url);
                 return response.data;
             } catch (e) {
                 console.log(e);
             }
         };

        //Helper function to make a final score sheet, to be called whenever the game ends for any reason
        function makeScoreSheet(dispMessage = "Game Over!") {
            const scoreSheet = new Discord.MessageEmbed()
                .setTitle("Final Scores")
                .setColor(0x3b8c2e);
                //.setThumbnail(thumbURL);
                //.setDescription(`Maximum Possible Points: ${questionOrder.length}`);
            if (thumbURL) scoreSheet.setThumbnail(thumbURL);
            let desc = "";
            scores.sort((v1, v2) => v2-v1);
            let firstVals = scores.values();
            if (firstVals.next().value === firstVals.next().value) {
                desc += "There's a tie!";
            } else {
                desc += `${scores.firstKey()} wins!`
            }
            desc += `\nMaximum Possible Points: ${questionOrder.length}`;
            scoreSheet.setDescription(desc);
            for (const player of scores.keys()) {
                scoreSheet.addField(player.displayName, scores.get(player), true);
            }
            scoreSheet.addField("Unanswered", totalBlanks, true);
            return message.channel.send(dispMessage, scoreSheet);
        };


        async function waitFor(correctAnswers) {
            function filter(response) {
                blanksInARow = 0;
                return correctAnswers.some(answer => answer.toLowerCase() === response.content.toLowerCase())
                    || response.content === stopPhrase;
            }
                return await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: timePerQuestion * 1000,
                    errors: ['time']
                });
        };

        async function awardPoints(ans) {
            let pointWinner = ans.guild.member(ans.author);
            await triviaChannel.send(`${pointWinner} is correct!`);
            let currentScore = scores.get(pointWinner);
            if (currentScore) {
                scores.set(pointWinner, currentScore + 1);
            } else {
                scores.set(pointWinner, 1);
            }
            return ans;
        };

        async function triviaQuestion(q) {
            let question = q['question'];
            //he.decode(question);
            console.log(question);
            let correctAnswers = q['correct_answer'];
            if (!(correctAnswers instanceof Array)) {
                correctAnswers = Array.of(correctAnswers);
            };
            await message.channel.send(`----------------\n${question}`);
            try {
                let ans = (await waitFor(correctAnswers)).first();
                if (ans.content === stopPhrase) throw new StopGame("Stopping game...");
                let newAns = await awardPoints(ans);
            } catch (e) {
                throw e;
            };
        };

        try {
            for (const q of questionOrder) {
                if (blanksInARow >= questionsBeforeEnd) throw new StopGame("Game Over, nobody is playing :(");
                await triviaQuestion(q).then(result => {
                    //blanksInARow = 0;
                }).catch(err => {
                    if (err.name === StopGame.name) throw err;
                    blanksInARow++;
                    totalBlanks++;
                    let correct = q['correct_answer'];
                    if (!(correct instanceof Array)) {
                        correct = Array.of(correct);
                    };
                    triviaChannel.send(`Time's up! The correct answer was \`${correct}\``);
                });
            }
        } catch (e) {
            makeScoreSheet(e.message);
            return;
        };
        makeScoreSheet();
    }
}