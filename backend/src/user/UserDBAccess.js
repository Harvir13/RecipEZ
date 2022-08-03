const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

function scanDB(email) {
    return new Promise((resolve, reject) => {
        client.db("UserDB").collection("Users").countDocuments({email}).then(result => {
            if (result > 0) {
                client.db("UserDB").collection("Users").findOne({email}).then(result =>{
                    return resolve({"status": 200, "userID": result["userID"]})
                })
            }
            else {
                return resolve({"status": 200, "userID": 0})
            }
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

async function generateUserID () {
    const result = await client.db("UserDB").collection("Users").countDocuments()
    const newID = result + 1
    return newID
}

function storeUserInfo(email) {
    return new Promise((resolve, reject) => {
        generateUserID().then(id => {
            var newUser = {email}
        newUser["userID"] = id;
        newUser["dietaryRestrictions"] = [];
        client.db("UserDB").collection("Users").insertOne(newUser).then(result => {
            return resolve({"status": 200, "userID": id})
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
        })  
    })
}


function storeToken(userID, token) {
    return new Promise((resolve, reject) => {
        client.db("UserDB").collection("Tokens").findOne({"userID": parseInt(userID, 10)}).then(result => {
            if (result === null) {
                var newToken = {"userID": parseInt(userID, 10), token}
                client.db("UserDB").collection("Tokens").insertOne(newToken).then(result => {
                    return resolve({"status": 200, "result": "New user's token has been added to DB"})
                })
            }
            else {
                client.db("UserDB").collection("Tokens").updateOne({"userID": parseInt(userID, 10)}, {$set: {token}}).then(result => {
                    return resolve({"status": 200, "result": "Updated token"})
                })  
            }
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function getTokens(userids) {
    return new Promise((resolve, reject) => {
        var userIds = []
        var stringIdsArray = userids.split(",")
        for (let i = 0; i < stringIdsArray.length; i++) {
            userIds.push(parseInt(stringIdsArray[i], 10))
        }
        client.db("UserDB").collection("Tokens").find({"userID": {$in: userIds}}).toArray().then(result => {
            var retObj = {"status": 200}
            retObj["result"] = result
            return resolve(retObj)
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function addToDietaryRestrictions(userID, restriction) {
    return new Promise((resolve, reject) => {
        var restrictions = restriction
        client.db("UserDB").collection("Users").updateOne({"userID": parseInt(userID, 10)}, {$push: {"dietaryRestrictions": restrictions}}).then(result => {
            return resolve({"status": 200, "result": "Successfully updated dietary restrictions list"})
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}


function deleteDietaryRestrictions(userID, restriction) {
    return new Promise((resolve, reject) => {
        var restrictions = restriction
        client.db("UserDB").collection("Users").updateOne({"userID": parseInt(userID, 10)}, {$pull: {"dietaryRestrictions": restrictions}}).then(result => {
            return resolve({"status": 200, "result": "Successfully updated dietary restrictions list"})
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function getDietaryRestrictions(userid) {
    return new Promise((resolve, reject) => {
        var userID = parseInt(userid, 10)
        client.db("UserDB").collection("Users").findOne({userID}).then(result => {
            return resolve({"status": 200, result})
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

module.exports = {getDietaryRestrictions, deleteDietaryRestrictions, addToDietaryRestrictions, getTokens, storeToken, storeUserInfo, scanDB, client}
