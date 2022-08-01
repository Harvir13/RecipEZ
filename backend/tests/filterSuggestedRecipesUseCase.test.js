const supertest = require('supertest')
const {app} = require('../src/router.js')
const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

const server = app.listen(8085)
const request = supertest(app)



jest.mock('../src/verify.js')

beforeAll(async () => {
    await client.db("UserDB").collection("Users").insertOne({"userID": 11111, "dietaryRestrictions": ["bread"]})
})

afterAll(async () => {
    await client.db("UserDB").collection("Users").remove({"userID": 11111, "dietaryRestrictions": ["bread"]})
    await client.close()
    server.close()
})

test("No user", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=-1&ingredients=apples,sugar&filters=italian,gluten-free")
    expect(response.status).toEqual(454)
})

test("Invalid list of ingredients", async () => {
    const response = await request.get("/requestFilteredRecipes?userid=11111&filters=vegetarian")
    console.log(response)
    expect(response.status).toEqual(400)
})

test("Success", async () => {
    // UserManaging.getRestrictions = jest.fn().mockImplementation((userid, googlesignintoken) => {
    //     return new Promise ((resolve, reject) => {
    //         console.log("in mock")
    //         if(userid === 11111) {
    //             console.log(userid)
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": ["bread"]}})
    //         }
    //         else {
    //             return resolve({"status": 200, "data": {"dietaryRestrictions": []}})
    //         }
    //     })
    // })
    const response = await request.get("/requestFilteredRecipes?userid=11111&ingredients=lettuce,tomatoes,apple,banana,rice,bread&filters=dairyFree")
        expect(response.status).toEqual(200)
        console.log(response.body)
        expect(response.body.length).toBeGreaterThan(0)
})

afterAll(() => {
    server.close()
})