import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: users, error: errUsers } = await supabase.from('users').select('id').limit(1);
  const { data: rooms, error: errRooms } = await supabase.from('rooms').select('id').limit(1);
  const { data: bookings, error: errBookings } = await supabase.from('bookings').select('id').limit(1);
  const { data: gallery, error: errGallery } = await supabase.from('gallery').select('id').limit(1);
  
  console.log('users:', errUsers ? errUsers.message : 'exists');
  console.log('rooms:', errRooms ? errRooms.message : 'exists');
  console.log('bookings:', errBookings ? errBookings.message : 'exists');
  console.log('gallery:', errGallery ? errGallery.message : 'exists');
}
check();
