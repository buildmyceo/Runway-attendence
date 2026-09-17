import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SavedProfileCard from '@/components/SavedProfileCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch today's submission
  const today = new Date().toISOString().split('T')[0]
  const { data: todaysSubmission } = await supabase
    .from('daily_submissions')
    .select('*')
    .eq('user_id', user.id)
    .eq('submission_date', today)
    .single()

  // Fetch history
  const { data: history } = await supabase
    .from('daily_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('submission_date', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Runway Attendance</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-6">Today's Status</h2>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${todaysSubmission ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-gray-700 font-medium">
              {todaysSubmission ? 'Submitted' : 'Not Submitted'}
            </span>
          </div>
          <Link
            href="/form"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {todaysSubmission ? 'Update Today\'s Form' : 'Fill Today\'s Form'}
          </Link>
        </div>

        {/* Profile Card */}
        <SavedProfileCard />
      </div>

      {/* History */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6">Submission History</h2>
        {history && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{sub.submission_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sub.seat_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sub.duration}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sub.team_members}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No submissions yet.</p>
        )}
      </div>
    </div>
  )
}
