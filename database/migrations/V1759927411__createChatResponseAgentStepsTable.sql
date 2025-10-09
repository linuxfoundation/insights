-- Create enum for agent types
CREATE TYPE agent_type AS ENUM ('ROUTER', 'PIPE', 'TEXT_TO_SQL', 'AUDITOR', 'CHART', 'EXECUTE_INSTRUCTIONS');

-- Create table to track individual agent execution steps
CREATE TABLE IF NOT EXISTS chat_response_agent_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_response_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    model TEXT,
    agent agent_type NOT NULL,
    response JSONB,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    response_time_seconds NUMERIC NOT NULL DEFAULT 0,
    instructions TEXT,
    error_message TEXT,

    CONSTRAINT fk_chat_response
        FOREIGN KEY (chat_response_id)
        REFERENCES chat_responses(id)
        ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX idx_agent_steps_chat_response_id ON chat_response_agent_steps(chat_response_id);
CREATE INDEX idx_agent_steps_created_at ON chat_response_agent_steps(created_at DESC);
CREATE INDEX idx_agent_steps_agent_type ON chat_response_agent_steps(agent);
