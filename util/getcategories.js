const https = require('https');
const fs = require('fs');

let categories = '';
https.get('https://opentdb.com/api_category.php', (res) => {
    res.on('data', d => {
        categories += d;
    });
    res.on('end', function () {
        //Removes any the "Entertainment: " from "Entertainment: Television" in all applicable categories
        categories = JSON.parse(categories);
        for (let i = 0; i < categories.trivia_categories.length; i++) {
            const currentCat = categories.trivia_categories[i].name;
            for (let j = 0; j < currentCat.length; j++) {
                if (currentCat[j] === ':') {
                    categories.trivia_categories[i].name = currentCat.substr(j+2);
                    break;
                };
            };
        };

        fs.writeFile('../trivia/categories.json', JSON.stringify(categories), err => {
            if (err) {
                console.log('Error writing file', err);
            } else {
                console.log("Successfully wrote to file");
            };
        });
    });
}).on('error', e => {
    console.error(e);
});
