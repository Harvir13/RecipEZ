const {MongoClient} = require('mongodb');
const IngredientDBAccess = require("../src/ingredients/IngredientDBAccess.js");
const IngredientManagingAccess = require("../src/ingredients/IngredientManaging.js");
const supertest = require('supertest');
const {app} = require('../src/router.js');

const server = app.listen(8091);
const request = supertest(app);

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

jest.mock('../src/verify.js');

//tests for getIngredients
test("getIngredients: user with unregistered userID", async () => {
    return IngredientDBAccess.getIngredients(-1).catch((err) => {
        expect(err.status).toBe(404);
    });
});

test("getIngredients: user with no ingredients", async () => {
    return IngredientDBAccess.getIngredients(11111).then((response) => {
        expect(response.result).toEqual([]);
    });
});

test("getIngredients: user with ingredients", async () => {
    return IngredientDBAccess.getIngredients(22222).then((response) => {
        expect(response.result).toEqual([
            { name: "orange", expiry: 123456789, image: "orange.png" },
            { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
            { name: "apple", expiry: 259201, image: "apple.jpg" }
        ]);
    });
});

//tests for storeIngredient
test("storeIngredient: user with unregistered userID", async () => {
    return IngredientDBAccess.storeIngredient(-1, {
        name: "apple",
        expiry: 86400,
        image: "apple.jpg"
    }).catch((err) => {
        expect(err.status).toBe(404)
    });
});

test("storeIngredient: negative expiry value", async () => {
    return IngredientDBAccess.storeIngredient(11111, {
        name: "apple",
        expiry: -1,
        image: "apple.jpg"
    }).catch((err) => {
        expect(err.status).toBe(405);
    });
});

test("storeIngredient: correct input", async () => {
    const response = await IngredientDBAccess.storeIngredient(11111, {
        name: "apple",
        expiry: 86400,
        image: "apple.jpg"
    });
    const del = await IngredientDBAccess.removeIngredient(11111, "apple");
    expect(del.status).toBe(200);
    expect(response.result).toEqual({ name: "apple", expiry: 86400, image: "apple.jpg" });
});

//tests for removeIngredient
test("removeIngredient: user with unregistered userID", async () => {
    return IngredientDBAccess.removeIngredient(-1, "apple").catch((err) => {
        expect(err.status).toBe(404);
    });
});

test("removeIngredient: no stored ingredient", async () => {
    const response = await IngredientDBAccess.removeIngredient(22222, "banana");
    const ingredients = await IngredientDBAccess.getIngredients(22222);
    expect(response.status).toBe(200);
    expect(ingredients.result).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
        { name: "apple", expiry: 259201, image: "apple.jpg" }
    ]);
});

test("removeIngredient: has stored ingredient", async () => {
    const response = await IngredientDBAccess.removeIngredient(22222, "apple");
    const ingredients = await IngredientDBAccess.getIngredients(22222);
    const fixDB = await IngredientDBAccess.storeIngredient(22222, {
        name: "apple",
        expiry: 259201,
        image: "apple.jpg"
    });
    expect(response.status).toBe(200);
    expect(fixDB.status).toBe(200);
    expect(ingredients.result).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" }
    ]);
});

//tests for usersWithExpiringIngredients
test("usersWithExpiringIngredients: negative expiry value", async () => {
    return IngredientDBAccess.usersWithExpiringIngredients(-1).catch((err) => {
        expect(err.status).toBe(405);
    });
});

test("usersWithExpiringIngredients: correct input w/ an expiring user", async () => {
    return IngredientDBAccess.usersWithExpiringIngredients(86400).then((response) => {
        expect(response.result).toEqual([22222]);
    });
});

test("usersWithExpiringIngredients: correct input w/o an expiring user", async () => {
    return IngredientDBAccess.usersWithExpiringIngredients(0).then((response) => {
        expect(response.result).toEqual([]);
    });
});


//tests for changeExpiry
test("changeExpiry: user with unregistered userID", async () => {
    return IngredientDBAccess.changeExpiry(-1, "apple", 86400).catch((err) => {
        expect(err.status).toBe(404);
    });
});

test("changeExpiry: negative expiry value", async () => {
    return IngredientDBAccess.changeExpiry(22222, "apple", -1).catch((err) => {
        expect(err.status).toBe(405);
    });
});

test("changeExpiry: no stored ingredient", async () => {
    const response = await IngredientDBAccess.changeExpiry(22222, "banana", 86400);
    const ingredients = await IngredientDBAccess.getIngredients(22222);
    expect(response.status).toBe(200);
    expect(ingredients.result).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
        { name: "apple", expiry: 259201, image: "apple.jpg" }
    ]);
});

test("changeExpiry: correct input", async () => {
    const response = await IngredientDBAccess.changeExpiry(22222, "apple", 86400);
    const ingredients = await IngredientDBAccess.getIngredients(22222);
    const fixDB = await IngredientDBAccess.changeExpiry(22222, "apple", 259201);
    expect(response.status).toBe(200);
    expect(ingredients.result[2].expiry).toBe(86400);
    expect(fixDB.status).toBe(200);
});


