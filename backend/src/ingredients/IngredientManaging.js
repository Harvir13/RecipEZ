const UserManaging = require('../user/UserManaging.js');
const {changeExpiry, usersWithExpiringIngredients, removeIngredient, storeIngredient, getIngredients} = require('./IngredientDBAccess.js');
const axios = require('axios');
const express = require('express')
const {verify} = require('../verify.js')
 
const API_KEY = "d1e4859a4c854f3a9f5f8cdbbf2bf18f";
const SERVER_KEY = "key=AAAAMKdSYCY:APA91bFkZgU98nuuyEQod_nkkfKP4U6r3uA-avUnsJu9oNYTw1T3MRgbaZ-pzeDgRkNKJomwiC9LMrvqYKVnkzOZPz5HJDk4Mm96l2E3epm4_ZFVCXBjQMVk4sXV78-H6qVT9voEKfrM";

var app = express();
app.use(express.json());

// setInterval(function() {
// 	sendExpiryNotification(Math.round(Date.now() / 1000).toString());
// }, 300000)

const getNotification = async(req, res) => {
	sendExpiryNotification();
	res.send({"result": "Sent notification"});
}

//expects {userid: xxx}
const requestIngredientsAPI = async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		getIngredients(req.query["userid"]).then((response) => {
			res.status(response.status).send(response.result);
		}).catch((err) => {
			var status = err.status
			delete err["status"]
			res.status(status).send(err);
		});
	});
}

function requestIngredients(userid, googlesignintoken) {
	return new Promise((resolve, reject) => {
        verify(googlesignintoken).then(() => {
            	getIngredients(userid).then((response) => {
				return resolve({"status": 200, data: response.result})
        	}).catch((err) => {
				return reject({"status": err.status, "data": err})
        	}) 
    	})
	})
}

// expects {userid: xxx, ingredient: xxx}
const deleteIngredient = async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		removeIngredient(req.body["userid"], req.body["ingredient"]).then((response) => {
			res.status(response.status).send(response.result);
		}).catch((err) => {
			var status = err.status
			delete err["status"]
			res.status(status).send(err);
		});
	}); 
}

// expects {userid: xxx, ingredient: xxx, expiry: xxx}
const updateExpiryDate = async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		changeExpiry(req.body["userid"], req.body["ingredient"], req.body["expiry"]).then((response) => {
			res.status(response.status).send(response.result);
		}).catch((err) => {
			var status = err.status
			delete err["status"]
			res.status(status).send(err);
		});
	});
}

//expects {ingredient: xxx}
function searchForIngredient(ingredient) {
	return new Promise((resolve, reject) => {
		spoonacularSearch(ingredient).then((data) => {
			return resolve(data.results);
		});
	})	
}

// expects {string: xxx}
const getIngredientSuggestions = async (req, res) => {
	verify(req.query["googlesignintoken"]).then(() => {
		spoonacularSuggest(req.query["string"]).then((data) => {
			res.send(data.results);
		}).catch((err) => {
			var status = err.status;
			delete err["status"];
			res.status(status).send(err);
		});
	});
}

// expects {ingredient: xxx}
const requestExpiryDate = async (req, res) => {
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
}

// expects body of {userid: xxx, ingredient: xxx, expiry: xxx}
const addIngredient = async (req, res) => {
	verify(req.body.googleSignInToken).then(() => {
		searchForIngredient(req.body.ingredient).then((spoonacularIng) => {
			if (spoonacularIng.length === 0) {
				res.status(410).send(new Error("Error: no ingredient found in Spoonacular API"));
				return;
			}
			var ingredientObj = {
				userid: req.body.userid,
				ingredient: {
					name: req.body.ingredient,
					expiry: req.body.expiry,
					image: spoonacularIng[0].image,
				}
			};
			storeIngredient(ingredientObj.userid, ingredientObj.ingredient).then((response) => {
				res.status(response.status).send(response.result);
			}).catch((err) => {
				var status = err.status
				delete err["status"]
				res.status(status).send(err);
			});
		});
	});
}

// expects {userid: xxx, time: xxx}
function scanExpiryDates(time) {
	return new Promise((resolve, reject) => {
		usersWithExpiringIngredients(time).then(response => {
			return resolve(response.result)
		}).catch(err => {
			return reject(err);
		})
	})
	
}

// app.get("/scanExpiryDates", async (req, res) => {
// 	verify(req.query["googlesignintoken"]).then(() => {
// 		axios.get("http://localhost:8085/usersWithExpiringIngredients?time=" + req.query["time"]).then((response) => {
// 			res.send(response.data);
// 		}).catch((err) => {
// 			res.status(err.response.status).send(err);
// 		});
// 	});
// });

// expects {userid: xxx, time: zzz}
function expiringIngredients(userid, time) {
	return new Promise((resolve, reject) => {
		if (time < 0) return reject({"status": 405, "result": "Error: invalid expiry value"});
		getIngredients(userid).then((response) => {
			let data = response.result;
			let expiringSoon = [];
			data.forEach((ingredient) => {
				let ingDate = new Date(0);
				let currDate = new Date(0);
				ingDate.setUTCSeconds(ingredient.expiry - (86400 * 2)); // 86400 = 1 day in seconds
				currDate.setUTCSeconds(parseInt(time, 10));
				if (ingDate <= currDate) {
					expiringSoon.push(ingredient);
				}
			});
			return resolve({"status": response.status, "result": expiringSoon});
		}).catch((err) => {
			return reject(err);
		});
	})
}
// app.get("/expiringIngredients", async (req, res) => {
// 	verify(req.query["googlesignintoken"]).then(() => {
// 		if (req.query["time"] < 0) return res.status(405).send(new Error("Error: invalid expiry value"));
// 		IngredientDBAccess.getIngredients(userid).then((response) => {
// 			let data = response.result;
// 			let expiringSoon = [];
// 			data.forEach((ingredient) => {
// 				let ingDate = new Date(0);
// 				let currDate = new Date(0);
// 				ingDate.setUTCSeconds(ingredient.expiry - (86400 * 2)); // 86400 = 1 day in seconds
// 				currDate.setUTCSeconds(parseInt(req.query["time"], 10));
// 				if (ingDate <= currDate) {
// 					expiringSoon.push(ingredient);
// 				}
// 			});
// 			res.status(response.status).send(expiringSoon);
// 		}).catch((err) => {
// 			var status = err.status
// 			delete err["status"]
// 			res.status(status).send(err);
// 		});
// 	});
// });

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
async function sendExpiryNotification(currTime) {
	//let currTime = Math.round(Date.now() / 1000).toString();
	console.log("Current time: " + currTime)
	scanExpiryDates(currTime).then((data) => {
        console.log(data);
		let userids = "";
		for (let i = 0; i < data.length; i++) {
			userids += data.toString();
			userids += ",";
		}
		userids = userids.slice(0,-1)
		console.log(userids);
		UserManaging.getUserTokens(userids).then((response) => {
			return response.result;
		}).then((tokens) => {
			console.log(tokens)
			data.forEach((user) => {
				console.log(user)
				expiringIngredients(user.toString(), currTime).then((response) => {
					return response.result
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
						return data;
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

module.exports = {getNotification, requestIngredientsAPI, requestIngredients, searchForIngredient, scanExpiryDates, sendExpiryNotification,
	expiringIngredients, deleteIngredient, updateExpiryDate, getIngredientSuggestions, requestExpiryDate, addIngredient};