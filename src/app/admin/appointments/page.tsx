import { updateAppointmentStatus } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAppointments } from "@/lib/repositories/appointment-repository";
import { MoreHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Upcoming: "default",
  Completed: "secondary",
  Cancelled: "destructive",
  Pending: "outline",
};

type AppointmentsPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const appointments = await listAppointments();
  const successMessage = searchParams?.success;
  const errorMessage = searchParams?.error;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Appointments</h1>
      {(successMessage || errorMessage) && (
        <Alert variant={errorMessage ? "destructive" : "default"}>
          <AlertTitle>{errorMessage ? "Update failed" : "Status updated"}</AlertTitle>
          <AlertDescription>{successMessage ?? errorMessage}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Manage Consultations</CardTitle>
          <CardDescription>View, manage, and generate summaries for all student appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No consultations have been booked yet. Once students schedule time with you, they will appear here automatically.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => {
                  const scheduled = new Date(appointment.scheduledFor);
                  const formattedDate = scheduled.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = appointment.timeSlotLabel || scheduled.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.studentName}</TableCell>
                      <TableCell className="hidden md:table-cell">{appointment.email}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{formattedTime}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[appointment.status] || 'default'}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <form action={updateAppointmentStatus} method="post">
                              <input type="hidden" name="appointmentId" value={appointment.id} />
                              <input type="hidden" name="status" value="Completed" />
                              <DropdownMenuItem asChild disabled={appointment.status === 'Completed'}>
                                <button type="submit" className="w-full justify-start" disabled={appointment.status === 'Completed'}>
                                  Mark as Completed
                                </button>
                              </DropdownMenuItem>
                            </form>
                            <form action={updateAppointmentStatus} method="post">
                              <input type="hidden" name="appointmentId" value={appointment.id} />
                              <input type="hidden" name="status" value="Cancelled" />
                              <DropdownMenuItem asChild disabled={appointment.status === 'Cancelled'}>
                                <button type="submit" className="w-full justify-start" disabled={appointment.status === 'Cancelled'}>
                                  Mark as Cancelled
                                </button>
                              </DropdownMenuItem>
                            </form>
                            <form action={updateAppointmentStatus} method="post">
                              <input type="hidden" name="appointmentId" value={appointment.id} />
                              <input type="hidden" name="status" value="Upcoming" />
                              <DropdownMenuItem asChild disabled={appointment.status === 'Upcoming'}>
                                <button type="submit" className="w-full justify-start" disabled={appointment.status === 'Upcoming'}>
                                  Mark as Upcoming
                                </button>
                              </DropdownMenuItem>
                            </form>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Generate Summary</DropdownMenuItem>
                            <DropdownMenuItem>Generate Checklist</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
