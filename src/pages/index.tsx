import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import UserSidebar from '@/components/user-sidebar';
import { Separator } from '@/components/ui/separator';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { Button } from '@/components/ui/button';
import { CornerDownLeft, Paperclip } from 'lucide-react';
import { AuthGuard } from '@/components/auth-provider';

export default function IndexPage() {
  return (
    <AuthGuard role="user">
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
            <div className="flex-1 overflow-auto">
            </div>
            <form
              className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
            >
              <ChatInput
                placeholder="Type your message here..."
                className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0">
                <Button variant="ghost" size="icon">
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
                </Button>

                <Button
                  size="sm"
                  className="ml-auto gap-1.5"
                >
                  Send Message
                  <CornerDownLeft className="size-3.5" />
                </Button>
              </div>
            </form>

          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
