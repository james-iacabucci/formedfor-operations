
-- Enable RLS on chat tables
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_thread_participants ENABLE ROW LEVEL SECURITY;

-- Create clearer security policies for threads
DROP POLICY IF EXISTS "Users can insert threads" ON chat_threads;
DROP POLICY IF EXISTS "Users can view threads they're part of" ON chat_threads;

-- New policies for threads
CREATE POLICY "Users can insert threads" ON chat_threads
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can view sculpture threads" ON chat_threads
  FOR SELECT 
  TO authenticated 
  USING (
    sculpture_id IS NOT NULL AND
    fabrication_quote_id IS NULL
  );

CREATE POLICY "Users can view quote threads" ON chat_threads
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chat_thread_participants 
      WHERE thread_id = id 
      AND user_id = auth.uid()
    ) AND fabrication_quote_id IS NOT NULL
  );

-- Clear policies for messages
DROP POLICY IF EXISTS "Users can insert messages in threads they're part of" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in threads they're part of" ON chat_messages;

-- New policies for messages
CREATE POLICY "Users can view sculpture chat messages" ON chat_messages
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE id = chat_messages.thread_id
      AND sculpture_id IS NOT NULL
      AND fabrication_quote_id IS NULL
    )
  );

CREATE POLICY "Users can view quote chat messages" ON chat_messages
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      JOIN chat_thread_participants ctp ON ct.id = ctp.thread_id
      WHERE ct.id = chat_messages.thread_id
      AND ctp.user_id = auth.uid()
      AND ct.fabrication_quote_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert messages in sculpture threads" ON chat_messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads
      WHERE id = chat_messages.thread_id
      AND sculpture_id IS NOT NULL
      AND fabrication_quote_id IS NULL
    )
  );

CREATE POLICY "Users can insert messages in quote threads they're part of" ON chat_messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      JOIN chat_thread_participants ctp ON ct.id = ctp.thread_id
      WHERE ct.id = chat_messages.thread_id
      AND ctp.user_id = auth.uid()
      AND ct.fabrication_quote_id IS NOT NULL
    )
  );

-- Update participants policies
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON chat_thread_participants;
DROP POLICY IF EXISTS "Users can view thread participants" ON chat_thread_participants;

CREATE POLICY "Users can insert participants" ON chat_thread_participants
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can view thread participants" ON chat_thread_participants
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Make sure the tables are in the realtime publication
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE chat_threads REPLICA IDENTITY FULL;
ALTER TABLE chat_thread_participants REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_thread_participants;
