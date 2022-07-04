import express, { json } from 'express';
import fetch from 'node-fetch';

var app = express()
app.use(express.json())

app.get("/checkUserExists", async (req, res) => {
    try {
        var email = encodeURIComponent(req.query["email"])
        fetch("http://localhost:8081/scanDB?email=" + email).then(response =>
            response.json()
        ).then(data => {
            // User doesn't exist in db, so we need to store their info
            if (data["id"] === 0) {
                fetch("http://localhost:8081/storeUserInfo", {
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
            //user already exists in the database, data will contain {"id": xx}
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


app.put("/updateRestrictions", async (req, res) => {
    try {
        console.log(req.body)
        //req.body should contain data like {userID: xxx, dietaryRestrictions: [xxx, xxx, ]}
        fetch("http://localhost:8081/updateDietaryRestrictions", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        }).then(response =>
            response.text()
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
