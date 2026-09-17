import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MultiStepForm from '@/components/MultiStepForm'

export default async function FormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const awaitedSearchParams = await searchParams
  const isEditProfile = awaitedSearchParams?.edit === 'profile'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <MultiStepForm 
          userId={user.id} 
          forceEditProfile={isEditProfile} 
        />
      </div>
    </div>
  )
}
