const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)
var MAX_CACHE_ENTRIES = 20

//TODO: Add this
/*
check db for recipe; if there and db not full, add and set refcount to one
if full use refcount replacement policy
if recipe already bookmarked, do nothing, if not remove refcount by 1
if refcount reaches 0 delete
*/

//for testing purposes only
function changeCacheSize(size) {
    MAX_CACHE_ENTRIES = size
}

function checkCache(recipeID) {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("Cache").findOne({ recipeid: parseInt(recipeID, 10) }).then((result) => {
            if (result == null) return resolve(false);
            else return resolve(true);
        })
    })
}

function getFromCache(recipeID) {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("Cache").findOne({ recipeid: parseInt(recipeID, 10) }).then((result) => {
            if (result == null) return reject({"status": 400, "result": "No recipe in cache"})
            delete result._id
            return resolve({"status": 200, result})
        })
    })
}

function addToCache(recipeID, recipeData, hasRecipe) {
    return new Promise((resolve, reject) => {
        if (hasRecipe) {
            var newRefcount
            client.db("RecipeDB").collection("Cache").findOne({ recipeid: parseInt(recipeID, 10) }).then((recipe) => {
                newRefcount = recipe.refcount + 1
            })
            client.db("RecipeDB").collection("Cache").updateOne({ recipeid: parseInt(recipeID, 10) }, {
                $set: { refcount: newRefcount }
            }).then(() => {
                return resolve({"status": 200, "result": "new ref count: " + newRefcount});
            })
        } else {
            var numEntries
            client.db("RecipeDB").collection("Cache").countDocuments({}).then((dbEntries) => {
                numEntries = dbEntries
            })
            if (numEntries >= MAX_CACHE_ENTRIES) {
                client.db("RecipeDB").collection("Cache").find().sort({refcount: 1}).limit(1).toArray(async (err, res) => {
                    if (err) return
                    await client.db("RecipeDB").collection("Cache").deleteOne({ recipeid: res[0].recipeid })
                })
            }
            const recipeInfo = {
                recipeid: parseInt(recipeID, 10),
                refcount: 1,
                recipedata: recipeData
            }
            client.db("RecipeDB").collection("Cache").insertOne(recipeInfo).then(() => {
                return resolve({"status": 200, "result": "added " + recipeID})
            })
        }
    })
}

function removeFromCache(recipeID) {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("Cache").findOne({ recipeid: parseInt(recipeID, 10) }).then((result) => {
            if (result == null) return resolve({"status": 200, "result": "No recipe to remove"})
            if (result.refcount > 1) {
                const newRefcount = result.refcount - 1
                client.db("RecipeDB").collection("Cache").updateOne({ recipeid: parseInt(recipeID, 10) }, {
                    $set: { refcount: newRefcount }
                }).then(() => {
                    return resolve({"status": 200, "result": "new ref count: " + newRefcount});
                })
            }
            else {
                client.db("RecipeDB").collection("Cache").deleteOne({ recipeid: parseInt(recipeID, 10) }).then(() => {
                    return resolve({"status": 200, "result": "Deleted recipe " + recipeID})
                })
            }
        })
    })
}

function flushCache() {
    return new Promise((resolve, reject) => {
        client.db("RecipeDB").collection("Cache").drop().then(() => {
            resolve("Cache flushed")
        })
    })
}

function addToBookmarkedList(userID, recipeID, path, title, image) {
    return new Promise ((resolve, reject) => {
        if (parseInt(userID, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        var newEntry = {}
        newEntry["userID"] = parseInt(userID, 10)
        newEntry["recipeID"] = parseInt(recipeID, 10)
        newEntry["path"] = path
        newEntry["image"] = image
        newEntry["title"] = title
        client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(newEntry).then(result => {
            return resolve({"status": 200, "result": "Successfully added recipe to bookmarked list"})
        }).catch(err => {
            return reject({"status": 400, "result": err})
        })   
    })
        
}

function removeFromBookmarkedList(userID, recipeID) {
    return new Promise((resolve, reject) => {
        if (parseInt(userID, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(userID, 10)
        entryToDelete["recipeID"] = parseInt(recipeID, 10)
        client.db("RecipeDB").collection("BookmarkedRecipes").deleteOne(entryToDelete).then(result => {
            if (result["deletedCount"] === 0) {
                return reject({"status": 453, "result": "Missing recipe from bookmarked list"})
            }
            else {
                return resolve({"status": 200, "result": "Successfully deleted recipe from bookmarked list"})
            }
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function getBookmarkedRecipes(userid) {
    return new Promise((resolve, reject) => {
        if (parseInt(userid, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        client.db("RecipeDB").collection("BookmarkedRecipes").find({"userID": parseInt(userid, 10)}).toArray().then(result => {
            client.db("RecipeDB").collection("Paths").find({"userID": parseInt(userid, 10)}).toArray().then(result2 => {
                var retObj = {};
                retObj["paths"] = result2
                retObj["recipes"] = result
                retObj["status"] = 200
                return resolve(retObj)
            })
            
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function addToPathList(userID, path) {
    return new Promise((resolve, reject) => {
        if (parseInt(userID, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        var newEntry = {}
        newEntry["userID"] = parseInt(userID, 10)
        newEntry["path"] = path
        client.db("RecipeDB").collection("Paths").findOne(newEntry).then(result => {
            if (result != null) {
                return reject({"status": 456, "result": "Path already exists"})
            }
            else {
                client.db("RecipeDB").collection("Paths").insertOne(newEntry).then(result => {
                    return resolve({"status": 200, "result": "Successfully added path to path list"})
                })
            }
        })
        .catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function removeFromPathList(userID, path) {
    return new Promise((resolve, reject) => {
        if (parseInt(userID, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        var entryToDelete = {}
        entryToDelete["userID"] = parseInt(userID, 10)
        entryToDelete["path"] = path
        client.db("RecipeDB").collection("Paths").deleteOne(entryToDelete).then(result => {
            if (result["deletedCount"] === 0) {
                return reject({"status": 457, "result": "Path does not exist"})
            }
            else {
                return resolve({"status": 200, "result": "Successfully deleted path from paths list"})
            }
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

function getPaths(userid) {
    return new Promise((resolve, reject) => {
        if (parseInt(userid, 10) <= 0) {
            return reject({"status": 404, "result": "User not found"})
        }
        client.db("RecipeDB").collection("Paths").find({"userID": parseInt(userid, 10)}).toArray().then(result => {
            var retObj = {}
            retObj["status"] = 200
            retObj["result"] = result
            return resolve(retObj)
            
        }).catch(err => {
            return reject({"status": 400, "result": err})
        }) 
    })
}

module.exports = {getPaths, removeFromPathList, addToPathList, getBookmarkedRecipes, removeFromBookmarkedList, addToBookmarkedList,
    checkCache, addToCache, removeFromCache, flushCache, getFromCache, changeCacheSize}
