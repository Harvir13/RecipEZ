const {app} = require('./router.js')

async function run () {
    console.log("Successfully connected to database")
    var server = app.listen(8082, (req, res) => {
        var host = server.address().address
        var port = server.address().port
        console.log("Example server successfully running at http://%s:%s", host, port)
    })
}


run()