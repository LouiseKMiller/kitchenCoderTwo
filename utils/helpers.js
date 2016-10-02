
var Recipe = require('../models')["Recipe"];
var Ingredient = require('../models')["Ingredient"];

var helpers = {

//=====================================================================
//    HELPER FUNCTIONS FOR INGREDIENTS
//

	findAllIngredients: function(req, res) {
		// return instance of Ingredient.findAll results
		return Ingredient.findAll()
		.catch(function(err) {
			console.log('Error occurred in helpers.findAllIngredients function:', err);		
		})
	},	

	createIngredient: function(req, res) {
		// return instance of Ingredient.create results
		return Ingredient.create(
			{name: req.body.name,
			category: req.body.category})
		.catch(function(err) {
			console.log('Error occurred in helpers.createIngredient function:', err);
		})
	},

	updateIngredientPantryStatus: function(req, res) {
		// return number of recipes you can now make
		// ************** TO DO *************************************
		return Ingredient.update({inPantry: req.body.inPantry }, {where: {id: req.params.id}})
		.then (function () {
		// see if any recipes' canMake status is affected by change in ingredient's inPantry status
			Recipe.findAll({
			include:[{
				model: Ingredient,
				where: {id: req.params.id}
				}]
			})
			.then (function(recipes){
				recipes.forEach(function(recipe){
					if (req.body.inPantry=='false') {
						recipe.update({canMake: false});
					} else {
						recipe.getIngredients({
							where: {inPantry: false}
						})
						.then(function(ingredients){
							if (ingredients.length==0) {recipe.update({canMake: true})}
						})
					}
				})
			})
		})
		.catch(function(err) {
			console.log('Error occurred in helpers.updateIngredient function:', err);
		})
	},
//=====================================================================
//    HELPER FUNCTIONS FOR RECIPES
//
	findDatabaseRecipes: function(req,res) {
		return Ingredient.findAll({where: {name: {$like: '%'+req.body.searchTerm+'%'}}})
		.then(function(ingredients){

			// prepare search criteria
			var searchObject = {};
			if (req.body.type !== 'any') {
				searchObject.type = {$in: ['', req.body.type]}};
			if (req.body.cuisine !== 'any') {
				searchObject.cuisine = {$in: ['', req.body.cuisine]}};
			searchObject.vegan = ((req.body.vegan == ('0' || '1')) ?
				req.body.vegan : {$ne: '3'});
			searchObject.glutenFree = ((req.body.gluten == ('0' || '1' )) ?
				req.body.gluten : {$ne: '3'});
			searchObject.vegetarian = ((req.body.vegetarian == ('0' || '1' )) ?
				req.body.vegetarian : {$ne: '3'});
			searchObject.canMake = ((req.body.canMake == '1') ? req.body.canMake : {$ne: '3'});

			//	for each ingredient, we need to find the recipes
			//  then combine all the results into one array of results
			var i = 0;
			var recipes = [];
			var recipeID = '';
			var savedRecipeIDs = [];
			var recipeIDs = [];
			function anotherLoop(){
				if (i < ingredients.length){
					ingredients[i].getRecipes({where: searchObject})
					.then(function(partialList){
						for (var j=0; j<partialList.length; j++){
							recipeID = partialList[j].dataValues.id;
							if (savedRecipeIDs.indexOf(recipeID) < 0) {
								recipes.push(partialList[j]);
								savedRecipeIDs.push(recipeID);
							}
						}
						i++;
						anotherLoop();
					})
				} else {
					var hbsObject = {recipes};
					res.render('findRecipe', hbsObject);
				}
			}
			anotherLoop();
		})
		.catch(function(error) {
			console.log("error: ", error)
		})
	},

	findSpecificRecipe: function(req, res) {
		// return instance of Ingredient.findAll results
		return Recipe.find({
			where: {id: req.params.id}
		})
		.catch(function(err) {
			console.log('Error occurred in helpers.findAllIngredients function:', err);		
		})
	},	

}








// We export the helpers function
module.exports = helpers;