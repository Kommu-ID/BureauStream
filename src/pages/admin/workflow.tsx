import AdminSidebar from "@/components/admin-sidebar";
import { AuthGuard } from "@/components/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableHead, TableRow, TableHeader, TableBody,TableCell } from "@/components/ui/table";
import { Separator } from "@radix-ui/react-separator";
import { Terminal } from "lucide-react";

export default function WorkflowPage() {
  return (
    <AuthGuard role="admin">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                This page is still under construction
              </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Marriage certificate request</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Veteran ID application</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <img className="w-[800px]" src="https://help.apple.com/assets/66564E9545C34E52E6087F8B/66564E9FF70BB9CA9404E357/en_US/91feca69b6d4a32d3927e8019d64ae73.png" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
