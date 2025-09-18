

'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Search,
  Loader2,
  GraduationCap,
  Sparkles,
  Award,
  Star,
  ArrowRight,
  Info,
  PlusCircle,
  CreditCard,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleFindStudyOptions, bookConsultation } from '@/app/actions';
import type { BookingFormState } from '@/app/actions';
import type { FindStudyOptionsOutput } from '@/ai/flows/find-study-options';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

type TierDefinition = {
  id: 'standard' | 'premium' | 'ultimate';
  name: string;
  amount: number;
  currency: string;
  priceDisplay: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  highlight?: boolean;
  fullDescription: string;
  limitations: string;
};

type AddOnDefinition = {
  id: string;
  name: string;
  amount: number;
  priceDisplay: string;
};

const studyTiers: TierDefinition[] = [
  {
    id: 'standard',
    name: 'Standard',
    amount: 14500,
    currency: 'CAD',
    priceDisplay: '$145',
    description: 'Entry-level support for a confident start.',
    icon: <Sparkles className="size-6" />, 
    features: [
      'Full 1-hour expert consultation',
      'Guidance on required documents & timelines',
      'Appointment booking with visa experts',
      'Receipt generation for records',
    ],
    cta: 'Get Started',
    fullDescription:
      "The Standard Tier is designed for students who need expert guidance to kickstart their Canadian study permit application. You get a full hour with a visa expert to ask questions, understand the process, and receive a clear roadmap. We'll help you book the appointment and provide a receipt for your records.",
    limitations:
      'This plan does not include application form filling, SOP/LOE writing, or direct communication with IRCC on your behalf.',
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: 35000,
    currency: 'CAD',
    priceDisplay: '$350',
    description: 'The most popular choice for comprehensive support.',
    icon: <Award className="size-6" />, 
    features: [
      'Everything in Standard',
      'SOP or Letter of Explanation (LOE) writing support',
      'College application support (up to 3 programs)',
      'Tracking of IRCC application status',
      'Priority WhatsApp/email support',
    ],
    cta: 'Choose Premium',
    highlight: true,
    fullDescription:
      'Our most popular package, the Premium Tier, offers comprehensive support throughout your application journey. In addition to the expert consultation, we assist with the critical components of your application, including your Statement of Purpose and college applications. We\'ll also track your IRCC status and provide priority support until you receive a decision.',
    limitations:
      'This plan covers support for up to 3 college program applications. It does not include the final submission of the study permit application to IRCC or post-arrival services.',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    amount: 85000,
    currency: 'CAD',
    priceDisplay: '$850',
    description: 'The zero-stress, all-inclusive package.',
    icon: <Star className="size-6" />, 
    features: [
      'Everything in Premium',
      'End-to-end study permit application filing',
      'Biometrics & interview booking assistance',
      'Flight ticket & accommodation booking',
      'Airport pickup arrangement',
      'SIM card & banking setup',
    ],
    cta: 'Go Ultimate',
    fullDescription:
      "The Ultimate Tier is our 'white glove' service for students who want a completely stress-free experience. We handle everything from start to finish: filing your study permit application, booking necessary appointments, arranging your travel and accommodation, and even helping you get settled in Canada with airport pickup and essential setups. This is the all-inclusive package for total peace of mind.",
    limitations:
      'The cost of flights, accommodation, and third-party services (e.g., biometrics fees, tuition) are not included in the package price. Service fees for booking are covered.',
  },
];

const studyAddOns: AddOnDefinition[] = [
  {id: 'sop', name: 'SOP/LOE Writing', amount: 7900, priceDisplay: '$79'},
  {id: 'college_application', name: 'College Application (per program)', amount: 4900, priceDisplay: '$49'},
  {id: 'flight_booking', name: 'Flight Booking Service Fee', amount: 2900, priceDisplay: '$29'},
  {id: 'accommodation_booking', name: 'Accommodation Booking Service Fee', amount: 4900, priceDisplay: '$49'},
  {id: 'airport_pickup', name: 'Airport Pickup', amount: 9900, priceDisplay: '$99'},
  {id: 'insurance_setup', name: 'Insurance Setup Assistance', amount: 2900, priceDisplay: '$29'},
];

const initialStudyState: {
  message: string;
  data: FindStudyOptionsOutput | null;
  errors: any;
} = {
  message: '',
  errors: null,
  data: null,
};

const bookingInitialState: BookingFormState = {
  status: 'idle',
};


