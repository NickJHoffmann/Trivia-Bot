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
async function APICategories() {
    let categories = await getData('https://opentdb.com/api_category.php');
    for (let i = 0; i < categories['trivia_categories'].length; i++) {
        let currentCat = categories['trivia_categories'][i].name;
        currentCat = currentCat.replace(/ /g, '_');
        categories['trivia_categories'][i].name = currentCat;
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

    const localTopics = fs.readdirSync('../trivia').filter(file => file.endsWith('.json'));
    const arr = [];
    for (const topic of localTopics) {
        const data = require(`../trivia/${topic}`);
        let name = topic.substr(0, topic.length-5);
        name = name.charAt(0).toUpperCase() + name.substr(1);
        arr.push({"name":name, "totalQuestions":data['results'].length});
    }
    categories['custom_categories'] = arr;

    fs.writeFile('../trivia/info/categories.json', JSON.stringify(categories), err => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log("Successfully wrote to file");
        }
    });
}

APICategories().catch(e => console.log(e));
