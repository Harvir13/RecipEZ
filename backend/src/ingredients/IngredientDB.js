import express from "express";
import { MongoClient } from "mongodb";

var app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        var server = app.listen(8085, (req, res) => {
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
            if (result === null) {
                res.send([])
            }
            else {
                res.send(result.ingredients);
            }
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects body of {userid: xxx, ingredient: {name: xxx, expiry: yyy, image: zzz}}
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

// expects {time: xxx}
app.get("/usersWithExpiringIngredients", async (req, res) => {
    let expiringUsers = []
    try {
        client.db("IngredientDB").collection("Users").find().toArray().then((result) => {
            result.forEach((user) => {
                let hasExpiring = false;
                user.ingredients.forEach((ingredient) => {
                    if (ingredient.expiry <= req.query["time"] + (86400 * 2)) hasExpiring = true;
                });
                if (hasExpiring) expiringUsers.push(user.userid);
            });
            res.send(expiringUsers);
        });
    } catch (err) {
        res.status(400).send(err);
    }
})

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/changeExpiry", async (req, res) => {
    try {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(req.body.userid) }).then((result) => {
            result.ingredients.forEach(function (value) {
                if (value.name == req.body.ingredient) {
                    value.expiry = parseInt(req.body.expiry);
                }
            });
            let updateString = {$set: { ingredients: result.ingredients }};
            client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(req.body.userid) }, updateString).then(res.send(req.body))
        });
    } catch (err) {
        res.status(400).send(err);
    }
});
