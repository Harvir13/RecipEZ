const axios = require('axios');
const {getPaths, removeFromPathList, addToPathList, getBookmarkedRecipes, removeFromBookmarkedList, addToBookmarkedList} = require('./RecipeDBAccess.js')
const UserManaging = require('../user/UserManaging.js')
const IngredientManaging = require('../ingredients/IngredientManaging.js')

const {verify} = require('../verify.js')

const apiKey = "d1e4859a4c854f3a9f5f8cdbbf2bf18f"
const ip = "20.53.224.7"




function checkForTitles(recipeList) {
    var hasTitle = []
    for (let i = 0; i < recipeList.length; i++) {
        if (recipeList[i].hasOwnProperty("title")) {
            hasTitle.push(recipeList[i])
        }
    }
    return hasTitle
}


const addRecipe =  async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        // console.log(req.body)
        
        //req.body should contain data like {userID: xxx, recipeID: xxx, path: home/xxx/xxx, title: xxx, image: xxx}
        addToBookmarkedList(req.body["userID"], req.body["recipeID"], req.body["path"], req.body["title"], req.body["image"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            console.log("remove recipe")
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
        console.log(req.body)
        
        //req.body should contain data like {userID: xxx, recipeID: xxx}
        removeFromBookmarkedList(req.body["userID"], req.body["recipeID"]).then(response => {
            console.log("remove recipe success")
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            console.log("remove recipe")
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
    }).catch(err => {
            console.log("remove recipe")
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getRecipes = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        // console.log(req.query)
        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        getBookmarkedRecipes(id).then(data => {
            // console.log(data)
            var recipeList = []
            var pathList = []
            var recipes = data["recipes"]
            console.log(data["recipes"])
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
            // console.log(retObj)
            var status = data.status
            return res.status(status).send(retObj)
        }).catch(err => {
            console.log("remove recipe")
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
        // console.log(req.query)
        var ingredients = req.query["ingredients"].split(",")
        console.log("filter")

        var missingIngredientThreshold = 4 // recipes will be suggested if the user has 40% of the ingredients

        var skipFilters = 0
        if (req.query["filters"] === "") {
            skipFilters = 1
        }
        else {
            var filterList = req.query["filters"].split(",")
            // console.log(filterList)
            var filters = {}
            for (let a = 0; a < filterList.length; a++) {
                if (filterList[a] === "vegetarian" || filterList[a] === "vegan" || filterList[a] === "glutenFree" || filterList[a] === "dairyFree") {
                    filters[filterList[a]] = true
                }
                else {
                    return res.status(454).send({"result": "Invalid filters"})
                }
            }

            // console.log(filters)
        }

        var skipRestrictions = 0

        var ingredientList = ""
        for(let i = 0; i < ingredients.length; i++) {
            ingredientList = ingredientList + ingredients[i] + ",+"
        }

        ingredientList = ingredientList.slice(0,-2)


        console.log("About to get gestrictions")

        // fetch("http://" + ip + ":8082/getRestrictions?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
        UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result => {
            console.log(result)
            return result.data
        }).then(data => {
            console.log(data["dietaryRestrictions"])
            if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                skipRestrictions = 1
                // console.log("here")
                // console.log(data)
            }
            else {
                // console.log("Has restricitons:" + data)
                var restrictions = data["dietaryRestrictions"]
            }
            // console.log(ingredientList)
            axios.get("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredientList + "&apiKey=" + apiKey).then(response =>
                response.data
            ).then (data => {
                console.log(data)
                if (data.length === 0) {
                    // console.log("here")
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
                console.log("ids: " + idList)
                

                axios.get("https://api.spoonacular.com/recipes/informationBulk?ids=" + idList + "&apiKey=" + apiKey).then(response2 =>
                    response2.data
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
                        // console.log(currItem)
                    }
                    console.log(retList)
                    res.send(retList)
                })
            })

        })}).catch(err => {
            // console.log(err)
            res.status(400).send(err)
        }) 
}

