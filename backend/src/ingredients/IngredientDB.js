import express from "express";
import { MongoClient } from "mongodb";
// var express = require("express");
// var fetch = require("node-fetch");
// var { MongoClient } = require("mongodb");

var app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        var server = app.listen(8081, (req, res) => {
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

// expects {userid: xxx}
app.get("/getIngredients", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.query["userid"]) }).then((result) => {
            res.send(result.ingredients);
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects body of {userid: xxx, ingredient: {name: xxx, expiry: yyy}}
app.post("/storeIngredient", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid) }).then((result) => {
            let alreadyHaveIng = false;
            result.ingredients.forEach((ingredient => {
                if (ingredient.name == req.body.ingredient.name) alreadyHaveIng = true;
            }));
            if (!alreadyHaveIng) result.ingredients.push(req.body.ingredient);
            let newIngredients = {$set: { ingredients: result.ingredients }};
            client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid) }, newIngredients).then(res.send(req.body));
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects body of {userid: xxx, ingredient: xxx}
app.delete("/removeIngredient", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid) }).then((result) => {
            let newIngredients = result.ingredients.filter(function (value) {
                return value.name != req.body.ingredient;
            });
        let updateString = {$set: { ingredients: newIngredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid) }, updateString).then((data) => res.send(data))
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get("/getAllIngredientsInPantry"); //?

// expects {userid: xxx, ingredient: xxx, time: xxx}
app.get("/isExpired", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.query["userid"]) }).then((result) => {
            let ingredient = result.ingredients.filter(function (value) {
                return value.name == req.query["ingredient"];
            });
            if (ingredient[0].expiry <= parseInt(req.query["time"])) {
                res.send(true);
            } else {
                res.send(false);
            }
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/changeExpiry", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid) }).then((result) => {
            let updatedIngredients = result.ingredients.filter(function (value) {
                if (value.name == req.body.ingredient) {
                    value.expiry = req.body.expiry;
                }
            });
        let updateString = {$set: { ingredients: updatedIngredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid), updateString}).then(res.send(req.body))
        });
    } catch (err) {
        res.status(400).send(err);
    }
});
