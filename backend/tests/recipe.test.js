var axios = require("axios");
// var RecipeDBAccess = require("../src/recipes/RecipeDBAccess.js");
// var IngredientManaging = require('../src/ingredients/IngredientManaging.js');
// const fetch = require("node-fetch");
// import * as UserManaging from "../src/user/UserManaging.js"
const UserManaging = require('../src/user/UserManaging.js')
const IngredientManaging = require('../src/ingredients/IngredientManaging.js')
// const RecipeManaging = require('../src/recipes/RecipeManaging.js')
const RecipeDBAccess = require('../src/recipes/RecipeDBAccess.js')
const Verification = require('../src/verify.js')


const {app} = require('../src/router.js')
// const {app} = require('../src/start.js')
const supertest = require('supertest')

// jest.useFakeTimers()

app.listen(8083, () => {})

// jest.setTimeout(10000)

const request = supertest(app)

const RecipeManagingURL = "http://20.53.224.7:8082"

// addRecipe tests

// jest.mock('../src/user/UserManaging.js')
// jest.mock('../src/ingredients/IngredientManaging.js')
jest.mock('../src/verify.js')

// jest.setTimeout(15000)
test("Success", async () => {

    const response = await request.post("/addRecipe").send({
        userID: 11111, 
        recipeID: 632660, 
        path: "dessert",
        title: "Apricot Glazed Apple Tart",
        image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
    })

    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully added recipe to bookmarked list")
})


// removeRecipe tests
test("Missing Recipe in Bookmarked List", async () => {
    const response = await request.post("/removeRecipe").send({
        userID: 11111, 
        recipeID: 632671, 
    })

    expect(response.status).toEqual(453)
    
})

test("Success", async () => {

    const response = await request.post("/removeRecipe").send({
        userID: 11111, 
        recipeID: 632660, 
    })

    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully deleted recipe from bookmarked list")
})

// getRecipes tests

test("No Bookmarked Recipes", async () => {
    const response = await request.get("/getRecipes?userid=22222")
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({"recipes": [], "paths": []})
       
})

test("Success", async () => {
    const response = await request.get("/getRecipes?userid=11111")
    expect(response.status).toEqual(200)
    expect(response.body["recipes"].length).toBeGreaterThan(0)
})

//requestFilteredRecipes tests

test("Invalid list of filters", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise ((resolve, reject) => {
            console.log("in mock")
            if(userid === 11111) {
                console.log(userid)
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            }
            else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })
    })

    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=apples,sugar&filters=italian,gluten-free")
    expect(response.status).toEqual(454)
})

test("Invalid list of ingredients", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise ((resolve, reject) => {
            console.log("in mock")
            if(userid === 11111) {
                console.log(userid)
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            }
            else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })
    })


    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=asdfasdfadsf-asdf&filters=vegetarian")

    console.log(response)

    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Success", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise ((resolve, reject) => {
            console.log("in mock")
            if(userid === 11111) {
                console.log(userid)
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            }
            else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })
    })

    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=lettuce,tomatoes,apple,banana,rice,bread&filters=dairyFree")

        expect(response.status).toEqual(200)
        expect(response.body.length).toBeGreaterThan(0)
})

//  generatedSuggestedRecipes tests


