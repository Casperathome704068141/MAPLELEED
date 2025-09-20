import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listAppointments } from "@/lib/repositories/appointment-repository";

export const dynamic = "force-dynamic";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Upcoming: "default",
  Completed: "secondary",
  Cancelled: "destructive",
  Pending: "outline",
};

export default async function AppointmentsPage() {
  const appointments = await listAppointments();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Appointments</h1>
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
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
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
