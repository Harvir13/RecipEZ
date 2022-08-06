const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID = "158528567702-cla9vjg1b8mj567gnp1arb90870b001h.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // return new Promise((resolve, reject) => {
    //     return resolve("mock verification")
    // })

}

module.exports = {verify}