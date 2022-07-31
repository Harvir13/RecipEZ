const express = require('express');
const UserManaging = require('./user/UserManaging.js');
const RecipeManaging = require('./recipes/RecipeManaging.js')
const IngredientManaging = require('./ingredients/IngredientManaging.js')


const app = express()
app.use(express.json())


app.post("/addRecipe", RecipeManaging.addRecipe)
app.post("removeRecipe", RecipeManaging.removeRecipe)
app.get("/getRecipes", RecipeManaging.getRecipes)
app.get("/requestFilteredRecipes", RecipeManaging.requestFilteredRecipes)
app.get("/generateSuggestedRecipesList", RecipeManaging.generateSuggestedRecipesList)
app.get("/searchRecipe", RecipeManaging.searchRecipe)
app.get("/getRecipeDetails", RecipeManaging.getRecipeDetails)
app.post("/addNewPath", RecipeManaging.addNewPath)
app.post("/removeExistingPath", RecipeManaging.removeExistingPath)
app.get("/getAllPaths", RecipeManaging.getAllPaths)
app.get("/checkUserExists", UserManaging.checkUserExists)
app.post("/storeUserToken", UserManaging.storeUserToken)
app.get("/getUserTokens", UserManaging.getUserTokensAPI)
app.put("/addRestrictions", UserManaging.addRestrictions)
app.put("/deleteRestrictions", UserManaging.deleteRestrictions)
app.get("/getRestrictions", UserManaging.getRestrictionsAPI)
app.get("/requestIngredients", IngredientManaging.requestIngredientsAPI)
app.post("/deleteIngredient", IngredientManaging.deleteIngredient)
app.post("/updateExpiryDate", IngredientManaging.updateExpiryDate)
app.get("/getIngredientSuggestions", IngredientManaging.getIngredientSuggestions)
app.get("/requestExpiryDate", IngredientManaging.requestExpiryDate)
app.post("/addIngredient", IngredientManaging.addIngredient)


async function run () {
    try {
        console.log("Successfully connected to database")
        var server = app.listen(8082, (req, res) => {
            var host = server.address().address
            var port = server.address().port
            console.log("Example server successfully running at http://%s:%s", host, port)
        })
    }
    catch (err) {
        console.log(err)
        await client.close()

    }
}


run()