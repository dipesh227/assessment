let express = require("express");

var LocalStorage = require("node-localstorage").LocalStorage;
let localStorage = new LocalStorage("/insert");

let app = express();

app.set("view engine", "ejs");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "assesment",
});

conn.connect(function (error) {
  if (error) console.log(error);
});

app.get("/", function (req, res) {
  var sql = "SELECT * FROM data";
  conn.query(sql, function (error, results) {
    let username = localStorage.getItem("username");
    if (error) console.log(error);
    res.render("index", {
      user: results,
      usernames: username,
      editData: null,
    });
  });
});

app.post("/insert", function (req, res) {
  var name = req.body.signupName;
  var email = req.body.signupEmail;
  var password = req.body.signupPassword;
  var check = `SELECT COUNT(*) as cnt FROM data where email='${email}'`;
  conn.query(check, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      if (results[0].cnt > 0) {
        console.log("email Alredy exsit");
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

app.post("/login", function (req, res) {
  var email = req.body.Signinemail;
  var password = req.body.Signinpassword;
  console.log(email);
  var check = `SELECT COUNT(*) as cnt FROM data where email='${email}' and password='${password}'`;
  conn.query(check, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      if (results[0].cnt > 0) {
        console.log("login done");
        localStorage.clear();
        localStorage.setItem("username", email);
        res.redirect("/");
      } else {
        console.log("user name and password not match");
        localStorage.clear();
        res.redirect("/");
      }
    }
  });
});

app.get("/delet/:email", function (req, res) {
  var email = req.params.email;
  var sql = `DELETE FROM data WHERE email='${email}'`;
  if (localStorage.getItem("username") == email) {
    conn.query(sql, function (error, results) {
      if (error) console.log(error);
      localStorage.clear();
      res.redirect("/");
    });
  } else {
    conn.query(sql, function (error, results) {
      if (error) console.log(error);
      res.redirect("/");
    });
  }
});

app.post("/editit/:email", function (req, res) {
  var name = req.body.editName;
  var password = req.body.editPassword;
  var email = req.params.email;
  var sql = `UPDATE data SET name='${name}',password='${password}' WHERE email='${email}'`;
  conn.query(sql, function (error, results) {
    if (error) console.log(error);
    res.redirect("/");
  });
});

app.get("/edit/:email", function (req, res) {
  var email = req.params.email;
  var sql = "SELECT * FROM data";
  conn.query(sql, function (error, results) {
    let username = localStorage.getItem("username");
    if (error) console.log(error);
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

app.get("/logout", function (req, res) {
  localStorage.clear();
  res.redirect("/");
});

var server = app.listen(4000, function () {});
