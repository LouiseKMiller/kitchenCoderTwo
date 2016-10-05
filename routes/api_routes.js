// FINAL PROJECT
// UT BOOT CAMP
// THE KITCHEN CODERS PART TWO
// Here is where you create all the functions that will do the routing for your api requests, and the logic of each route, including CRUD commands for the MySQL database (using Sequelize).
//
var path = require('path');
var express = require('express');
var router = express.Router();
var Recipe = require('../models')["Recipe"];
var Ingredient = require('../models')["Ingredient"];
var getRecipes = require('../utils/getRecipes');
var helpers = require('../utils/helpers');

//******************************************************
//  ROUTE FOR ROOT AND HOME
//******************************************************
// THIS IS THE HOME PAGE
// From this page, user can decide what to do
// User can
//    (1) go to the ingredients page
//    (2) go to the findRecipes page
//	  (3) go to the addRecipes page
//    (4) go to the preferences page
//
router.get('/', function (req, res) {
	res.redirect('/home');
	});

router.get('/home', function (req, res) {
	res.render('home');
	});

//******************************************************
//  ROUTES FOR INGREDIENTS
//******************************************************
// User can
//	  (1) review his/her pantry,
//    (2) add ingredients,
//    (3) change status of ingredient to inStock or not inStock, or
//    (4) make a change to an ingredient already in the database (other than inStock)
//    (5) delete an ingredient
//
// GET REQUEST TO URI  - /INGREDIENT
// find all ingredients
// and pass to handlebars to process further
router.get('/ingredient', function(req, res) {
	helpers.findAllIngredients(req, res);
	// res.render('ingredient', hbsObject); // this is done in helper routine
});


// POST REQUEST TO URI  - /INGREDIENT/UPDATE
// receives new ingredient entered by user
// and updates database with the new ingredient
// router.post('/ingredient/update', function(req, res) {
// 	helpers.createIngredient(req, res)
// 	});
router.post('/ingredient/update', function(req, res) {
	helpers.createIngredient(req, res)
	.then (function(){
		res.redirect('/ingredient');
	});
});

// PUT REQUEST TO URI  - /INGREDIENT/UPDATE/:id
// user identifies an ingredient and a change to the inStock status
// we update the database with that information
router.post('/ingredient/update/:id', function(req, res) {
	helpers.updateIngredientPantryStatus(req, res)
	.then (function(){
		console.log("you are here", req.body.inPantry);
		res.json(req.body.inPantry);
	});
});

// POST REQUEST TO URI - /INGREDIENT/OTHERUPDATE
// user indentifies an ingredient and some change (other than inStock status)
// ?? can this same routine delete the ingredient?  May need a separate
// ??    POST REQUEST to delete
// we update the database with that information

//******************************************************
//  ROUTES FOR RECIPES
//******************************************************
//

// GET REQUEST TO URI - /findRecipe
// user presented with page where she can
// query database for matching recipes
// add addition limitation that all ingredients must be inStock
//
router.get('/findRecipe', function (req, res) {
	res.render('findRecipe');
});

router.post('/findRecipe', function (req, res) {
	// ***************** LKMNOTE TO DO ********************
	// figure out how to get helper function to
	// return results array so we can render it
	// in this router file
	helpers.findDatabaseRecipes(req, res);
	// res.render('findRecipe', hbsObject); // this is done in helpers routine

});

// GET REQUEST TO URI - /recipe
// user presented with page showing specific recipe information
//
router.get('/oneRecipe/:id', function(req, res){
	helpers.findSpecificRecipe(req.params.id, res);
	// res.render('oneRecipe', hbsObject); // this is done in helpers routine

});
//
// GET REQUEST TO URI - /addRecipe
// user presented with page where she can
// query database for matching recipes
// add addition limitation that all ingredients must be inStock
//
router.get('/addRecipe', function (req, res) {
	res.render('addRecipe');
});
//

//******************************************************
//  ROUTE FOR ADMINISTRATOR
//******************************************************
//
// GET REQUEST TO URI - /ADMIN/ADD
// user has entered filtering information, which is used below
// to query Spoonacular for matching recipes
// then call getRecipes to load database with results
//
//
router.get('/admin', function (req, res) {
		var message = "What kind of recipes are you looking for?";
		var hbsobject = {message};
		res.render('admin', hbsobject);
	});

router.post('/admin', function (req, res) {
	getRecipes(req.body, function(message){
		var hbsobject = {message};
		res.render('admin', hbsobject);
	});
});

//******************************************************
//  ROUTES FOR CONTACTUS
//******************************************************
//
// GET REQUEST TO URI - /RECIPE  (*** should change to /RECIPE/RESULTS ??)
// user has entered filtering information, which is used below
// to query database for matching recipes
// add addition limitation that all ingredients must be inStock
//
router.get('/contactUs', function (req, res) {
	res.render('contactUs');
});




//
//******************************************************
//  ROUTE FOR PREFERENCES
//******************************************************
// HERE IS WHERE WE SERVE UP THE PUBLIC STATIC HTML PAGE FOR PREFERENCES
// From this page, user can
//    (1) enter information regarding the user's preferences, like food allergies and other dietary restrictins.  Other???
//    (2) ???
//    (3) ???
//
//router.get('/preference', function (req, res) {
//	res.sendFile(path.join(__dirname + '/../public/preferences.html'));
//});

//******************************************************
//  ROUTE FOR SIGN-IN
//******************************************************
// HERE IS WHERE WE SERVE UP THE PUBLIC STATIC HTML PAGE FOR SIGN-IN
// From this page, user can
//    (1) enter user information,
//    (2) indicate whether user is a first time user
//    (3) ???
//
//router.get('/login', function (req, res) {
//	res.sendFile(path.join(__dirname + '/../public/login.html'));
//});

module.exports = router;
// POST REQUEST TO URI  - /RECIPE/ADD
// receives new recipe entered by user
// and updates database with the new recipe
//  THIS IS WHERE WE WILL NEED TO MAKE THE ASSOCIATION IN THE DATABASE BETWEEN THE RECIPE AND THE INGREDIENTS IT USES
//

// here is the code that has worked to make that association
// .then(function(){
// 	return models.Recipe.create(
// 		{title: 'Turkey Sandwich',
// 		 instructions: 'Take out two pieces of Bread. Spread mayo on one slice and mustard on the other. Add a layer of turkey, cheese, tomatoes, and lettuce.',
// 		 cuisine: 'Miscellaneous'
// 		})
// 	.then(function(recipe){
//     return models.Ingredient.findAll({where: {name: ['Lettuce','Turkey','Tomatoes']}})
//     	.then(function(ingredients){recipe.addIngredients(ingredients);
//     	})
// 	})

// })
