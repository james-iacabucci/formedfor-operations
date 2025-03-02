
-- Create function to update message reactions
CREATE OR REPLACE FUNCTION update_message_reactions(message_id UUID, reaction_data JSONB[])
RETURNS VOID AS $$
BEGIN
  -- Added debugging
  RAISE NOTICE 'Updating message % with reactions: %', message_id, reaction_data;
  
  UPDATE chat_messages
  SET reactions = reaction_data
  WHERE id = message_id;
  
  -- Verify the update
  RAISE NOTICE 'Update complete for message %', message_id;
END;
$$ LANGUAGE plpgsql;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION update_message_reactions TO authenticated;
