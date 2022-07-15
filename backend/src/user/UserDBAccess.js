import express from 'express';
import {MongoClient} from 'mongodb';

var app = express()
app.use(express.json())

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//req.query should contain a json of the form {"email": "test@test.com"}
app.get("/scanDB", async (req, res) => {
        client.db("UserDB").collection("Users").countDocuments(req.query).then(result => {
            console.log(result)
            if (result > 0) {
                console.log("User found")
                client.db("UserDB").collection("Users").findOne(req.query).then(result =>{
                    res.send({"userID": result["userID"]})
                })
            }
            else {
                console.log("False")
                res.send({"userID": 0})
            }
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        })  
    
})

async function generateUserID () {
    try {
        const result = await client.db("UserDB").collection("Users").countDocuments()
        const newID = result + 1
        console.log(newID)
        return newID
    }
    catch (err) {
        console.log(err)
        throw err
    }
}

//req.body should contain a json of the form {"email": "test@test.com"}
app.post("/storeUserInfo", async (req, res) => {
        const id = await generateUserID()
        var newUser = req.body
        newUser["userID"] = id;
        newUser["dietaryRestrictions"] = [];
        await client.db("UserDB").collection("Users").insertOne(newUser).then(result =>
            res.send({"userID": id})
        ).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
    
})

//expects {userID: xxx, token: xxx}
app.post("/storeToken", async (req, res) => {
        console.log(req.body)
        await client.db("UserDB").collection("Tokens").findOne({"userID": parseInt(req.body["userID"])}).then(result => {
            if (result === null) {
                var newToken = {"userID": parseInt(req.body["userID"], 10), "token": req.body["token"]}
                client.db("UserDB").collection("Tokens").insertOne(newToken).then(result =>
                    res.send({"result": "New user's token has been added to DB"})
                )
            }
            else {
                res.send({"result": "User already exists, in Token Table. Did not add user to Token table again."})
            }
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
    
})

//expects ?uderids=xxx,xxx,xxx
app.get("/getTokens", async (req, res) => {
    try {
        console.log(req.query)
        var userIds = []
        var stringIdsArray = req.query["userids"].split(",")
        for (let i = 0; i < stringIdsArray.length; i++) {
            userIds.push(parseInt(stringIdsArray[i], 10))
        }
        await client.db("UserDB").collection("Tokens").find({"userID": {$in: userIds}}).toArray().then(result =>
            res.send(result)
        )
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
    
})

//req.body - {userID: xxx, ingredient: xxx}
app.put("/addToDietaryRestrictions", async(req, res) => {
    try {
        console.log(req.body)
        var restrictions = req.body["restriction"]
        client.db("UserDB").collection("Users").updateOne({"userID": parseInt(req.body["userID"], 10)}, {$push: {"dietaryRestrictions": restrictions}}).then(result => {
            res.send({"result": "Successfully updated dietary restrictions list"})
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx,xxx]}
app.put("/deleteFromDietaryRestrictions", async (req, res) => {
    try {
        console.log(req.body)
        var restrictions = req.body["restriction"]
        client.db("UserDB").collection("Users").updateOne({"userID": parseInt(req.body["userID"], 10)}, {$pull: {"dietaryRestrictions": restrictions}}).then(result => {
            res.send({"result": "Successfully updated dietary restrictions list"})
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get("/getDietaryRestrictions", async (req, res) => {
    try {
        console.log(req.query)
        var userID = parseInt(req.query["userid"], 10)
        client.db("UserDB").collection("Users").findOne({"userID": userID}).then(result => {
            res.send(result)
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

async function run () {
    try {
        await client.connect()
        console.log("Successfully connected to database")
        var server = app.listen(8081, (req, res) => {
            var host = server.address().address
            var port = server.address().port
            console.log("Example server successfully running at http://%s:%s", host, port)
        })
    }
    catch (err) {
        console.log(err)
        await client.close()

    }
}

run()
