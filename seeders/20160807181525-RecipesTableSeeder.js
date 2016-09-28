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
        return queryInterface
          .bulkInsert('Recipe',
            [{title: 'Bologna Sandwich',
            instructions: 'Take out two pieces of Bread. Spread mayo on one slice and mustard on the other. Add a layer of bologna, cheese, tomatoes, and lettuce.',
            cuisine: 'Miscellaneous'
            }],
            [{title: 'Salsa Chicken',
            instructions: 'Preheat oven to 375 degrees F (190 degrees C). Place chicken breasts in a lightly greased 9x13 inch baking dish. Sprinkle taco seasoning on both sides of chicken breasts, and pour salsa over all. Bake at 375 degrees F (190 degrees C) for 25 to 35 minutes, or until chicken is tender and juicy and its juices run clear. Sprinkle chicken evenly with cheese, and continue baking for an additional 3 to 5 minutes, or until cheese is melted and bubbly. Top with sour cream if desired, and serve.',
            cuisine: 'Miscellaneous'
            }],
            [{title: 'Hummus and Cucumber Crostini',
            instructions: 'Dividing evenly, top the bagel chips with the hummus and cucumber. Drizzle with the oil and season with ¼ teaspoon each salt and pepper.',
            cuisine: 'Miscellaneous'
            }],
            [{title: 'Grilled Flat Bread With Thyme',
            instructions: 'In a small bowl, mix together 3 tablespoons olive oil, 2 tablespoons fresh thyme leaves, and ¼ teaspoon each kosher salt and black pepper.Coat 1 pound pizza dough with 1 teaspoon olive oil and shape into a 14-inch oval. Grill over medium heat until puffed, cooked through, and slightly charred, 2 to 3 minutes per side. Transfer to a cutting board, brush with the thyme mixture, and cut into pieces.',
            cuisine: 'Miscellaneous'
            }],
            [{title: 'Grilled Teriyaki Wings',
            instructions: 'Halve 8 chicken wings (about 1½ pounds) through the joint; cut off and discard the wing tips. Grill over medium-low heat, covered, turning occasionally, until cooked through, 20 to 25 minutes.Brush with ¼ cup teriyaki sauce during the last 5 minutes of grilling. Sprinkle with ½ teaspoon toasted sesame seeds and serve with additional teriyaki sauce for dipping, if desired.',
            cuisine: 'Miscellaneous'
            }],
            [{title: 'Steak With Skillet Tomatoes',
            instructions: 'Heat 2 teaspoons of the oil in a large skillet over medium-high heat. Season the steaks with ½ teaspoon salt and ¼ teaspoon pepper and cook to the desired doneness, 4 to 6 minutes per side for medium-rare. Let rest at least 5 minutes before slicing.Wipe out the skillet and heat the remaining 1 teaspoon of oil over medium-high heat. Add the tomatoes and ¼ teaspoon each salt and pepper. Cook, tossing occasionally, until beginning to soften, 4 to 6 minutes. Mix in the oregano and serve with the steaks.',
            cuisine: 'Miscellaneous'
            }],
      {});
},

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  return queryInterface.bulkDelete('Recipe', null, {});}
};
