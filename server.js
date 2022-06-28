const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const PORT = 8000;

let db,
  dbConnectionString = process.env.DB_STRING,
  dbName = "starwarsquotes",
  collection;

MongoClient.connect(dbConnectionString).then((client) => {
  console.log("Connected to Database");
  const db = client.db("star-wars-quotes");
  const quotesCollection = db.collection("quotes");
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  app.get("/", (req, res) => {
    quotesCollection
      .find()
      .toArray()
      .then((results) => {
        console.log(results);
        res.render("index.ejs", { quotes: results });
      })
      .catch((error) => console.error(error));
  });

  app.post("/quotes", (req, res) => {
    quotesCollection
      .insertOne(req.body)
      .then((result) => {
        console.log(result);
        res.redirect("/");
      })
      .catch((error) => console.error(error));
  });

  app.put("/quotes", (req, res) => {
    quotesCollection
      .findOneAndUpdate(
        { name: "Yoda" },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote,
          },
        },
        {
          upsert: true,
        }
      )
      .then((result) => {
        console.log(result);
        res.json("Success");
      })
      .catch((error) => console.error(error));
  });
  app.delete("/quotes", (req, res) => {
    quotesCollection
      .deleteOne({ name: req.body.name })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.json("No quote to delete");
        }
        res.json("Deleted Darth Vader's quote");
      })
      .catch((error) => console.error(error));
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
