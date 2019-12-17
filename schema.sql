
DROP TABLE location;

CREATE TABLE IF NOT EXISTS
location(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255) NOT NULL,
  formatted_query VARCHAR(255) NOT NULL,
  lat NUMERIC (18,6),
  lng NUMERIC (18,6)
);

