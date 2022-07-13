// M6 Q3
//import {jest} from '@jest/globals';
//import axios from 'axios';
var axios = require('axios')

const url = 'http://20.53.224.7:8082';

jest.mock('axios');

test('Get user tokens', () => {
    const req = '1, 2, 3';
    const res = [{'userID': 1, 'token': 'a'}, {'userID': 2, 'token': 'b'}, {'userID': 3, 'token': 'c'}];

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(url + '/getUserTokens?userids=' + req).then(response => expect(response).toEqual(res))
});


test('Store user token', () => {
    const req = {'userID': 1, 'token': 'a'};
    const res = {'result': 'Sucessfully stored user token'};

    axios.post = jest.fn().mockResolvedValue(res);
    return axios.post(url + '/storeUserToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Check user exists', () => {
    const req = 'test@test.com';
    const res = {'userID': 1};

    axios.get = jest.fn().mockResolvedValue(res);
    return axios.get(url + '/checkUserExists?email=' + req).then(response => expect(response).toEqual(res))
});
