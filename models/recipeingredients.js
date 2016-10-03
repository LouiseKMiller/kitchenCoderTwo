'use strict';
module.exports = function(sequelize, DataTypes) {
  var Recipeingredients = sequelize.define('Recipeingredients', {
    amount: DataTypes.DECIMAL(5,2),
    unit: DataTypes.STRING,
    IngredientId: DataTypes.INTEGER,
    RecipeId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },
    freezeTableName: true
  });
  return Recipeingredients;
};