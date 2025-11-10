import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_image: string | null;
  start_date: string;
  end_date: string;
  location: string;
  max_attendees: number | null;
  organiser_id: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);

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
    const fetchEvent = async () => {
      if (!id) return;

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventData) {
        setEvent(eventData);

        // Check registration count
        const { count } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', id);

        setRegistrationCount(count || 0);

        // Check if current user is registered
        if (user) {
          const { data: registration } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();

          setIsRegistered(!!registration);
        }
      }

      setLoading(false);
    };

    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to register for events."
      });
      navigate("/auth");
      return;
    }

    setRegistering(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: id!,
          user_id: user.id
        });

      if (error) throw error;

      setIsRegistered(true);
      setRegistrationCount(prev => prev + 1);
      toast({
        title: "Successfully registered!",
        description: "You're all set for this event."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;

    setRegistering(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', id!)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsRegistered(false);
      setRegistrationCount(prev => prev - 1);
      toast({
        title: "Unregistered",
        description: "You've been unregistered from this event."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to unregister",
        description: error.message
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} session={session} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} session={session} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </div>
    );
  }

  const isFull = event.max_attendees ? registrationCount >= event.max_attendees : false;
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} session={session} />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {event.event_image && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={event.event_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  {isRegistered && <Badge variant="secondary">Registered</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-muted-foreground">
                        {format(startDate, "PPP 'at' p")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        to {format(endDate, "PPP 'at' p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  {event.max_attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <p className="text-muted-foreground">
                          {registrationCount} / {event.max_attendees} registered
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {event.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About this event</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-4">
                {user && user.id !== event.organiser_id && (
                  <>
                    {isRegistered ? (
                      <Button
                        onClick={handleUnregister}
                        disabled={registering}
                        variant="outline"
                        className="w-full"
                      >
                        {registering ? "Processing..." : "Unregister"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        disabled={registering || isFull}
                        variant="hero"
                        className="w-full"
                      >
                        {registering
                          ? "Processing..."
                          : isFull
                          ? "Event Full"
                          : "Register for Event"}
                      </Button>
                    )}
                  </>
                )}

                {!user && (
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="hero"
                    className="w-full"
                  >
                    Sign In to Register
                  </Button>
                )}

                {user && user.id === event.organiser_id && (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    You're the organiser
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
