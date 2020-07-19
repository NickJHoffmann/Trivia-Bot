const fs = require('fs');
const axios = require('axios');

async function getData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (e) {
        console.log(e);
    }
}
async function doThings() {
    let categories = await getData('https://opentdb.com/api_category.php');
    for (let i = 0; i < categories['trivia_categories'].length; i++) {
        const currentCat = categories['trivia_categories'][i].name;
        for (let j = 0; j < currentCat.length; j++) {
            if (currentCat[j] === ':') {
                categories['trivia_categories'][i].name = currentCat.substr(j + 2);
                break;
            }
        }
    }
    let qAmounts = await getData('https://opentdb.com/api_count_global.php');

    categories['trivia_categories'].forEach(cat => {
        cat['totalQuestions'] = qAmounts['categories'][cat.id]['total_num_of_questions'];
    });

    categories['trivia_categories'].push({"name": "All", 'totalQuestions': qAmounts['overall']['total_num_of_questions']});

    fs.writeFile('../trivia/info/categories.json', JSON.stringify(categories), err => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log("Successfully wrote to file");
        }
    });
}

doThings().catch(e => {
    console.log(e);
});