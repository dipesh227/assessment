// adding express
let express = require("express");
// adding alert
let alert = require("alert");
// adding localstorege
var LocalStorage = require("node-localstorage").LocalStorage;
// send it to route /insert
let localStorage = new LocalStorage("/insert");
// inislize express
let app = express();
// set ejs view engin
app.set("view engine", "ejs");
// set body parser for get html form vale on submit
var bodyParser = require("body-parser");
// ?ye h bs ku ye n pata for url encode
app.use(bodyParser.urlencoded({ extended: true }));
// set data in JSON Formet
app.use(bodyParser.json());
// adding mysql for database connection
var mysql = require("mysql");
// set database cannection string
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "assesment",
});
// connect to databaase
conn.connect(function (error) {
  if (error) console.log(error);
});
// set base route for home page
app.get("/", function (req, res) {
  var sql = "SELECT * FROM data";
  conn.query(sql, function (error, results) {
    let username = localStorage.getItem("username");
    if (error) console.log(error);
    // render it with prop/argument
    res.render("index", {
      user: results,
      usernames: username,
      editData: null,
    });
  });
});
// set route for insert data as ragistretion form
app.post("/insert", function (req, res) {
  var name = req.body.signupName;
  var email = req.body.signupEmail;
  var password = req.body.signupPassword;
  // cheking email alredy exsist or not
  var check = `SELECT COUNT(*) as cnt FROM data where email='${email}'`;
  conn.query(check, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      if (results[0].cnt > 0) {
        alert("email Alredy exsit");
        res.redirect("/");
      } else {
        var sql = `INSERT INTO data( name, email, password) VALUES ('${name}','${email}','${password}')`;
        conn.query(sql, function (error, results) {
          if (error) console.log(error);
          localStorage.setItem("username", email);
          res.redirect("/");
        });
      }
    }
  });
});
// set route for login
app.post("/login", function (req, res) {
  var email = req.body.Signinemail;
  var password = req.body.Signinpassword;
  console.log(email);
  var check = `SELECT COUNT(*) as cnt FROM data where email='${email}' and password='${password}'`;
  conn.query(check, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      // cheking data correct or not
      if (results[0].cnt > 0) {
        alert("login done");
        localStorage.clear();
        localStorage.setItem("username", email);
        res.redirect("/");
      } else {
        alert("user name and password not match");
        localStorage.clear();
        res.redirect("/");
      }
    }
  });
});
// set route for delet a data
app.get("/delet/:email", function (req, res) {
  var email = req.params.email;
  var sql = `DELETE FROM data WHERE email='${email}'`;
  if (localStorage.getItem("username") == email) {
    // delet it whene data same as login pertion
    conn.query(sql, function (error, results) {
      if (error) console.log(error);
      localStorage.clear();
      alert("Data deleted");
      res.redirect("/");
    });
  } else {
    // delet it whene data diffrent from login person
    conn.query(sql, function (error, results) {
      if (error) console.log(error);
      alert("Data deleted");
      res.redirect("/");
    });
  }
});
// route for edit data
app.post("/editit/:email", function (req, res) {
  var name = req.body.editName;
  var password = req.body.editPassword;
  var email = req.params.email;
  var sql = `UPDATE data SET name='${name}',password='${password}' WHERE email='${email}'`;
  conn.query(sql, function (error, results) {
    if (error) console.log(error);
    alert("Data Edited");
    res.redirect("/");
  });
});
// route for open edit module
app.get("/edit/:email", function (req, res) {
  var email = req.params.email;
  var sql = "SELECT * FROM data";
  // for base setup tabal
  conn.query(sql, function (error, results) {
    let username = localStorage.getItem("username");
    if (error) console.log(error);
    // for edit modul setup
    var getData = `SELECT * FROM data WHERE email='${email}'`;
    conn.query(getData, function (err, result) {
      if (error) console.log(err);
      res.render("index", {
        user: results,
        usernames: username,
        editData: result,
      });
    });
  });
});
// route for login
app.get("/logout", function (req, res) {
  localStorage.clear();
  res.redirect("/");
});
// start server at port 4000
app.listen(4000, function () {});
