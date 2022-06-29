import express from 'express';
import {MongoClient} from 'mongodb';

var app = express()

// const {MongoClient} = require("mongodb")
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)


app.get("/scanDB", async (req, res) => {
    try {

        client.db("UserDB").collection("Users").countDocuments(req.query).then(result => {
            console.log(result)
            if (result > 0) {
                console.log("True")
                res.json({"userExists": "True"})
            }
            else {
                console.log("False")
                res.send("False")
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
        return -1
    }
}

app.post("/storeUserInfo", async (req, res) => {
    try {

        //req.query should contain a json of the form {"email": "test@test.com"}
        const id = await generateUserID()
        const newUser = req.body
        // const newUser = {"email": "test2@test.com"}
        newUser["id"] = id;
        const result = await client.db("UserDB").collection("Users").insertOne(newUser)
        console.log(result)
        res.send("Successfully added new user")
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

