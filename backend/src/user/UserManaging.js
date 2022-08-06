const {getDietaryRestrictions, deleteDietaryRestrictions, addToDietaryRestrictions, getTokens, storeToken, storeUserInfo, scanDB} = require('./UserDBAccess.js')
const {verify} = require('../verify.js')

const checkUserExists = async (req, res) => {
        verify(req.query["googlesignintoken"]).then(() => {
        var email = req.query["email"]
        scanDB(email).then(data => {
            // User doesn't exist in db, so we need to store their info
            if (data["userID"] === 0) {
                storeUserInfo(email).then(response => {
                    var status = response.status
                    delete response["status"]
                    res.status(status).send(response)
                })
            }
            //user already exists in the database, data will contain {"userID": xx}
            else {
                var status = data.status
                delete data["status"]
                res.status(status).send(data)
            }
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const storeUserToken = async (req, res) => {
        verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, token: xxx}
        storeToken(req.body["userID"], req.body["token"]).then(response => {
            var status = response.status
                    delete response["status"]
                    res.status(status).send(response)
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getUserTokensAPI = async (req, res) => {
        verify(req.query["googlesignintoken"]).then(() => {
        //req.query should contains userids=xxx,xx,xx
        getTokens(req.body["userids"]).then(response => {
            // DO SOME PROCEESSING ON data HERE TO ONLY SEND WHAT WE NEED
            var data = response.result
            var retArr = []
            for (let i = 0; i < data.length; i++) {
                let currObj = {}
                currObj["userID"] = data[i]["userID"]
                currObj["token"] = data[i]["token"]
                retArr.push(currObj)
            }
            res.status(response.status).send(retArr)
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

function getUserTokens(userids) {
    return new Promise((resolve, reject) => {
        getTokens(userids).then(response => {
            var data = response.result
            var retArr = []
            for (let i = 0; i < data.length; i++) {
                let currObj = {}
                currObj["userID"] = data[i]["userID"]
                currObj["token"] = data[i]["token"]
                retArr.push(currObj)
            }
            return resolve({"status": response.status, "result": retArr})
        }).catch ((err) => {
            return reject(err)
        }) 
    }) 
}

const addRestrictions = async (req, res) => {
        verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, restriction: xxx}
        addToDietaryRestrictions(req.body["userID"], req.body["restriction"]).then(data => {
            var status = data["status"]
            delete data["status"]
            res.status(status).send(data)
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const deleteRestrictions = async (req, res) => {
        verify(req.body.googleSignInToken).then(() => {
        //req.body should contain data like {userID: xxx, restriction: xxx}
        deleteDietaryRestrictions(req.body["userID"], req.body["restriction"]).then(data => {
            var status = data["status"]
            delete data["status"]
            res.status(status).send(data)
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}

const getRestrictionsAPI = async (req, res) => {
        verify(req.query["googlesignintoken"]).then(() => {
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx, xxx, ...]}
        getDietaryRestrictions(req.query["userid"]).then(response => {
            var data = response.result
            var status = response.status
            var retObj = {}
            retObj["userID"] = data["userID"]
            if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                retObj["dietaryRestrictions"] = []
            }
            else {
                retObj["dietaryRestrictions"] = data["dietaryRestrictions"]
            }
            res.status(status).send(retObj)
            
        })}).catch ((err) => {
            var status = err.status
            delete err["status"]
            res.status(status).send(err)
        }) 
}


function getRestrictions(userid, googlesignintoken) {
    return new Promise((resolve, reject) => {
        verify(googlesignintoken).then(() => {
            getDietaryRestrictions(userid).then(response => {
                var data = response.result
                var status = response.status
                var retObj = {}
                retObj["userID"] = data["userID"]
                if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                    retObj["dietaryRestrictions"] = []
                }
                else {
                    retObj["dietaryRestrictions"] = data["dietaryRestrictions"]
                }
                return resolve({status, "data": retObj})
                
            }).catch ((err) => {
                return reject(err)
            }) 
        }).catch ((err) => {
            return reject({"status": 400, "data": err})
        }) 
    })
}

module.exports = {getRestrictions, getUserTokens, checkUserExists, storeUserToken, getUserTokensAPI, addRestrictions, deleteRestrictions, getRestrictionsAPI}
