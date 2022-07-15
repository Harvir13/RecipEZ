// M6 Q3
//import {jest} from '@jest/globals';
//import axios from 'axios';
var axios = require('axios');
const { ObjectID } = require('bson');

const UserStoreURL = 'http://20.53.224.7:8082';
const UserDBURL = 'http://20.53.224.7:8081';

jest.mock('axios');

//UserStore.js tests

test('Get user tokens', () => {
    const req = '1, 2, 3';
    const res = [{'userID': 1, 'token': 'a'}, {'userID': 2, 'token': 'b'}, {'userID': 3, 'token': 'c'}];

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(UserStoreURL + '/getUserTokens?userids=' + req).then(response => expect(response).toEqual(res))
});


test('Store user token', () => {
    const req = {'userID': 1, 'token': 'a'};
    const res = {'result': 'Sucessfully stored user token'};

    axios.post = jest.fn().mockResolvedValue(res);
    return axios.post(UserStoreURL + '/storeUserToken', {
      method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Check user exists', () => {
    const req = 'test@test.com';
    const res = {'userID': 1};

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(UserStoreURL + '/checkUserExists?email=' + req).then(response => expect(response).toEqual(res))
});

//UserDB.js tests

test('Scan DB for user email', () => {
    const req = 'test@test.com';
    const res = {"userID": 1};

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(UserDBURL + '/scanDB?email=' + req).then(response => expect(response).toEqual(res))
});

test("Store user info", () => {
  const req = { email: "test4@test.com" };
    const res = {'userID': 4};

    axios.post = jest.fn().mockResolvedValue(res);
    return axios.post(UserDBURL + '/storeUserInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Store token', () => {
    const req = {'userID': 4, 'token': 'd'};
    const res = {'result': "New user's token has been added to DB"};

    axios.post = jest.fn().mockResolvedValue(res);
    return axios.post(UserDBURL + '/storeUserToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Get tokens', () => {
    const req = '1, 2, 3';
    const res = [{'userID': 1, 'token': 'a', "_id": ObjectID("17C6E3C032F89045AD746684")}, {'userID': 2, 'token': 'b', "_id": ObjectID("17C6E3C032F89045AD746685")}, {'userID': 3, 'token': 'c', "_id": ObjectID("17C6E3C032F89045AD746686")}];

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(UserDBURL + '/getTokens?userids=' + req).then(response => expect(response).toEqual(res))
});
