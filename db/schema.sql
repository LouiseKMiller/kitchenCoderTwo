### PROJECT 2
### UT BOOT CAMP
### THE KITCHEN CODERS
### Schema

CREATE DATABASE kitchenCodersDB;

USE kitchenCodersDB;
CREATE TABLE Recipe
(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Name varchar(25),
	Instructions varchar(500) NOT NULL,
    Cuisine varchar(40) NOT NULL
);

CREATE TABLE Ingredient
(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    Name varchar(50),
	Category varchar(40)
);

CREATE TABLE RecipeIngredient
(
	recipe_id INT NOT NULL,
	ingredient_id INT NOT NULL,
	CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES Recipe(id),
    CONSTRAINT fk_ingredient FOREIGN KEY(ingredient_id) REFERENCES Ingredient(id)
);

###Run this to create your tables of recipes and ingredients.  The last table (RecipeIngredient) is used to combine everything.

