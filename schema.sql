DROP TABLE city_explorer;
CREATE TABLE IF NOT EXISTS city_explorer(
  id SERIAL PRIMARY KEY,
  searchquery VARCHAR(255),
  formattedquery VARCHAR(255),
  lat FLOAT,
  lng FLOAT
  );
