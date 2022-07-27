var axios = require("axios");
// const fetch = require("node-fetch");

const RecipeManagingURL = "http://20.53.224.7:8084"

// addRecipe tests

test("Unregistered userID", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 0, 
                recipeID: 632660, 
                path: "dessert",
                title: "Apricot Glazed Apple Tart",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(404)
            expect(response.data.result).toEqual("User not found")
        })
})

test("Invalid RecipeID", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 1, 
                recipeID: 0, 
                path: "dessert",
                title: "Apricot Glazed Apple Tart",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(450)
            expect(response.data.result).toEqual("Invalid recipe ID")
        })
})

// I don't think there actually are invalid string, but I'm not sure
test("Invalid Bookmark Folder Path", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 1, 
                recipeID: 632660, 
                path: "#32@2%$",
                title: "Apricot Glazed Apple Tart",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(451)
            expect(response.data.result).toEqual("Invalid String")
        })
})

// I don't think there actually are invalid string, but I'm not sure
test("Invalid Recipe Title", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 1, 
                recipeID: 632660, 
                path: "dessert",
                title: "",
                image: "https://spoonacular.com/recipeImages/632660-312x231.jpg"
        }).then(response => {
            expect(response.status).toEqual(451)
            expect(response.data.result).toEqual("Invalid String")
        })
})

// I don't think we can check this
test("Invalid Recipe Image URL", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 1, 
                recipeID: 632660, 
                path: "dessert",
                title: "",
                image: "https://#$23#2$%#2.jpg"
        }).then(response => {
            expect(response.status).toEqual(452)
            expect(response.data.result).toEqual("Invalid URL   ")
        })
})

test("Success", () => {
    axios.post(RecipeManagingURL + "/addRecipe", {
                userID: 1, 
                recipeID: 632660, 
                path: "dessert",
                title: "Apricot Glazed Apple Tart",
                image: "https://#$23#2$%#2.jpg"
        }).then(response => {
            expect(response.status).toEqual(200)
            expect(response.data.result).toEqual("Successfully added recipe to bookmarked list")
        })
})