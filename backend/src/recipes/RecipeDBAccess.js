const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//TODO: Add this

// public Recipe getRecipeFromCache(String query) {
//     return null;
// }


function addToBookmarkedList (userID, recipeID, path, title, image) {
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

function removeFromBookmarkedList(userID, recipeID) {
    return new Promise((resolve, reject) => {
        var entryToDelete = {}
        console.log("removing recipe")
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


function getBookmarkedRecipes(userid) {
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


function addToPathList(userID, path) {
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


function removeFromPathList(userID, path) {
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

function getPaths(userid) {
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

module.exports = {getPaths, removeFromPathList, addToPathList, getBookmarkedRecipes, removeFromBookmarkedList, addToBookmarkedList}