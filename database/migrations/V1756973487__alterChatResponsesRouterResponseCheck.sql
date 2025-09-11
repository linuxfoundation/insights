-- Drop the existing check constraint
ALTER TABLE chat_responses DROP CONSTRAINT chat_responses_router_response_check;

UPDATE chat_responses SET router_response = 'create_query' 
WHERE router_response = 'text-to-sql';

-- Add the new check constraint with 'create_query' instead of 'text-to-sql'
ALTER TABLE chat_responses ADD CONSTRAINT chat_responses_router_response_check 
    CHECK (router_response IN ('pipes', 'create_query', 'stop'));