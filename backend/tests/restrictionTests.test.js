//import axios from 'axios';
var axios = require('axios')

jest.mock('axios');

const UserStoreURL = 'http://20.53.224.7:8082';
const UserDBURL = 'http://20.53.224.7:8081';

test('Testing add restriction', () => {
	const req = {'userID': 1, 'dietaryRestrictions': ['apple', 'orange']};
	const res = {'result': 'Successfully added restriction'};

    axios.put = jest.fn().mockResolvedValue(res);
    return axios.put(UserStoreURL + '/addRestrictions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
      },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Testing delete restriction', () => {

	const req = {'userID': 1, 'dietaryRestrictions': ['banana', 'orange']};
	const res = {'result': 'Successfully deleted restriction'};

    axios.put = jest.fn().mockResolvedValue(res);
    return axios.put(UserStoreURL + '/deleteRestrictions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Testing get restriction', () => {
	const req = '1';
	const res = {data: ['banana', 'orange']};

	axios.get = jest.fn().mockResolvedValue(res);
	return axios.get(UserStoreURL + '/getRestrictions?userid=' + req).then(response => expect(response).toEqual(res));
});

test('Testing add restrictions for DB', () => {
    const req = {'userID': 1, 'ingredient': 'apple'};
	const res = {'result': 'Successfully added restriction'};

    axios.put = jest.fn().mockResolvedValue(res);
    return axios.put(UserDBURL + '/addToDietaryRestrictions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Testing delete restrictions for DB', () => {
    const req = {'userID': 1, 'dietaryRestrictions': ['apple', 'banana']};
	const res = {'result': 'Successfully added restriction'};

    axios.put = jest.fn().mockResolvedValue(res);
    return axios.put(UserDBURL + '/deleteFromDietaryRestrictions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res));
});

test('Testing get restriction for DB', () => {
	const req = '1';
	const res = {data: ['banana', 'orange']};

	axios.get = jest.fn().mockResolvedValue(res);
	return axios.get(UserDBURL + '/getDietaryRestrictions?userid=' + req).then(response => expect(response).toEqual(res));
});
