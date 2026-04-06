-- Events table for tracking user interactions throughout the application
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    properties JSONB,
    feature TEXT,
    source TEXT,
    entry_source TEXT
);

-- Indexes for common query patterns
CREATE INDEX idx_events_key ON public.events(key);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_feature ON public.events(feature);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
