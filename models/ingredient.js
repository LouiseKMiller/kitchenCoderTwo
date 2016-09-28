'use strict';
module.exports = function(sequelize, DataTypes) {
  var Ingredient = sequelize.define('Ingredient', {
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    spoonID: DataTypes.INTEGER,
    inPantry: {type: DataTypes.BOOLEAN,
              defaultValue: false}
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      Ingredient.belongsToMany(models.Recipe, {through: models.Recipeingredients});
     }
    },
    freezeTableName: true
  });
  return Ingredient;
};