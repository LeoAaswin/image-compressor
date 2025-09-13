-- Create the global_counter table
CREATE TABLE IF NOT EXISTS global_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_files BIGINT DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row if it doesn't exist
INSERT INTO global_counter (id, total_files, total_size_bytes, last_updated)
VALUES (1, 0, 0, NOW())
ON CONFLICT (id) DO UPDATE SET
  total_files = COALESCE(global_counter.total_files, 0),
  total_size_bytes = COALESCE(global_counter.total_size_bytes, 0),
  last_updated = NOW();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_global_counter_updated_at ON global_counter;
CREATE TRIGGER update_global_counter_updated_at
    BEFORE UPDATE ON global_counter
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE global_counter ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON global_counter
    FOR SELECT USING (true);

-- Create policy to allow public insert/update access
CREATE POLICY "Allow public insert/update" ON global_counter
    FOR ALL USING (true);

-- Enable real-time for the global_counter table
ALTER PUBLICATION supabase_realtime ADD TABLE global_counter;
