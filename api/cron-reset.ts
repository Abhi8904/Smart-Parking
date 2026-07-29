import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using your environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Optional: Security check to make sure it's actually Vercel calling it
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Find all bookings that are confirmed but have expired
    const now = new Date().toISOString();
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('slot_id')
      .eq('status', 'confirmed')
      .lt('end_time', now);

    if (fetchError) throw fetchError;

    if (!expiredBookings || expiredBookings.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No expired slots found.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Extract unique slot IDs that need to be freed up
    const slotIdsToFree = [...new Set(expiredBookings.map((b: any) => b.slot_id))];

    // 3. Update those specific parking slots to available = true
    const { error: updateError } = await supabase
      .from('parking_slots')
      .update({ is_available: true })
      .in('id', slotIdsToFree);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully released ${slotIdsToFree.length} expired slots.` 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}