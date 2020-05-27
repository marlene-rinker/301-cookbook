DROP TABLE IF EXISTS recipes;
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  image VARCHAR(255),
  sourceUrl VARCHAR(255),
  readyInMinutes INT,
  servings INT,
  api_id INT
)
