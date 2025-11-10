import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Calendar, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import eventTech from "@/assets/event-tech.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventNetworking from "@/assets/event-networking.jpg";

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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true })
        .limit(6);

      if (data) {
        // Add demo images to events
        const eventsWithImages = data.map((event, index) => ({
          ...event,
          event_image: event.event_image || [eventTech, eventWorkshop, eventNetworking][index % 3]
        }));
        setEvents(eventsWithImages);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} session={session} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Event networking"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover & Create Amazing Events
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with communities, learn new skills, and create unforgettable experiences. 
              Whether you're attending or organizing, EventHub makes it seamless.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="hero" size="lg">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="hero" size="lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EventHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Easy Event Management</h3>
              <p className="text-muted-foreground">
                Create and manage events effortlessly with our intuitive interface
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Connect with Communities</h3>
              <p className="text-muted-foreground">
                Find events that match your interests and meet like-minded people
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Registration</h3>
              <p className="text-muted-foreground">
                Register for events with just a few clicks and get instant confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {events.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Events</h2>
              {user && (
                <Link to="/dashboard">
                  <Button variant="ghost">View All</Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees on EventHub today
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Create Your Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
