'use strict';
module.exports = function(sequelize, DataTypes) {
  var Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    className: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      Category.hasMany(models.Ingredient);
     }
    },
    freezeTableName: true
  });
  return Category;
};