
DROP TABLE IF EXISTS location;

CREATE TABLE IF NOT EXISTS
location (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255) NOT NULL,
  formatted_query VARCHAR(255) NOT NULL,
  latitude NUMERIC (18,6),
  longitude NUMERIC (18,6)
);

