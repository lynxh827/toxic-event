import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { EventCard } from "@/components/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

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

interface UserDashboardProps {
  user: User | null;
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      // Fetch registered events
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);

      const registeredIds = registrations?.map(r => r.event_id) || [];

      // Fetch all events
      const { data: allEvents } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (allEvents) {
        setRegisteredEvents(allEvents.filter(e => registeredIds.includes(e.id)));
        setAvailableEvents(allEvents.filter(e => !registeredIds.includes(e.id)));
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your event registrations and discover new events
        </p>
      </div>

      <Tabs defaultValue="registered" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="registered">My Events</TabsTrigger>
          <TabsTrigger value="available">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="mt-6">
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} isRegistered />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't registered for any events yet.</p>
              <p className="mt-2">Check out the Discover tab to find exciting events!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No events available at the moment.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
