import express, { json } from 'express';
import fetch from 'node-fetch';

var app = express()

app.get("/checkUserExists", async (req, res) => {
    try {

        fetch("http://localhost:8081/scanDB/?email=test@test.com").then(response => {
            console.log(response)
            response.json()
        }).then(data => {
            // res.send(data)
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
