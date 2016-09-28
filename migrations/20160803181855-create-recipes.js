'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Recipe', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      vegetarian: {
        type: Sequelize.BOOLEAN
      },
      vegan: {
        type: Sequelize.BOOLEAN
      },
      glutenFree: {
        type: Sequelize.BOOLEAN
      },
      servings: {
        type: Sequelize.STRING
      },
      preparationMinutes: {
        type: Sequelize.INTEGER
      },
      cookingMinutes: {
        type: Sequelize.INTEGER
      },
      sourceUrl: {
        type: Sequelize.STRING
      },
      instructions: {
        type: Sequelize.TEXT
      },
      isMatch: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      spoonID: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Recipe');
  }
};