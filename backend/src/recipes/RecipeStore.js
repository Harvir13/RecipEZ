import express from 'express';
import fetch from 'node-fetch';

var app = express()
app.use(express.json())

app.post("/addRecipe", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, recipeID: xxx, path: home/xxx/xxx, title: xxx, image: xxx}
        fetch("http://localhost:8083/addToBookmarkedList", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
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

app.get("/getRecipes", async (req, res) => {
    try {
        console.log(req.query)
        //req.query should contain data like ?userid=xxx
        var id = encodeURIComponent(req.query["userid"])
        fetch("http://localhost:8083/getBookmarkedRecipes?userid=" + id).then(response =>
            response.json()
        ).then(data => {
            console.log(data)
            var recipeList = []
            var pathList = []
            var currItem = {}
            var recipes = data["recipes"]
            var paths = data["paths"]
            for (let i = 0; i < recipes.length; i++) {
                currItem["userID"] = recipes[i]["userID"]
                currItem["recipeID"] = recipes[i]["recipeID"]
                currItem["title"] = recipes[i]["title"]
                currItem["image"] = recipes[i]["image"]
                currItem["path"] = recipes[i]["path"]
                // console.log(currItem)
                recipeList.push(currItem)
            }
            for (let j = 0; j < paths.length; j++) {
                currItem["userID"] = paths[j]["userID"]
                currItem["path"] = paths[j]["path"]
                pathList.push(currItem)
            }
            res.send({"recipes": recipeList, "paths": pathList})
            // console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//req.query is of the form ?ingredients=xxx,xxx&filters=xxx,xxx&restrictions=xxx,xxx where the filters are taken as true
app.get("/requestFilteredRecipes", async (req, res) => {
    try {
        console.log(req.query)
        var ingredients = req.query["ingredients"].split(",")

        // I think this is important, but for MVP we can use a default
        //var missingThreshold = req.query["missingthreshold"] 
        var missingIngredientThreshold = 4 // recipes will be suggested if the user has 40% of the ingredients

        var skipFilters = 0
        if (req.query["filters"] === "") {
            skipFilters = 1
        }
        else {
            var filterList = req.query["filters"].split(",")
            console.log(filterList)
            var filters = {}
            for (let a = 0; a < filterList.length; a++) {
                filters[filterList[a]] = true
            }

            console.log(filters)
        }


        var skipRestrictions = 0
        if (req.query["restrictions"] === "") {
            skipRestrictions = 1
        }
        else {
            var restrictions = req.query["restrictions"].split(",")
            console.log(restrictions)
        }

        var ingredientList = "" + ingredients[0] // REQUIRES AT LEAT ONE INGREDIENT
        for(let i = 1; i < ingredients.length; i++) {
            ingredientList = ingredientList + ",+" + ingredients[i]
        }

        fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            // console.log(data)
            if (data.length === 0) {
                res.send([])
            }

            var idList = ""
            var passesDietaryRestrictionsCheck

            var recipeIDToAmountOfIngredientsIhave = {};

            for (let j = 0; j < data.length; j++) {
                passesDietaryRestrictionsCheck = 1

                recipeIDToAmountOfIngredientsIhave[data[j]["id"]] = data[j]["usedIngredientCount"].toString() + " / " + (data[j]["missedIngredientCount"] + data[j]["usedIngredientCount"]).toString()

                if (skipRestrictions === 0) {
                    var missingIngredients = data[j]["missedIngredients"]
                    for (let a = 0; a < missingIngredients.length; a++) {
                        if (restrictions.indexOf(missingIngredients[a]["name"]) > -1) {
                            passesDietaryRestrictionsCheck = 0
                            break
                        }
                    }
                }
                if (passesDietaryRestrictionsCheck === 1) {
                    idList = idList + data[j]["id"].toString() + ","
                }
            }
            idList = idList.slice(0,-1)
            console.log(idList)
            

            fetch("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response2 =>
                response2.json()
            ).then(data => {
                var returnList = []
                
                for (let k = 0; k < data.length; k++) {
                    var include = 1
                    if (skipFilters === 0) {
                        for (let key in filters) {

                            //THIS DOESNT WORK: I think the cuisine array is always empty
                            // if (key === "cuisine") {
                            //     if (!(data[k][key].includes(filters[key]))) {
                            //         include = 0
                            //     }
                            // }
                            if (filters[key] !== data[k][key]) {
                                include = 0
                            }
                        }
                    }
                    
                    if (include === 1) {
                        returnList.push(data[k])
                    }
                }
                var recipesWithTitles = checkForTitles(returnList)
                var retList = []
                for (let i = 0; i < recipesWithTitles.length; i++) {
                    let currItem = {};
                    currItem["title"] = recipesWithTitles[i]["title"]
                    currItem["image"] = recipesWithTitles[i]["image"]
                    currItem["id"] = recipesWithTitles[i]["id"]
                    currItem["ingredientsIAlreadyHave"] = recipeIDToAmountOfIngredientsIhave[recipesWithTitles[i]["id"]]
                    retList.push(currItem)
                }
                res.send(retList)
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

// async function checkForInstructions(recipeID) {
//     try {
//         fetch("https://api.spoonacular.com/recipes/" + recipeID + "/analyzedInstructions&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
//             response.json()
//         ).then(data => {
//             if(data.length === 0) {
//                 return 0
//             } else if  (data[0].hasOwnProperty("steps")) {
//                 return 1
//             } else {
//                 return 0
//             }
//         })
//     }
//     catch (err) {
//         console.log(err)
//         res.status(400).send(err)
//     }
// }

// expects ?ingredientsinpantry=xxx,xxx,xx&restrictions=xxx,xxx where ingredientsinpantry is non-empty
// should now expect ?userid=xx&restrictions=xxx,xxx !!!
app.get("/generateSuggestedRecipesList", async (req, res) => {
    try {
        console.log(req.query)
        var ingredients = req.query["ingredientsinpantry"].split(",")

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

        var skipRestrictions = 0
        if (req.query["restrictions"] === '') {
            skipRestrictions = 1
        }
        else {
            var restrictions = req.query["restrictions"].split(",")
        }

        fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            var recipesWithTitles = checkForTitles(data)
            var retList = []
            var passesDietaryRestrictionsCheck
            for (let j = 0; j < recipesWithTitles.length; j++) {

                passesDietaryRestrictionsCheck = 1

                if (skipRestrictions === 0) {
                    var missingIngredients = recipesWithTitles[j]["missedIngredients"]

                    for (let a = 0; a < missingIngredients.length; a++) {
                        if (restrictions.indexOf(missingIngredients[a]["name"]) > -1) {
                            passesDietaryRestrictionsCheck = 0
                            break
                        }
                    }
                }
                if (passesDietaryRestrictionsCheck === 1) {
                    let currItem = {};
                    currItem["title"] = recipesWithTitles[j]["title"]
                    currItem["image"] = recipesWithTitles[j]["image"]
                    currItem["id"] = recipesWithTitles[j]["id"]
                    currItem["ingredientsAlreadyHave"] = recipesWithTitles[j]["usedIngredientCount"].toString() + " / " + (recipesWithTitles[j]["missedIngredientCount"] + recipesWithTitles[j]["usedIngredientCount"]).toString()
                    retList.push(currItem)
                }
            }
            res.send(retList)
        })

    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//expects ?recipename=xxx
app.get("/searchRecipe", async (req, res) => {
    try {
        //TODO: check if Recipe is in cache
        var name = encodeURIComponent(req.query["recipename"])
        fetch("https://api.spoonacular.com/recipes/complexSearch?query=" + name + "&apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then (data => {
            var recipes = data["results"]
            var hasTitles = checkForTitles(recipes)
            var returnList = []
            var currItem = {}
            for (let i = 0; i < hasTitles.length; i++) {
                currItem["title"] = hasTitles[i]["title"]
                currItem["id"] = hasTitles[i]["id"]
                currItem["image"] = hasTitles[i]["image"]
                returnList.push(currItem)
            }
            res.send(returnList)
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

//expects ?recipeid=xxx
app.get("/getRecipeDetails", async (req, res) => {
    try {
        //getRecipeDetails: {"ingredientsAndAmounts": ["1 lb spaghetti", ""], 
        //                    "nutritionalDetails":  {"calories": "576k","carbs": "51g","fat": "32g","protein": "20g"}, 
        //                    "instructions: [{"name": "xxx", "steps": ["Preheat the oven to 200 degrees F.", ""] }, {...} ]} 
        fetch("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/ingredientWidget.json?apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
            response.json()
        ).then(data => {
            var returnObj = {}
            var ingredients = []
            for (let i = 0; i < data["ingredients"].length; i++) {
                var amount = data["ingredients"][i]["amount"]["us"]
                var name = data["ingredients"][i]["name"]
                ingredients.push(amount["value"].toString() + " " + amount["unit"] + " " + name)
            }
            returnObj["ingredientsAndAmounts"] = ingredients
            fetch ("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/nutritionWidget.json?apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
                response.json()
            ).then(data => {
                var nutrition = {}
                nutrition["calories"] = data["calories"]
                nutrition["carbs"] = data["carbs"]
                nutrition["fat"] = data["fat"]
                nutrition["protein"] = data["protein"]
                returnObj["nutritionDetails"] = nutrition
                fetch("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/analyzedInstructions?apiKey=34a0f8a88c9544c0a48bd2be360b3b04").then(response =>
                    response.json()
                ).then(data => {
                    var instructions = []
                    console.log(data)
                    var currStep = {}
                    for (let j = 0; j < data.length; j++) {
                        currStep["name"] = data[j]["name"]
                        currStep["steps"] = []
                        var allSteps = data[j]["steps"]
                        for (let k = 0; k < allSteps.length; k++) {
                            currStep["steps"].push(allSteps[k]["step"])
                        }
                        instructions.push(currStep)
                    }
                    returnObj["instructions"] = instructions
                    res.send(returnObj)
                })
            })
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