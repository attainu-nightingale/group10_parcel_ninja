const express = require("express");
const router = express.Router();
var { MongoClient: mongoClient, ObjectID } = require("mongodb");
var db;
mongoClient.connect(
  "mongodb://localhost:27017",
  { useUnifiedTopology: true },
  function(err, client) {
    if (err) throw err;
    db = client.db("parcelninja");
  }
);

router.get("/ninjadash", function(req, res) {
  if (req.session.loggedIn) {
    db.collection("ninja")
      .find({ email: req.session.email })
      .toArray(function(err, result) {
        if (err) {
          throw err;
        }
        res.render("ninjadashboard", {
          title: "Ninja Dashboard",
          script: "/ninja.js",
          data: result,
          fname: req.session.fname,
          lname: req.session.lname,
          email: req.session.email
        });
      });
  } else {
    res.redirect("/login/ninja");
  }
});

router.post("/statusAvail", function(req, res) {
  db.collection("ninja").update(
    { id: req.body.id },
    { $set: { Availability: req.body.status } },
    function(err, result) {
      if (err) throw err;
      res.send("updated");
    }
  );
});
router.post("/statusDuty", function(req, res) {
  db.collection("ninja").update(
    { id: req.body.id },
    { $set: { duty: req.body.duty } },
    function(err, result) {
      if (err) throw err;
      res.send("updated");
    }
  );
});
router.get("/orders", function(req, res) {
  if (req.session.loggedIn) {
    db.collection("parcel")
      .find({ ninjaid: req.session.ninjaid })
      .toArray(function(err, result) {
        if (err) throw err;

        res.send(result);
      });
  }
});
router.post("/profileUpdate", function(req, res) {
  db.collection("ninja").updateOne(
    { email: req.body.email },
    {
      $set: {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        Phone: req.body.Phone,
        Address: req.body.Address
      }
    },
    function(err, result) {
      if (err) throw err;
      res.redirect("/ninjadashboard/ninjadash");
    }
  );
});
router.post("/orderUpdate", function(req, res) {
  db.collection("parcel").updateOne(
    { _id: ObjectID(req.body.nid) },
    { $set: { status: req.body.status } },
    function(err, result) {
      console.log(result);
      if (err) throw err;
      res.send("updated");
    }
  );
});

router.get("/logout", function(req, res) {
  req.session.destroy();
  res.redirect("/login/ninja");
});
module.exports = router;
