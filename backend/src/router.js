const express = require('express');
const RecipeManaging = require('./recipes/RecipeManaging.js')
const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const app = express()
app.use(express.json())


app.post("/addRecipe", RecipeManaging.addRecipe)
app.post("removeRecipe", RecipeManaging.removeRecipe)
app.get("getRecipe", RecipeManaging.getRecipe)


async function run () {
    try {
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