// app/dashboard/page.tsx
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import DashboardContent from "@/components/dashboard/dashboard-content"

export default async function Dashboard() {
  const session = await getServerSession()
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  // TypeScript type assertion since we know the user exists
  const user = session.user as { id: string }
  
  return <DashboardContent userId={user.id} />
}