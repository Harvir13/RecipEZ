const IngredientManagingAccess = require("../src/ingredients/IngredientManaging.js");

const {app} = require('../src/router.js');

jest.mock('axios');

const server = app.listen(8084);

test("no expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(0);
    expect(response).toEqual([]);
});

test("has expiring items", async () => {
    const response = await IngredientManagingAccess.sendExpiryNotification(86400);
    expect(response).toEqual([22222]);
});

afterAll(() => {
    server.close();
});