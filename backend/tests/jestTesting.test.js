// M6 Q3
import {jest} from '@jest/globals';
import axios from 'axios';


// jest.mock('axios')
const ip = "20.53.224.7"

jest.mock('axios')

test('get user tokens', () => {
    const req = "1, 2, 3"
    const res = [{"userID": 1, "token": "a"}, {"userID": 2, "token": "b"}, {"userID": 3, "token": "c"}]

    axios.get = jest.fn().mockResolvedValue(res)
    return axios.get("http://" + ip + ":8082/getUserTokens?userids=" + req).then(response => expect(response).toEqual(res))
}) 


test('store user token', () => {
    //Do I check if the input parameters are correct or something?
    const req = {"userID": 1, "token": "a"}
    const res = {"result": "Sucessfully stored user token"}

    axios.post = jest.fn().mockResolvedValue(res)
    return axios.post("http://" + ip + ":8082/storeUserToken", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
    }).then(response => expect(response).toEqual(res))
}) 

test('check user exists', () => {
    const req = "test@test.com"
    const res = {"userID": 1}

    axios.get = jest.fn().mockResolvedValue(res)
    return axios.get("http://" + ip + ":8082/checkUserExists?email=" + req).then(response => expect(response).toEqual(res))
}) 