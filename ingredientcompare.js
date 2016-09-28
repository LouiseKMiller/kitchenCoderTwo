var path = require('path');
var path = require('path');
var express = require('express');
var router = express.Router();
var Recipe = require('./models')["Recipe"];
var Ingredient = require('./models')["Ingredient"];
var Recipeingredients = require('./models')["Recipeingredients"];
var getRecipes = require('./getRecipes');

var globalRecipes = [];
var globalIngArray = [];
var arrayOfRecipeIngredients = [];
var ingredientsInPantry = [];
var allRecipes = [];
var models = require('./models');


// PREPARE OUR TABLES in MySQL)
/// extract our sequelize connection from the models object, to avoid confusion
var seqConnection = models.sequelize;


// We run this query so that we can drop our tables even though they have foreign keys
seqConnection.query('SET FOREIGN_KEY_CHECKS = 0')

// reach into our models object, and create each table based on the associated model.
// note: force:true drops the table if it already exists
.then(function(){
	return seqConnection.sync()
})

var Recipeingredient = require('./models')["Recipeingredient"];


// We run this query so that we can drop our tables even though they have foreign keys
seqConnection.query('SET FOREIGN_KEY_CHECKS = 0')

// reach into our models object, and create each table based on the associated model.
// note: force:true drops the table if it already exists
.then(function(){
	return seqConnection.sync()
})
.then(function(){
	Ingredient.findAll({
	attributes: ['id'],
	where: {inPantry : true}
})
	.then (function(ingredient){
		console.log("line 48", ingredient);
		for (var i=0; i<ingredient.length; i++){
			ingredientsInPantry.push(ingredient[i].dataValues.id);
		}

		console.log("ingredientsInPantry", ingredientsInPantry);
		findRecipes();
	});
})


function combineArrays(array1, array2){
	for (var i = 0; i < array1.length; i++) {
		allRecipes.push(
		{id: array1[i],
		ingredients: array2[i]})
	}
	console.log("allRecipes", allRecipes);
}

function gatherIngredients(recipesParam){
  var i = 0;
  function forloop(){
    if (i<recipesParam.length){
        Recipeingredients.findAll({
        	attributes: ['IngredientId'],
        	where: {RecipeId : recipesParam[i]}
        })
        .then(function(recIngredient){
 			for (var j=0; j<recIngredient.length; j++){
			arrayOfRecipeIngredients.push(recIngredient[j].dataValues.id);
			}
       	globalIngArray.push(arrayOfRecipeIngredients);
            i++;
            forloop();
        });
    }
    else{
        console.log("done with loop");
    }
  }
  forloop();
  combineArrays(globalRecipes, globalIngArray);
}

function findRecipes() {Recipe.findAll({
	attributes: ['id'],
})
	.then (function(recipes){
			for (var i=0; i<recipes.length; i++){
			globalRecipes.push(recipes[i].dataValues.id);
		}

		gatherIngredients(globalRecipes);
	})
	.then (function (){
		doCalcs();
	});
}
//module.exports = function(recipes, ingredientsInPantry)
//{



//here is the recipes variable, it only has titles and ingredients
//var recipes = [
//	{title: "chicken soup", ingredients: ["chicken", "carrot", "avocado", "cheese"]},
//	{title: "sandwich", ingredients: ["bread", "turkey", "lettuce", "cheese"]},
//	{title: "taco", ingredients: ["chicken", "tortilla",  "tomatoes", "cheese"]}];
//here are the ingredients in the user's kitchen
//var ingredientsInPantry = ["cheese", "chicken", "tomatoes", "tortilla"];




function doCalcs(){

var count = 0;
var percentages = [];


//3 for loops
//I like to think of it from the inside out.

console.log("allRecipes", allRecipes);
console.log("ingredients", allRecipes[0].ingredients);
console.log("ingredientsInPantry", ingredientsInPantry);
//3) this loops through the recipes 1 by 1
for (var j=0; j<allRecipes.length; j++){
	//2) this will loop through the ingredients of the recipe
	for (var k=0; k<allRecipes[j].ingredients.length; k++) {
		//1) START HERE this will loop through all of the users ingredients and see if it matches the ingredients of the recipe starting with the [0] recipe
		for (var i=0; i<ingredientsInPantry.length; i++) {
			if (ingredientsInPantry[i] == allRecipes[j].ingredients[k]) {
				count++;
			};

		};
		//console.log(count);

	};
	//finds the percentage of ingredients the user has in each recipe and pushes them to an array
	var percentage = count/(allRecipes[j].ingredients.length);
	percentages.push(percentage);
	var count = 0;

}

//this will give you all of the percentages in an array. we need to find the highest 3 percentages to find 3 recipes the customer could make
console.log(percentages);


//this is the function that finds the 3 highest percentages.  i just copy/pasted it off the internet pretty much
function findLargest3(){
    // sort descending
    percentages.sort(function(a,b) {
        if (a < b) { return 1; }
        else if (a == b) { return 0; }
        else { return -1; }
    });

    console.log(percentages+"/******/"+percentages[0]+"/"+percentages[1]+"/"+percentages[2]);
}

findLargest3();

}
//} //end of getRecipes function

