import express from 'express';
import fetch from 'node-fetch';

var app = express()
app.use(express.json())

app.post("/addRecipe", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, recipeID: xxx}
        fetch("http://localhost:8083/addToBookmarkedList", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.text()
        ).then(data => {
            res.send(data)
            console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})


app.delete("/removeRecipe", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, recipeID: xxx}
        fetch("http://localhost:8083/removeFromBookmarkedList", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.text()
        ).then(data => {
            res.send(data)
            console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//ASK GROUP HOW TO DO THIS ONE

// app.get("/requestFilteredRecipes", async (req, res) => {
//     try {
//         var ingredients = req.query["ingredients"]

//         // I think this is important, but for MVP we can use a default
//         //var missingThreshold = req.query["missingthreshold"] 
//         var missingThreshold = 0.4 // recipes will be suggested if the user has 40% of the ingredients
//         var filters = JSON.parse(req.query["filters"])

//         var ingredientList = "" + ingredients[0]
//         for(let i = 1; i < ingredients.length; i++) {
//             ingredientList = ingredientList + ",+" + ingredients[i]
//         }

//         fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
//             response.json()
//         ).then (data => {
//             console.log(data)
//             if (data.length === 0) {
//                 res.send([])
//             }

//             var idList = "" + data[0]
//             for (let j = 1; j < data.length; j++) {
//                 idList = idList + "," + data[j]
//             }

//             fetch("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList).then(response2 =>
//                 response2.json()
//             ).then(data2 => {
//                 returnList = []
//                 for (let k = 0; k < data2.length; k++) {
//                     for (let key in filters) {
//                         if (filters[key] !== data2[k][key]) {

//                         }
//                     }
//                 }
//             })


//         })

//     }
//     catch (err) {
//         console.log(err)
//         res.status(400).send(err)
//     }
// })

app.get("/generateSuggestedRecipesList", async (req, res) => {
    try {
        var ingredients = req.query["ingredientsinpantry"]

        // do we really need this, might as well jsut give the entire list and they can be rendered accordingly
        //var maxValue = req.query["maxvalue"] 
        
        // I think this is important, but for MVP we can use a default
        // var missingThreshold = req.query["missingthreshold"]
        var missingThreshold = 4 // recipes will be suggested if the user is missing at most 4 ingredients
        // missing ingredients query is missedIngredientCount=

        var ingredientList = "" + ingredients[0]
        for(let i = 1; i < ingredients.length; i++) {
            ingredientList = ingredientList + ",+" + ingredients[i]
        }

        fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            console.log(data)
            res.send(data)
        })

    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get("/searchRecipe", async (req, res) => {
    try {
        //TODO: check if Recipe is in cache
        var name = encodeURIComponent(req.query["recipename"])
        fetch("http://localhost:8083/getRecipeFromAPI?recipename=" + name).then(response =>
            response.json()
        ).then(data => {
            res.send(data)
            console.log(data)
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})


async function run () {
    try {
        console.log("Successfully connected to database")
        var server = app.listen(8084, (req, res) => {
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
