'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MultiStepForm from '@/components/MultiStepForm'

function FormContent() {
  const searchParams = useSearchParams()
  const isEditProfile = searchParams.get('edit') === 'profile'

  return (
    <div className="max-w-3xl mx-auto">
      <MultiStepForm forceEditProfile={isEditProfile} />
    </div>
  )
}

export default function FormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="max-w-3xl mx-auto p-8 text-center text-gray-500">Loading form...</div>}>
        <FormContent />
      </Suspense>
    </div>
  )
}
