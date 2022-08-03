const {MongoClient} = require('mongodb');
const IngredientManagingAccess = require("../src/ingredients/IngredientManaging.js");
const supertest = require('supertest');

const {app} = require('../src/router.js');

const server = app.listen(8089);
const request = supertest(app);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

jest.mock('../src/verify.js');

test("requestIngredients: user with unregistered userID", async () => {
    return request.get("/requestIngredients?userid=-1").then((response) => {
        expect(response.status).toBe(404);
    });
});

test("requestIngredients: user with no ingredients", async () => {
    return request.get("/requestIngredients?userid=11111").then((response) => {
        expect(response.body).toEqual([]);
    });
});

test("requestIngredients: user with ingredients", async () => {
    return request.get("/requestIngredients?userid=22222").then((response) => {
        expect(response.body).toEqual([
            { name: "orange", expiry: 123456789, image: "orange.png" },
            { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
            { name: "apple", expiry: 259201, image: "apple.jpg" }
        ]);
    });
});

test("deleteIngredient: user with unregistered userID", async () => {
    return request.post("/deleteIngredient").send({
        userid: -1,
        ingredient: "apple"
    }).then((response) => {
        expect(response.status).toBe(404);
    });
});

test("deleteIngredient: no stored ingredient", async () => {
    const response = await request.post("/deleteIngredient").send({
        userid: 11111,
        ingredient: "banana"
    });
    expect(response.status).toBe(200);
});

test("deleteIngredient: has stored ingredient", async () => {
    const response = await request.post("/deleteIngredient").send({
        userid: 22222,
        ingredient: "apple"
    });
    const addBack = await request.post("/addIngredient").send({
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.status).toBe(200);
    expect(addBack.status).toBe(200);
});

test("updateExpiryDate: user with unregistered userID", async () => {
    return request.post("/updateExpiryDate").send({
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).then((response) => {
        expect(response.status).toBe(404);
    });
});

test("updateExpiryDate: negative expiry value", async () => {
    return request.post("/updateExpiryDate").send({
        userid: 11111,
        ingredient: "apple",
        expiry: -1
    }).then((response) => {
        expect(response.status).toBe(405);
    });
});

test("updateExpiryDate: no stored ingredient", async () => {
    const response = await request.post("/updateExpiryDate").send({
        userid: 11111,
        ingredient: "banana",
        expiry: 86400
    });
    expect(response.status).toBe(200);
    expect(response.text).toEqual("Successfully changed expiry date");
});

test("updateExpiryDate: correct input", async () => {
    const response = await request.post("/updateExpiryDate").send({
        userid: 22222,
        ingredient: "apple",
        expiry: 86400
    });
    const ingredients = await request.get("/requestIngredients?userid=22222");
    const fixDB = await request.post("/updateExpiryDate").send({
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.status).toBe(200);
    expect(ingredients.body[2].expiry).toBe(86400);
    expect(fixDB.status).toBe(200);
});

test("getIngredientSuggestions: no results", async () => {
    const response = await request.get("/getIngredientSuggestions?string=asjdkfjsl");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
});

test("getIngredientSuggestions: has results", async () => {
    const response = await request.get("/getIngredientSuggestions?string=apple");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
        {"id":9003,"name":"apple","image":"apple.jpg"},
        {"id":1009016,"name":"apple cider","image":"apple-cider.jpg"},
        {"id":10019297,"name":"apple jelly","image":"apple-jelly.jpg"},
        {"id":19312,"name":"apple pie filling","image":"apple-pie-slice.jpg"},
        {"id":19294,"name":"apple butter spread","image":"apple-jelly.jpg"},
        {"id":2048,"name":"apple cider distilled vinegar","image":"apple-cider-vinegar.jpg"},
        {"id":10123,"name":"Bacon","image":"raw-bacon.png"},
        {"id":9266,"name":"Ananas","image":"pineapple.jpg"},
        {"id":9019,"name":"Apfelmark","image":"applesauce.png"},
        {"id":9016,"name":"Apfelsaft","image":"apple-juice.jpg"}
    ]);
});

test("requestExpiryDate: has results", async () => {
    const response = await request.get("/requestExpiryDate?ingredient=apple");
    expect(response.status).toBe(200);
    expect(parseInt(response.text, 10)).toBeLessThanOrEqual(Math.round(Date.now() / 1000) + 5184000);
});

test("requestExpiryDate: exists in Spoonacular API but not in expiry API", async () => {
    const checkSpoonacular = await IngredientManagingAccess.searchForIngredient("breadfruit");
    const response = await request.get("/requestExpiryDate?ingredient=breadfruit");
    expect(checkSpoonacular).toEqual([{"id":9059,"name":"breadfruit","image":"breadfruit.jpg"}]);
    expect(response.status).toBe(200);
    expect(parseInt(response.text, 10)).toBeLessThanOrEqual(-1);
});

test("addIngredient: user with unregistered userID", async () => {
    return request.post("/addIngredient").send({
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).then((response) => {
        expect(response.status).toBe(404);
    });
});

test("addIngredient: negative expiry value", async () => {
    return request.post("/addIngredient").send({
        userid: 11111,
        ingredient: "apple",
        expiry: -1
    }).then((response) => {
        expect(response.status).toBe(405);
    });
});

test("addIngredient: ingredient doesn't exist in Spoonaular API", async () => {
    return request.post("/addIngredient").send({
        userid: 11111,
        ingredient: "asjdkfljsl",
        expiry: 86400
    }).then((response) => {
        expect(response.status).toBe(410);
    });
});

test("addIngredient: correct inputs", async () => {
    const response = await request.post("/addIngredient").send({
        userid: 11111,
        ingredient: "apple",
        expiry: 86400
    });
    const del = await request.post("/deleteIngredient").send({
        userid: 11111,
        ingredient: "apple"
    });
    expect(del.status).toBe(200);
    expect(response.body).toEqual({ name: "apple", expiry: 86400, image: "apple.jpg" });
});

test("addIngredient: ingredient already present", async () => {
    const response = await request.post("/addIngredient").send({
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.body).toEqual({ name: "apple", expiry: 259201, image: "apple.jpg" });
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
});

afterAll(async () => {
    await client.db("IngredientDB").collection("Users").deleteOne({userid: 11111});
    await client.db("IngredientDB").collection("Users").deleteOne({userid: 22222});
});

