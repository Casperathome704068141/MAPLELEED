'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  LifeBuoy,
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

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

function StudyHero() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Expert Visa Guidance</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
          Let our experts guide you through every step of the student visa process. Book a free consultation to get a clear, personalized action plan.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <a href="#appointments">Book a Free Consultation</a>
        </Button>
      </div>
    </section>
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
    <section id="appointments" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Book Your Consultation</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Select a date and time that works for you. Our experts are ready to help.
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

function StudyResourcesSection() {
    const features = [
    {
      icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
      title: 'AI Document Checklist',
      description: 'After your consultation, receive a personalized document checklist generated by our intelligent tool to ensure you miss nothing.',
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Consultation Summaries',
      description: 'Get a detailed summary of your discussion with the visa expert, including key advice and your agreed action plan.',
    },
    {
      icon: <LifeBuoy className="w-8 h-8 text-primary" />,
      title: 'End-to-End Support',
      description: 'From the first call to your arrival, our team is here to support you at every stage of the process.',
    },
  ];

  const faqs = [
      {
        question: "Is the initial consultation really free?",
        answer: "Yes, absolutely. The first 30-minute consultation is completely free of charge. It's designed to help us understand your needs and for you to understand how we can help. There's no obligation to proceed further."
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
        answer: "Our team has extensive experience with student visa applications for the United States, United Kingdom, Canada, Australia, and many Schengen Area countries. We can advise on your specific destination during the consultation."
      }
  ]

  return (
    <section id="resources" className="py-20 lg:py-28 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Resources & Support</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Everything you need for a smooth and successful application process.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                 <h3 className="text-2xl font-headline font-bold mb-6">What's Included</h3>
                <div className="space-y-8">
                {features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">{feature.icon}</div>
                        <div>
                            <h4 className="font-headline font-semibold text-lg">{feature.title}</h4>
                            <p className="text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-headline font-bold mb-6">Frequently Asked Questions</h3>
                 <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="font-semibold text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </div>
    </section>
  );
}


export default function StudyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <StudyHero />
        <AppointmentSection />
        <StudyResourcesSection />
      </main>
      <Footer />
    </div>
  );
}
