import express from 'express';
import {MongoClient} from 'mongodb';

var app = express()
app.use(express.json())

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//req.query should contain a json of the form {"email": "test@test.com"}
app.get("/scanDB", async (req, res) => {
    try {
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

//req.body should contain a json of the form {"email": "test@test.com"}
app.post("/storeUserInfo", async (req, res) => {
    try {
        const id = await generateUserID()
        var newUser = req.body
        newUser["id"] = id;
        newUser["dietaryRestrictions"] = [];
        await client.db("UserDB").collection("Users").insertOne(newUser).then(result =>
            res.send({"id": id, "dietaryRestrictions": []})
        )
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
    
})

//req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx,xxx]}
app.put("/updateDietaryRestrictions", async (req, res) => {
    try {
        console.log(req.body)
        var restrictions = req.body["dietaryRestrictions"].split(",")
        client.db("UserDB").collection("Users").updateOne({"id": parseInt(req.body["userID"])}, {$set: {"dietaryRestrictions": restrictions}}).then(result => {
            res.send({"result": "Successfully updated dietary restrictions list"})
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

