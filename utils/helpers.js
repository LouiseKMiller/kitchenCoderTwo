var Recipe = require('../models')["Recipe"];
var Ingredient = require('../models')["Ingredient"];
var Category = require('../models')["Category"];
var GroceryListItem = require('../models')["GroceryListItem"];


var helpers = {

//=====================================================================
//    HELPER FUNCTIONS FOR INGREDIENTS
//

	findAllIngredients: function(req, res, hblPage) {
		// return instance of Ingredient.findAll results
		Ingredient.findAll({
			order: ['name']
		})
		.then (function(ingredients){
			Category.findAll({
				order: ['className']
			})
			.then (function(categories){
				GroceryListItem.findAll()
				.then (function(groceryListItems){
					var hbsObject = {
						categories: categories,
						ingredients: ingredients,
						groceryListItems: groceryListItems};
					console.log(groceryListItems);
					res.render(hblPage, hbsObject);
				})
				.catch(function(err) {
					console.log('Error occurred in helpers.findAllIngredients function:', err);
				})
			})
		})
	},

	createIngredient: function(req, res) {
		// return instance of Ingredient.create results
		return Ingredient.create(
			{name: req.body.name,
			category: req.body.category})
		.then (function(ingredient){
			Category.find({where: {name: ingredient.category}})
			.then (function(cat){cat.addIngredient(ingredient.id)})
			.catch(function(err) {
				console.log('Error occurred in helpers.createIngredient function:', err);
			})
		})
	},

	updateIngredientPantryStatus: function(req, res) {
		// return number of recipes you can now make
		// ************** TO DO *************************************
		return Ingredient.update({inPantry: req.body.inPantry }, {where: {id: req.params.id}})
		.then (function (updatedIngredient) {
		// see if any recipes' canMake status is affected by change in ingredient's inPantry status
			Recipe.findAll({
			include:[{
				model: Ingredient,
				where: {id: req.params.id}
				}]
			})
			.then (function(recipes){
				var returnValue;
				recipes.forEach(function(recipe){
					if (req.body.inPantry=='false') {
						recipe.update({canMake: false});
					} else {
						recipe.getIngredients({
							where: {inPantry: false}
						})
						.then(function(ingredients){
							if (ingredients.length==0) {recipe.update({canMake: true})};
						})
					}
				})
			})
		})
		.catch(function(err) {
			console.log('Error occurred in helpers.updateIngredientPantryStatus function:', err);
		})
	},


	addGroceryListItem: function(req, res) {
		// return number of recipes you can now make
		// ************** TO DO *************************************
		return GroceryListItem.create({
			note: req.body.note, 
			name: req.body.name
			})
		.then (function(groceryListItem){
			Ingredient.find({where: {id: req.params.id}})
				.then (function(ingredient){
					groceryListItem.setIngredient(ingredient);
				})
			})
		.catch(function(err) {
			console.log('Error occurred in helpers.addGroceryListItem function:', err);
		})
	},

	clearAllGroceryList: function(req, res) {
		// return number of recipes you can now make
		// ************** TO DO *************************************
		return GroceryListItem.destroy({truncate: true})
		.catch(function(err) {
			console.log('Error occurred in helpers.clearIngredientGroceryList function:', err);
		})
	},

	deleteGroceryListItem: function(req, res) {
		// return number of recipes you can now make
		// ************** TO DO *************************************
		return GroceryListItem.findAll()
		.then(function(groceryListItems){
			GroceryListItem.destroy({truncate: true})
		})
		.catch(function(err) {
			console.log('Error occurred in helpers.clearIngredientGroceryList function:', err);
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

	findSpecificRecipe: function(idNum, res) {
		var savedRecipe = {};
		// return instance of Ingredient.findAll results
		return Recipe.find({
			where: {id: idNum}
		})
		.then(function(recipe){
			savedRecipe = recipe;
			recipe.getIngredients()
			.then(function(ingredients){
				var hbsObject = {recipe: savedRecipe, ingredients: ingredients};
				res.render('oneRecipe', hbsObject);
			})
			.catch(function(err) {
				console.log('Error occurred in helpers.findSpecificRecipe function:', err);
			})
		})
	},

	addRecipe: function(req, res) {
		// return instance of Recipe.create results
		var vegetarian = ((req.body.vegetarian) ? true : false);
		var vegan = ((req.body.vegan) ? true : false);
		var glutenFree = ((req.body.glutenFree) ? true : false);

		var newRecipe = {
			title: req.body.title,
			cuisine: req.body.cuisine,
			type: req.body.type,
			vegan: vegan,
			glutenFree: glutenFree,
			vegetarian: vegetarian,
			instructions: req.body.instructions,
			spoonID: parseInt(req.body.spoonID)			
		};

		if (!isNaN(parseInt(req.body.servings)))	{
			newRecipe.servings = parseInt(req.body.servings)};
		if (!isNaN(parseInt(req.body.preparationMinutes))) {
			newRecipe.preparationMinutes = parseInt(req.body.preparationMinutes)};
		if (!isNaN(parseInt(req.body.cookingMinutes))) {
			newRecipe.cookingMinutes = parseInt(req.body.cookingMinutes)};

		return Recipe.create(newRecipe)
		.then (function(recipe){
			var ingredientsArray = req.body.ingredients;
			var ingredientIDs = ingredientsArray.map(function(eachIngredient){
                    return eachIngredient.id;});
            return Ingredient.findAll({where: {id: ingredientIDs}})

                // then take all ingredients and process each one individually
                .then(function(ingredients){
                    ingredients.forEach(function(ingredient){
                        var index = 0;
                        // find the ingredient in the newRecipe ingredients array that matches this instance.  have to do this to keep the proper association between the ingredient and its respective amount/units
                        for (var i=0; i<ingredientsArray.length; i++) {
                                if (ingredientsArray[i].id == ingredient.spoonID) {index = i};
                            }

                            // then associate that ingredient with the recipe
                            // along with the additional attributes of amount and units
                            recipe.addIngredient(
                                ingredient,
                                {amount: ingredientsArray[index].amount,
                                 unit: ingredientsArray[index].unit}
                            )
                            .then(function(){
                            	var sendUrl = '/oneRecipe/' + recipe.id;
                            	console.log("you are here", sendUrl);
                            	res.send({redirect: sendUrl});
                            })
							.catch(function(err){
								console.log('Error occurred in helpers.addRecipe function:', err);
                        });
                    })
				})
		})
	}


}

// We export the helpers function
module.exports = helpers;