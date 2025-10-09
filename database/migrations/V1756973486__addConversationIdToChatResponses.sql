ALTER TABLE chat_responses 
ADD COLUMN conversation_id UUID DEFAULT gen_random_uuid();

-- Create index for efficient conversation queries
CREATE INDEX idx_chat_responses_conversation_id ON chat_responses(conversation_id);

-- Create index for efficient conversation + timestamp queries  
CREATE INDEX idx_chat_responses_conversation_created_at ON chat_responses(conversation_id, created_at);