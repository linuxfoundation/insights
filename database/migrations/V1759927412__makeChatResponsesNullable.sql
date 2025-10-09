-- Make router fields nullable to allow early creation of chat_responses
ALTER TABLE chat_responses ALTER COLUMN router_response DROP NOT NULL;
ALTER TABLE chat_responses ALTER COLUMN router_reason DROP NOT NULL;

-- Drop existing constraints
ALTER TABLE chat_responses DROP CONSTRAINT IF EXISTS chat_responses_router_response_check;
ALTER TABLE chat_responses DROP CONSTRAINT IF EXISTS check_pipe_instructions;

-- Add new constraint that allows NULL or valid enum values
ALTER TABLE chat_responses ADD CONSTRAINT chat_responses_router_response_check
    CHECK (router_response IS NULL OR router_response IN ('pipes', 'create_query', 'stop', 'ask_clarification'));

-- Recreate pipe_instructions check with NULL handling
ALTER TABLE chat_responses ADD CONSTRAINT check_pipe_instructions CHECK (
    router_response IS NULL OR
    (router_response = 'pipes' AND pipe_instructions IS NOT NULL) OR
    (router_response != 'pipes' AND pipe_instructions IS NULL)
);
