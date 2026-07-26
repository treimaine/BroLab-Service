import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { GrowthPipelineClient } from './GrowthPipelineClient'

export default async function GrowthPipelinePage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const operatorEmail = (
    process.env.GROWTH_OPS_EMAIL ||
    process.env.BRAND_EMAIL ||
    ''
  ).toLowerCase()
  const primaryEmail = user.emailAddresses
    .find((email) => email.id === user.primaryEmailAddressId)
    ?.emailAddress.toLowerCase()
  const isAdmin = user.publicMetadata?.role === 'admin'

  if (!isAdmin && (!operatorEmail || primaryEmail !== operatorEmail)) {
    redirect('/studio')
  }

  return <GrowthPipelineClient />
}
