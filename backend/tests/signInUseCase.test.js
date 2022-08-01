const supertest = require('supertest')
const {app} = require('../src/router.js')
const {MongoClient} = require('mongodb')

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

const server = app.listen(8085)
const request = supertest(app)

jest.mock('../src/verify.js')

afterAll(async () => {
    await client.db("UserDB").collection("Users").deleteOne({"email": "test4@test.com"})
    await client.close()
    server.close()
})

var userID;

test("First time", async () => {

    const response = await request.get("/checkUserExists?email=test4@test.com")

    expect(response.status).toEqual(200)
    userID = response.userID
    
})

test("Already signed in", async () => {
    const response = await request.get("/checkUserExists?email=test4@test.com")

    expect(response.status).toEqual(200)
    expect(response.userID).toEqual(userID)
})

