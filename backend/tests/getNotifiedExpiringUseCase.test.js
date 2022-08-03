const IngredientManagingAccess = require("../src/ingredients/IngredientManaging.js");
const {MongoClient} = require('mongodb');

jest.mock('axios');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

test("no expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(0);
    expect(response).toEqual([]);
});

test("has expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(86400);
    expect(response).toEqual([22222]);
});

beforeAll(async () => {
    await client.db("IngredientDB").collection("Users").insertOne({
        "userid": 11111,
        "ingredients": []
    });
    await client.db("IngredientDB").collection("Users").insertOne({
        "userid": 22222,
        "ingredients": [
            {
            "name": "orange",
            "expiry": 123456789,
            "image": "orange.png"
            },
            {
            "name": "chicken",
            "expiry": 259200,
            "image": "whole-chicken.jpg"
            },
            {
            "name": "apple",
            "expiry": 259201,
            "image": "apple.jpg"
            }
        ]
    });
    await client.db("UserDB").collection("Tokens").insertOne({
        "userID": 11111,
        "token": "dakfjasljf"
    })
    await client.db("UserDB").collection("Tokens").insertOne({
        "userID": 22222,
        "token": "dadsfadsfasdf"
    })
});

afterAll(async () => {
    await client.db("IngredientDB").collection("Users").deleteOne({userid: 11111});
    await client.db("IngredientDB").collection("Users").deleteOne({userid: 22222});
    await client.db("UserDB").collection("Tokens").deleteOne({userID: 11111});
    await client.db("UserDB").collection("Tokens").deleteOne({userID: 22222});
});