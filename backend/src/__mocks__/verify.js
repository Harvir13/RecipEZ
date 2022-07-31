async function verify (googlesignintoken) {
        console.log("mocking verify")
        return new Promise((resolve, reject) => {
            return resolve("mock verificaiton")
        })
}

module.exports = {verify}