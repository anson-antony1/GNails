import { redirect } from 'next/navigation'
import { isOwner } from '@/lib/auth'
import { HomeClient } from './home-client'

export default async function Home() {
  // If user is authenticated as owner, redirect to dashboard
  const ownerAuthenticated = await isOwner()
  if (ownerAuthenticated) {
    redirect('/today')
  }

  return <HomeClient />
}
