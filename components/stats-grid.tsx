import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Award } from "lucide-react"

interface StatsGridProps {
  stats: {
    totalVolunteers: number
    coming: number
    notComing: number
    registered: number
    sevadalTrained: number
    pastService: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-sai-orange/5 border-sai-orange/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sai-orange">Total Volunteers</CardTitle>
          <Users className="h-4 w-4 text-sai-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sai-orange">{stats.totalVolunteers}</div>
        </CardContent>
      </Card>

      <Card className="bg-sai-green/5 border-sai-green/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sai-green">Active Volunteers</CardTitle>
          <UserCheck className="h-4 w-4 text-sai-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sai-green">{stats.coming}</div>
        </CardContent>
      </Card>

      <Card className="bg-sai-blue/5 border-sai-blue/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sai-blue">Registered Volunteers</CardTitle>
          <UserPlus className="h-4 w-4 text-sai-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sai-blue">{stats.registered}</div>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-500">Cancelled Volunteers</CardTitle>
          <UserX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{stats.notComing}</div>
        </CardContent>
      </Card>

      <Card className="bg-sai-orange/5 border-sai-orange/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sai-orange">Sevadal Trained</CardTitle>
          <Award className="h-4 w-4 text-sai-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sai-orange">{stats.sevadalTrained}</div>
        </CardContent>
      </Card>

      <Card className="bg-sai-blue/5 border-sai-blue/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-sai-blue">Past Prashanti Service</CardTitle>
          <TrendingUp className="h-4 w-4 text-sai-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sai-blue">{stats.pastService}</div>
        </CardContent>
      </Card>
    </div>
  )
} 