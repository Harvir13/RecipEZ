import express from "express";
import fetch from "node-fetch";
// import admin from "firebase-admin";
// import { createRequire } from 'module';

const API_KEY = "1b961ea726c449868f6bffe1dd76da71";
// var registrationToken = "dQeP0tUfTCmXF_TUVvk615:APA91bFbY6JuIRlxVzPv4EDvzkP1ubgQJm7VEplUpNCm1jedXaNEzrbad9Bs0DnmTKB2TbjLlgKqZj47Hm4lRyK2jZB5aHCa5N7iGiVDk9eJ7xF2QfiVeTEtpYJ0qyHYZ1pi6efATAms";
const SERVER_KEY = "key=AAAAMKdSYCY:APA91bFkZgU98nuuyEQod_nkkfKP4U6r3uA-avUnsJu9oNYTw1T3MRgbaZ-pzeDgRkNKJomwiC9LMrvqYKVnkzOZPz5HJDk4Mm96l2E3epm4_ZFVCXBjQMVk4sXV78-H6qVT9voEKfrM";

var app = express();
app.use(express.json());


// const require = createRequire(import.meta.url);
// var serviceAccount = require("./recipez-92366-firebase-adminsdk-i7kge-e682dcca8c.json");

// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
//   })

async function run() {
  	try {
		var server = app.listen(8086, (req, res) => {
			var host = server.address().address;
			var port = server.address().port;
			console.log("Example server successfully running at http://%s:%s", host, port);
		});
	} catch (err) {
	}
}

run();

setInterval(function() {
	sendExpiryNotification();
}, 10000)

