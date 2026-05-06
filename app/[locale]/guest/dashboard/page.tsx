import { createServerSupabaseClient } from '@/lib/db/supabase';
import { redirect } from 'next/navigation';

export default async function GuestDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">View your booking history and saved properties</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Booking History</h3>
            <p className="text-gray-500 text-sm">You haven't made any bookings yet.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Saved Properties</h3>
            <p className="text-gray-500 text-sm">No saved properties yet.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
          <p className="text-sm text-gray-600 mt-2">Member since: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
