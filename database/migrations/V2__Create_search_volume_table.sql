CREATE TABLE search_volume (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    data_timestamp DATE NOT NULL,
    volume INTEGER NOT NULL
);
