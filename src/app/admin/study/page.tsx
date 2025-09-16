import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const resources = [
  { id: 'RES001', title: 'F-1 Visa Document Checklist', type: 'Checklist', country: 'USA' },
  { id: 'RES002', 'title': 'UK Student Visa Financial Requirements', type: 'Guide', country: 'UK' },
  { id: 'RES003', 'title': 'Canadian Study Permit Application Steps', type: 'Guide', country: 'Canada' },
  { id: 'RES004', 'title': 'Schengen Visa Photo Specifications', type: 'Checklist', country: 'EU' },
];

export default function StudyAdminPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-headline font-bold">Study & Visa Administration</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Resource Management</CardTitle>
                <CardDescription>Add, edit, or remove guides and checklists available to students.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Country</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map((resource) => (
                        <TableRow key={resource.id}>
                            <TableCell className="font-medium">{resource.title}</TableCell>
                            <TableCell>{resource.type}</TableCell>
                            <TableCell>{resource.country}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
