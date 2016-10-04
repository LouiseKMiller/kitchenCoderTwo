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
    //        if (j < 2){
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


    //========================================================================
    // FUNCTION processOneRecipe Function
    //
    //  - INPUT:   the data for one recipe
    //  - ACTION:  preprocesses CATEGORY information (taken from spoonacular 'aisle' field
    //             then saves ingredient information to database if it isn't already there
    //  - OUTPUT:  calls createRecipe function that saves the recipe information to the database
    //
    // MUST LET EACH findOrCreate COMPLETE BEFORE INITIATING THE NEXT ONE FOR
    // THE NEXT INGREDIENT.  OTHERWISE, YOU MAY NOT FIND A PRIOR INGREDIENT
    // THAT IS STILL IN PROCESS.  SO WE USE A RECURSIVE FUNCTION
    function processOneRecipe(newRecipe){
        seqConnection.sync();

        var i = 0;
        // if we already have all the ingredients and they are inPantry, then recipe's
        // canMakeFlag should be set to true.
        var canMakeFlag = true;
        function forloop(){
            if (i < newRecipe.extendedIngredients.length){
        //    if (i < 5){

                newRecipe.extendedIngredients[i].aisle = newRecipe.extendedIngredients[i].aisle || "misc";
                newRecipe.extendedIngredients[i].aisle = newRecipe.extendedIngredients[i].aisle.replace(/\//, "or").replace(/\?/, "misc");

                models.Ingredient.findOrCreate(
                    {where: {spoonID: newRecipe.extendedIngredients[i].id}, 
                    defaults: 
                        {name: newRecipe.extendedIngredients[i].name, category: newRecipe.extendedIngredients[i].aisle}
                    })
                .spread(function(ingr, create){
                    // when we add an ingredient, we take this opportunity to see if we can make the current recipe we are saving
                    // with the ingredients we currently have in our kitchen
                    // If we had to add any ingredients, we mark canMake = false
                    // if we didn't have to add any ingredients, we do a further check to see if all
                    // ingredients are in pantry.  If any inPantry is false for any, then canMake = false
                    if (create) {
                        canMakeFlag = false;
                    }
                    else {
                        if (!ingr.dataValues.inPantry) {canMakeFlag = false};
                    };
                    models.Category.findOrCreate(
                        {where: {name: ingr.category}, 
                        defaults: 
                            {name: ingr.category,
                            className: ingr.category.replace(/[^,A-Z0-9]/ig, " ")}
                        })
                        .spread(function(cat, create){
                            i++;
                            cat.addIngredient(ingr.id);
                            forloop();
                        })
                        .catch(function(err) {
                            console.log('Error occurred in processOneRecipe function:', err);
                        });
                })
            }
            else {
                createRecipe(newRecipe, canMakeFlag);
            }
        }
        forloop();
    }

    //========================================================================
    // FUNCTION createRecipe
    //
    //  - INPUT:   the data for one recipe, canMakeFlag
    //  - ACTION:  store recipe information to recipe table if new, associate the ingredients,
    //             and store additional recipe-specific information to recipeIngredient through table
    //  - OUTPUT:  the end

    function createRecipe(newRecipe, canMakeFlag){
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

                // create an array of ingredient spoonIDs so we can finaAll mathcing
                // ingredient instances in the database
                var ingredientIDs = newRecipe.extendedIngredients.map(function(eachIngredient){
                    return eachIngredient.id;
                });
                // then find all matching ingredients in the database
                return models.Ingredient.findAll({where: {spoonID: ingredientIDs}})

                    // then take all ingredients and process each one individually
                    .then(function(ingredients){
                        ingredients.forEach(function(ingredient){
                            var index = 0;
                            // find the ingredient in the newRecipe ingredients array that matches this instance.  have to do this to keep the proper association between the ingredient and its respective amount/units
                            for (var i=0; i<newRecipe.extendedIngredients.length; i++) {
                                if (newRecipe.extendedIngredients[i].id == ingredient.spoonID) {index = i};
                            }

                            // then associate that ingredient with the recipe
                            // along with the additional attributes of amount and units
                            recipe.addIngredient(
                                ingredient,
                                {amount: newRecipe.extendedIngredients[index].amount,
                                 unit: newRecipe.extendedIngredients[index].unit}
                            );
                        });
                    });
            }
       })
       // errors from both database calls will bubble down to this catch
       .catch(function(err) {
        console.log('Error occurred in createRecipe function:', err);
        });
    }


} //end of getRecipes function


