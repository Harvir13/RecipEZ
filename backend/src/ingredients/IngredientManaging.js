import express from "express";
//var axios = require("axios");
import axios from "axios";
import {OAuth2Client} from 'google-auth-library';

const API_KEY = "d1e4859a4c854f3a9f5f8cdbbf2bf18f";
const SERVER_KEY = "key=AAAAMKdSYCY:APA91bFkZgU98nuuyEQod_nkkfKP4U6r3uA-avUnsJu9oNYTw1T3MRgbaZ-pzeDgRkNKJomwiC9LMrvqYKVnkzOZPz5HJDk4Mm96l2E3epm4_ZFVCXBjQMVk4sXV78-H6qVT9voEKfrM";

var app = express();
app.use(express.json());

const CLIENT_ID = "158528567702-cla9vjg1b8mj567gnp1arb90870b001h.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    // const ticket = await client.verifyIdToken({
    //     idToken: token,
    //     audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    // });
    // const payload = ticket.getPayload();
    // const userid = payload['sub'];
    return new Promise((resolve, reject) => {resolve("hi")})

  }

async function run() {
	var server = app.listen(8086, (req, res) => {
		var host = server.address().address;
		var port = server.address().port;
		console.log("Example server successfully running at http://%s:%s", host, port);
	});
}

run();

// setInterval(function() {
// 	sendExpiryNotification();
// }, 300000)

//endpoint for TA to test notifications
app.get("/getNotification", async(req, res) => {
	sendExpiryNotification();
	res.send({"result": "Sent notification"});
});

//expects {userid: xxx}
app.get("/requestIngredients", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		axios.get("http://localhost:8085/getIngredients?userid=" + req.query["userid"]).then((response) => {
			res.send(response.data);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	});
});


export function requestIngredients(userid, googlesignintoken) {
	verify(googlesignintoken).then(() => {
		axios.get("http://20.53.224.7:8085/getIngredients?userid=" + userid).then((response) => {
			res.send(response.data);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	});

}

// expects {userid: xxx, ingredient: xxx}
app.post("/deleteIngredient", async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		axios.delete("http://localhost:8085/removeIngredient", {
			data: req.body
		}).then((response) => {
			res.send(response.data);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	}); 
});

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/updateExpiryDate", async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		axios.post("http://localhost:8085/changeExpiry", req.body).then((response) => {
			res.send(response.data);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	});
});

//expects {ingredient: xxx}
app.get("/searchForIngredient", async (req, res) => {
	spoonacularSearch(req.query["ingredient"]).then((data) => {
		res.send(data.results);
	});
});

// expects {string: xxx}
app.get("/getIngredientSuggestions", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		spoonacularSuggest(req.query["string"]).then((data) => {
			res.send(data.results);
		}).catch((err) => {
			res.status(err.status).send(err);
		});
	});
});

// expects {ingredient: xxx}
app.get("/requestExpiryDate", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		shelfLifeSearch(req.query["ingredient"]).then((data) => {
			if (data.length === 0 || data.code === 500) {
				res.send("-1");
				return;
			}
			let minLevDistance = Number.MAX_VALUE;
			let desiredIngredient;
			data.forEach((ingredient) => {
				let generalName = ingredient.name;
				let levDistance = levenshtein_distance(generalName, req.query["ingredient"]);
				if (levDistance < minLevDistance) {
					minLevDistance = levDistance;
					desiredIngredient = ingredient;
				}
			});
			shelfLifeGuide(desiredIngredient.id).then((expiryData) => {
				let wantedMethod = null;
				expiryData.methods.forEach((method) => {
					if (method.location == "Refrigerator") wantedMethod = method;
					else if (method.location == "Pantry" && wantedMethod == null) wantedMethod = method;
					else wantedMethod = method;
				});
				res.send((wantedMethod.expirationTime + Math.round(Date.now() / 1000)).toString());
			});
		});
	});
});

// expects body of {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/addIngredient", async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		axios.get("http://localhost:8086/searchForIngredient?ingredient=" + req.body.ingredient).then((spoonacularIng) => {
			if (spoonacularIng.data.length === 0) {
				res.status(410).send(new Error("Error: no ingredient found in Spoonacular API"));
				return;
			}
			let ingredient = {
				userid: req.body.userid,
				ingredient: {
					name: req.body.ingredient,
					expiry: req.body.expiry,
					image: spoonacularIng.data[0].image,
				}
			};
			axios.post("http://localhost:8085/storeIngredient", ingredient).then((response) => {
				res.send(response.data.ingredient);
			}).catch((err) => {
				res.status(err.response.status).send(err);
			});
		});
	});
});

