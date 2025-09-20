import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ConsultationSummaryGenerator from "@/components/admin/consultation-summary-generator";
import DocumentChecklistGenerator from "@/components/admin/document-checklist-generator";

export default function AiToolsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold">Intelligent Tools</h1>
      <Tabs defaultValue="summary-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary-generator">Consultation Summary</TabsTrigger>
          <TabsTrigger value="checklist-generator">Document Checklist</TabsTrigger>
        </TabsList>
        <TabsContent value="summary-generator" className="mt-6">
          <Card>
             <CardHeader>
              <CardTitle>Generate Consultation Summary</CardTitle>
              <CardDescription>
                Input the student's background and consultation notes to generate a structured summary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationSummaryGenerator />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checklist-generator" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Generate Document Checklist</CardTitle>
              <CardDescription>
                Input the student's background to generate a tailored document checklist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentChecklistGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
