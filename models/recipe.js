'use strict';
module.exports = function(sequelize, DataTypes) {
  var Recipe = sequelize.define('Recipe', {
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    cuisine: DataTypes.STRING,
    type: DataTypes.STRING,
    intolerances: DataTypes.STRING,
    vegetarian: DataTypes.BOOLEAN,
    vegan: DataTypes.BOOLEAN,
    glutenFree: DataTypes.BOOLEAN,
    dairyFree: DataTypes.BOOLEAN,
    servings: DataTypes.INTEGER,
    preparationMinutes: DataTypes.INTEGER,
    cookingMinutes: DataTypes.INTEGER,
    sourceUrl: DataTypes.STRING,
    instructions: DataTypes.TEXT,
    isMatch: {type: DataTypes.BOOLEAN,
              defaultValue: false},
    spoonID: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Recipe.belongsToMany(models.Ingredient, {through: models.Recipeingredients});
        // associations can be defined here
      }
    },
    freezeTableName: true
  });
  return Recipe;
};