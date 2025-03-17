// filepath: c:\Users\joe\Documents\submit-form\submission-form\src\supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxbfiwftjwfpsrdjxwfq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4YmZpd2Z0andmcHNyZGp4d2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjY4MTMsImV4cCI6MjA1NzIwMjgxM30.Vg69HlP2myU0716i0nB7Mmd6_dxLRecLxixpSj7HWls';

export const supabase = createClient(supabaseUrl, supabaseKey);