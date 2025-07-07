CREATE TABLE IF NOT EXISTS search_volume (
    id SERIAL PRIMARY KEY,
    insights_project_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    data_timestamp DATE NOT NULL,
    volume INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    CONSTRAINT search_volume_unique_project_slug_date UNIQUE (insights_project_id, slug, data_timestamp)
);