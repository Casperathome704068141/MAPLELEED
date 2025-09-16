'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  LifeBuoy,
  Search,
  Loader2,
  GraduationCap
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
} from '@/components/ui/dialog';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFormState, useFormStatus } from 'react-dom';
import { handleFindStudyOptions } from '@/app/actions';
import type { FindStudyOptionsOutput } from '@/ai/flows/find-study-options';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
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


function StudyHero() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Find Your Perfect Course</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          Use our AI-powered search to discover universities and programs that match your ambitions. Then, book a free consultation to create a winning application strategy.
        </p>
         <Button size="lg" className="mt-8" asChild>
          <a href="#course-finder">Find a Course</a>
        </Button>
      </div>
    </section>
  );
}

function SearchSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Search className="mr-2 h-4 w-4" />
      )}
      Find Options
    </Button>
  );
}

function CourseFinderSection() {
    const [state, formAction] = useFormState(handleFindStudyOptions, initialStudyState);

    return (
        <section id="course-finder" className="py-20 lg:py-28">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">AI Course Finder</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Describe what you're looking for, and our AI will do the hard work.
                    </p>
                </div>
                <Card className="max-w-3xl mx-auto shadow-lg">
                    <CardContent className="p-6">
                        <form action={formAction} className="flex flex-col md:flex-row items-center gap-4">
                            <Input 
                                name="query"
                                id="query"
                                placeholder='Try "Masters in Data Science in the USA"' 
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

                {useFormStatus().pending && (
                     <div className="mt-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Our AI is searching for the best options for you...</p>
                    </div>
                )}
                
                {state.message === 'success' && state.data && (
                    <StudyResults results={state.data} />
                )}

                {state.message && state.message !== 'success' && (
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
                <Card key={uniIndex} className="overflow-hidden">
                    <CardHeader className="bg-secondary/50">
                        <CardTitle className="font-headline">{uni.name}</CardTitle>
                        <CardDescription>{uni.city}, {uni.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Accordion type="single" collapsible className="w-full">
                            {uni.courses.map((course, courseIndex) => (
                                <AccordionItem value={`course-${courseIndex}`} key={courseIndex} className={courseIndex === uni.courses.length - 1 ? 'border-b-0' : ''}>
                                    <AccordionTrigger className="px-6 py-4 text-base font-semibold hover:bg-muted/50">
                                       <div className="flex flex-col md:flex-row items-start md:items-center text-left gap-2">
                                         <span className="font-headline">{course.name}</span>
                                         <span className="text-sm font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{course.level}</span>
                                       </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 pt-0">
                                        <p className="text-muted-foreground">{course.description}</p>
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

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsModalOpen(true);
  };
  
  const handleBookingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsModalOpen(false);
    toast({
      title: "Consultation Booked!",
      description: `Your appointment is confirmed for ${date?.toLocaleDateString()} at ${selectedTime}. A confirmation email has been sent.`,
      variant: 'default'
    });
    setSelectedTime(null);
  };

  return (
    <section id="appointments" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Book Your Free Consultation</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Discuss your study options with an expert. Select a date and time that works for you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <Card className="shadow-lg">
            <CardContent className="p-4 md:p-6 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
              />
            </CardContent>
          </Card>
          <div className="space-y-4">
             <h3 className="font-headline font-semibold text-xl text-center md:text-left">
                Available Slots for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
            </h3>
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
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You're booking a consultation for {date?.toLocaleDateString()} at {selectedTime}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" required className="col-span-3" placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" required className="col-span-3" placeholder="jane.doe@example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function FaqSection() {
  const faqs = [
      {
        question: "Is the initial consultation really free?",
        answer: "Yes, absolutely. The first 30-minute consultation is completely free of charge. It's designed to help us understand your needs and for you to understand how we can help. There's no obligation to proceed further."
      },
      {
        question: "How does the AI Course Finder work?",
        answer: "Our AI tool uses a large language model trained on vast amounts of educational data. You provide a natural language query (like 'business analytics masters in Canada'), and it searches for matching universities and programs, presenting them in a structured format for you to explore."
      },
      {
        question: "What happens after the consultation?",
        answer: "You'll receive an email with an AI-generated summary of your discussion and a tailored document checklist. This gives you a clear and immediate action plan. You can then decide if you'd like to engage our full visa support services."
      },
      {
        question: "Do you guarantee visa approval?",
        answer: "No reputable consultant can guarantee visa approval, as the final decision rests with the government of the respective country. However, we guarantee that your application will be prepared with the utmost professionalism and accuracy to maximize your chances of success."
      },
      {
        question: "What countries do you specialize in?",
        answer: "Our team has extensive experience with student visa applications for the United States, United Kingdom, Canada, Australia, and many Schengen Area countries. Our AI tool can search for options globally, and we can advise on your specific destination during the consultation."
      }
  ]

  return (
    <section id="faq" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="font-semibold text-left text-lg">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    </section>
  )
}


export default function StudyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <StudyHero />
        <CourseFinderSection />
        <AppointmentSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