function StudyHero() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Your Canadian Study Permit, Sorted.</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          From college applications to your study permit and travel arrangements, we provide end-to-end support for your journey to Canada. Explore our services and book a consultation today.
        </p>
         <Button size="lg" className="mt-8" asChild>
          <a href="#pricing">See Pricing Plans</a>
        </Button>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Choose the right level of support for your journey to Canada. No hidden fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {studyTiers.map(tier => (
            <Dialog key={tier.id}>
              <Card
                className={`flex flex-col ${tier.highlight ? 'border-primary ring-2 ring-primary shadow-2xl' : 'shadow-lg'}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4 text-primary">{tier.icon}</div>
                  <CardTitle className="font-headline text-3xl">{tier.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{tier.description}</CardDescription>
                  <p className="text-4xl font-bold font-headline pt-4">{tier.priceDisplay}</p>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between pt-4">
                  <ul className="space-y-3 mb-8 text-left">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 mr-3 text-primary shrink-0 mt-1" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full mt-auto" variant={tier.highlight ? 'default' : 'outline'}>
                      <Info className="mr-2" /> Explore &amp; enrol
                    </Button>
                  </DialogTrigger>
                </CardContent>
              </Card>
              <DialogContent className="sm:max-w-xl grid-rows-[auto_1fr_auto] p-0 max-h-[90svh]">
                <TierDialogContent tier={tier} addOns={studyAddOns} />
              </DialogContent>
            </Dialog>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-headline font-bold text-center mb-8">Optional Add-Ons</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {studyAddOns.map(addOn => (
              <Card key={addOn.id} className="bg-secondary/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="size-5 text-primary" />
                    <span className="font-medium text-secondary-foreground">{addOn.name}</span>
                  </div>
                  <span className="font-semibold font-headline text-lg">{addOn.priceDisplay}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            You can add these services during checkout. Stripe will email you a detailed invoice immediately after
            payment is completed.
          </p>
        </div>
      </div>
    </section>
  );
}

function TierDialogContent({tier, addOns}: {tier: TierDefinition; addOns: AddOnDefinition[]}) {
  const {toast} = useToast();
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalCents = React.useMemo(
    () =>
      selectedAddons.reduce((total, addonId) => {
        const addon = addOns.find(item => item.id === addonId);
        return total + (addon?.amount ?? 0);
      }, tier.amount),
    [addOns, selectedAddons, tier.amount],
  );

  const formattedTotal = React.useMemo(() => {
    try {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: tier.currency,
        currencyDisplay: 'symbol',
      }).format(totalCents / 100);
    } catch (e) {
      return `${tier.currency} ${(totalCents / 100).toFixed(2)}`;
    }
  }, [totalCents, tier.currency]);

  function toggleAddon(addonId: string, checked: boolean) {
    setSelectedAddons(prev =>
      checked ? [...new Set([...prev, addonId])] : prev.filter(existing => existing !== addonId),
    );
  }

  async function startCheckout() {
    if (!customerEmail) {
      setError('Please enter the email address that should receive the invoice.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/study/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          planId: tier.id,
          addons: selectedAddons,
          customer: {name: customerName, email: customerEmail},
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (body && typeof body.error === 'string')
            ? body.error
            : 'Unable to start checkout. Please try again.';
        throw new Error(message);
      }

      if (body?.url) {
        window.location.href = body.url;
        return;
      }

      throw new Error('Stripe did not return a checkout URL.');
    } catch (err: any) {
      const message = err?.message ?? 'Unable to start checkout. Please try again.';
      setError(message);
      toast({
        title: 'Checkout failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader className="p-6 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-full w-fit text-primary">{tier.icon}</div>
          <DialogTitle className="font-headline text-2xl">{tier.name} Tier</DialogTitle>
        </div>
        <DialogDescription className="text-base">{tier.fullDescription}</DialogDescription>
      </DialogHeader>
      <ScrollArea className="overflow-y-auto">
        <div className="py-4 px-6 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What's Included:</h4>
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 mr-3 text-primary shrink-0 mt-1" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Limitations:</h4>
            <p className="text-sm text-muted-foreground italic">{tier.limitations}</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Add-ons</h4>
            {addOns.map(addOn => (
              <label
                key={addOn.id}
                htmlFor={`addon-${addOn.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 p-3 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`addon-${addOn.id}`}
                    checked={selectedAddons.includes(addOn.id)}
                    onCheckedChange={checked => toggleAddon(addOn.id, checked === true)}
                  />
                  <div>
                    <p className="font-medium leading-tight">{addOn.name}</p>
                    <p className="text-xs text-muted-foreground">{addOn.priceDisplay}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <Label htmlFor="student-name" className="text-sm mb-1">
                Student name (optional)
              </Label>
              <Input
                id="student-name"
                placeholder="Your full name"
                value={customerName}
                onChange={event => setCustomerName(event.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="student-email" className="text-sm mb-1">
                Email for receipt and invoice
              </Label>
              <Input
                id="student-email"
                type="email"
                placeholder="you@example.com"
                required
                value={customerEmail}
                onChange={event => setCustomerEmail(event.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="font-medium">Order summary</p>
            <p className="text-lg font-headline">{formattedTotal}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Stripe securely handles the payment and emails you a tax-compliant invoice instantly after checkout.
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Checkout error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>
      <DialogFooter className="p-6 flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button
          onClick={startCheckout}
          size="lg"
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing secure checkout...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" /> Pay with Stripe
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground sm:text-right">
          You can still speak with us first — booking a consultation remains available below.
        </p>
        <DialogClose asChild>
          <Button variant="ghost">Maybe later</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

function SearchSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="shrink-0">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Find Options
        </>
      )}
    </Button>
  );
}

function CourseFinderSection() {
    const [state, formAction] = useActionState(handleFindStudyOptions, initialStudyState);
    const { pending } = useFormStatus();

    return (
        <section id="course-finder" className="py-20 lg:py-28 bg-secondary/30">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">AI Course Finder (Canada)</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Describe what you're looking for, and our AI will find matching programs in Canadian institutions.
                    </p>
                </div>
                <Card className="max-w-3xl mx-auto shadow-lg">
                    <CardContent className="p-6">
                        <form action={formAction} className="flex flex-col sm:flex-row items-center gap-4">
                            <Input 
                                name="query"
                                id="query"
                                placeholder='Try "Diploma in Business in Toronto"' 
                                className="h-12 text-base flex-grow"
                                required 
                            />
                            <SearchSubmitButton />
                        </form>
                        {state.errors?.query && (
                            <p className="text-sm text-destructive mt-2">{state.errors.query[0]}</p>
                        )}
                    </CardContent>
                </Card>

                {pending && (
                     <div className="mt-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Our AI is searching for the best options for you...</p>
                    </div>
                )}
                
                {state.message === 'success' && state.data && (
                    <StudyResults results={state.data} />
                )}

                {state.message && state.message !== 'success' && !pending && (
                     <Alert variant="destructive" className="mt-12 max-w-3xl mx-auto">
                        <AlertTitle>Search Failed</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
            </div>
        </section>
    );
}

function StudyResults({ results }: { results: FindStudyOptionsOutput }) {
    if (!results.options || results.options.length === 0) {
        return (
            <Alert className="mt-12 max-w-3xl mx-auto">
                <GraduationCap className="h-4 w-4" />
                <AlertTitle>No Results Found</AlertTitle>
                <AlertDescription>
                    Our AI couldn't find any matching results for your query. Try being more specific or broader in your search.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="mt-12 max-w-5xl mx-auto space-y-8">
            <h3 className="text-2xl font-headline font-bold text-center">Your Suggested Study Options</h3>
            {results.options.map((uni, uniIndex) => (
                <Card key={uniIndex} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-secondary/50 border-b">
                        <CardTitle className="font-headline">{uni.name}</CardTitle>
                        <CardDescription>{uni.city}, {uni.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Accordion type="single" collapsible className="w-full">
                            {uni.courses.map((course, courseIndex) => (
                                <AccordionItem value={`course-${courseIndex}`} key={courseIndex} className={courseIndex === uni.courses.length - 1 ? 'border-b-0' : ''}>
                                    <AccordionTrigger className="px-6 py-4 text-base hover:bg-muted/50 transition-colors">
                                       <div className="flex flex-col md:flex-row items-start md:items-center text-left gap-x-4 gap-y-1">
                                         <span className="font-headline text-primary">{course.name}</span>
                                         <span className="text-sm font-medium text-secondary-foreground bg-secondary px-2 py-1 rounded-md">{course.level}</span>
                                       </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 pt-0">
                                        <p className="text-muted-foreground prose prose-sm">{course.description}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
             <div className="text-center pt-8">
                <p className="text-lg text-muted-foreground">Ready to take the next step?</p>
                <Button size="lg" className="mt-4" asChild>
                    <a href="#appointments">Book a Free Consultation</a>
                </Button>
            </div>
        </div>
    );
}


function AppointmentSection() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();
  const [bookingState, bookConsultationAction] = useActionState(bookConsultation, bookingInitialState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const lastResultRef = React.useRef<{
    status: BookingFormState['status'];
    appointmentId?: string;
    message?: string;
  }>({ status: bookingInitialState.status });

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    const lastHandled = lastResultRef.current;

    if (bookingState.status === 'success' && bookingState.appointment) {
      if (lastHandled.status === 'success' && lastHandled.appointmentId === bookingState.appointment.id) {
        return;
      }

      const appointmentDate = new Date(bookingState.appointment.scheduledFor);
      toast({
        title: 'Consultation Booked!',
        description: `Your appointment is confirmed for ${appointmentDate.toLocaleDateString()} at ${bookingState.appointment.timeSlotLabel}.`,
      });
      setIsModalOpen(false);
      setSelectedTime(null);
      formRef.current?.reset();

      lastResultRef.current = {
        status: 'success',
        appointmentId: bookingState.appointment.id,
      };
      return;
    }

    if (bookingState.status === 'error') {
      const shouldToast =
        bookingState.message && (!bookingState.errors || Object.keys(bookingState.errors).length === 0);

      if (
        shouldToast &&
        !(lastHandled.status === 'error' && lastHandled.message === bookingState.message)
      ) {
        toast({
          title: 'Booking not saved',
          description: bookingState.message,
          variant: 'destructive',
        });
      }

      lastResultRef.current = {
        status: 'error',
        message: shouldToast ? bookingState.message : undefined,
      };
      return;
    }

    lastResultRef.current = { status: bookingState.status };
  }, [bookingState, toast]);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const isSubmitDisabled = !date || !selectedTime;

  return (
    <section id="appointments" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Book Your Free Consultation</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Select a date and time to speak with one of our Canadian visa experts.
          </p>
        </div>
        <Card className="max-w-6xl mx-auto shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
                 <div className="p-6 border-b md:border-b-0 md:border-r">
                    <h3 className="font-headline font-semibold text-xl text-center md:text-left mb-4">
                        1. Select a Date
                    </h3>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md"
                            disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="font-headline font-semibold text-xl text-center md:text-left mb-4">
                        2. Select a Time Slot
                    </h3>
                    <p className="text-sm text-muted-foreground text-center md:text-left mb-4">
                        Available slots for {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {timeSlots.map((time) => (
                            <Button
                            key={time}
                            variant="outline"
                            onClick={() => handleTimeSelect(time)}
                            className="py-6 text-base"
                            >
                            <Clock className="mr-2 h-4 w-4" />
                            {time}
                            </Button>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left pt-4">All times are in your local timezone.</p>
                </div>
            </div>
        </Card>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You are booking a consultation for {date?.toLocaleDateString()} at {selectedTime}. Please provide your details below.
            </DialogDescription>
          </DialogHeader>
          <form ref={formRef} action={bookConsultationAction} className="space-y-4">
            <input type="hidden" name="date" value={formattedDate} readOnly aria-hidden="true" />
            <input type="hidden" name="time" value={selectedTime ?? ''} readOnly aria-hidden="true" />

            {bookingState.status === 'error' && bookingState.message && (
              <Alert variant="destructive">
                <AlertTitle>Booking not saved</AlertTitle>
                <AlertDescription>{bookingState.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  className="h-11"
                  aria-invalid={Boolean(bookingState.errors?.name)}
                />
                {bookingState.errors?.name && (
                  <p className="text-sm text-destructive">
                    {bookingState.errors.name.join(' ')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  className="h-11"
                  aria-invalid={Boolean(bookingState.errors?.email)}
                />
                {bookingState.errors?.email && (
                  <p className="text-sm text-destructive">
                    {bookingState.errors.email.join(' ')}
                  </p>
                )}
              </div>
            </div>
            {bookingState.errors?.date && (
              <p className="text-sm text-destructive" role="alert">
                {bookingState.errors.date.join(' ')}
              </p>
            )}
            {bookingState.errors?.time && (
              <p className="text-sm text-destructive" role="alert">
                {bookingState.errors.time.join(' ')}
              </p>
            )}
            <DialogFooter>
              <BookingSubmitButton disabled={isSubmitDisabled} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function BookingSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={disabled || pending}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Booking...
        </span>
      ) : (
        'Confirm Booking'
      )}
    </Button>
  );
}

function StudyPageContent() {
  const searchParams = useSearchParams();
  const {toast} = useToast();
  const paymentStatus = searchParams.get('payment');
  const planParam = searchParams.get('plan');

  React.useEffect(() => {
    if (!paymentStatus) return;

    const planName = studyTiers.find(tier => tier.id === planParam)?.name ?? 'selected';

    if (paymentStatus === 'success') {
      toast({
        title: 'Payment received',
        description: `Your ${planName} package is confirmed. We emailed your receipt and invoice moments ago.`,
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: 'Payment cancelled',
        description: 'No worries—your booking has not been charged. You can restart checkout whenever you are ready.',
      });
    }

    if (typeof window !== 'undefined') {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('payment');
      nextParams.delete('plan');
      const queryString = nextParams.toString();
      const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [paymentStatus, planParam, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <StudyHero />
        <PricingSection />
        <CourseFinderSection />
        <AppointmentSection />
      </main>
      <Footer />
    </div>
  );
}

export default function StudyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex flex-1 items-center justify-center px-6 py-24 text-sm text-muted-foreground">
            Loading study services…
          </main>
          <Footer />
        </div>
      }
    >
      <StudyPageContent />
    </React.Suspense>
  );
}
