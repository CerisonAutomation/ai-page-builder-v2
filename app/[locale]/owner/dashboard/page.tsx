import { createServerSupabaseClient } from '@/lib/db/supabase';
import { getUserRole } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import Card from '@/components/ui/Card';

export default async function OwnerDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getUserRole(supabase, user.id);
  if (role !== 'owner' && role !== 'admin') redirect('/admin/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage your properties and bookings</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Properties</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500 mt-2">Active listings</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">48</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">$24.5k</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            <p className="text-gray-500 text-sm">No recent bookings to display.</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Property Performance</h3>
            <p className="text-gray-500 text-sm">Property analytics will appear here.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
