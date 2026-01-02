import { LayoutDashboard, BarChart3, Brain, Sparkles } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  activeView: 'tracker' | 'analytics' | 'insights';
  onViewChange: (view: 'tracker' | 'analytics' | 'insights') => void;
}

const navItems = [
  { id: 'tracker' as const, title: 'Tracker', icon: LayoutDashboard },
  { id: 'analytics' as const, title: 'Analytics', icon: BarChart3 },
  { id: 'insights' as const, title: 'AI Insights', icon: Brain },
];

export function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">Internship</span>
              <span className="text-xs text-muted-foreground -mt-0.5">Intelligence</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    tooltip={item.title}
                    className={cn(
                      'h-11 rounded-xl transition-all duration-200',
                      activeView === item.id 
                        ? 'bg-gradient-primary text-white shadow-md shadow-primary/25 font-medium' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0",
                      activeView === item.id ? "text-white" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      activeView !== item.id && "text-sidebar-foreground"
                    )}>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}