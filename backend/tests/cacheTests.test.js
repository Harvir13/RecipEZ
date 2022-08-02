const {MongoClient} = require('mongodb');
const RecipeDBAccess = require("../src/recipes/RecipeDBAccess.js");
const supertest = require('supertest');
const {app} = require('../src/router.js');

const server = app.listen(8092);
const request = supertest(app);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

beforeEach(async () => {
    await client.db("RecipeDB").collection("Cache").insertOne({"recipeid": 1, "refcount": 1});
    await client.db("RecipeDB").collection("Cache").insertOne({"recipeid": 2, "refcount": 2});
});

afterEach(async () => {
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 1});
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 2});
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 3});
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 4});
});

//tests for checkCache
test("checkCache: contains recipe", async () => {
    return RecipeDBAccess.checkCache(1).then((response) => {
        expect(response).toBeTruthy();
    });
});

test("checkCache: does not contain recipe", async () => {
    return RecipeDBAccess.checkCache(0).then((response) => {
        expect(response).toBeFalsy();
    });
});

//tests for flushCache
test("flushCache: contains entries", async () => {
    return RecipeDBAccess.flushCache().then(async () => {
        const numEntries = await client.db("RecipeDB").collection("Cache").countDocuments({});
        expect(numEntries).toEqual(0);
    });
});

test("flushCache: no entries", async () => {
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 1});
    await client.db("RecipeDB").collection("Cache").deleteOne({recipeid: 2});
    return RecipeDBAccess.flushCache().then(async () => {
        const numEntries = await client.db("RecipeDB").collection("Cache").countDocuments({});
        expect(numEntries).toEqual(0);
    });
});

//tests for removeFromCache
test("removeFromCache: no recipe stored", async () => {
    return RecipeDBAccess.removeFromCache(0).then(async (response) => {
        expect(response.status).toBe(200);
        expect(response.result).toEqual("No recipe to remove");
    });
});

test("removeFromCache: refcount greater than 1", async () => {
    return RecipeDBAccess.removeFromCache(2).then(async (response) => {
        const numEntries = await client.db("RecipeDB").collection("Cache").countDocuments({});
        expect(numEntries).toEqual(2);
        expect(response.status).toBe(200);
        expect(response.result).toEqual("new ref count: 1");
    });
});

test("removeFromCache: refcount is 1", async () => {
    return RecipeDBAccess.removeFromCache(1).then(async (response) => {
        expect(response.status).toBe(200);
        expect(response.result).toEqual("Deleted recipe 1");
        const numEntries = await client.db("RecipeDB").collection("Cache").countDocuments({});
        expect(numEntries).toEqual(1);
    });
});

//tests for addToCache
test("addToCache: cache not full and recipe isn't there", async () => {
    return RecipeDBAccess.addToCache(3, {}).then((response) => {
        expect(response.status).toBe(200);
        expect(response.result).toEqual("added 3");
    });
});

test("addToCache: recipe is there", async () => {
    return RecipeDBAccess.addToCache(2, {}).then((response) => {
        expect(response.status).toBe(200);
        expect(response.result).toEqual("new ref count: 3");
    });
});

test("addToCache: cache is full and recipe isn't there", async () => {
    await client.db("RecipeDB").collection("Cache").insertOne({"recipeid": 3, "refcount": 5});
    const response = await RecipeDBAccess.addToCache(4, {});
    expect(response.status).toBe(200);
    expect(response.result).toEqual("added 4");
    const recipe1 = await RecipeDBAccess.checkCache(1);
    expect(recipe1).toBeFalsy();
});