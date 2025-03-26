import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/badge"
import { Timeline } from "@/components/timeline"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Users } from "lucide-react"

interface ServiceHistoryCardProps {
  volunteer: {
    name: string
    serviceHistory: Array<{
      date: string
      title: string
      description: string
      location: string
      participants: number
      status: "completed" | "pending" | "cancelled"
    }>
  }
  className?: string
}

export function ServiceHistoryCard({ volunteer, className }: ServiceHistoryCardProps) {
  return (
    <Card className={cn("bg-sai-orange/5 border-sai-orange/20", className)}>
      <CardHeader>
        <CardTitle className="text-sai-orange">Service History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-sai-orange">{volunteer.name}</h3>
            <Badge variant="success">
              {volunteer.serviceHistory.filter(s => s.status === "completed").length} Services
            </Badge>
          </div>

          <Timeline
            items={volunteer.serviceHistory.map(service => ({
              date: service.date,
              title: service.title,
              description: (
                <div className="space-y-2">
                  <p>{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {service.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {service.participants} participants
                    </div>
                  </div>
                </div>
              ),
              status: service.status
            }))}
          />
        </div>
      </CardContent>
    </Card>
  )
} 