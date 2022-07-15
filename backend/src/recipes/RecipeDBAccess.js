import express from 'express';
import {MongoClient} from 'mongodb';

var app = express()
app.use(express.json())

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//TODO: Add this

// public Recipe getRecipeFromCache(String query) {
//     return null;
// }

//req.body should contain data like {userID: xxx, recipeID: xxx, path:xxx}
app.post("/addToBookmarkedList", async (req, res) => {
        console.log(req.body)
        var newEntry = req.body
        newEntry["userID"] = parseInt(req.body["userID"], 10)
        newEntry["recipeID"] = parseInt(req.body["recipeID"], 10)
        client.db("RecipeDB").collection("Paths").findOne({"userID": newEntry["userID"], "path": req.body["path"]}).then(result => {
            console.log(result)
            if(result === null) {
                client.db("RecipeDB").collection("BookmarkedRecipes").insertOne({"userID": newEntry["userID"], "path": req.body["path"]}).then(result => {
                    console.log(result)
                })
            }
        })
        client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(newEntry).then(result => {
            console.log(result)
            res.send({"result": "Successfully added recipe to bookmarked list"})
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        })   
})

//req.body should contain data like {userID: xxx, recipeID: xxx}
app.post("/removeFromBookmarkedList", async (req, res) => {
    try {
        console.log(req.body)
        var entryToDelete = req.body
        entryToDelete["userID"] = parseInt(req.body["userID"], 10)
        entryToDelete["recipeID"] = parseInt(req.body["recipeID"], 10)
        client.db("RecipeDB").collection("BookmarkedRecipes").deleteOne(entryToDelete).then(result => {
            console.log(result)
            if (result["deletedCount"] !== 1) {
                res.send({"result": "Error occured when deleting"})
            }
            else {
                res.send({"result": "Successfully deleted recipe from bookmarked list"})
            }
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.query should contain data like ?userid=xxx
app.get("/getBookmarkedRecipes", async (req, res) => {
    try {
        console.log(req.query)
        client.db("RecipeDB").collection("BookmarkedRecipes").find({"userID": parseInt(req.query["userid"], 10)}).toArray().then(result => {
            console.log("BOOKMARKED RECIPES:" + result)
            client.db("RecipeDB").collection("Paths").find({"userID": parseInt(req.query["userid"], 10)}).toArray().then(result2 => {
                console.log("PATHS:" + result2)
                var retObj = {};
                retObj["paths"] = result2
                retObj["recipes"] = result
                console.log(retObj)
                res.send(retObj)
            })
            
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.body should contain data like {userID: xxx, path:/home/xxx}
app.post("/addToPathList", async (req, res) => {
    try {
        console.log(req.body)
        var newEntry = req.body
        newEntry["userID"] = parseInt(req.body["userID"])
        client.db("RecipeDB").collection("Paths").insertOne(newEntry).then(result => {
            console.log(result)
            res.send({"result": "Successfully added path to path list"})
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.body should contain data like {userID: xxx, recipeID: xxx}
app.post("/removeFromPathList", async (req, res) => {
    try {
        console.log(req.body)
        var entryToDelete = req.body
        entryToDelete["userID"] = parseInt(req.body["userID"])
        client.db("RecipeDB").collection("Paths").deleteOne(entryToDelete).then(result => {
            console.log(result)
            if (result["deletedCount"] !== 1) {
                res.send({"result": "Error occured when deleting"})
            }
            else {
                res.send({"result": "Successfully deleted recipe from paths list"})
            }
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.query should contain data like ?userid=xxx
app.get("/getPaths", async (req, res) => {
    try {
        console.log(req.query)
        client.db("RecipeDB").collection("Paths").find({"userID": parseInt(req.query["userid"], 10)}).toArray().then(result => {
            console.log(result)
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
        var server = app.listen(8083, (req, res) => {
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
