'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type ProfileData = {
  full_name: string
  startup_name: string
  email: string
}

export default function SavedProfileCard() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('runway_profile')
    if (saved) {
      try {
        setProfile(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse local profile', e)
      }
    }
  }, [])

  if (!mounted) return <div className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">Saved Profile</h2>
        <Link
          href="/form?edit=profile"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Edit Details
        </Link>
      </div>
      
      {profile ? (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 text-gray-500">Name:</div>
          <div className="col-span-2 font-medium">{profile.full_name}</div>
          
          <div className="grid grid-cols-3 text-gray-500">Startup:</div>
          <div className="col-span-2 font-medium">{profile.startup_name}</div>
          
          <div className="grid grid-cols-3 text-gray-500">Email:</div>
          <div className="col-span-2 font-medium">{profile.email}</div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No profile saved yet. It will be saved on your device when you fill out your first form.</p>
      )}
    </div>
  )
}
