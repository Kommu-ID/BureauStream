import { ChevronUp, LandmarkIcon, MessageSquarePlusIcon, MessagesSquareIcon, User2 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "./ui/sidebar";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useRouter } from "next/router";

export const convoIdMap: Record<string, string> = {
  '1001': 'Marriage certificate request',
  '1002': 'Veteran ID application',
}

type Convo = {
  id: string,
  service_id: string | null,
  service_state?: unknown,
}

export type UserSidebarProps = {
  activeConversationId?: string
  serviceConvoList: Array<Convo>
}

const UserSidebar = ({ activeConversationId, serviceConvoList }: UserSidebarProps) => {
  const {payload} = useAuth()
  const router = useRouter()
  const { ongoing, archive } = useMemo(() => {
    return serviceConvoList.reduce<{
      ongoing: Array<Convo>,
      archive: Array<Convo>
    }>((obj, convo) => {
        const ongoing = convo.service_state && typeof convo.service_state === 'object' && 'stage' in convo.service_state && Array.isArray(convo.service_state.stage) && convo.service_state.stage[0] !== convo.service_state.stage[1]
        if (ongoing) return {...obj, ongoing: [...obj.ongoing, convo]}
        return {...obj, archive: [...obj.archive, convo]}
      }, { ongoing: [], archive: []})
  }, [serviceConvoList])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4 flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LandmarkIcon className="size-4" />
          </div>
          BUREAUSTREAM
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={!activeConversationId}>
                <Link href="/">
                  <MessageSquarePlusIcon />
                  <span>New consultation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {ongoing.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Ongoing service requests</SidebarGroupLabel>
            <SidebarGroupContent>
              {ongoing.map(convo => (
                <SidebarMenu key={convo.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeConversationId === convo.id}>
                      <Link href={`/conversation/${convo.id}`}>
                        <MessagesSquareIcon />
                        <span>{convoIdMap[convo.service_id ?? ''] ?? ''}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {archive.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Archives</SidebarGroupLabel>
            <SidebarGroupContent>
              {archive.map(convo => (
                <SidebarMenu key={convo.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeConversationId === convo.id}>
                      <Link href={`/conversation/${convo.id}`}>
                        <MessagesSquareIcon />
                        <span>{convoIdMap[convo.service_id ?? ''] ?? ''}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {payload?.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={() => {
                  window.localStorage.removeItem('token')
                  router.replace('/auth')
                }}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default UserSidebar
