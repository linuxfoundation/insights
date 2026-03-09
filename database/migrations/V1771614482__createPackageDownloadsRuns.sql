CREATE TABLE IF NOT EXISTS public."package_downloads_runs" (
    "id"                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "date"                      DATE NOT NULL,
    "insights_project_id"       UUID NOT NULL,
    "repository_url"            TEXT NOT NULL,
    "bytes_returned"            BIGINT NOT NULL CHECK ("bytes_returned" >= 0),
    "returned_any_package_data" BOOLEAN NOT NULL,
    "error"                     TEXT,
    "created_at"                TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_package_downloads_runs_repository_url ON public."package_downloads_runs"("repository_url");
CREATE INDEX idx_package_downloads_runs_created_at ON public."package_downloads_runs"("created_at" DESC);
CREATE INDEX idx_package_downloads_runs_date ON public."package_downloads_runs"("date");
