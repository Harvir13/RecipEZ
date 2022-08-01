const IngredientDBAccess = require("../src/ingredients/IngredientDBAccess.js");
const IngredientManagingAccess = require("../src/ingredients/IngredientManaging.js");
const UserManaging = require('../src/user/UserManaging.js')
const IngredientManaging = require('../src/ingredients/IngredientManaging.js')
// const RecipeManaging = require('../src/recipes/RecipeManaging.js')
const RecipeDBAccess = require('../src/recipes/RecipeDBAccess.js')
const supertest = require('supertest');

const {app} = require('../src/router.js');

const server = app.listen(8087);
const request = supertest(app);

jest.mock('../src/verify.js');

test("No Ingredients", async () => {
    // UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         if(userid === 11111) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
    //         } else if (userid === 33333) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["Apple"]}})
    //         } else {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
    //         }
    //     })   
    // })
    // IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         if(userid === 11111) {
    //             return resolve({"status": 200, "data": ["Apple", "Blue berries", "Orange"]})
    //         } else if (userid === 33333) {
    //             return resolve({"status": 200, "data": ["Breadfruit"]})
    //         } else {
    //             return resolve({"status": 200, "data": []})
    //         }
    //     })   
    // })
    const response = await request.get("/generateSuggestedRecipesList?userid=22222")
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("No user", async () => {
    // UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         if(userid === 11111) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
    //         } else if (userid === 33333) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["Apple"]}})
    //         } else {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
    //         }
    //     })   
    // })
    // IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         return resolve({"status": 200, "data": [{"name": "Apple"},{"name": "Blue berries"},{"name": "Orange"}]})
    //     })   
    // })

    const response = await request.get("/generateSuggestedRecipesList?userid=-1")
    expect(response.status).toEqual(200)
})


test("Success", async () => {
    // UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         if(userid === 11111) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
    //         } else if (userid === 33333) {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["Apple"]}})
    //         } else {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
    //         }
    //     })   
    // })
    // IngredientManaging.requestIngredients = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise((resolve, reject) => {
    //         return resolve({"status": 200, "data": [{"name": "Apple"},{"name": "Blue berries"},{"name": "Orange"}]})
    //     })   
    // })
    const response = await request.get("/generateSuggestedRecipesList?userid=11111")
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(expect.arrayContaining([{
        title: 'Roja Sangria',
        image: 'https://spoonacular.com/recipeImages/658737-312x231.jpg',
        id: 658737,
        ingredientsAlreadyHave: '2 / 7'
      }]))
})

test("Invalid recipe ID", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=0")
    expect(response.status).toEqual(455)
})

test("Success", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=632660")
    expect(response.status).toEqual(200)
    expect(response.body.instructions).toBeDefined()
    expect(response.body.nutritionDetails).toBeDefined()
})

test("No recipe", async () => {
    const response = await request.get("/searchRecipe?recipename=asdadsfsdfasdf")
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("Success", async () => {
    const response = await request.get("/searchRecipe?recipename=pasta")
    expect(response.status).toEqual(200)
    expect(response.body.length).toBeGreaterThan(0)
})