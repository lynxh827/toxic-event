import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface OrganiserDashboardProps {
  user: User | null;
}

const OrganiserDashboard = ({ user }: OrganiserDashboardProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0 });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organiser_id', user.id)
        .order('start_date', { ascending: true });

      if (eventsData) {
        setEvents(eventsData);
        
        // Fetch total registrations
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventsData.map(e => e.id));

        setStats({
          totalEvents: eventsData.length,
          totalRegistrations: count || 0
        });
      }

      setLoading(false);
    };

    fetchEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organiser Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your events and track attendee registrations
          </p>
        </div>
        <Link to="/create-event">
          <Button variant="hero" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRegistrations}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Events</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
            <Link to="/create-event">
              <Button variant="hero">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganiserDashboard;
