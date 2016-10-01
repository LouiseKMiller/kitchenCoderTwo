// ============================================================
// GETRECIPES
// This module is used to get recipes from the Spoonacular API and
// load them into the database
// Query terms for the API call are set by user in the admin page
// ============================================================


// ============================================================
// DEPENDENCIES
// Node Package Modules
// ============================================================
var unirest = require('unirest');

// PREPARE OUR TABLES
// =======================================================================
var models = require('./models');
/// extract our sequelize connection from the models object, to avoid confusion
var seqConnection = models.sequelize;

// global variables
// =======================================================================
var recipeSearchResults = [];
var oneRecipeData = {};
var recipeID ="";
var recipeIngredients = [];
var cuisine = "";
var type = "";
var intolerances = "";


module.exports = function(searchParams, cb)
{
//========================================================================
//          THIS IS WHERE THE ACTION STARTS
//========================================================================
//

// BUILD QUERY STRING for Spoonsacular API using input from admin page
// Also, save certain search parameters to database so we can save them later with 
// the other recipe information in the database.

var queryURL = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?limitLicense=false&number=10&offset=0";

console.log("searchParams: ", searchParams);
if (searchParams.searchTerm!=="") {queryURL += ("&query=" + searchParams.searchTerm.replace(" ", "+").replace(",", "%2C"))};
if (searchParams.cuisine!=="any") {
    queryURL += ("&cuisine=" + searchParams.cuisine);
    cuisine = searchParams.cuisine.replace("+", " ");
    };
if (searchParams.diet!=="any") {queryURL += ("&diet=" + searchParams.diet);};
if (searchParams.type!=="any") {
    queryURL += ("&type=" + searchParams.type);
    type = searchParams.type;
    };
if (searchParams.excludeIngredients!=="") {queryURL += ("&excludeIngredients=" + searchParams.excludeIngredients.trim().replace(",", "%2C").replace(" ", "+"))};
if (searchParams.intolerances!=="none") {
    queryURL += ("&intolerances=" + ((typeof searchParams.intolerances === 'string') ? 
            searchParams.intolerances : 
            searchParams.intolerances.join("%2C+")));
    intolerances = (typeof searchParams.intolerances === 'string') ? 
            searchParams.intolerances : 
            searchParams.intolerances.join(", ").replace("+", " ");
};
console.log("queryURL: ", queryURL);

// SEARCH FOR 10 RECIPES -
 unirest.get(queryURL)
 .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
 .end(function (result) {
    // If no results found, run the call back function with message of failure.
    if (result.body.results.length > 0) {
    // STORE RESULTS IN recipeResults array
        recipeSearchResults = result.body.results;
        console.log("recipeSearchResults: ", recipeSearchResults);
        // NOW CALL THE MOTHER OF ALL FUNCTIONS FOR THIS MODULE
        processAllRecipes(recipeSearchResults, cb);
        // then run the call back function with a message of success!
        cb("recipes found and entered into database!");
    } else {
        cb("No Recipes Found. Try Again!");
    }
 });

} //end of getRecipes function


//========================================================================
//          HERE ARE ALL THE FUNCTIONS
//========================================================================
//

//===========================================================
//  processAllRecipes FUNCTION
//
//  THE FUNCTION FROM WHICH ALL OTHER FUNCTIONS ARE CALLED
//  - INPUT: the results of the search for 10 recipes 
//  - ACTION:  grabs the detailed information for all 10 recipes
//             and stores the information in the database 
//  - OUTPUT:  confirmation that the recipes have been saved to the database
//
function processAllRecipes(recipes){
    var j=0;
    function outerloop(){
//        if (j < recipes.length){
        if (j < 1){
            // FOR EACH RECIPE IN recipeResults array, you need to do two searches
            recipeID = recipes[j].id;

            //first you need to search by recipeID and find the recipe information
            unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + recipeID + "/information?includeNutrition=false")
            .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
            .end(function (result) {

                oneRecipeData = {
                    title: result.body.title,
                    image: result.body.image,
                    cuisine: cuisine,
                    type: type,
                    intolerances: intolerances,
                    vegetarian: result.body.vegetarian,
                    vegan: result.body.vegan,
                    glutenFree: result.body.glutenFree,
                    dairyFree: result.body.dairyFree,
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

//========================================================================
//          addToTable Function
//
// ON A PER RECIPE BASIS, ADD INGREDIENTS TO THE DATABASE IF THEY ARE NEW
// MUST LET EACH findOrCreate COMPLETE BEFORE INITIATING THE NEXT ONE FOR
// THE NEXT INGREDIENT.  OTHERWISE, YOU MAY NOT FIND A PRIOR INGREDIENT
// THAT IS STILL IN PROCESS.
function addToTable(ingredients, newRecipe, recipeIngredients){
  var i = 0;
  function forloop(){
//    if(i<ingredients.length){
    if (i<1){
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

//========================================================================
//          createRecipe Function
//
//
//
function createRecipe(newRecipe, recipeIngredients){
    return models.Recipe.findOrCreate({where: {spoonID: newRecipe.spoonID}, defaults:
        {title: newRecipe.title,
        image: newRecipe.image,
        cuisine: newRecipe.cuisine,
        type: newRecipe.type,
        intolerances: newRecipe.intolerances,
        vegetarian: newRecipe.vegetarian,
        vegan: newRecipe.vegan,
        glutenFree: newRecipe.glutenFree,
        servings: newRecipe.servings,
        preparationMinutes: newRecipe.preparationMinutes,
        cookingMinutes: newRecipe.cookingMinutes,
        sourceUrl: newRecipe.sourceUrl,
        instructions: newRecipe.instructions,
        spoonID: newRecipe.spoonID
        }})
   .spread(function(recipe, created){
        if (created) {
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
                        console.log("***recipe: ", recipe);
                        {recipe.addIngredient(ingredients[i],ingredientAmounts[i])};

                    }
                });
        }        
   })
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
