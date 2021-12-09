const express = require("express");
const mysql = require('mysql');
const fetch = require("node-fetch")
const bcrypt = require('bcrypt');
const session = require('express-session')
const app = express();
const pool = dbConnection();

app.locals.myVar = false
app.locals.name = ""
app.locals.customer = ""

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secret_key!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

//routes
app.get('/', async (req, res) => {
  let sql = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql);
  res.render('index', { "menuItems": rows })
});

app.post('/order/new', isAuthenticated ,async (req, res) => {
  
  let customerId = app.locals.customer
  let foodName = req.body.foodName;
  let price = req.body.price;
  let first = req.body.init;
  let last = req.body.end;

   console.log("foodName:" + foodName)
   console.log("price:" + price)

  let sql = `INSERT INTO cart (foodName,price,customerId) VALUES (?, ?, ?)`;

  let params = [foodName, price, customerId];

   let rows = await executeSQL(sql, params)

  console.log('order/new')

  res.redirect('/cart')
})

//order route
app.get('/order/selection', async(req, res) => {
  
  let init = req.query.init;
  let end = req.query.end;

  let sql = `SELECT * FROM noodle_menu
            WHERE foodId BETWEEN ${init} AND ${end}`
  let rows = await executeSQL(sql)

  //console.log(rows)

  res.render('order',{"menuItems":rows,"init":init,"end":end})
});

//cart route
app.get('/cart', isAuthenticated ,async (req, res) => {
  
  let customerId = app.locals.customer

  let sql = `SELECT *
             FROM cart
             WHERE customerId = ${customerId}`;
             
  let rows = await executeSQL(sql)

  sql = `SELECT ROUND(SUM(price),2) AS total_price FROM cart WHERE customerId = ${customerId}`

  rows2 = await executeSQL(sql)
  // console.log(rows)
  // console.log(rows2)

  res.render('cart', {"menuItems": rows,"total":rows2})
});

app.get('/cart/delete', isAuthenticated ,async (req, res) => {

  let cartId = req.query.cartId

  let sql = `DELETE FROM cart WHERE cartId = ${cartId}`
  let rows = await executeSQL(sql)

  res.redirect('/cart')
});

app.get('/cart/clean', isAuthenticated ,async (req, res) => {

  let sql = `DELETE FROM cart`
  let rows = await executeSQL(sql)

  res.redirect('/cart')
});


//about us route
app.get('/about', (req, res) => {
  //console.log(rows)
  res.render('about')
});

app.get('/login', async (req, res) => {

  res.render('login')
});

app.post('/login', async (req, res) => {
  let username = req.body.username
  let userPassword = req.body.pwd
  let customerId = req.body.customerId;

  let passwordHash = "";

  let sql = `SELECT * FROM customer_info WHERE email = ?`;
  let data = await executeSQL(sql, [username]);
  if (data.length > 0)
    passwordHash = data[0].password

  const matchPassword = await bcrypt.compare(userPassword, passwordHash);
  let sql1 = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql1);

  if (matchPassword) {
    req.session.authenticated = true;
    app.locals.myVar = req.session.authenticated
    app.locals.name = data[0].firstName;
    app.locals.customer = data[0].customerId

    res.render("index", { "menuItems": rows });
  }
  else {
    res.render("login", { "error": "Invalid Credentials" })
  }

});

app.get('/signup', async (req, res) => {
  let url = "https://cst336.herokuapp.com/projects/api/state_abbrAPI.php";
  let response = await fetch(url);
  let data = await response.json();
  res.render('signup', { "stateList": data })
});

app.post('/signup', async (req, res) => {
  let url = "https://cst336.herokuapp.com/projects/api/state_abbrAPI.php";
  let response = await fetch(url);
  let data = await response.json();

  const salt = await bcrypt.genSalt(10);

  let firstName = req.body.fName;
  let lastname = req.body.lName;
  let email = req.body.email;
  let password = await bcrypt.hash(req.body.password, salt);
  let address = req.body.address;
  let city = req.body.city;
  let state = req.body.state;
  let zip = req.body.zip;
  let sex = req.body.inlineRadioOptions;
  
  let sql = `INSERT INTO customer_info (firstName, lastName, email, password, address, city, state, zip, sex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let params = [firstName, lastname, email, password, address, city, state, zip, sex];

  let rows = await executeSQL(sql, params)

  console.log('signup')
  res.render('signup', { "stateList": data })
});

app.get('/page2', async (req, res) => {
  let sql = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql);
  console.log('page2')
  res.render('page2', { "menuItems": rows })
});

app.get('/page3', async (req, res) => {
  let sql = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql);
  console.log('page3')
  res.render('page3', { "menuItems": rows })
});

app.get('/page4', async (req, res) => {
  let sql = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql);
  console.log('page4')
  res.render('page4', { "menuItems": rows })
});

app.get('/page5', async (req, res) => {
  let sql = `SELECT * FROM noodle_menu`;
  let rows = await executeSQL(sql);
  console.log('page5')
  res.render('page5', { "menuItems": rows })
});

app.get('/logout', isAuthenticated, (req, res) => {
  req.session.authenticated = false;
  app.locals.myVar = req.session.authenticated
  req.session.destroy();
  res.redirect('/');
});

app.get('/user/edit', isAuthenticated, async (req, res) => {

  let url = "https://cst336.herokuapp.com/projects/api/state_abbrAPI.php";
  let response = await fetch(url);
  let data = await response.json();
  
  let customerId = app.locals.customer;

  let sql = `SELECT *
            From customer_info
            WHERE customerId = ${customerId}`;

  let rows = await executeSQL(sql);

  console.log('userEdit')

  res.render('editInformation', { "customerInfo": rows, "stateList": data })

});

app.post('/user/edit', async (req, res) => {


  let url = "https://cst336.herokuapp.com/projects/api/state_abbrAPI.php";
  let response = await fetch(url);
  let data = await response.json();
  let customerId = req.body.customerId;

  let sql = `UPDATE customer_info
             SET firstName = ?,
             lastName = ?,
             email = ?,
             address = ?,
             city = ?,
             state = ?,
             zip = ?
             WHERE customerId = ${customerId}`;

  let params = [req.body.fName, req.body.lName, req.body.email, req.body.address, req.body.city, req.body.state, req.body.zip]
  app.locals.name = req.body.fName;
  let rows = await executeSQL(sql, params);

  sql = `SELECT *
        From customer_info
        WHERE customerId = ${customerId}`;

  rows = await executeSQL(sql)

  res.render('editInformation', { "customerInfo": rows, "stateList": data })

});


//functions
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}//executeSQL
//values in red must be updated
function dbConnection() {

  const pool = mysql.createPool({

    connectionLimit: 10,
    host: "x8autxobia7sgh74.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "jbujpgcwh0slwrkp",
    password: "e62mvhxl3ak0v2ze",
    database: "ebnlpsznktwvls96"

  });

  return pool;

} //dbConnection

function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  }
  else {
    res.redirect("/login");
  }
}
//start server
app.listen(3000, () => {
  console.log("Expresss server running...")
})