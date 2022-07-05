import express from 'express';
import {MongoClient} from 'mongodb';

var app = express()
app.use(express.json())

// const {MongoClient} = require("mongodb")
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)


app.get("/scanDB", async (req, res) => {
    try {

        //req.query should contain a json of the form {"email": "test@test.com"}
        client.db("UserDB").collection("Users").countDocuments(req.query).then(result => {
            console.log(result)
            if (result > 0) {
                console.log("User found")
                client.db("UserDB").collection("Users").find(req.query).toArray().then(result =>{
                    res.send({"id": result[0]["id"], "dietaryRestrictions": result[0]["dietaryRestrictions"]})
                })
            }
            else {
                console.log("False")
                res.send({"id": 0})
            }
        })
        
        
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
    
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


app.post("/storeUserInfo", async (req, res) => {
    try {
        //req.body should contain a json of the form {"email": "test@test.com"}
        const id = await generateUserID()
        var newUser = req.body
        newUser["id"] = id;
        newUser["dietaryRestrictions"] = [];
        const result = await client.db("UserDB").collection("Users").insertOne(newUser)
        console.log(result)
        res.send({"id": id, "dietaryRestrictions": []})
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
    
})


app.put("/updateDietaryRestrictions", async (req, res) => {
    try {
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx,xxx]}
        console.log("here")
        console.log(req.body)
        console.log(req.body["dietaryRestrictions"])
        client.db("UserDB").collection("Users").updateOne({"id": req.body["userID"]}, {$set: {"dietaryRestrictions": req.body["dietaryRestrictions"]}}).then(result => {
            console.log(result)
            res.send("Successfully updated dietary restrictions list")
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})


app.put("/updateDietaryRestrictions", async (req, res) => {
    try {
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx,xxx]}
        console.log("here")
        console.log(req.body)
        console.log(req.body["dietaryRestrictions"])
        client.db("UserDB").collection("Users").updateOne({"id": req.body["userID"]}, {$set: {"dietaryRestrictions": req.body["dietaryRestrictions"]}}).then(result => {
            console.log(result)
            res.send("Successfully updated dietary restrictions list")
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

