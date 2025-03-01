
-- Add reactions column to chat_messages table
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reactions JSONB[] DEFAULT '{}';

-- Update the table policies to include reactions
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Make sure the table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
