import express from "express";
import { MongoClient } from "mongodb";
// const express = require('express')
// const {MongoClient} = require('mongodb')

var app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    await client.connect();
    var server = app.listen(8085, (req, res) => {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Example server successfully running at http://%s:%s", host, port);
    });
}

run();

// expects {userid: xxx}
app.get("/getIngredients", async (req, res) => {
    client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.query["userid"], 10) }).then((result) => {
        if (result === null) {
            res.status(404).send(new Error("Error: invalid userID"));
        }
        else {
            console.log(result.ingredients)
            res.send(result.ingredients);
        }
    }).catch((err) => {
        res.status(400).send(err);
    });
});

export function getIngredients(userid) {
    return new Promise((resolve, reject) => {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            if (result === null) {
                console.log("result is empty")
                return resolve({"status": 200, "result": []})
            }
            else {
                console.log(result.ingredients)
                return resolve({"status": 200, "result": result.ingredients});
            }
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}


// expects body of {userid: xxx, ingredient: {name: xxx, expiry: yyy, image: zzz}}
app.post("/storeIngredient", async (req, res) => {
    if (req.body.ingredient.expiry < 0) return res.status(405).send(new Error("Error: invalid expiry value"));
    client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid, 10) }).then((result) => {
        if (result == null) return res.status(404).send(new Error("Error: invalid userID"));
        let alreadyHaveIng = false;
        result.ingredients.forEach((ingredient => {
            if (ingredient.name == req.body.ingredient.name) alreadyHaveIng = true;
        }));
        if (!alreadyHaveIng) result.ingredients.push(req.body.ingredient);
        let newIngredients = {$set: { ingredients: result.ingredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid, 10) }, newIngredients).then(res.send(req.body));
    }).catch((err) => {
        res.status(400).send(err);
    });
});

export function storeIngredient(userid, inputIngredient) {
    return new Promise((resolve, reject) => {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            let alreadyHaveIng = false;
            result.ingredients.forEach((ingredient => {
                if (ingredient.name == inputIngredient.name) alreadyHaveIng = true;
            }));
            if (!alreadyHaveIng) result.ingredients.push(inputIngredient);
            let newIngredients = {$set: { ingredients: result.ingredients }};
            client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, newIngredients).then(result => {
                return resolve({"status": 200, "result": inputIngredient});
            })
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

// expects body of {userid: xxx, ingredient: xxx}
app.delete("/removeIngredient", async (req, res) => {
    client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid, 10) }).then((result) => {
        if (result == null) return res.status(404).send(new Error("Error: invalid userID"));
        let newIngredients = result.ingredients.filter(function (value) {
            return value.name != req.body.ingredient;
        });
    let updateString = {$set: { ingredients: newIngredients }};
    client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid, 10) }, updateString).then((data) => res.send(data))
    }).catch((err) => {
        res.status(400).send(err);
    });
});

export function removeIngredient(userid, ingredient) {
    return new Promise((resolve, reject) => {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            let newIngredients = result.ingredients.filter(function (value) {
                return value.name != ingredient;
            });
        let updateString = {$set: { ingredients: newIngredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, updateString).then((data) => {
            return resolve({"status": 200, "result": "Successfully deleted ingredient"})
        })
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

// expects {time: xxx}
app.get("/usersWithExpiringIngredients", async (req, res) => {
    if (req.query["time"] < 0) return res.status(405).send(new Error("Error: invalid expiry value"));
    let expiringUsers = []
    client.db("IngredientDB").collection("Users").find().toArray().then((result) => {
        result.forEach((user) => {
            let hasExpiring = false;
            user.ingredients.forEach((ingredient) => {
                if (ingredient.expiry <= req.query["time"] + (86400 * 2)) hasExpiring = true;
            });
            if (hasExpiring) expiringUsers.push(user.userid);
        });
        res.send(expiringUsers);
    }).catch((err) => {
        res.status(400).send(err);
    });
})

export function usersWithExpiringIngredients(time) {
    return new Promise((resolve, reject) => {
        let expiringUsers = []
        client.db("IngredientDB").collection("Users").find().toArray().then((result) => {
            result.forEach((user) => {
                let hasExpiring = false;
                user.ingredients.forEach((ingredient) => {
                    if (ingredient.expiry <= time + (86400 * 2)) hasExpiring = true;
                });
                if (hasExpiring) expiringUsers.push(user.userid);
            });
            return resolve({"status": 200, "result": expiringUsers})
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/changeExpiry", async (req, res) => {
    if (req.body.expiry < 0) return res.status(405).send(new Error("Error: invalid expiry value"));
    client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid, 10) }).then((result) => {
        if (result == null) return res.status(404).send(new Error("Error: invalid userID"));
        result.ingredients.forEach(function (value) {
            if (value.name == req.body.ingredient) {
                value.expiry = parseInt(req.body.expiry, 10);
            }
        });
        let updateString = {$set: { ingredients: result.ingredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid, 10) }, updateString).then(res.send(req.body))
    }).catch((err) => {
        res.status(400).send(err);
    });
});

export function changeExpiry(userid, ingredient, expiry) {
    return new Promise((resolve, reject) => {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            result.ingredients.forEach(function (value) {
                if (value.name == ingredient) {
                    value.expiry = parseInt(expiry, 10);
                }
            });
            let updateString = {$set: { ingredients: result.ingredients }};
            client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, updateString).then(result => {
                return resolve({"status": 200, "result": "Successfully changed expiry date"})
            })
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}
