const axios = require('axios');
const {getPaths, removeFromPathList, addToPathList, getBookmarkedRecipes, removeFromBookmarkedList, addToBookmarkedList,
    checkCache, addToCache, removeFromCache, getFromCache} = require('./RecipeDBAccess.js')
const UserManaging = require('../user/UserManaging.js')
const IngredientManaging = require('../ingredients/IngredientManaging.js')

const {verify} = require('../verify.js')

console.log("api key:" + process.env.API_KEY)
// const API_KEY = process.env.API_KEY;
const API_KEY = "d1e4859a4c854f3a9f5f8cdbbf2bf18f"


function checkForTitles(recipeList) {
    var hasTitle = []
    for (let i = 0; i < recipeList.length; i++) {
        if (Object.prototype.hasOwnProperty.call(recipeList[i], "title")) {
            hasTitle.push(recipeList[i])
        }
    }
    return hasTitle
}

const addRecipe =  async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, recipeID: xxx, path: home/xxx/xxx, title: xxx, image: xxx}
        addToBookmarkedList(req.body["userID"], req.body["recipeID"], req.body["path"], req.body["title"], req.body["image"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        })  
}

const removeRecipe = async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {   
        removeFromCache(req.body["recipeID"])
        //req.body should contain data like {userID: xxx, recipeID: xxx}

        removeFromBookmarkedList(req.body["userID"], req.body["recipeID"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
    }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getRecipes = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {

        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        getBookmarkedRecipes(id).then(data => {
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
            var status = data.status
            return res.status(status).send(retObj)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

//req.query is of the form ?ingredients=xxx,xxx&filters=xxx,xxx&userid=xxx where the filters are taken as true
const requestFilteredRecipes = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        if (parseInt(req.query["userid"], 10) <= 0) {
            return res.status(404).send({"result": "User not found"})
        }
        var ingredients = req.query["ingredients"].split(",")
        var missingIngredientThreshold = 4 // recipes will be suggested if the user has 40% of the ingredients
        var skipFilters = 0
        if (req.query["filters"] === "") {
            skipFilters = 1
        }
        else {
            var filterList = req.query["filters"].split(",")
            var filters = {}
            for (let a = 0; a < filterList.length; a++) {
                if (filterList[a] === "vegetarian" || filterList[a] === "vegan" || filterList[a] === "glutenFree" || filterList[a] === "dairyFree") {
                    filters[filterList[a]] = true
                }
                else {
                    return res.status(454).send({"result": "Invalid filters"})
                }
            }
        }
        var skipRestrictions = 0
        var ingredientList = ""
        for(let i = 0; i < ingredients.length; i++) {
            ingredientList = ingredientList + ingredients[i] + ",+"
        }
        ingredientList = ingredientList.slice(0,-2)
        UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result => {
            return result.data
        }).then(data => {
            if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                skipRestrictions = 1
            }
            else {
                var restrictions = data["dietaryRestrictions"]
            }
            axios.get("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=" + API_KEY).then(response =>
                response.data
            ).then (data => {
                if (data.length === 0) {
                    return res.send([]);
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
                

                axios.get("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList + "&apiKey=" + API_KEY).then(response2 =>
                    response2.data
                ).then(data => {
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
                    }
                    res.send(retList)
                })
            })
        })}).catch(err => {
            res.status(400).send(err)
        }) 
}

// expects userid=xxx, googlesignintoken=yyy
const generateSuggestedRecipesList = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        if (parseInt(req.query["userid"], 10) <= 0) {
            return res.status(404).send({"result": "User not found"})
        }
        IngredientManaging.requestIngredients(req.query["userid"], req.query["googlesignintoken"]).then(response => {
            return response.data
        }).then(ingredientResponse => {
            if (ingredientResponse.length === 0) {
                return res.send(ingredientResponse)
            }
            var ingredients = "";
            for (let i = 0; i < ingredientResponse.length; i++) {
                ingredients += ingredientResponse[i]["name"]
                ingredients += ","
            }
            ingredients = ingredients.slice(0,-1)
            
            var missingIngredientThreshold = 4 // recipes will be suggested if the user is missing at most 4 ingredients

            var skipRestrictions = 0
            UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result =>
                result.data
            ).then(data => {
                if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                    skipRestrictions = 1
                }
                else {
                    var restrictions = data["dietaryRestrictions"]
                }
                
                axios.get("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredients + "&apiKey=" + API_KEY).then(response =>
                    response.data
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
                            currItem["ingredientsIAlreadyHave"] = recipesWithTitles[j]["usedIngredientCount"].toString() + " / " + (recipesWithTitles[j]["missedIngredientCount"] + recipesWithTitles[j]["usedIngredientCount"]).toString()
                            retList.push(currItem)
                        }
                    }
                    res.send(retList)
                })
            })
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            res.status(400).send(err)
        }) 
}

//expects ?recipename=xxx
const searchRecipe = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        var name = encodeURIComponent(req.query["recipename"])
        axios.get("https://api.spoonacular.com/recipes/complexSearch?query=" + name + "&apiKey=" + API_KEY).then(response => {
            return response.data
    }).then (data => {
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
            res.status(400).send(err)
        }) 
}

//expects ?recipeid=xxx
const getRecipeDetails = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(async () => {
        const recipeInCache = await checkCache(req.query["recipeid"])
        if (recipeInCache) {
            await addToCache(req.query["recipeid"], {}, true)
            const recipeData = await getFromCache(req.query["recipeid"])
            return res.send(recipeData.result.recipedata)
        } else {
            axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/ingredientWidget.json?apiKey=" + API_KEY).then(response =>
                response.data
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
                axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/nutritionWidget.json?apiKey=" + API_KEY).then(response =>
                    response.data
                ).then(data => {
                    var nutrition = {}
                    nutrition["calories"] = data["calories"]
                    nutrition["carbs"] = data["carbs"]
                    nutrition["fat"] = data["fat"]
                    nutrition["protein"] = data["protein"]
                    returnObj["nutritionDetails"] = nutrition
                    axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/analyzedInstructions?apiKey=" + API_KEY).then(response =>
                        response.data
                    ).then(data => {
                        var instructions = []
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
                        addToCache(req.query["recipeid"], returnObj, false).then(() => {
                            return res.send(returnObj)
                        })
                    })
                })
            }).catch(() => {
                return res.status(455).send({"result": "Recipe does not exist"})
            })
        }
    }).catch(err => {
        return res.status(400).send(err)
    }) 
}

const addNewPath = async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, path: home/xxx/xxx}
        addToPathList(req.body["userID"], req.body["path"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const removeExistingPath = async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, path: xxx/xxx}
        removeFromPathList(req.body["userID"], req.body["path"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getAllPaths = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        getPaths(id).then(response => {
            var result = response.result
            var idPathJSON = {}
            var retArr = []
            for (let i = 0; i < result.length; i++) {
                if (idPathJSON.hasOwnProperty(result[i]["userID"])) {
                    idPathJSON[result[i]["userID"]].push(result[i]["path"])
                }
                else {
                    idPathJSON[result[i]["userID"]] = []
                }
            }
            for (let userID in idPathJSON) {
                retArr.push({"userID": userID, "paths": idPathJSON[userID]})
            }
            var status = response.status
            return res.status(status).send(retArr)
        }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

module.exports = {addRecipe, removeRecipe, getRecipes, requestFilteredRecipes, generateSuggestedRecipesList, searchRecipe, getRecipeDetails, addNewPath, removeExistingPath, getAllPaths}
