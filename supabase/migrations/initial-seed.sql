/*
  # Visitor Check-in System Database Schema

  1. New Tables
    - `visitors`
      - `id` (uuid, primary key)
      - `name` (text, required) - Visitor's full name
      - `company` (text, optional) - Company/organization name
      - `phone` (text, optional) - Contact phone number
      - `email` (text, optional) - Contact email
      - `purpose` (text, optional) - Purpose of visit
      - `host_name` (text, optional) - Name of person being visited
      - `checked_in_at` (timestamp) - Check-in time
      - `checked_out_at` (timestamp, nullable) - Check-out time
      - `status` (text) - Current status: 'checked_in' or 'checked_out'
      - `created_at` (timestamp) - Record creation time
      - `updated_at` (timestamp) - Last update time

  2. Security
    - Enable RLS on `visitors` table
    - Add policies for public read/write access (suitable for reception desk)
    
  3. Indexes
    - Index on status for quick filtering
    - Index on checked_in_at for chronological sorting
    - Index on name for search functionality
*/

CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  phone text,
  email text,
  purpose text,
  host_name text,
  checked_in_at timestamptz DEFAULT now(),
  checked_out_at timestamptz,
  status text DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (suitable for reception desk usage)
CREATE POLICY "Allow public read access to visitors"
  ON visitors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access to visitors"
  ON visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to visitors"
  ON visitors
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_checked_in_at ON visitors(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_name ON visitors(name);
CREATE INDEX IF NOT EXISTS idx_visitors_company ON visitors(company);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitors_updated_at 
  BEFORE UPDATE ON visitors 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_updated_at_column();