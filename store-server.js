const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        const itemsPath = path.join(__dirname, 'data', 'items.json');
        console.log('Reading items from:', itemsPath);
        fs.readFile(itemsPath, 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items file");
                return;
            }
            items = JSON.parse(data);

            const categoriesPath = path.join(__dirname, 'data', 'categories.json');
            console.log('Reading categories from:', categoriesPath);
            fs.readFile(categoriesPath, 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read categories file");
                    return;
                }
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
};

module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject("No results returned");
            return;
        }
        resolve(items);
    });
};

module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length === 0) {
            reject("No results returned");
            return;
        }
        resolve(publishedItems);
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("No results returned");
            return;
        }
        resolve(categories);
    });
};
