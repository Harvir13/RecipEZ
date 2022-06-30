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

//req.query is of the form ?ingredients=xxx,xxx&filters=xxx,xxx where the filters are taken as true
app.get("/requestFilteredRecipes", async (req, res) => {
    try {
        console.log(req.query)
        var ingredients = req.query["ingredients"].split(",")

        // I think this is important, but for MVP we can use a default
        //var missingThreshold = req.query["missingthreshold"] 
        var missingIngredientThreshold = 4 // recipes will be suggested if the user has 40% of the ingredients

        var filterList = req.query["filters"].split(",")
        var filters = {}
        for (let a = 0; a < filterList.length; a++) {
            filters[filterList[a]] = true
        }

        console.log(filters)

        var ingredientList = "" + ingredients[0]
        for(let i = 1; i < ingredients.length; i++) {
            ingredientList = ingredientList + ",+" + ingredients[i]
        }

        fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            console.log(data)
            if (data.length === 0) {
                res.send([])
            }

            var idList = "" + data[0].id
            for (let j = 1; j < data.length; j++) {
                idList = idList + "," + data[j].id
            }
            // console.log(idList)

            fetch("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response2 =>
                response2.json()
            ).then(data2 => {
                var returnList = []
                console.log(data2)
                
                for (let k = 0; k < data2.length; k++) {
                    var include = 1
                    for (let key in filters) {
                        // console.log(key)
                        console.log(key)
                        console.log(filters[key])
                        console.log(data2[k][key])
                        if (key === "cuisine") {
                            if (!(data2[k][key].includes(filters[key]))) {
                                include = 0
                            }
                        }
                        else if (filters[key] !== data2[k][key]) {
                            include = 0
                        }
                    }

                    if (include === 1) {
                        returnList.push(data[k])
                    }
                }
                // console.log(returnList)
                var recipesWithTitles = checkForTitles(returnList)
                res.send(recipesWithTitles)
            })


        })

    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

function checkForTitles(recipeList) {
    var hasTitle = []
    for (let i = 0; i < recipeList.length; i++) {
        if (recipeList[i].hasOwnProperty("title")) {
            hasTitle.push(recipeList[i])
        }
    }
    return hasTitle
}

app.get("/generateSuggestedRecipesList", async (req, res) => {
    try {
        var ingredients = req.query["ingredientsinpantry"].split(",")
        console.log(ingredients[1])

        // do we really need this, might as well jsut give the entire list and they can be rendered accordingly
        //var maxValue = req.query["maxvalue"] 
        
        // I think this is important, but for MVP we can use a default
        // var missingThreshold = req.query["missingthreshold"]
        var missingIngredientThreshold = 4 // recipes will be suggested if the user is missing at most 4 ingredients
        // missing ingredients query is missedIngredientCount=

        var ingredientList = "" + ingredients[0]
        for(let i = 1; i < ingredients.length; i++) {
            ingredientList = ingredientList + ",+" + ingredients[i]
        }

        fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            // console.log(data)
            var recipesWithTitles = checkForTitles(data)
            res.send(recipesWithTitles)
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
