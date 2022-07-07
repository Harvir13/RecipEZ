import express from "express";
import { MongoClient } from "mongodb";
import fetch from "node-fetch";
// var express = require('express')
// var fetch = require('node-fetch')
// var {MongoClient} = require('mongodb')

let API_KEY = "1b961ea726c449868f6bffe1dd76da71";

var app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    var server = app.listen(8086, (req, res) => {
      var host = server.address().address;
      var port = server.address().port;
      console.log(
        "Example server successfully running at http://%s:%s",
        host,
        port
      );
    });
  } catch (err) {
    await client.close();
  }
}

run();

//expects {userid: xxx}
app.get("/requestIngredients", async (req, res) => {
  console.log(req.query);
  try {
    fetch(
      "http://localhost:8085/getIngredients?userid=" + req.query["userid"],
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.text())
      .then((data) => {
        res.send(data);
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects {userid: xxx, ingredient: xxx}
app.post("/deleteIngredient", async (req, res) => {
  try {
    fetch("http://localhost:8085/removeIngredient", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })
      .then((response) => response.text())
      .then((data) => {
        res.send(data);
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/updateExpiryDate", async (req, res) => {
  try {
    console.log(req.body);
    fetch("http://localhost:8085/changeExpiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    })
      .then((response) => response.text())
      .then((data) => res.send(data));
  } catch (err) {
    res.status(400).send(err);
  }
});

//expects {ingredient: xxx}
app.get("/searchForIngredient", async (req, res) => {
  try {
    fetch(
      "https://api.spoonacular.com/food/ingredients/search?query=" +
        req.query["ingredient"] +
        "&number=1&apiKey=" +
        API_KEY,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        res.send(data.results);
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects {string: xxx}
app.get("/getIngredientSuggestions", async (req, res) => {
  try {
    fetch(
      "https://api.spoonacular.com/food/ingredients/search?query=" +
        req.query["string"] +
        "&apiKey=" +
        API_KEY,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        res.send(data.results);
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects {ingredient: xxx}
app.get("/requestExpiryDate", async (req, res) => {
  try {
    fetch(
      "https://shelf-life-api.herokuapp.com/search?q=" +
        req.query["ingredient"],
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length == 0 || data.code == 500) {
          res.send("-1");
          return;
        }
        console.log(data);
        let minLevDistance = Number.MAX_VALUE;
        let desiredIngredient;
        data.forEach((ingredient) => {
          let generalName = ingredient.name;
          //let generalName = ingredient.name.split('-')
          //console.log(generalName[0].trim().toLowerCase())
          //console.log(req.query["ingredient"].toLowerCase())
          //console.log(generalName)
          let levDistance = levenshtein_distance(
            generalName,
            req.query["ingredient"]
          );
          console.log("" + generalName + " : " + levDistance);
          if (levDistance < minLevDistance) {
            minLevDistance = levDistance;
            desiredIngredient = ingredient;
          }
        });
        fetch(
          "https://shelf-life-api.herokuapp.com/guides/" + desiredIngredient.id,
          {
            method: "GET",
            Headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((expiryData) => {
            let wantedMethod = null;
            expiryData.methods.forEach((method) => {
              if (method.location == "Refrigerator") wantedMethod = method;
              else if (method.location == "Pantry" && wantedMethod == null)
                wantedMethod = method;
              else wantedMethod = method;
            });
            console.log(expiryData);
            res.send(wantedMethod.expirationTime.toString());
          });
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects body of {userid: xxx, ingredient: xxx}
app.post("/addIngredient", async (req, res) => {
  try {
    fetch(
      "http://localhost:8086/searchForIngredient?ingredient=" +
        req.body.ingredient,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((spoonacularIng) => {
        console.log(spoonacularIng);
        if (spoonacularIng.length == 0) {
          res.send("No ingredient found");
          return;
        }
        fetch(
          "http://localhost:8086/requestExpiryDate?ingredient=" +
            req.body.ingredient,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.text())
          .then((expiryVal) => {
            console.log(expiryVal);
            if (parseInt(expiryVal) == -1) {
              res
                .status(400)
                .send(
                  "No expiry date found for ingredient. Enter one manually"
                );
              return;
            }
            let expiryDate =
              Math.floor(Date.now() / 1000) + parseInt(expiryVal);
            let ingredient = {
              userid: req.body.userid,
              ingredient: {
                name: req.body.ingredient,
                expiry: expiryDate,
                image: spoonacularIng[0].image,
              },
            };
            console.log(ingredient);
            fetch("http://localhost:8085/storeIngredient", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(ingredient),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                res.send(data.ingredient);
              });
          });
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects {userid: xxx, time: xxx}
app.get("/scanExpiryDates", async (req, res) => {
  try {
    fetch(
      "http://localhost:8085/getIngredients?userid=" + req.query["userid"],
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        let expiringSoon = [];
        data.forEach((ingredient) => {
          if (ingredient.expiry - 86400 * 2 <= req.query["time"])
            expiringSoon.push(ingredient); // 86400 = 1 day in seconds
        });
        res.send(expiringSoon);
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// expects { {restrictions: xxx, yyy, zzz}, ingredient: xxx}
app.get("/checkDietaryRestrictions", async (req, res) => {
  let restrictions = req.query["restrictions"].split(",");
  let ingredientRestricted = false;
  restrictions.forEach((ingredient) => {
    if (ingredient == req.query["ingredient"]) {
      ingredientRestricted = true;
    }
  });
  if (ingredientRestricted) res.send(false); // cannot add ingredient
  else res.send(true); // allowed to add ingredient
});

function levenshtein_distance(inputString, realString) {
  let prevRow = [];
  let currRow = [];
  for (let x = 0; x < realString.length + 1; x++) {
    prevRow[x] = x;
  }
  for (let i = 0; i < inputString.length; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < realString.length; j++) {
      let deletionCost = prevRow[j + 1] + 1;
      let insertionCost = currRow[j] + 1;
      let substitutionCost =
        inputString[i] == realString[j] ? prevRow[j] : prevRow[j] + 1;
      currRow[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
    }
    prevRow = currRow;
    currRow = [];
  }
  return prevRow[realString.length];
}

app.get("/test", async (req, res) => {
  let dist = levenshtein_distance(req.query["input"], req.query["word"]);
  res.send(dist.toString());
});
