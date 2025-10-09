-- Drop the existing check constraint
ALTER TABLE chat_responses DROP CONSTRAINT chat_responses_router_response_check;

-- Add the new check constraint with 'ask_clarification'
ALTER TABLE chat_responses ADD CONSTRAINT chat_responses_router_response_check
    CHECK (router_response IN ('pipes', 'create_query', 'stop', 'ask_clarification'));

-- Add clarification_question column to store the clarification question
ALTER TABLE chat_responses ADD COLUMN IF NOT EXISTS clarification_question TEXT;
