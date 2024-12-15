import AdminSidebar from "@/components/admin-sidebar";
import { AuthGuard } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from '@/components/ui/chat/chat-bubble'
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableCaption, TableHead, TableRow, TableHeader, TableBody,TableCell } from "@/components/ui/table";
import { convoIdMap } from "@/components/user-sidebar";
import { trpc } from "@/utils/trpc";
import { useCallback, useState } from "react";
import { Markdown } from "@/components/markdown";
import { ChatContentRenderer } from "@/components/chat-content-renderer";

export default function AdminPage() {
  const convos = trpc.admin.processList.useQuery()
  const continueProcessMutation = trpc.admin.processContinue.useMutation()
  const [activeConvo, setActiveConvo] = useState<(NonNullable<typeof convos.data>)[0]>()

  const continueProcess = useCallback(async (convoId: string) => {
    await continueProcessMutation.mutateAsync({ id: convoId })
    convos.refetch()
  }, [continueProcessMutation, convos])

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
            <Table>
              <TableCaption>Ongoing service requests pending action</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {convos.data?.map((convo) => (
                  <TableRow key={convo.id}>
                    <TableCell className="font-medium">{convo.modified_at && new Date(convo.modified_at).toLocaleDateString()}</TableCell>
                    <TableCell>{convoIdMap[convo.service_id ?? '']}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveConvo(convo)}
                      >
                        View Chat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Sheet open={!!activeConvo} onOpenChange={() => setActiveConvo(undefined)}>
        <SheetContent className="flex flex-col sm:max-w-3xl sm:w-full">
          <SheetHeader>
            <SheetTitle>Previewing the conversation</SheetTitle>
            <SheetDescription>
              Validate the data here to complete the process
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <ChatMessageList>
              {Array.isArray(activeConvo?.messages) && activeConvo.messages.map((message, i) => {
                if (message.role === 'user') {
                  return (
                    <ChatBubble variant='sent' key={i}>
                      <ChatBubbleAvatar fallback='US' />
                      <ChatBubbleMessage variant='sent'>
                        <ChatContentRenderer content={message.content} />
                      </ChatBubbleMessage>
                    </ChatBubble>
                  )
                }
                if (message.role === 'assistant') {
                  return (
                    <ChatBubble variant='received' key={i}>
                      <ChatBubbleAvatar fallback='AI' />
                      <ChatBubbleMessage variant='received'>
                        <ChatContentRenderer content={message.content} />
                      </ChatBubbleMessage>
                    </ChatBubble>
                  )
                }
              })}
            </ChatMessageList>
          </div>
          <div className="text-end">
            <Button type="button" variant="destructive" className="flex-shrink-0"
              onClick={() => continueProcess(activeConvo?.id ?? '')}
            >Continue Process</Button>
          </div>
        </SheetContent>
      </Sheet>
    </AuthGuard>
  )
}
