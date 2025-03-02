
-- Create function to update message reactions
CREATE OR REPLACE FUNCTION update_message_reactions(message_id UUID, reaction_data JSONB[])
RETURNS VOID AS $$
BEGIN
  -- Added detailed debugging
  RAISE NOTICE 'Updating message % with reactions: %', message_id, reaction_data;
  
  -- Check if message exists
  IF NOT EXISTS (SELECT 1 FROM chat_messages WHERE id = message_id) THEN
    RAISE EXCEPTION 'Message with ID % not found', message_id;
  END IF;
  
  -- Update the message with the new reaction data
  UPDATE chat_messages
  SET reactions = reaction_data
  WHERE id = message_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update reactions for message %', message_id;
  END IF;
  
  -- Verify the update
  RAISE NOTICE 'Update complete for message %', message_id;
END;
$$ LANGUAGE plpgsql;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION update_message_reactions TO authenticated;
