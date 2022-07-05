import express from 'express';
import {MongoClient} from 'mongodb';
import fetch from 'node-fetch';

var app = express()
app.use(express.json())

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//TODO: Add this

// public Recipe getRecipeFromCache(String query) {
//     return null;
// }

//req.body should contain data like {userID: xxx, recipeID: xxx, path:/home/xxx, title: xxx, image: xxx}
app.post("/addToBookmarkedList", async (req, res) => {
    try {
        console.log(req.body)
        client.db("RecipeDB").collection("BookmarkedRecipes").insertOne(req.body).then(result => {
            console.log(result)
            res.send("Successfully added recipe to bookmarked list")
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.body should contain data like {userID: xxx, recipeID: xxx}
app.delete("/removeFromBookmarkedList", async (req, res) => {
    try {
        console.log(req.body)
        client.db("RecipeDB").collection("BookmarkedRecipes").deleteOne(req.body).then(result => {
            console.log(result)
            res.send("Successfully deleted recipe from bookmarked list")
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
        client.db("RecipeDB").collection("BookmarkedRecipes").find({"userID": parseInt(req.query["userid"])}).toArray().then(result => {
            console.log(result)
            res.send(result)
        })   
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})


// app.get("/getRecipeFromAPI", async (req, res) => {
//     try {
//         //req.query should contain {recipeName: xxxx}
//         var name = encodeURIComponent(req.query["recipename"])
//         console.log(name)
//         fetch("https://api.spoonacular.com/recipes/complexSearch?query=" + name + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
//             response.json()
//         ).then (data => {
//             console.log(data)
//             res.send(data)
//         })
        
//     }
//     catch (err) {
//         console.log(err)
//         res.status(400).send(err)
//     }
// })

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