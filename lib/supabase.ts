import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpuenwdehmwchimqnhuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdWVud2RlaG13Y2hpbXFuaHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDUxMDUsImV4cCI6MjA4MDYyMTEwNX0.MLQmLalfOITW1gA9ofNSgaXSvRRTcfQeLozl6vAHgKg';

export const supabase = createClient(supabaseUrl, supabaseKey);
