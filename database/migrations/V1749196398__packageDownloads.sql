create table public."package_downloads" (
    "id" bigint not null primary key,
    "date" date not null,
    "insights_project_id" uuid not null,
    "repository_url" text not null,
    "name" text not null,
    "ecosystem" text not null,
    "purl" text not null,
    "dependent_repos_count" bigint,
    "dependent_packages_count" bigint,
    "docker_dependents_count" bigint,
    "docker_downloads_count" bigint,
    "downloads_count" bigint,
    "created_at" timestamp with time zone default now() not null,
    "updated_at" timestamp with time zone default now() not null,
    unique ("date", "repository_url", "name")
);

create index "ix_package_downloads_repo" on "package_downloads"("repository_url");
create index "ix_package_downloads_updated_at_id" on "package_downloads"("updated_at", id);

ALTER TABLE public."package_downloads" REPLICA IDENTITY FULL;