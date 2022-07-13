//import axios from 'axios';
var axios = require('axios')

jest.mock('axios');

const url = 'http://20.53.224.7:8082';

test('Testing add restriction', () => {
	const req = {'userID': 1, 'dietaryRestrictions': ['apple', 'orange']};
	const res = {'result': 'Successfully added restriction'};

    axios.put = jest.fn().mockResolvedValue(res);
    return axios.put(url + '/addRestrictions', {
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
    return axios.put(url + '/deleteRestrictions', {
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
	return axios.get(url + '/getRestrictions?userid=' + req).then(response => expect(response).toEqual(res));
});