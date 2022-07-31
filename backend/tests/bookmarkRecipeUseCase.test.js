const supertest = require('supertest')

const {app} = require('../src/router.js')

const server = app.listen(8082)
const request = supertest(app)

test("getAllPaths: no user", async () => {
    const response = await request.get("/getAllPaths?userid=-1")
    console.log(response)
    expect(response.status).toEqual(200)
    expect(response.body.length).toBeGreaterThan(0)
})

test("getAllPaths: success", async () => {
    const response = await request.get("/getAllPaths?userid=11111")
    console.log(response)
    expect(response.status).toEqual(200)
    expect(response.body.length).toBeGreaterThan(0)
})

test("getRecipes: no user", async () => {
    const response = await request.get("/getRecipes?userid=-1")
    console.log(response)
    expect(response.status).toEqual(200)
    expect(response.body["recipes"].length).toBeGreaterThan(0)
})

test("getRecipes: success", async () => {
    const response = await request.get("/getRecipes?userid=11111")
    expect(response.status).toEqual(200)
    expect(response.body["recipes"].length).toBeGreaterThan(0)
})

test("addNewPath: no user", async () => {
    const response = await request.post("/addNewPath").send({
                userID: -1, 
                path: "burgers"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully added path to path list")
})

test("addNewPath: success", async () => {
    const response = await request.post("/addNewPath").send({
                userID: 11111, 
                path: "burgers"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully added path to path list")
})

test("removeExistingPath: path does not exist", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: 11111, 
                path: "breakfast"
        })
        expect(response.status).toEqual(457)
})

test("removeExistingPath: no user exists", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: -1, 
                path: "burgers"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully deleted path from paths list")
})

test("removeExistingPath: empty folder", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: 11111, 
                path: "sauce"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully deleted path from paths list")
})

test("removeExistingPath: success", async () => {
    const response = await request.post("/removeExistingPath").send({
                userID: 11111, 
                path: "burgers"
        })
        expect(response.status).toEqual(200)
        expect(response.body.result).toEqual("Successfully deleted path from paths list")
})

test("addRecipe: no user", async () => {
    const response = await request.post("/addRecipe").send({
        userID: -1, 
        recipeID: 632660, 
        path: "dessert",
        title: "Apricot Glazed Apple Tart",
        image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
    })
    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully added recipe to bookmarked list")
})

test("addRecipe: no folder", async () => {
    const response = await request.post("/addRecipe").send({
        userID: 11111, 
        recipeID: 632660, 
        path: "dasfsakjsdl;jfl",
        title: "Apricot Glazed Apple Tart",
        image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
    })
    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully added recipe to bookmarked list")
})

test("addRecipe: success", async () => {
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

test("removeRecipe: no user", async () => {
    const response = await request.post("/removeRecipe").send({
        userID: -1, 
        recipeID: 632660, 
    })
    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully deleted recipe from bookmarked list")
})

test("removeRecipe: success", async () => {
    const response = await request.post("/removeRecipe").send({
        userID: 11111, 
        recipeID: 632660, 
    })
    expect(response.status).toEqual(200)
    expect(response.body.result).toEqual("Successfully deleted recipe from bookmarked list")
})

afterAll(() => {
    server.close()
})