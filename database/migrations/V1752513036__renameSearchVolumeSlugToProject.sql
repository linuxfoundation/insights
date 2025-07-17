-- Drop the existing constraint that references the slug column
ALTER TABLE search_volume
DROP CONSTRAINT search_volume_unique_project_slug_date;

-- Rename the column
ALTER TABLE search_volume
RENAME COLUMN slug TO project;

-- Recreate the constraint with the new column name
ALTER TABLE search_volume
ADD CONSTRAINT search_volume_unique_project_slug_date
UNIQUE (insights_project_id, project, data_timestamp);
