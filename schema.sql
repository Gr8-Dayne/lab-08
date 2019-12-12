DROP TABLE city_explorer;
CREATE TABLE IF NOT EXISTS
city_explorer(
  id SERIAL PRIMARY KEY NOT NULL,
  searchquery VARCHAR(255) NOT NULL,
  formattedquery VARCHAR(255) NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL
  );
