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

const appointments = [
  {
    id: "APP001",
    studentName: "John Doe",
    email: "john.doe@example.com",
    date: "2024-08-15",
    time: "10:00 AM",
    status: "Upcoming",
  },
  {
    id: "APP002",
    studentName: "Jane Smith",
    email: "jane.smith@example.com",
    date: "2024-08-14",
    time: "02:00 PM",
    status: "Completed",
  },
  {
    id: "APP003",
    studentName: "Sam Wilson",
    email: "sam.w@example.com",
    date: "2024-08-16",
    time: "11:00 AM",
    status: "Upcoming",
  },
  {
    id: "APP004",
    studentName: "Emily Brown",
    email: "emily.b@example.com",
    date: "2024-08-12",
    time: "03:00 PM",
    status: "Cancelled",
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Upcoming': 'default',
    'Completed': 'secondary',
    'Cancelled': 'destructive',
}

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Appointments</h1>
       <Card>
        <CardHeader>
          <CardTitle>Manage Consultations</CardTitle>
          <CardDescription>View, manage, and generate summaries for all student appointments.</CardDescription>
        </CardHeader>
        <CardContent>
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
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.studentName}</TableCell>
                    <TableCell className="hidden md:table-cell">{appointment.email}</TableCell>
                    <TableCell>{appointment.date}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
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
                ))}
              </TableBody>
            </Table>
        </CardContent>
       </Card>
    </div>
  );
}
