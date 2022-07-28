import express, { response } from 'express';
import fetch from 'node-fetch';
import {OAuth2Client} from 'google-auth-library';
import * as UserManaging from '../user/UserManaging.js'
import * as IngredientManaging from '../ingredients/IngredientManaging.js'

var app = express()
app.use(express.json())

const apiKey = "d1e4859a4c854f3a9f5f8cdbbf2bf18f"
const ip = "20.53.224.7"

const CLIENT_ID = "158528567702-cla9vjg1b8mj567gnp1arb90870b001h.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    // const ticket = await client.verifyIdToken({
    //     idToken: token,
    //     audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // });
    // const payload = ticket.getPayload();
    // const userid = payload['sub'];
    return new Promise((resolve, reject) => {resolve("hi")})

  }

app.post("/addRecipe", async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        console.log(req.body)
        
        //req.body should contain data like {userID: xxx, recipeID: xxx, path: home/xxx/xxx, title: xxx, image: xxx}
        fetch("http://" + ip + ":8083/addToBookmarkedList", {
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
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        })  
})

app.post("/removeRecipe", async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        console.log(req.body)
        
        //req.body should contain data like {userID: xxx, recipeID: xxx}
        fetch("http://" + ip + ":8083/removeFromBookmarkedList", {
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
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

app.get("/getRecipes", async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query)
        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        fetch("http://" + ip + ":8083/getBookmarkedRecipes?userid=" + id).then(response =>
            response.json()
        ).then(data => {
            console.log(data)
            var recipeList = []
            var pathList = []
            var recipes = data["recipes"]
            var paths = data["paths"]
            for (let i = 0; i < recipes.length; i++) {
                var currRecipeItem = {}
                currRecipeItem["userID"] = recipes[i]["userID"]
                currRecipeItem["recipeID"] = recipes[i]["recipeID"]
                currRecipeItem["title"] = recipes[i]["title"]
                currRecipeItem["image"] = recipes[i]["image"]
                currRecipeItem["path"] = recipes[i]["path"]
                recipeList.push(currRecipeItem)
            }

            
            for (let j = 0; j < paths.length; j++) {
                pathList.push(paths[j]["path"])
            }
            var retObj = {"recipes": recipeList, "paths": pathList}
            console.log(retObj)
            res.send(retObj)
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

//req.query is of the form ?ingredients=xxx,xxx&filters=xxx,xxx&userid=xxx where the filters are taken as true
app.get("/requestFilteredRecipes", async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query)
        var ingredients = req.query["ingredients"].split(",")

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
                if (filters[filterList[a]] === "vegetarian" || filters[filterList[a]] === "vegan" || filters[filterList[a]] === "glutenFree" || filters[filterList[a]] === "dairyFree") {
                    filters[filterList[a]] = true
                }
                else {
                    return res.status(454).send({"result": "Invalid filters"})
                }
            }

            console.log(filters)
        }

        var skipRestrictions = 0

        var ingredientList = ""
        for(let i = 0; i < ingredients.length; i++) {
            ingredientList = ingredientList + ingredients[i] + ",+"
        }

        ingredientList = ingredientList.slice(0,-2)

        // fetch("http://" + ip + ":8082/getRestrictions?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
        UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result =>
            result.json()
        ).then(data => {
            if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                skipRestrictions = 1
                console.log("here")
                console.log(data)
            }
            else {
                console.log("Has restricitons:" + data)
                var restrictions = data["dietaryRestrictions"]
            }
            console.log(ingredientList)
            fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=" + apiKey).then(response =>
            response.json()
            ).then (data => {
                console.log(data)
                if (data.length === 0) {
                    console.log("here")
                    res.send([])
                    return;
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
                console.log("ids: " + idList)
                

                fetch("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList + "&apiKey=" + apiKey).then(response2 =>
                    response2.json()
                ).then(data => {
                    console.log(data)
                    var returnList = []
                    
                    for (let k = 0; k < data.length; k++) {
                        var include = 1
                        if (skipFilters === 0) {
                            for (let key in filters) {
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
                        console.log(currItem)
                    }
                    res.send(retList)
                })
            })

        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
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

// expects ?userid=xxx where ingredientsinpantry is non-empty
// should now expect ?userid=xx !!!
app.get("/generateSuggestedRecipesList", async (req, res) => {
    console.log("generate suggested recipes")
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query)


        // fetch("http://" + ip + ":8086/requestIngredients?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
        IngredientManaging.getRestrictions(req.query["userid"], req.query["googlesignintoken"]).then (response =>
            response.json()
        ).then(ingredientResponse => {
            console.log(ingredientResponse)

            var ingredients = ""
            for (let i = 0; i < ingredientResponse.length; i++) {
                ingredients += ingredientResponse[i]["name"] + ","
            }

            ingredients = ingredients.split(0,-1)
            console.log(ingredients)
            
            var missingIngredientThreshold = 4 // recipes will be suggested if the user is missing at most 4 ingredients

            var skipRestrictions = 0
            // fetch("http://" + ip + ":8082/getRestrictions?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
            UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result =>
                result.json()
            ).then(data => {
                console.log(data)
                if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                    skipRestrictions = 1
                }
                else {
                    var restrictions = data["dietaryRestrictions"]
                }
                console.log(restrictions)
                console.log(ingredients)
                fetch("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredients + "&apiKey=" + apiKey).then(response =>
                    response.json()
                ).then (data => {
                    console.log("recipes returned: " + data)
                    var recipesWithTitles = checkForTitles(data)
                    var retList = []
                    console.log("Recipe with titles:")
                    console.log(recipesWithTitles)
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
            })
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

//expects ?recipename=xxx
app.get("/searchRecipe", async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        var name = encodeURIComponent(req.query["recipename"])
        fetch("https://api.spoonacular.com/recipes/complexSearch?query=" + name + "&apiKey=" + apiKey).then(response =>
            response.json()
        ).then (data => {
            console.log(data)
            var recipes = data["results"]
            var hasTitles = checkForTitles(recipes)
            var returnList = []
            for (let i = 0; i < hasTitles.length; i++) {
                var currItem = {}
                currItem["title"] = hasTitles[i]["title"]
                currItem["id"] = hasTitles[i]["id"]
                currItem["image"] = hasTitles[i]["image"]
                returnList.push(currItem)
            }
            res.send(returnList)
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

//expects ?recipeid=xxx
app.get("/getRecipeDetails", async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        fetch("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/ingredientWidget.json?apiKey=" + apiKey).then(response =>
            response.json()
        ).then(data => {
            if (!data.hasOwnProperty('ingredients')) {
                return res.status(455).send({"result": "Recipe does not exist"})
            }
            var returnObj = {}
            var ingredients = []
            for (let i = 0; i < data["ingredients"].length; i++) {
                var amount = data["ingredients"][i]["amount"]["us"]
                var name = data["ingredients"][i]["name"]
                ingredients.push(amount["value"].toString() + " " + amount["unit"] + " " + name)
            }
            returnObj["ingredientsAndAmounts"] = ingredients
            fetch ("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/nutritionWidget.json?apiKey=" + apiKey).then(response =>
                response.json()
            ).then(data => {
                var nutrition = {}
                nutrition["calories"] = data["calories"]
                nutrition["carbs"] = data["carbs"]
                nutrition["fat"] = data["fat"]
                nutrition["protein"] = data["protein"]
                returnObj["nutritionDetails"] = nutrition
                fetch("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/analyzedInstructions?apiKey=" + apiKey).then(response =>
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
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

app.post("/addNewPath", async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, path: home/xxx/xxx}
        fetch("http://" + ip + ":8083/addToPathList", {
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
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

app.post("/removeExistingPath", async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, path: xxx/xxx}
        fetch("http://" + ip + ":8083/removeFromPathList", {
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
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
})

app.get("/getAllPaths", async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query)
        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        fetch("http://" + ip + ":8083/getPaths?userid=" + id).then(response =>
            response.json()
        ).then(result => {
            console.log(result)
            var idPathJSON = {}
            var retArr = []
            for (let i = 0; i < result.length; i++) {
                if (idPathJSON.hasOwnProperty(result[i]["userID"])) {
                    console.log("here: " + result[i]["path"])
                    idPathJSON[result[i]["userID"]].push(result[i]["path"])
                }
                else {
                    console.log("here2: " + result[i]["userID"])
                    idPathJSON[result[i]["userID"]] = []
                }
            }
            for (let userID in idPathJSON) {
                console.log("id: " + userID)
                console.log(idPathJSON[userID])
                retArr.push({"userID": userID, "paths": idPathJSON[userID]})
            }
            console.log(retArr)
            res.send(retArr)
        })}).catch(err => {
            console.log(err)
            res.status(400).send(err)
        }) 
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
