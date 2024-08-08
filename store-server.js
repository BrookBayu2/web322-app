const Sequelize = require('sequelize');


const sequelize = new Sequelize('newdb', 'postgres', '1219', {
    host: 'localhost', 
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        
    },
    query: { raw: true }
});


const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});


Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject(`unable to sync the database: ${err.message}`));
    });
};

module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.getItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(data => resolve(data))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.getPublishedItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category: category } })
            .then(data => resolve(data))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.getItemById = function(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id: id } })
            .then(data => resolve(data[0]))
            .catch(err => reject(`no results returned: ${err.message}`));
    });
};

module.exports.addItem = function(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        for (let key in itemData) {
            if (itemData[key] === "") {
                itemData[key] = null;
            }
        }
        itemData.itemDate = new Date();
        Item.create(itemData)
            .then(() => resolve())
            .catch(err => reject(`unable to create item: ${err.message}`));
    });
};

module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }
        Category.create(categoryData)
            .then(() => resolve())
            .catch(err => reject(`unable to create category: ${err.message}`));
    });
};

module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject(`unable to remove category / category not found: ${err.message}`));
    });
};

module.exports.deleteItemById = function(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject(`unable to remove item / item not found: ${err.message}`));
    });
};
