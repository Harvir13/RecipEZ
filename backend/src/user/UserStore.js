import express, { json } from 'express';
import fetch from 'node-fetch';

var app = express()
app.use(express.json())

const ip = "20.53.224.7"

app.get("/checkUserExists", async (req, res) => {
    try {
        console.log(req.query);
        var email = encodeURIComponent(req.query["email"])
        fetch("http://" + ip + ":8081/scanDB?email=" + email).then(response =>
            response.json()
        ).then(data => {
            // User doesn't exist in db, so we need to store their info
            if (data["id"] === 0) {
                fetch("http://" + ip + ":8081/storeUserInfo", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(req.query)
                }).then(response => 
                    response.json()
                ).then(data => {
                    res.send(data)
                })
            }
            //user already exists in the database, data will contain {"userID": xx}
            else {
                res.send(data)
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
    
})

app.post('/storeUserToken', (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, token: xxx}
        fetch("http://" + ip + ":8081/storeToken", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.json()
        ).then(data => {
            res.send(data)
            console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get("/getUserTokens", async (req, res) => {
    try {
        //req.query should contains userids=xxx,xx,xx
        fetch("http://" + ip + ":8081/getTokens?userids=" + req.query["userids"]).then(response =>
            response.json()
        ).then(data => {
            // DO SOME PROCEESSING ON data HERE TO ONLY SEND WHAT WE NEED
            var retArr = []
            console.log(data)
            for (let i = 0; i < data.length; i++) {
                let currObj = {}
                currObj["userID"] = data[i]["userID"]
                currObj["token"] = data[i]["token"]
                retArr.push(currObj)
            }
            res.send(retArr)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    } 
})

app.put("/addRestrictions", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx, xxx, ]}
        fetch("http://" + ip + ":8081/addToDietaryRestrictions", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.json()
        ).then(data => {
            res.send(data)
            console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.put("/deleteRestrictions", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx, xxx, ]}
        fetch("http://" + ip + ":8081/deleteFromDietaryRestrictions", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.json()
        ).then(data => {
            res.send(data)
            console.log(data)
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get("/getRestrictions", async (req, res) => {
    try {
        console.log(req.query)
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx, xxx, ...]}
        fetch("http://" + ip + ":8081/getDietaryRestrictions?userid=" + req.query["userid"]).then(response =>
            response.json()
        ).then(data => {
            console.log(data)
            var retObj = {}
            retObj["userID"] = data["userID"]
            if (data["dietaryRestrictions"] === undefined || data["dietaryRestrictions"].length === 0) {
                retObj["dietaryRestrictions"] = []
            }
            else {
                retObj["dietaryRestrictions"] = data["dietaryRestrictions"]
            }
            console.log(retObj)
            res.send(retObj)
            
        })  
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

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
