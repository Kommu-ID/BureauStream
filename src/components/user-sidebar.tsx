import { LandmarkIcon, MessageSquarePlusIcon, MessagesSquareIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "./ui/sidebar";
import { useMemo } from "react";
import Link from "next/link";

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
    </Sidebar>
  );
}

export default UserSidebar
