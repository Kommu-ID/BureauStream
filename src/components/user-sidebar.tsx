import { LandmarkIcon, MessageSquarePlusIcon, MessagesSquareIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "./ui/sidebar";

export type UserSidebarProps = {
  activeConversationId?: string
}

const UserSidebar = ({ activeConversationId }: UserSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4 flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LandmarkIcon className="size-4" />
          </div>
          BureauStream
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={!activeConversationId}>
                <a href="#">
                  <MessageSquarePlusIcon />
                  <span>New consultation</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Ongoing service requests</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <MessagesSquareIcon />
                      <span>Applying for Marriage Certificate</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Archives</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <MessagesSquareIcon />
                      <span>Applying for Veteran ID</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default UserSidebar
