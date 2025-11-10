import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_image: string | null;
  start_date: string;
  end_date: string;
  location: string;
  max_attendees: number | null;
}

interface EventCardProps {
  event: Event;
  registrationCount?: number;
  isRegistered?: boolean;
}

export const EventCard = ({ event, registrationCount = 0, isRegistered = false }: EventCardProps) => {
  const startDate = new Date(event.start_date);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-video overflow-hidden bg-muted">
        {event.event_image ? (
          <img
            src={event.event_image}
            alt={event.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
          {isRegistered && <Badge variant="secondary">Registered</Badge>}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description || "No description available"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          {format(startDate, "PPP")}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          {event.location}
        </div>
        {event.max_attendees && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary" />
            {registrationCount} / {event.max_attendees} attendees
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to={`/event/${event.id}`} className="w-full">
          <Button className="w-full" variant="default">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
