'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SavedProfileCard from '@/components/SavedProfileCard'

type Submission = {
  id: string
  submission_date: string
  purpose: string[]
  seat_number: string
  duration: string
  team_members: string
  status: string
}

export default function DashboardPage() {
  const [history, setHistory] = useState<Submission[]>([])
  const [todaysSubmission, setTodaysSubmission] = useState<Submission | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('runway_submissions')
    if (saved) {
      try {
        const parsed: Submission[] = JSON.parse(saved)
        // sort history desc
        parsed.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime())
        setHistory(parsed.slice(0, 5))

        // find today's submission
        const todayStr = new Date().toISOString().split('T')[0]
        const todaySub = parsed.find(sub => sub.submission_date === todayStr)
        if (todaySub) {
          setTodaysSubmission(todaySub)
        }
      } catch (e) {
        console.error('Failed to parse local submissions', e)
      }
    }
  }, [])

  if (!mounted) return <div className="min-h-screen bg-gray-50 flex justify-center py-20"><div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div></div>

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Runway Attendance</h1>
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
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          >
            {todaysSubmission ? 'Update Today\'s Form' : 'Fill Today\'s Form'}
          </Link>
          
          <a
            href="https://forms.cloud.microsoft/pages/responsepage.aspx?id=zgSD_XlQy0uaVDJA7XQF2dYmtDFRSDRNowCPEBsVXAhUOUhGOUVZSE1GSTZDUUEzMkJJQUtROVNKRy4u&origin=QRCode&route=shorturl"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Auto-Fill Microsoft Form
          </a>
        </div>

        {/* Profile Card */}
        <SavedProfileCard />
      </div>

      {/* History */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-6">Submission History</h2>
        {history.length > 0 ? (
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
