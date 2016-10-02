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




module.exports = function(searchParams, cb)
{

// PREPARE OUR TABLES
// =======================================================================
var models = require('../models');
/// extract our sequelize connection from the models object, to avoid confusion
var seqConnection = models.sequelize;
//
// reset global variables to default values for every search
// if we don't do this, these variables will be set to the values
// leftover from the last search
var recipeSearchResults = [];
var oneRecipeData = {};
var recipeID ="";
var cuisine = "";
var type = "";
var intolerances = "";

//========================================================================
//          THIS IS WHERE THE ACTION STARTS
//========================================================================

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
// searchParams.intolerances is string if user picks just one, 
// and is an array if user picks more than one from pull down list of options
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
    // check if error in API call
    if (result.status!==200) {
        cb("error in API call")
    } else {
        // no error in API call
        // check if no results found.
        if (result.body.results.length <= 0) {
            cb("No Recipes Found. Try Again!")
        } else {
            // Results found.  STORE RESULTS IN recipeResults array
            recipeSearchResults = result.body.results;
            console.log("recipeSearchResults: ", recipeSearchResults);
            // NOW CALL THE MOTHER OF ALL FUNCTIONS FOR THIS MODULE
            processAllRecipes(recipeSearchResults, cuisine, type, intolerances);
            // then run the call back function with a message of success!
            cb("Recipes found!");
        }; // end of inner else
    }; // end of outer else
 }); // end of unirest


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
    function processAllRecipes(recipes, cuisine, type, intolerances){
        var j=0;
        function outerloop(){
            if (j < recipes.length){
    //        if (j < 3){
                // FOR EACH RECIPE IN recipeResults array, you need to do two searches
                recipeID = recipes[j].id;

                //first you need to search by recipeID and find the recipe information
                // note: we do not try to see if the recipe is already in the database
                // just in case any of the ingredients were accidently deleted.
                unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + recipeID + "/information?includeNutrition=false")
                .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
                .end(function (result) {
                    // check if errors in API call for recipe information
                    if (result.status!==200) {
                        j++;
                        outerloop();
                    } else {
                    // unirest API call successful

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
                        getInstructions(oneRecipeData);

                        j++;
                        outerloop();
                    }
                });
            } else {
                console.log("outer loop done");
            }

        }
        outerloop();
    }

    //====================================================================
    // FUNCTION getInstructions
    // 
    //  
    //  - INPUT: recipeID - the spoonID from spoonacular for the recipe
    //  - ACTION:  grabs the list of ingredients from spoonacular API
    //             for the recipe with the specified spoonID (recipeID)
    //  - OUTPUT:  calls next processOneRecipe function that processes the recipe and ingredient information

    function getInstructions(oneRecipeData){
        var instructions = "";
        var idTerm = oneRecipeData.spoonID;
        // this section is for the instructions.  Still need to work on this
        unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + idTerm + "/analyzedInstructions?stepBreakdown=false")
        .header("X-Mashape-Key", "1pb1awVrWQmsh5cGX7uf2JqubVkIp1ibFl8jsnOPSRyTSkfXtR")
        .header("Accept", "application/json")
        .end(function (result) {
            // check if errors in API call for recipe information
            if (result.status!==200) {
                console.log("error in unirest call in getInstructions function");
            } else {
            // unirest API call successful
            // if instructions array not empty, concatenate 
            // the step value in each element of the steps array
                if (result.body.length >= 1) {
                    var steps = result.body[0].steps;
                    for (var i=0; i<steps.length; i++) {
                        instructions += (steps[i].step + "\n");
                    }
                }
                oneRecipeData.instructions = instructions;
                return processOneRecipe(oneRecipeData);
            } // end of else
        });
    }

    //====================================================================
    // FUNCTION processOneRecipe
    // 
    //  
    //  - INPUT:   the data for one recipe
    //  - ACTION:  formats the ingredients information so we can add the recipe-specific
    //             information to the recipeIngredients table (e.g., amount, units of measurement)
    //  - OUTPUT:  calls next addtoTable function that saves the ingredients information to the database

    function processOneRecipe(newRecipe){
        seqConnection.sync()
        .then(function(){

            // the extendedIngredients data received from spoonacular is an array of ingredients
            // each element of the array is an object that includes the following:
            // id - the spoonacular unique identifies for the ingredients
            // aisle (which we are using for "category"
            // amount - amount of ingredient needed for the particular recipe
            // unit - unit of measurement that goes with the amount
            //
            // we need to separate the ingredient and category information
            // from the recipe-specific information (i.e., amount and unit)
            // the latter information goes into the recipeIngredient through table
            var cleanCategory = "";
            var recipeIngredient = {};
            var recipeIngredients = [];

            for (var i=0; i<newRecipe.extendedIngredients.length; i++) {


                // our first shot at cleaning up the category value for each ingredient
                // must replace special characters because we use this later as a class name
                // in ingredient.handlebars
                cleanCategory = newRecipe.extendedIngredients[i].aisle || "misc";
                cleanCategory = cleanCategory.replace(/\//, "or").replace(/\?/, "misc");

                recipeIngredient = {
                    name: newRecipe.extendedIngredients[i].name,
                    spoonID: newRecipe.extendedIngredients[i].id,
                    category: cleanCategory,
                    amount: newRecipe.extendedIngredients[i].amount,
                    unit: newRecipe.extendedIngredients[i].unit
                };
                recipeIngredients.push(recipeIngredient);
            }
            addToTable(newRecipe, recipeIngredients);
        })
    }



    //========================================================================
    // FUNCTION addToTable Function
    //  
    //  - INPUT:   the data for one recipe
    //  - ACTION:  formats the ingredients information so we can add the recipe-specific
    //             information to the recipeIngredients table (e.g., amount, units of measurement)
    //  - OUTPUT:  calls next addtoTable function that saves the ingredients information to the database

    //
    // ON A PER RECIPE BASIS, ADD INGREDIENTS TO THE DATABASE IF THEY ARE NEW
    // MUST LET EACH findOrCreate COMPLETE BEFORE INITIATING THE NEXT ONE FOR
    // THE NEXT INGREDIENT.  OTHERWISE, YOU MAY NOT FIND A PRIOR INGREDIENT
    // THAT IS STILL IN PROCESS.
    function addToTable(newRecipe, ingredients){
      var i = 0;
      // if we already have all the ingredients and they are inPantry, then recipe's
      // canMakeFlag should be set to true.
      var canMakeFlag = true;
      function forloop(){
        if(i<ingredients.length){
    //    if (i < 5){
            models.Ingredient.findOrCreate({where: {spoonID: ingredients[i].spoonID}, defaults: {name: ingredients[i].name, category: ingredients[i].category}})
            .spread(function(ingr, create){
                i++;
                // when we add a recipe, we take this opportunity to see if we can make the recipe
                // with the ingredients we currently have in our kitchen
                // If we had to add any ingredients, we mark canMake = false
                // if we didn't have to add any ingredients, we do a further check to see if all
                // ingredients are in pantry.  If any inPantry is false for any, then canMake = false
                if (create) {canMakeFlag = false;}
                else {
                    if (!ingr.dataValues.inPantry) {canMakeFlag = false};
                }
                forloop();
            })
            .catch(function(err) {
                console.log('Error occurred in addToTable function:', err);
            });
        }
        else {
            createRecipe(newRecipe, ingredients, canMakeFlag);
        }
      }
      forloop();
    }

    //========================================================================
    // FUNCTION createRecipe
    //  
    //  - INPUT:   the data for one recipe, separated Ingredient information
    //  - ACTION:  store recipe information to recipe table if new
    //             and store recipe-specific information to recipeIngredient through table
    //  - OUTPUT:  the end

    function createRecipe(newRecipe, recipeIngredients, canMakeFlag){
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
            spoonID: newRecipe.spoonID,
            canMake: canMakeFlag
            }})
        // if we add a recipe, then we need to add the recipe-specific information to the
        // recipeIngredients table
       .spread(function(recipe, created){
            if (created) {
                var ingredientIDs =[];
                var ingredientAmounts = [];
                for (var x=0; x<recipeIngredients.length; x++){
                    ingredientIDs.push(recipeIngredients[x].spoonID);
                    var ingredientAmount = {amount: recipeIngredients[x].amount, unit: recipeIngredients[x].unit};
                    ingredientAmounts.push(ingredientAmount);
                }
                return models.Ingredient.findAll({where: {spoonID: ingredientIDs}})

                    .then(function(ingredients){
                        for (var i=0; i<ingredients.length; i++) {
                            {recipe.addIngredient(ingredients[i],ingredientAmounts[i])};
                        }
                    });
            }
       })
       // errors from both database calls will bubble down to this catch
       .catch(function(err) {
        console.log('Error occurred in createRecipe function:', err);
        });
    }


} //end of getRecipes function

