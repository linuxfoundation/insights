CREATE TABLE IF NOT EXISTS search_volume (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    data_timestamp DATE NOT NULL,
    volume INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
);
