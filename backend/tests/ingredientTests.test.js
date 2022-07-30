var axios = require("axios");

const IP = "localhost";//const IP = "20.53.224.7";

//mocks


//tests for getIngredients
test("getIngredients: user with unregistered userID", () => {
    return axios.get("http://" + IP + ":8085/getIngredients?userid=-1").catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("getIngredients: user with no ingredients", () => {
    return axios.get("http://" + IP + ":8085/getIngredients?userid=11111").then((response) => {
        expect(response.data).toEqual([]);
    });
});

test("getIngredients: user with ingredients", () => {
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


//tests for requestIngredients
test("requestIngredients: user with unregistered userID", () => {
    return axios.get("http://" + IP + ":8086/requestIngredients?userid=-1").catch((err) => {
        console.log(err);
        expect(err.response.status).toBe(404);
    });
});

test("requestIngredients: user with no ingredients", () => {
    return axios.get("http://" + IP + ":8086/requestIngredients?userid=11111").then((response) => {
        expect(response.data).toEqual([]);
    });
});

test("requestIngredients: user with ingredients", () => {
    return axios.get("http://" + IP + ":8086/requestIngredients?userid=22222").then((response) => {
        console.log(response.data);
        expect(response.data).toEqual([
            { name: "orange", expiry: 123456789, image: "orange.png" },
            { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" },
            { name: "apple", expiry: 259201, image: "apple.jpg" }
        ]);
    });
});


//tests for deleteIngredient
test("deleteIngredient: user with unregistered userID", () => {
    return axios.post("http://" + IP + ":8086/deleteIngredient", {
        userid: -1,
        ingredient: "apple"
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("deleteIngredient: no stored ingredient", async () => {
    const response = await axios.post("http://" + IP + ":8086/deleteIngredient", {
        userid: 11111,
        ingredient: "banana"
    });
    expect(response.status).toBe(200);
});

test("deleteIngredient: has stored ingredient", async () => {
    const response = await axios.post("http://" + IP + ":8086/deleteIngredient", {
        userid: 22222,
        ingredient: "apple"
    });
    const addBack = await axios.post("http://" + IP + ":8086/addIngredient", {
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.status).toBe(200);
    expect(addBack.status).toBe(200);
});


//tests for updateExpiryDate
test("updateExpiryDate: user with unregistered userID", () => {
    return axios.post("http://" + IP + ":8086/updateExpiryDate", {
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("updateExpiryDate: negative expiry value", () => {
    return axios.post("http://" + IP + ":8086/updateExpiryDate", {
        userid: 11111,
        ingredient: "apple",
        expiry: -1
    }).catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("updateExpiryDate: no stored ingredient", async () => {
    const response = await axios.post("http://" + IP + ":8086/updateExpiryDate", {
        userid: 11111,
        ingredient: "banana",
        expiry: 86400
    });
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
        userid: 11111,
        ingredient: "banana",
        expiry: 86400
    });
});

test("updateExpiryDate: correct input", async () => {
    const response = await axios.post("http://" + IP + ":8086/updateExpiryDate", {
        userid: 22222,
        ingredient: "apple",
        expiry: 86400
    });
    const ingredients = await axios.get("http://" + IP + ":8086/requestIngredients?userid=22222");
    const fixDB = await axios.post("http://" + IP + ":8086/updateExpiryDate", {
        userid: 22222,
        ingredient: "apple",
        expiry: 259201
    });
    expect(response.status).toBe(200);
    expect(ingredients.data[2].expiry).toBe(86400);
    expect(fixDB.status).toBe(200);
});


//tests for searchForIngredient
test("searchForIngredient: no results", async () => {
    const response = await axios.get("http://" + IP + ":8086/searchForIngredient?ingredient=asjdkfjsl");
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
});

test("searchForIngredient: has results", async () => {
    const response = await axios.get("http://" + IP + ":8086/searchForIngredient?ingredient=apple");
    expect(response.status).toBe(200);
    expect(response.data).toEqual([{"id":9003,"name":"apple","image":"apple.jpg"}]);
});


//tests for getIngredientSuggestions
test("getIngredientSuggestions: no results", async () => {
    const response = await axios.get("http://" + IP + ":8086/getIngredientSuggestions?string=asjdkfjsl");
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
});

test("getIngredientSuggestions: has results", async () => {
    const response = await axios.get("http://" + IP + ":8086/getIngredientSuggestions?string=apple");
    expect(response.status).toBe(200);
    expect(response.data).toEqual([
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
    const response = await axios.get("http://" + IP + ":8086/requestExpiryDate?ingredient=asjdkfjsl");
    expect(response.status).toBe(200);
    expect(response.data).toBe(-1);
});

test("requestExpiryDate: has results", async () => {
    const response = await axios.get("http://" + IP + ":8086/requestExpiryDate?ingredient=apple");
    expect(response.status).toBe(200);
    expect(response.data).toBeLessThanOrEqual(Math.round(Date.now() / 1000) + 5184000);
});


//tests for addIngredient
test("addIngredient: user with unregistered userID", () => {
    return axios.post("http://" + IP + ":8086/addIngredient", {
        userid: -1,
        ingredient: "apple",
        expiry: 86400
    }).catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("addIngredient: negative expiry value", () => {
    return axios.post("http://" + IP + ":8086/addIngredient", {
        userid: 11111,
        ingredient: "apple",
        expiry: -1
    }).catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("addIngredient: ingredient doesn't exist in Spoonaular API", () => {
    return axios.post("http://" + IP + ":8086/addIngredient", {
        userid: 11111,
        ingredient: "asjdkfljsl",
        expiry: 86400
    }).catch((err) => {
        expect(err.response.status).toBe(410);
    });
});

test("addIngredient: correct inputs", async () => {
    const response = await axios.post("http://" + IP + ":8086/addIngredient", {
        userid: 11111,
        ingredient: "apple",
        expiry: 86400
    });
    const del = await axios.post("http://" + IP + ":8086/deleteIngredient", {
        userid: 11111,
        ingredient: "apple"
    });
    expect(del.status).toBe(200);
    expect(response.data).toEqual({ name: "apple", expiry: 86400, image: "apple.jpg" });
});
    

//tests for scanExpiryDates
test("scanExpiryDates: negative expiry value", () => {
    return axios.get("http://" + IP + ":8086/scanExpiryDates?time=-1").catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("scanExpiryDates: correct input w/ an expiring user", () => {
    return axios.get("http://" + IP + ":8086/scanExpiryDates?time=86400").then((response) => {
        expect(response.data).toEqual([22222]);
    });
});

test("scanExpiryDates: correct input w/o an expiring user", () => {
    return axios.get("http://" + IP + ":8086/scanExpiryDates?time=0").then((response) => {
        expect(response.data).toEqual([]);
    });
});
    

//tests for expiringIngredients
test("expiringIngredients: user with unregistered userID", () => {
    return axios.get("http://" + IP + ":8086/expiringIngredients?userid=-1&time=86400").catch((err) => {
        expect(err.response.status).toBe(404);
    });
});

test("expiringIngredients: negative expiry value", () => {
    return axios.get("http://" + IP + ":8086/expiringIngredients?userid=22222&time=-1").catch((err) => {
        expect(err.response.status).toBe(405);
    });
});

test("expiringIngredients: correct input w/ an expiring ingredient", () => {
    return axios.get("http://" + IP + ":8086/expiringIngredients?userid=22222&time=86400").then((response) => {
        expect(response.data).toEqual([ { name: "chicken", expiry: 259200, image: "whole-chicken.jpg" } ]);
    });
});

test("expiringIngredients: correct input w/o an expiring ingredient", () => {
    return axios.get("http://" + IP + ":8086/expiringIngredients?userid=22222&time=0").then((response) => {
        expect(response.data).toEqual([]);
    });
});

//tests for checkDietaryRestrictions
test("checkDietaryRestrictions: restrictions does not contain ingredient", () => {
    return axios.get("http://" + IP + ":8086/checkDietaryRestrictions?restrictions=apple,banana,orange&ingredient=chicken").then((response) => {
        expect(response.status).toBe(200);
        expect(response.data).toBeTruthy();
    });
});

test("checkDietaryRestrictions: restrictions does contain ingredient", () => {
    return axios.get("http://" + IP + ":8086/checkDietaryRestrictions?restrictions=apple,banana,orange&ingredient=apple").then((response) => {
        expect(response.status).toBe(200);
        expect(response.data).toBeFalsy();
    });
});