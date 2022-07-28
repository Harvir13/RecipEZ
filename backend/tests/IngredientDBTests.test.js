var axios = require("axios");

const IP = "localhost";//const IP = "20.53.224.7"; 

//tests for getIngredients
test("requestIngredients: user with unregistered userID", () => {
    return axios.get("http://" + IP + ":8085/getIngredients?userid=-1").catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("requestIngredients: user with no ingredients", () => {
    return axios.get("http://" + IP + ":8085/getIngredients?userid=11111").then((response) => {
        expect(response.data).toEqual([]);
    });
});

test("requestIngredients: user with ingredients", () => {
    return axios.get("http://" + IP + ":8085/getIngredients?userid=22222").then((response) => {
        console.log(response.data);
        expect(response.data).toEqual([
            { name: "orange", expiry: 123456789, image: "orange.png" },
            { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
            { name: "apple", expiry: 259201, image: "apple.jpg" }
        ]);
    });
});


//tests for storeIngredient
test("storeIngredient: user with unregistered userID", () => {
    return axios.post("http://" + IP + ":8085/storeIngredient", {
        userid: -1,
        ingredient: {
            name: "apple",
            expiry: 86400,
            image: "apple.jpg"
        }
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("storeIngredient: negative expiry value", () => {
    return axios.post("http://" + IP + ":8085/storeIngredient", {
        userid: 11111,
        ingredient: {
            name: "apple",
            expiry: -1,
            image: "apple.jpg"
        }
    }).catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("storeIngredient: correct input", async () => {
    const response =  await axios.post("http://" + IP + ":8085/storeIngredient", {
        userid: 11111,
        ingredient: {
            name: "apple",
            expiry: 86400,
            image: "apple.jpg"
        }
    });
    const del = await axios.delete("http://" + IP + ":8085/removeIngredient", {
        data: {
            userid: 11111,
            ingredient: "apple"
        }
    });
    expect(del.status).toBe(200);
    expect(response.data).toEqual({
        userid: 11111,
        ingredient: { name: "apple", expiry: 86400, image: "apple.jpg" }   
    });
});


//tests for removeIngredient
test("removeIngredient: user with unregistered userID", () => {
    return axios.delete("http://" + IP + ":8085/removeIngredient", {
        data: {
            userid: -1,
            ingredient: "apple"
        }
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("removeIngredient: no stored ingredient", async () => {
    const response = await axios.delete("http://" + IP + ":8085/removeIngredient", {
        data: {
            userid: 22222,
            ingredient: "banana"
        }
    });
    const ingredients = await axios.get("http://" + IP + ":8085/getIngredients?userid=22222");
    expect(response.status).toBe(200);
    expect(ingredients.data).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
        { name: "apple", expiry: 259201, image: "apple.jpg" }
    ]);
});

test("removeIngredient: has stored ingredient", async () => {
    const response = await axios.delete("http://" + IP + ":8085/removeIngredient", {
        data: {
            userid: 22222,
            ingredient: "apple"
        }
    });
    const ingredients = await axios.get("http://" + IP + ":8085/getIngredients?userid=22222");
    const fixDB = await axios.post("http://" + IP + ":8085/storeIngredient", {
        userid: 22222,
        ingredient: {
            name: "apple",
            expiry: 259201,
            image: "apple.jpg"
        }
    });
    expect(response.status).toBe(200);
    expect(fixDB.status).toBe(200);
    expect(ingredients.data).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" }
    ]);
});


//tests for usersWithExpiringIngredients
test("usersWithExpiringIngredients: negative expiry value", () => {
    return axios.get("http://" + IP + ":8085/usersWithExpiringIngredients?time=-1").catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("usersWithExpiringIngredients: correct input w/ an expiring user", () => {
    return axios.get("http://" + IP + ":8085/usersWithExpiringIngredients?time=86400").then((response) => {
        console.log(response.data)
        expect(response.data).toEqual([22222]);
    });
});

test("usersWithExpiringIngredients: correct input w/o an expiring user", () => {
    return axios.get("http://" + IP + ":8085/usersWithExpiringIngredients?time=0").then((response) => {
        console.log(response.data)
        expect(response.data).toEqual([]);
    });
});


//tests for changeExpiry
test("changeExpiry: user with unregistered userID", () => {
    return axios.post("http://" + IP + ":8085/changeExpiry", {
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("changeExpiry: negative expiry value", () => {
    return axios.post("http://" + IP + ":8085/changeExpiry", {
        userid: 22222,
        ingredient: "apple",
        expiry: -1
    }).catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("changeExpiry: no stored ingredient", async () => {
    const response = await axios.post("http://" + IP + ":8085/changeExpiry", {
        userid: 22222,
        ingredient: "banana",
        expiry: 86400
    });
    const ingredients = await axios.get("http://" + IP + ":8085/getIngredients?userid=22222");
    expect(response.status).toBe(200);
    expect(ingredients.data).toEqual([
        { name: "orange", expiry: 123456789, image: "orange.png" },
        { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
        { name: "apple", expiry: 259201, image: "apple.jpg" }
    ]);
});

test("changeExpiry: correct input", async () => {
    const response = await axios.post("http://" + IP + ":8085/changeExpiry", {
        userid: 22222,
        ingredient: "apple",
        expiry: 86400
    });
    const ingredients = await axios.get("http://" + IP + ":8085/getIngredients?userid=22222");
    const fixDB = await axios.post("http://" + IP + ":8085/changeExpiry", {
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.status).toBe(200);
    expect(ingredients.data[2].expiry).toBe(86400);
    expect(fixDB.status).toBe(200);
});