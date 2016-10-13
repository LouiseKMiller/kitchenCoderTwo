'use strict';
module.exports = function(sequelize, DataTypes) {
  var GroceryListItem = sequelize.define('GroceryListItem', {
    note: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      GroceryListItem.belongsTo(models.Ingredient);
     }
    },
    freezeTableName: true
  });
  return GroceryListItem;
};