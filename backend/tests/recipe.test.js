var axios = require("axios");
var UserManaging = require("../src/user/UserManaging.js");
var IngredientManaging = require('../src/ingredients/IngredientManaging.js');
// const fetch = require("node-fetch");

const RecipeManagingURL = "http://20.53.224.7:8084"

// addRecipe tests

jest.mock('../src/user/UserManaging.js')
jest.mock('../src/ingredients/IngredientManaging.js')

test("Success", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 21, 
                recipeID: 632660, 
                path: "dessert",
                title: "Apricot Glazed Apple Tart",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully added recipe to bookmarked list")
        })
})


// removeRecipe tests
test("Missing Recipe in Bookmarked List", () => {
    axios.post(RecipeManagingURL + "/removeRecipe", {
                userID: 21, 
                recipeID: 632671, 
        }).then(response => {
            expect(response.status).toEqual(453)
            expect(response.data.result).toEqual("Missing recipe from bookmarked list")
        })
})

test("Success", () => {
    axios.post(RecipeManagingURL + "/removeRecipe", {
                userID: 21, 
                recipeID: 632660, 
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully deleted recipe from bookmarked list")
        })
})

// getRecipes tests

test("No Bookmarked Recipes", () => {
    axios.get(RecipeManagingURL + "/getRecipes?userid=20"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data).toEqual({"recipes": [], "paths": []})
        })
})

test("Success", () => {
    axios.get(RecipeManagingURL + "/getRecipes?userid=21"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.recipes.length).toBeGreaterThan(0)
        })
})

//requestFilteredRecipes tests

test("Invalid list of filters", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        }
        else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/requestFilteredRecipes?userid=21&ingredients=apples,sugar&filters=italian,gluten-free"
        ).then(response => {
            expect(response.status).toEqual(454)
            expect(response.data.result).toEqual("Invalid filters")
        })
})

test("Invalid list of ingredients", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        }
        else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/requestFilteredRecipes?userid=21&ingredients=asdfasdfadsf-asdf&filters=vegetarian"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toEqual(0)
        })
})

test("Success", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        }
        else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/requestFilteredRecipes?userid=21&ingredients=lettuce,tomatoes,apple,banana,rice,bread&filters=vegetarian,glutenFree"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toEqual(0)
        })
})

//generatedSuggestedRecipes tests


test("No Ingredients", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        } else if (userid === 22) {
            return ["rice"]
        } else {
            return []
        }
    })

    IngredientManaging.requestIngredients = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if (userid === 22) {
            return []
        } else if (userid === 23) {
            return ["Breadfruit"]
        } else if (userid === 21) {
            return ["lettuce","tomatoes","apple","banana","rice","bread"]
        }
        else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/generateSuggestedRecipes?userid=22"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toEqual(0)
        })
})

test("Not enough ingredients to make a recipe", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        } else if (userid === 22) {
            return ["rice"]
        } else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/generateSuggestedRecipes?userid=23"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toEqual(0)
        })
})

test("Success", () => {

    UserManaging.getRestrictions = jest.fn.mockImplementation((userid, googlesignintoken) => {
        if(userid === 21) {
            return ["bread"]
        } else if (userid === 22) {
            return ["rice"]
        } else {
            return []
        }
    })

    axios.get(RecipeManagingURL + "/generateSuggestedRecipes?userid=21"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toBeGreaterThan(0)
        })
})


// searchRecipe tests

test("Not enough ingredients to make a recipe", () => {
    axios.get(RecipeManagingURL + "/searchRecipe?query=card"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toEqual(0)
        })
})

test("Success", () => {
    axios.get(RecipeManagingURL + "/searchRecipe?query=pasta"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.length).toBeGreaterThan(0)
        })
})

// getRecipeDetails tests

test("Invalid recipe ID", () => {
    axios.get(RecipeManagingURL + "/getRecipeDetails?recipeID=0"
        ).then(response => {
            expect(response.status).toEqual(455)
            expect(response.data.result).toEqual("Recipe does not exist")
        })
})

