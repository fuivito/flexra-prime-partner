import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, CreditCard, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import { useLocale } from '@/i18n/LocaleContext';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useLocale();

  const navItems = [
    { title: t.nav.dashboard, url: '/portal/dashboard', icon: LayoutDashboard },
    { title: t.nav.payments, url: '/portal/payments', icon: CreditCard },
    { title: t.nav.profile, url: '/portal/profile', icon: UserCircle },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
          <div className="flex h-16 items-center px-6">
            <Link to="/portal/dashboard" className="text-lg font-bold tracking-tight text-sidebar-foreground">
              flexra<span className="text-sidebar-primary">.</span>
            </Link>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                        <NavLink to={item.url} className="flex items-center gap-3 text-sidebar-foreground hover:text-sidebar-primary-foreground" activeClassName="bg-sidebar-accent text-sidebar-primary-foreground">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-foreground h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="flex h-14 md:h-16 items-center border-b border-border/50 px-4 md:px-6 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="mr-3" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-muted-foreground truncate block">{user?.company || 'My Portal'}</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
