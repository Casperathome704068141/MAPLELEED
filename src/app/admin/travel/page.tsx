import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, BedDouble } from "lucide-react";

const bookings = [
  {
    id: "TRV001",
    customer: "John Doe",
    type: "Flight",
    details: "LHR -> JFK, One-way",
    commission: "$50.00",
  },
  {
    id: "TRV002",
    customer: "Jane Smith",
    type: "Accommodation",
    details: "Hilton Times Square, 5 nights",
    commission: "$75.50",
  },
  {
    id: "TRV003",
    customer: "John Doe",
    type: "Accommodation",
    details: "Student Housing, NYC",
    commission: "$25.00",
  },
  {
    id: "TRV004",
    customer: "Emily Brown",
    type: "Flight",
    details: "BOM -> SFO, Return",
    commission: "$120.00",
  },
];

export default function TravelBookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Travel Bookings</h1>
       <Card>
        <CardHeader>
          <CardTitle>Manage Travel Bookings</CardTitle>
          <CardDescription>
            View all flight and accommodation bookings and track commission revenue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {booking.type === 'Flight' ? 
                        <Plane className="h-3 w-3" /> : 
                        <BedDouble className="h-3 w-3" />
                      }
                      {booking.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{booking.customer}</TableCell>
                  <TableCell>{booking.details}</TableCell>
                  <TableCell className="text-right">{booking.commission}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
       </Card>
    </div>
  );
}
