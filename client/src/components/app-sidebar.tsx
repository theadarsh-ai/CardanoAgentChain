import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Sparkles, Mail, ShieldCheck, BarChart3, ShoppingBag, Palette, Banknote, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";

const agentCategories = [
  {
    label: "Workflow Automation",
    items: [
      { title: "SocialGenie", icon: Sparkles, url: "/agents/socialgenie", description: "Social media management" },
      { title: "MailMind", icon: Mail, url: "/agents/mailmind", description: "Email marketing automation" },
    ],
  },
  {
    label: "Data & Compliance",
    items: [
      { title: "ComplianceGuard", icon: ShieldCheck, url: "/agents/complianceguard", description: "AML/KYC monitoring" },
      { title: "InsightBot", icon: BarChart3, url: "/agents/insightbot", description: "Business intelligence" },
    ],
  },
  {
    label: "Customer Support",
    items: [
      { title: "ShopAssist", icon: ShoppingBag, url: "/agents/shopassist", description: "E-commerce support" },
      { title: "StyleAdvisor", icon: Palette, url: "/agents/styleadvisor", description: "Product recommendations" },
    ],
  },
  {
    label: "DeFi Services",
    items: [
      { title: "YieldMaximizer", icon: Banknote, url: "/agents/yieldmaximizer", description: "Yield optimization" },
      { title: "TradeMind", icon: TrendingUp, url: "/agents/trademind", description: "Autonomous trading" },
    ],
  },
];

export default function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AgentHub</h1>
              <p className="text-xs text-muted-foreground">Powered by Cardano</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {agentCategories.map((category) => (
          <SidebarGroup key={category.label}>
            <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
