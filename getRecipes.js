var path = require('path');

module.exports = function(searchParams)
{

// ============================================================
// DEPENDENCIES
// Node Package Modules
// ============================================================

// import Node File System module express - a fast, unopinionated, minimalist web framework
var express = require('express');
// import Node File System module body-parser - body parsing middleware.  It parses incoming request bodies in a middleware before your handlers
var bodyParser = require('body-parser');

var models = require('./models');


// PREPARE OUR TABLES in MySQL)
/// extract our sequelize connection from the models object, to avoid confusion
var seqConnection = models.sequelize;

// Include the unirest npm package
var unirest = require('unirest');
var fs = require('fs');

// PREPARE OUR TABLES
// =======================================================================

var recipeSearchResults = [];
var oneRecipeData = {};
var recipeID ="";
var searchTerm = "";
var recipeIngredients = [];


// ON A PER RECIPE BASIS, ADD INGREDIENTS TO THE DATABASE IF THEY ARE NEW
// MUST LET EACH findOrCreate COMPLETE BEFORE INITIATING THE NEXT ONE FOR
// THE NEXT INGREDIENT.  OTHERWISE, YOU MAY NOT FIND A PRIOR INGREDIENT
// THAT IS STILL IN PROCESS.
function addToTable(ingredients, newRecipe, recipeIngredients){
  var i = 0;
  function forloop(){
    if(i<ingredients.length){
        models.Ingredient.findOrCreate({where: {spoonID: ingredients[i].spoonID}, defaults: {name: ingredients[i].name, category: ingredients[i].category}})
        .then(function(){
            i++;
            forloop();
        });
    }
    else{
        createRecipe(newRecipe, recipeIngredients);
    }
  }
  forloop();
}


function createRecipe(newRecipe, recipeIngredients){
    return models.Recipe.create(
        {title: newRecipe.title,
        image: newRecipe.image,
        vegetarian: newRecipe.vegetarian,
        vegan: newRecipe.vegan,
        glutenFree: newRecipe.glutenFree,
        servings: newRecipe.servings,
        preparationMinutes: newRecipe.preparationMinutes,
        cookingMinutes: newRecipe.cookingMinutes,
        sourceUrl: newRecipe.sourceUrl,
        instructions: newRecipe.instructions
        })
   .then(function(recipe){
        var ingredientNames =[];

        var ingredientAmounts = [];
        for (var x=0; x<recipeIngredients.length; x++){
            ingredientNames.push(recipeIngredients[x].name);
            var ingredientAmount = {amount: recipeIngredients[x].amount, unit: recipeIngredients[x].unit};
            ingredientAmounts.push(ingredientAmount);
        }
       return models.Ingredient.findAll({where: {name: ingredientNames}})

            .then(function(ingredients){

                for (var i=0; i<ingredients.length; i++) {
                    var option = ingredientAmounts[i];
                    {recipe.addIngredient(ingredients[i],ingredientAmounts[i])};

                }
       })
   })
}


function processAllRecipes(recipes){
   var j=0;
    function outerloop(){
 //
        if (j < recipes.length){


// FOR EACH RECIPE IN recipeResults array, you need to do two searches
            recipeID = recipes[j].id;


    //first you need to search by recipeID and find the recipe information
            unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + recipeID + "/information?includeNutrition=false")
            .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
            .end(function (result) {


                oneRecipeData = {
                    title: result.body.title,
                    image: result.body.image,
                    vegetarian: result.body.vegetarian,
                    vegan: result.body.vegan,
                    glutenFree: result.body.glutenFree,
                    servings: result.body.servings,
                    preparationMinutes: result.body.preparationMinutes,
                    cookingMinutes: result.body.cookingMinutes,
                    sourceUrl: result.body.sourceUrl,
                    extendedIngredients: result.body.extendedIngredients,
                    spoonID: recipeID,
                    instructions: ""

                };

                //
                getInstructions(recipeID);

            j++;
            outerloop();
            });
        } else {
            console.log("outer loop done");
        }

    }
    outerloop();
}
// ADD A RECIPE

function processOneRecipe(newRecipe){
    // We run this query so that we can drop our tables even though they have foreign keys
//    seqConnection.query('SET FOREIGN_KEY_CHECKS = 0')

    seqConnection.sync()
    // enter new ingredients
    .then(function(){

        var extendedIngredients = newRecipe.extendedIngredients;
        var newIngredients = [];
        recipeIngredients =[];

        for (var i=0; i<extendedIngredients.length; i++) {

            var cleanCategory = extendedIngredients[i].aisle;
            cleanCategory = cleanCategory.replace(/\//, "or");
            cleanCategory = cleanCategory.replace(/\?/, "misc");

            var newIngredient = {
                name: extendedIngredients[i].name,
                spoonID: extendedIngredients[i].id,
                category: cleanCategory
            };
            var recipeIngredient = {
                name: extendedIngredients[i].name,
                amount: extendedIngredients[i].amount,
                unit: extendedIngredients[i].unit
            };
        	newIngredients.push(newIngredient);
            recipeIngredients.push(recipeIngredient);
        }

        addToTable(newIngredients, newRecipe, recipeIngredients);
    })
}

function getInstructions(idTerm){

    // this section is for the instructions.  Still need to work on this
    unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + idTerm + "/analyzedInstructions?stepBreakdown=false")
    .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
    .header("Accept", "application/json")
    .end(function (result) {
        var instructions = "";
        if (result.body.length >= 1) {
            var steps = result.body[0].steps;
            for (var i=0; i<steps.length; i++) {
                instructions += (steps[i].step + " ");
                instructions += "<br>";
            }        

        }
        oneRecipeData.instructions = instructions;
        return processOneRecipe(oneRecipeData);
    });
}
//========================================================================
//          THIS IS WHERE THE ACTION STARTS
//========================================================================
//
// First we run this query so that we can drop our tables even though they have foreign keys

var searchTerm = searchParams.searchTerm;
var veganValue = searchParams.veganValue;

seqConnection.query('SET FOREIGN_KEY_CHECKS = 0')


// SEARCH FOR 10 RECIPES -
unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?limitLicense=false&number=10&offset=0&query=" + searchTerm + "&type=main+course")
.header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
.end(function (result) {

// STORE RESULTS IN recipeResults array
    recipeSearchResults = result.body.results;

    processAllRecipes(recipeSearchResults);

});




} //end of getRecipes function