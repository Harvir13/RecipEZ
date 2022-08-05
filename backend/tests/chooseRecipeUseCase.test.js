const supertest = require('supertest');
const {app} = require('../src/router.js');

const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)
const RecipeDBAccess = require('../src/recipes/RecipeDBAccess.js')

const server = app.listen(8086);
const request = supertest(app);

jest.mock('../src/verify.js');


beforeAll(async () => {
    await client.db("UserDB").collection("Users").insertOne({"userID": 11111, "dietaryRestrictions": ["raspberries"]})
    await client.db("UserDB").collection("Users").insertOne({"userID": 22222, "dietaryRestrictions": ["Apple"]})
    await client.db("UserDB").collection("Users").insertOne({"userID": 33333, "dietaryRestrictions": []})
    await client.db("IngredientDB").collection("Users").insertOne({"userid": 11111, "ingredients": [{"name": "Apple"}, {"name":"Blue berries"}, {"name": "Orange"}]})
    await client.db("IngredientDB").collection("Users").insertOne({"userid": 22222, "ingredients": [{"name": "Breadfruit"}]})
    await client.db("IngredientDB").collection("Users").insertOne({"userid": 33333, "ingredients": []})
})

afterAll(async () => {
    await client.db("UserDB").collection("Users").deleteOne({"userID": 11111, "dietaryRestrictions": ["raspberries"]})
    await client.db("UserDB").collection("Users").deleteOne({"userID": 22222, "dietaryRestrictions": ["Apple"]})
    await client.db("UserDB").collection("Users").deleteOne({"userID": 33333, "dietaryRestrictions": []})
    await client.db("IngredientDB").collection("Users").deleteOne({"userid": 11111, "ingredients": [{"name": "Apple"}, {"name":"Blue berries"}, {"name": "Orange"}]})
    await client.db("IngredientDB").collection("Users").deleteOne({"userid": 22222, "ingredients": [{"name": "Breadfruit"}]})
    await client.db("IngredientDB").collection("Users").deleteOne({"userid": 33333, "ingredients": []})
    await client.db("RecipeDB").collection("Cache").deleteOne({"recipeid": 632660})
    await client.db("RecipeDB").collection("Cache").deleteOne({"recipeid": 632660})
    await client.close()
    server.close()
})


// generateSuggestedRecipesList

test("No Ingredients", async () => {
    const response = await request.get("/generateSuggestedRecipesList?userid=33333")
    expect(response.status).toEqual(200)
    expect(response.body.length).toEqual(0)
})

test("No user", async () => {
    request.get("/generateSuggestedRecipesList?userid=-1").catch((err) => {
        expect(err.status).toEqual(404)
    })
})


test("Success", async () => {

    const response = await request.get("/generateSuggestedRecipesList?userid=11111")
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(expect.arrayContaining([{
        title: 'Roja Sangria',
        image: 'https://spoonacular.com/recipeImages/658737-312x231.jpg',
        id: 658737,
        ingredientsIAlreadyHave: '2 / 7'
      }]))
})


// getRecipeDetails

test("Invalid recipe ID", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=0")
    expect(response.status).toEqual(455)
})

test("Success, no recipe in cache", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=632660")
    expect(response.status).toEqual(200)
    expect(response.body.instructions).toBeDefined()
    expect(response.body.nutritionDetails).toBeDefined()
})

test("Success, recipe already in cache", async () => {
    const response = await request.get("/getRecipeDetails?recipeid=632660")
    expect(response.status).toEqual(200)
    expect(response.body.instructions).toBeDefined()
    expect(response.body.nutritionDetails).toBeDefined()
    const cache = await RecipeDBAccess.getFromCache(632660)
    expect(cache.result.refcount).toBe(2)
    expect(cache.result.recipeid).toBe(632660)
})

// searchRecipe

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