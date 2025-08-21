CREATE TABLE IF NOT EXISTS chat_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    user_prompt TEXT NOT NULL,
    router_response TEXT NOT NULL CHECK (router_response IN ('pipes', 'text-to-sql', 'stop')),
    router_reason TEXT NOT NULL,
    pipe_instructions JSONB,
    sql_query TEXT,
    model TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    feedback INTEGER,
    CONSTRAINT check_feedback_values CHECK (feedback IS NULL OR feedback IN (0, 1)),
    CONSTRAINT check_pipe_instructions CHECK (
        (router_response = 'pipes' AND pipe_instructions IS NOT NULL) OR 
        (router_response != 'pipes' AND pipe_instructions IS NULL)
    )
);