//expects {userid: xxx}
app.get("/requestIngredients", async (req, res) => {
	try {
		fetch("http://20.53.224.7:8085/getIngredients?userid=" + req.query["userid"], {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		}).then((response) => response.text()).then((data) => {
			res.send(data);
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects {userid: xxx, ingredient: xxx}
app.post("/deleteIngredient", async (req, res) => {
    try {
        fetch("http://20.53.224.7:8085/removeIngredient", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        }).then((response) => response.json()).then((data) => res.send(data));
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
app.post("/updateExpiryDate", async (req, res) => {
	try {
		fetch("http://20.53.224.7:8085/changeExpiry", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(req.body)
		}).then((response) => response.text()).then((data) => res.send(data));
	} catch (err) {
		res.status(400).send(err);
	}
});

//expects {ingredient: xxx}
app.get("/searchForIngredient", async (req, res) => {
	try {
		fetch("https://api.spoonacular.com/food/ingredients/search?query=" +
			req.query["ingredient"] + "&number=1&apiKey=" + API_KEY, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			}
		).then((response) => response.json()).then((data) => {
			res.send(data.results);
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects {string: xxx}
app.get("/getIngredientSuggestions", async (req, res) => {
	try {
		fetch("https://api.spoonacular.com/food/ingredients/search?query=" +
			req.query["string"] + "&apiKey=" + API_KEY, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			}
		).then((response) => response.json()).then((data) => {
			res.send(data.results);
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects {ingredient: xxx}
app.get("/requestExpiryDate", async (req, res) => {
	try {
		fetch("https://shelf-life-api.herokuapp.com/search?q=" + req.query["ingredient"], {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		}).then((response) => response.json()).then((data) => {
			if (data.length == 0 || data.code == 500) {
				res.send("-1");
				return;
			}
			let minLevDistance = Number.MAX_VALUE;
			let desiredIngredient;
			data.forEach((ingredient) => {
				let generalName = ingredient.name;
				//let generalName = ingredient.name.split('-')
				//console.log(generalName[0].trim().toLowerCase())
				//console.log(req.query["ingredient"].toLowerCase())
				//console.log(generalName)
				let levDistance = levenshtein_distance(generalName, req.query["ingredient"]);
				console.log("" + generalName + " : " + levDistance);
				if (levDistance < minLevDistance) {
					minLevDistance = levDistance;
					desiredIngredient = ingredient;
				}
			});
			fetch("https://shelf-life-api.herokuapp.com/guides/" + desiredIngredient.id, {
				method: "GET",
				Headers: {
					"Content-Type": "application/json",
				}
			}).then((response) => response.json()).then((expiryData) => {
				let wantedMethod = null;
				expiryData.methods.forEach((method) => {
					if (method.location == "Refrigerator") wantedMethod = method;
					else if (method.location == "Pantry" && wantedMethod == null) wantedMethod = method;
					else wantedMethod = method;
				});
				console.log(expiryData);
				res.send(wantedMethod.expirationTime.toString());
			});
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects body of {userid: xxx, ingredient: xxx}
app.post("/addIngredient", async (req, res) => {
	try {
		fetch("http://20.53.224.7:8086/searchForIngredient?ingredient=" + req.body.ingredient, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => response.json()).then((spoonacularIng) => {
			console.log(spoonacularIng);
			if (spoonacularIng.length == 0) {
				res.send("No ingredient found");
				return;
			}
			fetch("http://20.53.224.7:8086/requestExpiryDate?ingredient=" + req.body.ingredient, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}).then((response) => response.text()).then((expiryVal) => {
				console.log(expiryVal);
				let expiryDate;
				if (parseInt(expiryVal) == -1) {
					expiryDate = -1;
				} else {
					expiryDate = Math.floor(Date.now() / 1000) + parseInt(expiryVal);
				}
				let ingredient = {
					userid: req.body.userid,
					ingredient: {
						name: req.body.ingredient,
						expiry: expiryDate,
						image: spoonacularIng[0].image,
					}
				};
				console.log(ingredient);
				fetch("http://20.53.224.7:8085/storeIngredient", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(ingredient)
				}).then((response) => response.json()).then((data) => {
					res.send(data.ingredient);
				});
			});
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects {time: xxx}
app.get("/scanExpiryDates", async (req, res) => {
	try {
		fetch("http://20.53.224.7:8085/usersWithExpiringIngredients?time=" + req.query["time"],
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((response) => response.json()).then((data) => {
            res.send(data);
		});
	} catch (err) {
		res.status(400).send(err);
	}
});

// expects {userid: xxx, time: zzz}
app.get("/expiringIngredients", async (req, res) => {
    try {
        fetch("http://20.53.224.7:8085/getIngredients?userid=" + req.query["userid"],
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => response.json()).then((data) => {
            let expiringSoon = [];
            data.forEach((ingredient) => {
                let ingDate = new Date(0);
                let currDate = new Date(0);
                ingDate.setUTCSeconds(ingredient.expiry - (86400 * 2)); // 86400 = 1 day in seconds
                currDate.setUTCSeconds(parseInt(req.query["time"]));
                if (ingDate <= currDate) {
					console.log(ingredient)
					expiringSoon.push(ingredient);
				}
            });
            res.send(expiringSoon);
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

// expects { {restrictions: xxx, yyy, zzz}, ingredient: xxx}
app.get("/checkDietaryRestrictions", async (req, res) => {
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
	// let currTime = Date.now().toString()
	console.log("Current time: " + currTime)
	fetch("http://20.53.224.7:8086/scanExpiryDates?time=" + currTime, {
		method: "GET",
		headers: {
			"Content-type": "application/json"
		}
	}).then((response) => response.json()).then((data) => {
        console.log(data);
		let userids = "";
		for (let i = 0; i < data.length; i++) {
			userids += data.toString();
			userids += ",";
		}
		userids = userids.slice(0,-1)
		console.log(userids);
		fetch("http://20.53.224.7:8082/getUserTokens?userids=" + userids, {
			method: "GET",
			headers: {
				"Content-type": "application/json"
			}
		}).then((response) => response.json()).then((tokens) => {
			console.log(tokens)
			data.forEach((user) => {
				console.log(user)
				fetch("http://20.53.224.7:8086/expiringIngredients?userid=" + user.toString() + "&time=" + currTime, {
					method: "GET",
					headers: {
						"Content-type": "application/json"
					}
				}).then((response) => response.json()).then((ingredient) => {
					console.log("Expiring Ingredients:" + ingredient)
					var currToken = tokens.find((pair) => pair.userID == user).token
					var json = {
						"data": {
							"ingredients": ingredient
						},
						"to": currToken.toString()
					}
					fetch("https://fcm.googleapis.com/fcm/send", {
						method: "POST",
						headers: {
							"Content-type": "application/json",
							Authorization: SERVER_KEY
						},
						body: JSON.stringify(json)
					}).then((response) => response.text()).then((data) => {
						console.log(data);
					});
					// admin.messaging().sendToDevice(currToken.toString(), {"data": {"ingredients": ingredient.toString()}}, {
					// 	priority: "high",
					// 	timeToLive: 60 * 60 * 24
					//   })
					// .then( response => {
					// 	console.log(response)
					// 	console.log("Send to: " + currToken.toString())
					// })
					// .catch( error => {
					// 	console.log(error);
					// });

				})
			})
		})
		
        // let json = {
        //     "data": {
        //         "ingredients": data
        //     },
        //     "to": token
        // }
        // fetch("https://fcm.googleapis.com/fcm/send", {
        //     method: "POST",
        //     headers: {
        //         "Content-type": "application/json",
        //         Authorization: SERVER_KEY
        //     },
        //     body: JSON.stringify(json)
        // }).then((response) => response.text()).then((data) => {
        //     console.log(data);
        // });
	});
}

app.get("/test", async (req, res) => {
	let dist = levenshtein_distance(req.query["input"], req.query["word"]);
	res.send(dist.toString());
});