test("No Ingredients", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            if(userid === 11111) {
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            } else if (userid === 33333) {
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["Apple"]}})
            } else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })   
    })

    IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            if(userid === 11111) {
                return resolve({"status": 200, "data": ["Apple", "Blue berries", "Orange"]})
            } else if (userid === 33333) {
                return resolve({"status": 200, "data": ["Breadfruit"]})
            } else {
                return resolve({"status": 200, "data": []})
            }
        })   
    })

    const response = await request.get("/generateSuggestedRecipesList?userid=22222")
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Not enough ingredients to make a recipe", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            if(userid === 11111) {
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            } else if (userid === 33333) {
                return resolve({"status": 200, "data": {}})
            } else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })   
    })

    IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            return resolve({"status": 200, "data": [{"name": "Breadfruit"}]})
        })   
    })

    const response = await request.get("/generateSuggestedRecipesList?userid=33333")

    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Success", async () => {

    UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            if(userid === 11111) {
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
            } else if (userid === 33333) {
                return resolve({"status": 200, "data": {"dietaryRestrictions": ["Apple"]}})
            } else {
                return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
            }
        })   
    })

    IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
        return new Promise((resolve, reject) => {
            return resolve({"status": 200, "data": [{"name": "Apple"},{"name": "Blue berries"},{"name": "Orange"}]})
        })   
    })

    const response = await request.get("/generateSuggestedRecipesList?userid=11111")

    // console.log(response.body.length)

    expect(response.status).toEqual(200)
    expect(response.body).toEqual(expect.arrayContaining([{
        title: 'Roja Sangria',
        image: 'https://spoonacular.com/recipeImages/658737-312x231.jpg',
        id: 658737,
        ingredientsAlreadyHave: '2 / 7'
      }]))
})


// searchRecipe tests

test("No recipe", async () => {
    const response = await request.get("/searchRecipe?recipename=asdadsfsdfasdf")

    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Success", async () => {
    const response = await request.get("/searchRecipe?recipename=pasta")

    console.log(response.body)
    expect(response.status).toEqual(200)
    expect(response.body.length).toBeGreaterThan(0)
})

// getRecipeDetails tests

test("Invalid recipe ID", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=0")
    // console.log(response.body)
    expect(response.status).toEqual(455)
})

test("Success", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=632660")
    expect(response.status).toEqual(200)
    expect(response.body.instructions).toBeDefined()
    expect(response.body.nutritionDetails).toBeDefined()
})

// addNewPath tests

test("Success", async () => {
    const response = await request.post("/addNewPath").send({
                userID: 11111, 
                path: "burgers"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully added path to path list")
})

test("Path already exists", async () => {
    const response = await request.post("/addNewPath").send({
                userID: 11111, 
                path: "burgers"
        })

        expect(response.status).toEqual(456)
})


// removeExistingPath tests

test("Path does not exist", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: 11111, 
                path: "breakfast"
        })

        expect(response.status).toEqual(457)
})

test("Success", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: 11111, 
                path: "burgers"
        })

        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully deleted path from paths list")
})


// getAllPaths tests

test("No paths", async () => {
    const response = await request.get("/getAllPaths?userid=22222")
    
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Success", async () => {
    const response = await request.get("/getAllPaths?userid=11111")
    expect(response.status).toEqual(200)
    expect(response.body.length).toBeGreaterThan(0)
})

//  addToBookmarkedList tests

test("Success", async () => {

    const response = await(RecipeDBAccess.addToBookmarkedList(11111, 632660, "dessert", "Apricot Glazed Apple Tart", "https://spoonacular.com/recipeImages/632660-312x231.jpg"))

    expect(response.status).toEqual(200)
    expect(response.result).toEqual("Successfully added recipe to bookmarked list")

    // axios.post(RecipeManagingURL + "/addToBookmarkedList", {
    //             userID: 21, 
    //             recipeID: 632660, 
    //             path: "dessert",
    //             title: "Apricot Glazed Apple Tart",
    //             image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
    //     }).then(response => {
                // expect(response.status).toEqual(200)
                // expect(response.data.result).toEqual("Successfully added recipe to bookmarked list")
    //     })
})

//  removeFromBookmarkedList tests

test("Missing Recipe in Bookmarked List", async () => {

    try {
        const response = await(RecipeDBAccess.removeFromBookmarkedList(22222, 632660))
    } catch(e) {
        expect(e.status).toEqual(453)
        expect(e.result).toEqual("Missing recipe from bookmarked list")
    }

    

    // axios.post(RecipeManagingURL + "/removeFromBookmarkedList", {
    //             userID: 26, 
    //             recipeID: 716429, 
    //     }).then(response => {
    //         expect(response.status).toEqual(453)
    //         expect(response.data.result).toEqual("Missing recipe from bookmarked list")
    //     })
})