//tests for requestIngredients
test("requestIngredients: user with unregistered userID", () => {
    return request.get("/requestIngredients?userid=-1").then((response) => {
        expect(response.status).toBe(404);
    });
});

test("requestIngredients: user with no ingredients", () => {
    return request.get("/requestIngredients?userid=11111").then((response) => {
        expect(response.body).toEqual([]);
    });
});

test("requestIngredients: user with ingredients", () => {
    return request.get("/requestIngredients?userid=22222").then((response) => {
        expect(response.body).toEqual([
            { name: "orange", expiry: 123456789, image: "orange.png" },
            { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
            { name: "apple", expiry: 259201, image: "apple.jpg" }
        ]);
    });
});


//tests for deleteIngredient
test("deleteIngredient: user with unregistered userID", () => {
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


//tests for updateExpiryDate
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


//tests for searchForIngredient
test("searchForIngredient: no results", async () => {
    const response = await IngredientManagingAccess.searchForIngredient("asjdkfjsl");
    expect(response).toEqual([]);
});

test("searchForIngredient: has results", async () => {
    //const response = await axios.get("/searchForIngredient?ingredient=apple");
    const response = await IngredientManagingAccess.searchForIngredient("apple");
    expect(response).toEqual([{"id":9003,"name":"apple","image":"apple.jpg"}]);
});


//tests for getIngredientSuggestions
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


//tests for requestExpiryDate
test("requestExpiryDate: no results", async () => {
    const response = await request.get("/requestExpiryDate?ingredient=asjdkfjsl");
    expect(response.status).toBe(200);
    expect(parseInt(response.text, 10)).toBe(-1);
});

test("requestExpiryDate: has results", async () => {
    const response = await request.get("/requestExpiryDate?ingredient=apple");
    expect(response.status).toBe(200);
    expect(parseInt(response.text, 10)).toBeLessThanOrEqual(Math.round(Date.now() / 1000) + 5184000);
});


//tests for addIngredient
test("addIngredient: user with unregistered userID", async () => {
    return request.post("/addIngredient").send({
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).then((response) => {
        expect(response.status).toBe(404);
    });
});

test("addIngredient: negative expiry value", () => {
    return request.post("/addIngredient").send({
        userid: 11111,
        ingredient: "apple",
        expiry: -1
    }).then((response) => {
        expect(response.status).toBe(405);
    });
});

test("addIngredient: ingredient doesn't exist in Spoonaular API", () => {
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
    

//tests for scanExpiryDates
test("scanExpiryDates: negative expiry value", async () => {
    return IngredientManagingAccess.scanExpiryDates(-1).catch((err) => {
        expect(err.status).toBe(405);
    });
});

test("scanExpiryDates: correct input w/ an expiring user", async () => {
    return IngredientManagingAccess.scanExpiryDates(86400).then((response) => {
        expect(response).toEqual([22222]);
    });
});

test("scanExpiryDates: correct input w/o an expiring user", async () => {
    return IngredientManagingAccess.scanExpiryDates(0).then((response) => {
        expect(response).toEqual([]);
    })
});
    

//tests for expiringIngredients
test("expiringIngredients: user with unregistered userID", async () => {
    return IngredientManagingAccess.expiringIngredients(-1, 86400).catch((err) => {
        expect(err.status).toBe(404);
    });
});

test("expiringIngredients: negative expiry value", async () => {
    return IngredientManagingAccess.expiringIngredients(22222, -1).catch((err) => {
        expect(err.status).toBe(405);
    });
});

test("expiringIngredients: correct input w/ an expiring ingredient", () => {
    return IngredientManagingAccess.expiringIngredients(22222, 86400).then((response) => {
        expect(response.result).toEqual([ { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" } ]);
    });
});

test("expiringIngredients: correct input w/o an expiring ingredient", () => {
    return IngredientManagingAccess.expiringIngredients(22222, 0).then((response) => {
        expect(response.result).toEqual([]);
    });
});

test("sendExpiryNotification: no expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(0);
    expect(response).toEqual([]);
});

test("sendExpiryNotifcation: has expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(86400);
    expect(response).toEqual([22222]);
});

beforeAll(async () => {
    const res1 = await client.db("IngredientDB").collection("Users").insertOne({
        "userid": 11111,
        "ingredients": []
    });
    const res2 = await client.db("IngredientDB").collection("Users").insertOne({
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
    const res3 = await client.db("UserDB").collection("Tokens").insertOne({
        "userID": 11111,
        "token": "dakfjasljf"
    })
    const res4 = await client.db("UserDB").collection("Tokens").insertOne({
        "userID": 22222,
        "token": "dadsfadsfasdf"
    })
});

afterAll(async () => {
    const res1 = await client.db("IngredientDB").collection("Users").remove({userid: 11111});
    const res2 = await client.db("IngredientDB").collection("Users").remove({userid: 22222});
    const res3 = await client.db("UserDB").collection("Tokens").remove({userID: 11111});
    const res4 = await client.db("UserDB").collection("Tokens").remove({userID: 22222});
});