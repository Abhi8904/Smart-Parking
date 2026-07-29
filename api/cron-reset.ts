import { createClient } from '@supabase/supabase-js';

// Serverless environments use non-VITE variables for backend execution
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Security verification for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const now = new Date().toISOString();

    // 1. Fetch bookings that have passed their end time and haven't been cleared yet
    // (Adjust or remove the status filter depending on your schema)
    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, slot_id')
      .lt('end_time', now)
      .neq('status', 'expired'); // Prevents picking up already handled entries

    if (fetchError) throw fetchError;

    if (!expiredBookings || expiredBookings.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No expired slots found.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Map target IDs
    const slotIdsToFree = [...new Set(expiredBookings.map((b: any) => b.slot_id))];
    const bookingIdsToClear = expiredBookings.map((b: any) => b.id);

    // 3. Free up the parking slots
    const { error: slotUpdateError } = await supabase
      .from('parking_slots')
      .update({ is_available: true })
      .in('id', slotIdsToFree);

    if (slotUpdateError) throw slotUpdateError;

    // 4. Mark the bookings as expired so they cycle out of the next cron run
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({ status: 'expired' })
      .in('id', bookingIdsToClear);

    if (bookingUpdateError) throw bookingUpdateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully released ${slotIdsToFree.length} slots from ${bookingIdsToClear.length} bookings.` 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}