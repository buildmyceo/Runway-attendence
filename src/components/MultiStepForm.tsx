'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type ProfileData = {
  full_name: string
  startup_name: string
  incubation_status: string
  mobile_number: string
  email: string
}

type SpaceUsageData = {
  purpose: string[]
  seat_number: string
  duration: string
  team_members: string
  feedback: string
}

export default function MultiStepForm({
  userId,
  forceEditProfile,
}: {
  userId: string
  forceEditProfile: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    startup_name: '',
    incubation_status: 'Incubated',
    mobile_number: '',
    email: '',
  })

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('runway_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProfile(parsed)
        if (!forceEditProfile && step === 1) {
          setStep(2)
        }
      } catch (e) {
        console.error('Failed to parse profile from local storage', e)
      }
    }
  }, [forceEditProfile, step])

  const [spaceUsage, setSpaceUsage] = useState<SpaceUsageData>({
    purpose: [],
    seat_number: '',
    duration: '',
    team_members: '01',
    feedback: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // (Skipping original skip logic since we handle it in the load effect)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSpaceUsageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setSpaceUsage({ ...spaceUsage, [e.target.name]: e.target.value })
  }

  const handlePurposeToggle = (purposeText: string) => {
    setSpaceUsage((prev) => {
      if (prev.purpose.includes(purposeText)) {
        return { ...prev, purpose: prev.purpose.filter((p) => p !== purposeText) }
      } else {
        if (prev.purpose.length >= 4) return prev // max 4
        return { ...prev, purpose: [...prev.purpose, purposeText] }
      }
    })
  }

  const saveProfileAndNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      localStorage.setItem('runway_profile', JSON.stringify(profile))
      setStep(2)
    } catch (err: any) {
      setError('Failed to save profile locally: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    setError(null)
    const supabase = createClient()
    
    const today = new Date().toISOString().split('T')[0]

    // check if already submitted today to upsert
    const { data: existing } = await supabase
      .from('daily_submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('submission_date', today)
      .single()

    const submissionData = {
      user_id: userId,
      submission_date: today,
      ...spaceUsage,
      status: 'Submitted'
    }

    let err;
    if (existing) {
      const { error } = await supabase
        .from('daily_submissions')
        .update(submissionData)
        .eq('id', existing.id)
      err = error
    } else {
      const { error } = await supabase
        .from('daily_submissions')
        .insert(submissionData)
      err = error
    }

    setIsSubmitting(false)
    if (err) {
      setError('Failed to submit form: ' + err.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
          Step {step} of 4
        </h2>
        <div className="mt-2 h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={saveProfileAndNext}>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">User & Startup Details</h1>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required
                name="full_name"
                value={profile.full_name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name *</label>
              <input
                required
                name="startup_name"
                value={profile.startup_name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incubation Status *</label>
              <select
                required
                name="incubation_status"
                value={profile.incubation_status}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="Incubated">Incubated</option>
                <option value="Pre-incubated">Pre-incubated</option>
                <option value="External / Visitor">External / Visitor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
              <input
                required
                type="tel"
                name="mobile_number"
                value={profile.mobile_number}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                required
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save My Details & Next'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3) }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Space Usage Details</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose * (Max 4)
              </label>
              <div className="space-y-2">
                {['Regular Work', 'Team Meeting', 'Mentor Session', 'Client Meeting', 'Event / Workshop', 'Other'].map((p) => (
                  <label key={p} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={spaceUsage.purpose.includes(p)}
                      onChange={() => handlePurposeToggle(p)}
                      disabled={!spaceUsage.purpose.includes(p) && spaceUsage.purpose.length >= 4}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Number Used *</label>
              <select
                required
                name="seat_number"
                value={spaceUsage.seat_number}
                onChange={handleSpaceUsageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="" disabled>Select your answer</option>
                {Array.from({length: 16}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num.toString()}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Duration of Co-working Space Usage (in Hours) *
              </label>
              <select
                required
                name="duration"
                value={spaceUsage.duration}
                onChange={handleSpaceUsageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="" disabled>Select your answer</option>
                {['0 - 2 Hours', '2 - 4 Hours', '4 - 6 Hours', '6 - 8 Hours', '8 - 10 Hours', '10 - 12 Hours'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of team members using space today *
              </label>
              <select
                required
                name="team_members"
                value={spaceUsage.team_members}
                onChange={handleSpaceUsageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="01">01</option>
                <option value="02">02</option>
                <option value="03">03</option>
                <option value="04">04</option>
                <option value="05+">05+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any issues or feedback regarding the space?
              </label>
              <textarea
                name="feedback"
                value={spaceUsage.feedback}
                onChange={handleSpaceUsageChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter your answer"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={spaceUsage.purpose.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Rules and Regulations</h1>
          <div className="space-y-6 text-gray-700 text-sm">
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Hot Seat Policy</h3>
              <p>Desks are available on a first-come, first-served basis. Please clear your desk at the end of each day.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Conduct and Behavior</h3>
              <p>Maintain a professional environment. Keep noise levels to a minimum in open working areas.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">After-Hours Usage</h3>
              <p>Access outside regular working hours requires prior approval from the management team.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Meeting Room Bookings</h3>
              <p>Meeting rooms must be booked in advance. Do not occupy rooms without a valid reservation.</p>
            </section>
          </div>
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Rules and Regulations (Continued)</h1>
          <div className="space-y-6 text-gray-700 text-sm">
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Visitor Policy</h3>
              <p>All visitors must be registered at the front desk and accompanied by a member at all times.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Data and Confidentiality</h3>
              <p>Respect the privacy and intellectual property of other teams in the space.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Feedback Mechanism</h3>
              <p>Use the provided channels to report maintenance or operational issues.</p>
            </section>
            <section>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Feedback & Audits</h3>
              <p>Periodic audits will be conducted to ensure compliance with space rules.</p>
            </section>
          </div>
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
