const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

function getIngredients(userid) {
    return new Promise((resolve, reject) => {
        console.log(userid)
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            console.log(result)
            if (result === null) {
                return reject({"status": 404, "result": "Error: invalid userID"});
            }
            else {
                return resolve({"status": 200, "result": result.ingredients});
            }
        });
    });
}

function storeIngredient(userid, inputIngredient) {
    return new Promise((resolve, reject) => {
        if (inputIngredient.expiry < 0) return reject({"status": 405, "result": "Error: invalid expiry value"});
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            // if (result == null) {
            //     return resolve({"status": 404, "result": "invalid userID"});
            // }
            let alreadyHaveIng = false;
            // if (result == null) return reject ({"status": 404, "result": "Error: invalid userID"});
            if (result !== null) {
                result.ingredients.forEach((ingredient => {
                    if (ingredient.name == inputIngredient.name) alreadyHaveIng = true;
                }));
                if (!alreadyHaveIng) result.ingredients.push(inputIngredient);
                let newIngredients = {$set: { ingredients: result.ingredients }};
                client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, newIngredients).then(result => {
                    return resolve({"status": 200, "result": inputIngredient});
                });
            }else {
                client.db("IngredientDB").collection("Users").insertOne({ userid: parseInt(userid, 10), ingredients: [inputIngredient]}).then(result => {
                    return resolve({"status": 200, "result": inputIngredient});
                });
            }
        });
    })
}

function removeIngredient(userid, ingredient) {
    return new Promise((resolve, reject) => {
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            if (result == null) return reject ({"status": 404, "result": "Error: invalid userID"});
            let newIngredients = result.ingredients.filter(function (value) {
                return value.name != ingredient;
            });
        let updateString = {$set: { ingredients: newIngredients }};
        client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, updateString).then(() => {
            return resolve({"status": 200, "result": "Successfully deleted ingredient"});
        })
        });
    });
}

function usersWithExpiringIngredients(time) {
    console.log("userWithExpiringIngredients time")
    console.log(time)
    return new Promise((resolve, reject) => {
        if (time < 0) return reject({"status": 405, "result": "Error: invalid expiry value"});
        let expiringUsers = []
        client.db("IngredientDB").collection("Users").find().toArray().then((result) => {
            result.forEach((user) => {
                let hasExpiring = false;
                var totalTime = parseInt(time, 10) + (86400 * 2)
                user.ingredients.forEach((ingredient) => {
                    var expiration = parseInt(ingredient.expiry, 10)
                    console.log(expiration)
                    console.log(totalTime)
                    if (expiration <= totalTime) {
                        console.log(user)
                        hasExpiring = true;
                    }
                });
                if (hasExpiring) expiringUsers.push(user.userid);
                console.log(expiringUsers)
            });
            return resolve({"status": 200, "result": expiringUsers})
        });
    })
}

function changeExpiry(userid, ingredient, expiry) {
    return new Promise((resolve, reject) => {
        if (expiry < 0) return reject({"status": 405, "result": "Error: invalid expiry value"});
        client.db("IngredientDB").collection("Users").findOne({ userid: parseInt(userid, 10) }).then((result) => {
            if (result == null) return reject ({"status": 404, "result": "Error: invalid userID"});
            result.ingredients.forEach(function (value) {
                if (value.name == ingredient) {
                    value.expiry = parseInt(expiry, 10);
                }
            });
            let updateString = {$set: { ingredients: result.ingredients }};
            client.db("IngredientDB").collection("Users").updateOne({ userid: parseInt(userid, 10) }, updateString).then(result => {
                return resolve({"status": 200, "result": "Successfully changed expiry date"})
            })
        });
    })
}

module.exports = {changeExpiry, usersWithExpiringIngredients, removeIngredient, storeIngredient, getIngredients, client};