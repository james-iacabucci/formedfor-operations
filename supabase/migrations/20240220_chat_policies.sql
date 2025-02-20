
-- Enable RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_thread_participants ENABLE ROW LEVEL SECURITY;

-- Policy for chat_threads
CREATE POLICY "Users can insert threads" ON chat_threads
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can view threads they're part of" ON chat_threads
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chat_thread_participants 
      WHERE thread_id = id 
      AND user_id = auth.uid()
    )
  );

-- Policy for chat_messages
CREATE POLICY "Users can insert messages in threads they're part of" ON chat_messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_thread_participants 
      WHERE thread_id = chat_messages.thread_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in threads they're part of" ON chat_messages
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM chat_thread_participants 
      WHERE thread_id = chat_messages.thread_id 
      AND user_id = auth.uid()
    )
  );

-- Policy for chat_thread_participants
CREATE POLICY "Users can insert themselves as participants" ON chat_thread_participants
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view thread participants" ON chat_thread_participants
  FOR SELECT 
  TO authenticated 
  USING (true);
