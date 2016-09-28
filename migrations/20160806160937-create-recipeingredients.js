'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Recipeingredients', {
       id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      unit: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      IngredientId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Ingredient',
          key: 'id'
        },
      onUpdate: 'cascade',
      onDelete: 'cascade'
      },
      RecipeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Recipe',
          key: 'id'
        },
      onUpdate: 'cascade',
      onDelete: 'cascade'
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Recipeingredients');
  }
};