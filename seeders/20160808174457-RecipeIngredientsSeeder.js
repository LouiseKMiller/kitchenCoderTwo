'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Recipeingredients', [
      {IngredientId: 1, RecipeId: 1},
      {IngredientId: 2, RecipeId: 1},
      {IngredientId: 3, RecipeId: 1},
      {IngredientId: 4, RecipeId: 1},
      {IngredientId: 5, RecipeId: 1},
      {IngredientId: 6, RecipeId: 1}
    ], {});

    },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
      return queryInterface.bulkDelete('Recipeingredients', null, {});

  }
};