test("Success", () => {
    axios.get(RecipeManagingURL + "/getRecipeDetails?recipeID=632660"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.instructions).toBeDefined()
            expect(response.data.nutritionalDetails).toBeDefined()
        })
})

// addNewPath tests

test("Success", () => {
    axios.post(RecipeManagingURL + "/addNewPath", {
                userID: 21, 
                path: "burgers"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully added path to path list")
        })
})

test("Path already exists", () => {
    axios.post(RecipeManagingURL + "/addNewPath", {
                userID: 21, 
                path: "pastry"
        }).then(response => {
            expect(response.status).toEqual(456)
            expect(response.data.result).toEqual("Path already exists")
        })
})


// removeExistingPath tests

test("Path does not exist", () => {
    axios.post(RecipeManagingURL + "/removeExistingPath", {
                userID: 21, 
                path: "breakfast"
        }).then(response => {
            expect(response.status).toEqual(457)
            expect(response.data.result).toEqual("Path does not exist")
        })
})

test("Success", () => {
    axios.post(RecipeManagingURL + "/removeExistingPath", {
                userID: 21, 
                path: "pasta"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully deleted recipe from paths list")
        })
})


// getAllPaths tests

test("No paths", () => {
    axios.get(RecipeManagingURL + "/getAllPaths?userid=24"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.lenght).toEqual(0)
        })
})

test("Success", () => {
    axios.get(RecipeManagingURL + "/getAllPaths?userid=21"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.lenght).toBeGreaterThan(0)
        })
})

//  addToBookmarkedList tests

test("Success", () => {
    axios.post(RecipeManagingURL + "/addToBookmarkedList", {
                userID: 21, 
                recipeID: 632660, 
                path: "dessert",
                title: "Apricot Glazed Apple Tart",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully added recipe to bookmarked list")
        })
})

//  removeFromBookmarkedList tests

test("Missing Recipe in Bookmarked List", () => {
    axios.post(RecipeManagingURL + "/removeFromBookmarkedList", {
                userID: 26, 
                recipeID: 716429, 
        }).then(response => {
            expect(response.status).toEqual(453)
            expect(response.data.result).toEqual("Missing recipe from bookmarked list")
        })
})

test("Success", () => {
    axios.post(RecipeManagingURL + "/removeFromBookmarkedList", {
                userID: 21, 
                recipeID: 632660, 
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully deleted recipe from bookmarked list")
        })
})

//  getBookmarkedRecipes tests

test("No Bookmarked Recipes", () => {
    axios.get(RecipeManagingURL + "/getRecipes?userid=20"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data).toEqual({"recipes": [], "paths": []})
        })
})


test("Success", () => {
    axios.get(RecipeManagingURL + "/getRecipes?userid=21"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.recipes.length).toBeGreaterThan(0)
        })
})


//  addToPathList tests

test("Success", () => {
    axios.post(RecipeManagingURL + "/addNewPath", {
                userID: 21, 
                path: "chinese"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully added path to path list")
        })
})

test("Path already exists", () => {
    axios.post(RecipeManagingURL + "/addNewPath", {
                userID: 21, 
                path: "burgers"
        }).then(response => {
            expect(response.status).toEqual(456)
            expect(response.data.result).toEqual("Path already exists")
        })
})


// removeFromPathList tests

test("Path does not exist", () => {
    axios.post(RecipeManagingURL + "/removeFromPathList", {
                userID: 21, 
                path: "breakfast"
        }).then(response => {
            expect(response.status).toEqual(457)
            expect(response.data.result).toEqual("Path does not exist")
        })
})

test("Success", () => {
    axios.post(RecipeManagingURL + "/removeFromPathList", {
                userID: 21, 
                path: "pizza"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully deleted recipe from paths list")
        })
})

// getPaths tests

test("No paths", () => {
    axios.get(RecipeManagingURL + "/getPaths?userid=24"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.lenght).toEqual(0)
        })
})

test("Success", () => {
    axios.get(RecipeManagingURL + "/getPaths?userid=21"
        ).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.lenght).toBeGreaterThan(0)
        })
})