// expects ?userid=xxx where ingredientsinpantry is non-empty
// should now expect ?userid=xx !!!
const generateSuggestedRecipesList = async (req, res) => {
    // console.log("generate suggested recipes")
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query)


        // fetch("http://" + ip + ":8086/requestIngredients?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
        IngredientManaging.requestIngredients(req.query["userid"], req.query["googlesignintoken"]).then(response => {
            console.log(response)
            return response.data
        }).then(ingredientResponse => {
            console.log("got ingredients")
            console.log(ingredientResponse)
            if (ingredientResponse.length === 0) {
                // console.log("no ingredients")
                return res.send(ingredientResponse)
            }

            var ingredients = "";
            for (let i = 0; i < ingredientResponse.length; i++) {
                // console.log(ingredientResponse[i])
                ingredients += ingredientResponse[i]["name"]
                ingredients += ","
            }
            // console.log(ingredients)
            ingredients = ingredients.slice(0,-1)
            console.log(ingredients)
            
            var missingIngredientThreshold = 4 // recipes will be suggested if the user is missing at most 4 ingredients

            var skipRestrictions = 0
            // fetch("http://" + ip + ":8082/getRestrictions?userid=" + req.query["userid"] + "&googlesignintoken=" + req.query["googlesignintoken"])
            UserManaging.getRestrictions(parseInt(req.query["userid"], 10), req.query["googlesignintoken"]).then(result =>
                result.data
            ).then(data => {
                console.log(data)
                if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                    skipRestrictions = 1
                }
                else {
                    var restrictions = data["dietaryRestrictions"]
                    // console.log(restrictions)
                    // console.log(ingredients)
                }
                
                axios.get("https://api.spoonacular.com/recipes/findByIngredients?ignorePantry=true&missedIngredientCount=" + missingIngredientThreshold + "&ingredients=" + ingredients + "&apiKey=" + apiKey).then(response =>
                    response.data
                ).then (data => {
                    // console.log("recipes returned: " + data)
                    var recipesWithTitles = checkForTitles(data)
                    var retList = []
                    // console.log("Recipe with titles:")
                    // console.log(recipesWithTitles)
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
                    console.log(retList)
                    res.send(retList)
                })
            })
        })}).catch(err => {
            // console.log(err)
            res.status(400).send(err)
        }) 
}

//expects ?recipename=xxx
const searchRecipe = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        var name = encodeURIComponent(req.query["recipename"])
        console.log(name)
        axios.get("https://api.spoonacular.com/recipes/complexSearch?query=" + name + "&apiKey=" + apiKey).then(response => {
            console.log(response)
            return response.data
    }).then (data => {
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
            console.log(returnList)
            res.send(returnList)
        })}).catch(err => {
            // console.log(err)
            res.status(400).send(err)
        }) 
}

//expects ?recipeid=xxx
const getRecipeDetails = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        console.log(req.query["recipeid"])
        axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/ingredientWidget.json?apiKey=" + apiKey).then(response =>
            response.data
        ).then(data => {
            console.log(data)
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
            axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/nutritionWidget.json?apiKey=" + apiKey).then(response =>
                response.data
            ).then(data => {
                // console.log("Recipe Details")
                // console.log(data)
                console.log(data)
                var nutrition = {}
                nutrition["calories"] = data["calories"]
                nutrition["carbs"] = data["carbs"]
                nutrition["fat"] = data["fat"]
                nutrition["protein"] = data["protein"]
                returnObj["nutritionDetails"] = nutrition
                axios.get("https://api.spoonacular.com/recipes/" + req.query["recipeid"] + "/analyzedInstructions?apiKey=" + apiKey).then(response =>
                    response.data
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
                    console.log(returnObj)
                    return res.send(returnObj)
                })
            })
        }).catch(err => {
            // console.log(err)
            return res.status(455).send({"result": "Recipe does not exist"})
        }) }).catch(err => {
            // console.log(err)
            return res.status(400).send(err)
        }) 
}

const addNewPath = async (req, res) => {
    verify(req.body.googleSignInToken).then(() => {
        // console.log(req.body)
        //req.body should contain data like {userID: xxx, path: home/xxx/xxx}
        addToPathList(req.body["userID"], req.body["path"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            console.log("remove recipe")
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
        // console.log(req.body)
        //req.body should contain data like {userID: xxx, path: xxx/xxx}
        removeFromPathList(req.body["userID"], req.body["path"]).then(response => {
            var status = response.status
            delete response["status"]
            return res.status(status).send(response)
        }).catch(err => {
            console.log("remove recipe")
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) }).catch(err => {
            console.log("remove existing path")
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getAllPaths = async (req, res) => {
    verify(req.query["googlesignintoken"]).then(() => {
        // console.log(req.query)
        //req.query should contain data like ?userid=xxx
        var id = req.query["userid"]
        getPaths(id).then(response => {
            // console.log(result)
            var result = response.result
            var idPathJSON = {}
            var retArr = []
            for (let i = 0; i < result.length; i++) {
                if (idPathJSON.hasOwnProperty(result[i]["userID"])) {
                    // console.log("here: " + result[i]["path"])
                    idPathJSON[result[i]["userID"]].push(result[i]["path"])
                }
                else {
                    // console.log("here2: " + result[i]["userID"])
                    idPathJSON[result[i]["userID"]] = []
                }
            }
            for (let userID in idPathJSON) {
                // console.log("id: " + userID)
                // console.log(idPathJSON[userID])
                retArr.push({"userID": userID, "paths": idPathJSON[userID]})
            }
            // console.log(retArr)
            var status = response.status
            return res.status(status).send(retArr)
        }).catch(err => {
            console.log("remove recipe")
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