test("Success", async () => {

    const response = await(RecipeDBAccess.removeFromBookmarkedList(11111, 632660))

    expect(response.status).toEqual(200)
    expect(response.result).toEqual("Successfully deleted recipe from bookmarked list")

    // axios.post(RecipeManagingURL + "/removeFromBookmarkedList", {
    //             userID: 21, 
    //             recipeID: 632660, 
    //     }).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.result).toEqual("Successfully deleted recipe from bookmarked list")
    //     })
})

//  getBookmarkedRecipes tests

test("No Bookmarked Recipes", async () => {
    const response = await RecipeDBAccess.getBookmarkedRecipes(22222)

    expect(response).toEqual({"recipes": [], "paths": [], "status": 200})

    // axios.get(RecipeManagingURL + "/getRecipes?userid=20"
    //     ).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data).toEqual({"recipes": [], "paths": []})
    //     })
})


test("Success", async () => {

    const response = await RecipeDBAccess.getBookmarkedRecipes(11111)

    expect(response.recipes.length).toBeGreaterThan(0)

    // axios.get(RecipeManagingURL + "/getRecipes?userid=21"
    //     ).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.recipes.length).toBeGreaterThan(0)
    //     })
})


//  addToPathList tests

test("Success", async () => {
    
    const response = await RecipeDBAccess.addToPathList(11111, "pasta")

    expect(response.status).toEqual(200)
    expect(response.result).toEqual("Successfully added path to path list")

    // axios.post(RecipeManagingURL + "/addNewPath", {
    //             userID: 21, 
    //             path: "chinese"
    //     }).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.result).toEqual("Successfully added path to path list")
    //     })
})

test("Path already exists", async () => {

    try {
        const response = await RecipeDBAccess.addToPathList(11111, "pasta")
    } catch(e) {
        expect(e.status).toEqual(456)
        expect(e.result).toEqual("Path already exists")
    }

    // axios.post(RecipeManagingURL + "/addNewPath", {
    //             userID: 21, 
    //             path: "burgers"
    //     }).then(response => {
    //         expect(response.status).toEqual(456)
    //         expect(response.data.result).toEqual("Path already exists")
    //     })
})


// removeFromPathList tests

test("Path does not exist", async () => {

    try {
        const response = await RecipeDBAccess.removeFromPathList(22222, "breakfast")
    } catch (e) {
        expect(e.status).toEqual(457)
        expect(e.result).toEqual("Path does not exist")
    }

    // axios.post(RecipeManagingURL + "/removeFromPathList", {
    //             userID: 21, 
    //             path: "breakfast"
    //     }).then(response => {
    //         expect(response.status).toEqual(457)
    //         expect(response.data.result).toEqual("Path does not exist")
    //     })
})

test("Success", async () => {

    const response = await RecipeDBAccess.removeFromPathList(11111, "pasta")

    expect(response.status).toEqual(200)
    expect(response.result).toEqual("Successfully deleted path from paths list")

    // axios.post(RecipeManagingURL + "/removeFromPathList", {
    //             userID: 21, 
    //             path: "pizza"
    //     }).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.result).toEqual("Successfully deleted recipe from paths list")
    //     })
})

// getPaths tests

test("No paths", async () => {

    const response = await RecipeDBAccess.getPaths(22222)

    expect(response.status).toEqual(200)
    expect(response.result.length).toEqual(0)

    // axios.get(RecipeManagingURL + "/getPaths?userid=24"
    //     ).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.lenght).toEqual(0)
    //     })
})

test("Success", async () => {

    const response = await RecipeDBAccess.getPaths(11111)

    expect(response.status).toEqual(200)
    expect(response.result.length).toBeGreaterThan(0)

    // axios.get(RecipeManagingURL + "/getPaths?userid=21"
    //     ).then(response => {
    //         expect(response.status).toEqual(200)
    //         expect(response.data.lenght).toBeGreaterThan(0)
    //     })
})

