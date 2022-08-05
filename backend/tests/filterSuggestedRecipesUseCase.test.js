const supertest = require('supertest')
const {app} = require('../src/router.js')
const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

const server = app.listen(8087)
const request = supertest(app)



jest.mock('../src/verify.js')

beforeAll(async () => {
    await client.db("UserDB").collection("Users").insertOne({"userID": 11111, "dietaryRestrictions": ["lemon"]})
})

afterAll(async () => {
    await client.db("UserDB").collection("Users").deleteOne({"userID": 11111, "dietaryRestrictions": ["lemon"]})
    await client.close()
    server.close()
})

test("No user", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=-1&ingredients=apples,sugar&filters=italian,gluten-free")
    expect(response.status).toEqual(404)
})

test("Invalid list of ingredients", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&filters=vegetarian")
    expect(response.status).toEqual(400)
})

test("Invalid list of filters", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=lettuce,tomatoes,apple,banana,rice,breadbread&filters=indian")
    expect(response.status).toEqual(454)
})

test("Filter argumet missing", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=lettuce,tomatoes,apple,banana,rice,bread")
    expect(response.status).toEqual(400)
})

test("Not enough ingredients to make a recipe", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=Breadfruit&filters=dairyFree")
    expect(response.status).toEqual(200)
})

test("Success", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=lettuce,tomatoes,apple,banana,rice,bread&filters=vegetarian")
        expect(response.status).toEqual(200)
        expect(response.body.length).toBeGreaterThan(0)
})

afterAll(() => {
    server.close()
})