const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const stripJs = require('strip-js');
const itemData = require('./store-server.js');
const app = express();
const PORT = process.env.PORT || 8080;
const dotenv = require('dotenv');
dotenv.config();


app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        safeHTML: function(context) {
            return stripJs(context);
        },
        equals: function(a, b, options) {
            if (a === b) {
                return options.fn(this); 
            } else {
                return options.inverse(this); 
            }
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (route ? route : 'shop');
    app.locals.viewingCategory = req.query.category;
    next();
});


app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get('/shop', async (req, res) => {
    try {
        let items, categories, item = null;
        if (req.query.category) {
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await itemData.getPublishedItems();
        }
        categories = await itemData.getCategories();

        if (req.query.id) {
            item = await itemData.getItemById(req.query.id);
        }

        res.render('shop', { items, categories, item, viewingCategory: req.query.category });
    } catch (err) {
        console.error(`Error fetching shop data: ${err}`);
        res.render('shop', { message: 'Error loading shop data. Please try again later.' });
    }
});

app.get('/shop/:id', async (req, res) => {
    try {
        const item = await itemData.getItemById(req.params.id);
        const items = await itemData.getPublishedItems();
        const categories = await itemData.getCategories();

        res.render('shop', { item, items, categories });
    } catch (err) {
        console.error(`Error fetching item data: ${err}`);
        res.render('shop', { message: 'Item not found.' });
    }
});


app.get('/about', (req, res) => {
    res.render('about', { title: 'About - Biruk Abebe', studentName: 'Biruk Abebe' });
});


app.get('/items/add', async (req, res) => {
    try {
        const categories = await itemData.getCategories();
        res.render('addItem', { title: 'Add Item - Biruk Abebe', studentName: 'Biruk Abebe', categories });
    } catch (err) {
        res.render('addItem', { title: 'Add Item - Biruk Abebe', studentName: 'Biruk Abebe', categories: [] });
    }
});


app.get('/items', async (req, res) => {
    try {
        const items = await itemData.getAllItems();
        if (items.length > 0) {
            res.render('items', { items });
        } else {
            res.render('items', { message: "no results" });
        }
    } catch (err) {
        console.error(`Error fetching items: ${err}`);
        res.render('items', { message: 'No results returned' });
    }
});


app.get('/categories', async (req, res) => {
    try {
        const categories = await itemData.getCategories();
        if (categories.length > 0) {
            res.render('categories', { categories });
        } else {
            res.render('categories', { message: "no results" });
        }
    } catch (err) {
        console.error(`Error fetching categories: ${err}`);
        res.render('categories', { message: 'No results returned' });
    }
});


app.post('/categories/add', async (req, res) => {
    try {
        await itemData.addCategory(req.body);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).send("Unable to add category");
    }
});


app.get('/categories/delete/:id', async (req, res) => {
    try {
        await itemData.deleteCategoryById(req.params.id);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).send("Unable to remove category / Category not found");
    }
});


app.post('/items/add', async (req, res) => {
    try {
        await itemData.addItem(req.body);
        res.redirect('/items');
    } catch (err) {
        res.status(500).send("Unable to add item");
    }
});


app.get('/items/delete/:id', async (req, res) => {
    try {
        await itemData.deleteItemById(req.params.id);
        res.redirect('/items');
    } catch (err) {
        res.status(500).send("Unable to remove item / Item not found");
    }
});


app.use((req, res) => {
    res.status(404).render('404');
});


itemData.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error(`Failed to initialize the server: ${err}`);
});
