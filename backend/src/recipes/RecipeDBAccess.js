import express from 'express';
import {MongoClient} from 'mongodb';
// const express = require('express')
// const {MongoClient} = require('mongodb')

var app = express()
app.use(express.json())

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//TODO: Add this

// public Recipe getRecipeFromCache(String query) {
//     return null;
// }

//req.body should contain data like {userID: xxx, recipeID: xxx, path:xxx, image:xx, path:xxx}
app.post("/addToBookmarkedList", async (req, res) => {
        console.log(req.body)
        var newEntry = {}
        newEntry["userID"] = parseInt(req.body["userID"], 10)
        newEntry["recipeID"] = parseInt(req.body["recipeID"], 10)
        newEntry["path"] = req.body["path"]
        newEntry["image"] = req.body["image"]
        newEntry["title"] = req.body["title"]

        client.db("RecipeDB").collection("Paths").findOne({"userID": newEntry["userID"], "path": req.body["path"]}).then(result => {
            console.log(result)
            if(result === null) {
                client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(newEntry).then(result => {
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

export function addToBookmarkedList (userID, recipeID, path, title, image) {
    return new Promise ((resolve, reject) => {
        var newEntry = {}
        newEntry["userID"] = parseInt(userID, 10)
        newEntry["recipeID"] = parseInt(recipeID, 10)
        newEntry["path"] = path
        newEntry["image"] = image
        newEntry["title"] = title

        //TALK ABOUNT THIS

        // client.db("RecipeDB").collection("Paths").findOne({"userID": newEntry["userID"], "path": path}).then(result => {
        //     console.log(result)
        //     if(result === null) {
        //         client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(newEntry).then(result => {
        //             console.log(result)
        //         })
        //     }
        // })
        client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(newEntry).then(result => {
            console.log(result)
            return resolve({"status": 200, "result": "Successfully added recipe to bookmarked list"})
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        })   
    })
        
}

//req.body should contain data like {userID: xxx, recipeID: xxx}
app.post("/removeFromBookmarkedList", async (req, res) => {
        console.log(req.body)
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(req.body["userID"], 10)
        entryToDelete["recipeID"] = parseInt(req.body["recipeID"], 10)
        client.db("RecipeDB").collection("BookmarkedRecipes").deleteOne(entryToDelete).then(result => {
            console.log("delete recipe")
            console.log(result)
            if (result["deletedCount"] === 0) {
                console.log("here")
                res.status(453).send({"result": "Missing recipe from bookmarked list"})
            }
            else {
                res.send({"result": "Successfully deleted recipe from bookmarked list"})
            }
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

export function removeFromBookmarkedList(userID, recipeID) {
    return new Promise((resolve, reject) => {
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(userID, 10)
        entryToDelete["recipeID"] = parseInt(recipeID, 10)
        client.db("RecipeDB").collection("BookmarkedRecipes").deleteOne(entryToDelete).then(result => {
            console.log("delete recipe")
            console.log(result)
            if (result["deletedCount"] === 0) {
                console.log("here")
                return reject({"status": 453, "result": "Missing recipe from bookmarked list"})
            }
            else {
                return resolve({"status": 200, "result": "Successfully deleted recipe from bookmarked list"})
            }
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

//req.query should contain data like ?userid=xxx
app.get("/getBookmarkedRecipes", async (req, res) => {
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
            
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

export function getBookmarkedRecipes(userid) {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("BookmarkedRecipes").find({"userID": parseInt(userid, 10)}).toArray().then(result => {
            console.log("BOOKMARKED RECIPES:" + result)
            client.db("RecipeDB").collection("Paths").find({"userID": parseInt(userid, 10)}).toArray().then(result2 => {
                console.log("PATHS:" + result2)
                var retObj = {};
                retObj["paths"] = result2
                retObj["recipes"] = result
                retObj["status"] = 200
                console.log(retObj)
                return resolve(retObj)
            })
            
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

//req.body should contain data like {userID: xxx, path:/home/xxx}
app.post("/addToPathList", async (req, res) => {
        console.log(req.body)
        var newEntry = {}
        newEntry["userID"] = parseInt(req.body["userID"], 10)
        newEntry["path"] = req.body["path"]
        client.db("RecipeDB").collection("Paths").findOne(newEntry).then(result => {
            if (result != null) {
                return res.status(456).send({"result": "Path already exists"})
            }
            else {
                client.db("RecipeDB").collection("Paths").insertOne(newEntry).then(result => {
                    console.log(result)
                    res.send({"result": "Successfully added path to path list"})
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

export function addToPathList(userID, path) {
    return new Promise((resolve, reject) => {
        var newEntry = {}
        newEntry["userID"] = parseInt(userID, 10)
        newEntry["path"] = path
        client.db("RecipeDB").collection("Paths").findOne(newEntry).then(result => {
            if (result != null) {
                return reject({"status": 456, "result": "Path already exists"})
            }
            else {
                client.db("RecipeDB").collection("Paths").insertOne(newEntry).then(result => {
                    console.log(result)
                    return resolve({"status": 200, "result": "Successfully added path to path list"})
                })
            }
        })
        .catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

//req.body should contain data like {userID: xxx, path: xxx}
app.post("/removeFromPathList", async (req, res) => {
        console.log(req.body)
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(req.body["userID"], 10)
        client.db("RecipeDB").collection("Paths").deleteOne(entryToDelete).then(result => {
            console.log(result)
            if (result["deletedCount"] === 0) {
                return res.status(457).send({"result": "Path does not exist"})
            }
            else {
                res.send({"result": "Successfully deleted recipe from paths list"})
            }
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

export function removeFromPathList(userID, path) {
    return new Promise((resolve, reject) => {
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(userID, 10)
        entryToDelete["path"] = path
        client.db("RecipeDB").collection("Paths").deleteOne(entryToDelete).then(result => {
            console.log(result)
            if (result["deletedCount"] === 0) {
                return reject({"status": 457, "result": "Path does not exist"})
            }
            else {
                return resolve({"status": 200, "result": "Successfully deleted path from paths list"})
            }
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

//req.query should contain data like ?userid=xxx
app.get("/getPaths", async (req, res) => {
        console.log(req.query)
        client.db("RecipeDB").collection("Paths").find({"userID": parseInt(req.query["userid"], 10)}).toArray().then(result => {
            console.log(result)
            res.send(result)
            
        }).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

export function getPaths(userid) {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("Paths").find({"userID": parseInt(userid, 10)}).toArray().then(result => {
            var retObj = {}
            retObj["status"] = 200
            retObj["result"] = result
            return resolve(retObj)
            
        }).catch(err => {
            console.log(err)
            return reject({"status": 400, "result": err})
        }) 
    })
}

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

// module.exports = {getPaths, removeFromPathList, addToPathList, getBookmarkedRecipes, removeFromBookmarkedList, addToBookmarkedList}