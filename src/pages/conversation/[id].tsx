import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import UserSidebar from '@/components/user-sidebar';
import { Separator } from '@/components/ui/separator';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { ChatBubble,ChatBubbleAvatar,ChatBubbleMessage} from '@/components/ui/chat/chat-bubble'
import { Button } from '@/components/ui/button';
import { CornerDownLeft, Paperclip } from 'lucide-react';
import { AuthGuard } from '@/components/auth-provider';
import { trpc } from '@/utils/trpc';
import { ChangeEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import { useRouter } from 'next/router';
import { Markdown } from '@/components/markdown';
import imageCompression from 'browser-image-compression';
import { ChatContentRenderer } from '@/components/chat-content-renderer';

export default function ConversationPage() {
  const {query} = useRouter()
  const conversationId = typeof query.id === 'string' ? query.id : ''

  const addMessageMutation = trpc.user.serviceConvoAddMessage.useMutation()
  const convos = trpc.user.serviceConvoList.useQuery()
  const convo = convos.data?.find(c => c.id === conversationId)
  const [messages, setMessages] = useState<unknown>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onSubmit = useCallback(async (formData: FormData) => {
    const message = formData.get('message')?.toString()
    if (!message) return;
    const newMessages = await addMessageMutation.mutateAsync({ message, id: conversationId })
    setMessages(newMessages.messages)
  }, [addMessageMutation, conversationId])

  const onFileInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const compressedFile = await imageCompression(file, {maxSizeMB: 1});
        const base64Img = await imageCompression.getDataUrlFromFile(compressedFile)
        const message = [{ type: 'image_url', image_url: { url: base64Img } }]
        const newMessages = await addMessageMutation.mutateAsync({ message, id: conversationId })
        setMessages(newMessages.messages)
      } catch {}
      e.target.value = '';
    },
    [addMessageMutation, conversationId]
  );

  useEffect(() => {
    if (!convo?.messages) return
    setMessages(convo.messages)
  }, [convo?.messages])

  useEffect(() => {
    if (!addMessageMutation.data?.messages) return
    setMessages(addMessageMutation.data?.messages)
  }, [addMessageMutation.data?.messages])

  const serviceState = convo?.service_state as {stage: [number, number], stageName: string} | undefined

  const done = (serviceState?.stage[0] ?? 1) / (serviceState?.stage[1] ?? 1) === 1

  return (
    <AuthGuard role="user">
      <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInputChange} />
      <SidebarProvider>
        <UserSidebar serviceConvoList={convos.data ?? []} activeConversationId={conversationId} />
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {done
                ? 'Done'
                : 
                `Stage ${serviceState?.stage[0]} / ${serviceState?.stage[1]} - ${serviceState?.stageName ?? 'On progress'}`
              }
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <ChatMessageList>
                {Array.isArray(messages) && messages.map((message, i) => {
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


                {addMessageMutation.status === 'pending' && (
                  <ChatBubble variant='received'>
                    <ChatBubbleAvatar fallback='AI' />
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                )}
              </ChatMessageList>
            </div>
            <form
              action={onSubmit}
              className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
            >
              <ChatInput
                name="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center p-3 pt-0">
                <Button variant="ghost" size="icon" onClick={() => {
                  fileInputRef.current?.click()
                }}>
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
