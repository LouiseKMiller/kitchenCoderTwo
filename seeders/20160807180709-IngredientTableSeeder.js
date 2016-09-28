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
        return queryInterface.bulkInsert('Ingredient', [
            {name: 'Turkey', category: 'Meat', inPantry: 0},
            {name: 'Wheat Bread', category: 'Bread', inPantry: 0},
            {name:'Lettuce', category: 'Vegetable', inPantry: 0},
            {name: 'Tomatoes', category: 'Vegetable', inPantry: 0},
            {name: 'Mustard', category: 'Condiment', inPantry: 0},
            {name: 'Mayo', category: 'Condiment', inPantry: 0}
        ], {});

    },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('Ingredient', null, {});

  }
};
