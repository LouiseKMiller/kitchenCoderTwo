### PROJECT 2
### UT BOOT CAMP
### THE KITCHEN CODERS
### Seeds



### The first recipe to enter
INSERT INTO Recipe (Name, Instructions, Cuisine) VALUES ('Turkey Sandwich', 'Take out two pieces of Bread. Spread mayo on one slice and mustard on the other. Add a layer of turkey, cheese, tomatoes, and lettuce.', 'Miscellaneous');
INSERT INTO Ingredient (Name, Category) VALUES('Turkey', 'Meat'), ('Wheat Bread', 'Bread'), ('Lettuce', 'Vegetable'), ('Tomatoes', 'Vegetable'), ('Mustard', 'Condiment'), ('Mayo', 'Condiment');
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 1);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 2);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 3);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 4);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 5);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(1, 6);


### The second recipe to enter
INSERT INTO Recipe (Name, Instructions, Cuisine) VALUES ('Tacos', 'Grab a tortilla.  Fill it with chicken, lettuce, cheese, and salsa. Roll up and put in microwave', 'Mexican');

### Notice here I  dont need to enter lettuce again, because it is already in the ingredients table
INSERT INTO Ingredient (Name, Category) VALUES('Tortilla', 'Bread'), ('Chicken', 'Meat'), ('Cheese', 'Dairy'), ('Salsa', 'Condiment');
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(2, 7);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(2, 8);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(2, 9);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(2, 10);
INSERT INTO RecipeIngredient (recipe_id, ingredient_id) VALUES(2, 3);


### This will join the tables and list all the recipes with their cuisine and all the ingredients with their category
SELECT r.name AS 'Recipe', 

	r.instructions,
    
    r.Cuisine AS 'Cuisine',

	i.name AS 'Ingredient',
    
    i.Category AS 'Ingredient Type'

FROM Recipe r

JOIN RecipeIngredient ri on r.id = ri.recipe_id 
JOIN Ingredient i on i.id = ri.ingredient_id 



### If you ever need to see all of the ingredients or recipes we have in our database, you can use these commands
SELECT * FROM Ingredient
SELECT * FROM Recipe