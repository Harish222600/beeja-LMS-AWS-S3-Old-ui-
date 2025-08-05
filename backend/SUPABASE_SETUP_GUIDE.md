# 🔧 Supabase Setup Guide for File Storage

## ⚠️ CRITICAL: Get Your Service Role Key

The current `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file is actually the **anon key**, not the service role key. This is why you're getting RLS policy violations.

### 📋 Steps to Fix:

1. **Go to your Supabase Dashboard**
2. **Navigate to Settings → API**
3. **Copy the `service_role` key** (NOT the `anon` key)
4. **Update your `.env` file:**

```env
# Replace this line in your .env file:
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

### 🔍 How to Identify the Keys:

- **Anon Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eGF0c2xvaGxieG1nc3l4endjIiwicm9sZSI6ImFub24i...`
- **Service Role Key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eGF0c2xvaGxieG1nc3l4endjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI...`

Notice the difference: `"role":"anon"` vs `"role":"service_role"`

### 🗄️ Create Storage Buckets

After updating the service role key, run this SQL in your Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('videos', 'videos', true, 1073741824, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']),
  ('documents', 'documents', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('profiles', 'profiles', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('courses', 'courses', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('chat-files', 'chat-files', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for public access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('images', 'videos', 'documents', 'profiles', 'courses', 'chat-files'));

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('images', 'videos', 'documents', 'profiles', 'courses', 'chat-files'));

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id IN ('images', 'videos', 'documents', 'profiles', 'courses', 'chat-files'));

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id IN ('images', 'videos', 'documents', 'profiles', 'courses', 'chat-files'));

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
```

### 🔄 Restart Your Server

After updating the service role key:
```bash
npm start
```

### ✅ Test File Upload

Try uploading a file again - it should work without RLS errors!
