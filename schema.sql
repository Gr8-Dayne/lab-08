<<<<<<< HEAD
DROP TABLE city_explorer;
CREATE TABLE IF NOT EXISTS city_explorer(
  id SERIAL PRIMARY KEY,
  searchquery VARCHAR(255),
  formattedquery VARCHAR(255),
  lat FLOAT,
  lng FLOAT
  );
=======
DROP TABLE location;

CREATE TABLE IF NOT EXISTS
location(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255) NOT NULL,
  formatted_query VARCHAR(255) NOT NULL,
  lat NUMERIC (18,6),
  lng NUMERIC (18,6)
);
>>>>>>> 085051b303d6e2d46e5e1465c2ec0deb763e80db