// expects {userid: xxx, time: xxx}
app.get("/scanExpiryDates", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		axios.get("http://localhost:8085/usersWithExpiringIngredients?time=" + req.query["time"]).then((response) => {
			res.send(response.data);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	});
});

// expects {userid: xxx, time: zzz}
app.get("/expiringIngredients", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		if (req.query["time"] < 0) return res.status(405).send(new Error("Error: invalid expiry value"));
		axios.get("http://localhost:8085/getIngredients?userid=" + req.query["userid"]).then((response) => {
			let data = response.data;
			let expiringSoon = [];
			data.forEach((ingredient) => {
				let ingDate = new Date(0);
				let currDate = new Date(0);
				ingDate.setUTCSeconds(ingredient.expiry - (86400 * 2)); // 86400 = 1 day in seconds
				currDate.setUTCSeconds(parseInt(req.query["time"], 10));
				if (ingDate <= currDate) {
					expiringSoon.push(ingredient);
				}
			});
			res.send(expiringSoon);
		}).catch((err) => {
			res.status(err.response.status).send(err);
		});
	});
});

// expects { {restrictions: xxx, yyy, zzz}, ingredient: xxx}
app.get("/checkDietaryRestrictions", async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		let restrictions = req.query["restrictions"].split(",");
		let ingredientRestricted = false;
		restrictions.forEach((ingredient) => {
			if (ingredient == req.query["ingredient"]) {
				ingredientRestricted = true;
			}
		});
		if (ingredientRestricted) res.send(false); // cannot add ingredient
		else res.send(true); // allowed to add ingredient
	});
});

function levenshtein_distance(inputString, realString) {
	let prevRow = [];
	let currRow = [];
	for (let x = 0; x < realString.length + 1; x++) {
		prevRow[x] = x;
	}
	for (let i = 0; i < inputString.length; i++) {
		currRow[0] = i + 1;
		for (let j = 0; j < realString.length; j++) {
			let deletionCost = prevRow[j + 1] + 1;
			let insertionCost = currRow[j] + 1;
			let substitutionCost = inputString[i] == realString[j] ? prevRow[j] : prevRow[j] + 1;
			currRow[j + 1] = Math.min(deletionCost, insertionCost, substitutionCost);
		}
		prevRow = currRow;
		currRow = [];
	}
	return prevRow[realString.length];
}

// checks expiry dates and sends a notification to the user, if something is expiring
function sendExpiryNotification(res) {
	let currTime = Math.round(Date.now() / 1000).toString();
	console.log("Current time: " + currTime)
	axios.get("http://localhost:8086/scanExpiryDates?time=" + currTime).then((response) => {
		return response.json();
	}).then((data) => {
        console.log(data);
		let userids = "";
		for (let i = 0; i < data.length; i++) {
			userids += data.toString();
			userids += ",";
		}
		userids = userids.slice(0,-1)
		console.log(userids);
		axios.get("http://20.53.224.7:8082/getUserTokens?userids=" + userids).then((response) => {
			return response.json();
		}).then((tokens) => {
			console.log(tokens)
			data.forEach((user) => {
				console.log(user)
				axios.get("http://20.53.224.7:8086/expiringIngredients?userid=" + user.toString() + "&time=" + currTime).then((response) => {
					return response.json();
				}).then((ingredient) => {
					console.log("Expiring Ingredients:" + ingredient)
					var currToken = tokens.find((pair) => pair.userID == user).token
					var expiring = ""
					for (let i = 0; i < ingredient.length; i++) {
						expiring = expiring + ingredient[i]["name"] + ","
					}
					expiring = expiring.slice(0,-1)
					console.log("userid: " + user, "ingredients: " + expiring)
					var json = {
						"data": {
							"ingredients": expiring
						},
						"to": currToken.toString()
					}
					axios.post("https://fcm.googleapis.com/fcm/send", JSON.stringify(json), {
						"Content-Type": "application/json",
						Authorization: SERVER_KEY
					}).then((response) => response.text()).then((data) => {
						console.log(user)
						console.log(data);
					});
				})
			})
		})
	});
}

async function spoonacularSearch(ingredient) {
	const res = await axios.get("https://api.spoonacular.com/food/ingredients/search?query=" +
		ingredient + "&number=1&apiKey=" + API_KEY);
	return res.data;
}

async function spoonacularSuggest(string) {
	const res = await axios.get("https://api.spoonacular.com/food/ingredients/search?query=" +
		string + "&apiKey=" + API_KEY);
	return res.data;
}

async function shelfLifeSearch(ingredient) {
	const res = await axios.get("https://shelf-life-api.herokuapp.com/search?q=" + ingredient);
	return res.data;
}

async function shelfLifeGuide(id) {
	const res = await axios.get("https://shelf-life-api.herokuapp.com/guides/" + id);
	return res.data;
}