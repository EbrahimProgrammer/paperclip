import { AppWindow, Store, ShieldQuestion } from "lucide-react";
import { DEVELOPER_TABS, advancedTabHref, isExperimentalToolTab } from "@/pages/tools/tool-tabs";
import { useSmokeLabEnabled } from "@/hooks/useSmokeLabEnabled";
import { useReviewCount } from "@/pages/apps/useReviewCount";
import { SidebarNavItem } from "./SidebarNavItem";
import { contextualSidebarStyles } from "./contextual-sidebar-styles";

/**
 * Secondary sidebar for the prosumer Apps area (PAP-10856; three-door IA
 * PAP-13254 / U3).
 *
 *   Browse / Review (n)
 *   DEVELOPER: Connections / Activity
 *
 * "Browse" is the store and "Review" holds decisions waiting on the user's
 * OK. Page identity lives in the breadcrumb above this rail. Connection
 * management lives with the Developer tools.
 * "Needs attention" is no longer a door: health/error triage folds into
 * Connections as a status filter + banner, so approvals are never buried
 * behind an error label. The Developer section was folded in from the retired
 * ToolsSidebar (PAP-10915) so the whole Apps area shares one sidebar; a
 * one-line caption frames who it's for (Finding A). "Run your own" and "Paste a
 * config" moved out of the sidebar into rows on the Connect-an-app page
 * (PAP-10922).
 */
export function AppsSidebar() {
  const reviewCount = useReviewCount();
  const { enabled: smokeLabEnabled } = useSmokeLabEnabled();
  const developerTabs = DEVELOPER_TABS.filter((tab) => {
    // Temporarily hide Gateways and Profiles until they are ready to ship.
    // Keep their tab definitions and routes intact so we can bring them back later.
    if (tab.key === "gateways" || tab.key === "profiles") return false;
    return !isExperimentalToolTab(tab.key) || smokeLabEnabled;
  });

  return (
    <aside className="w-full h-full min-h-0 border-r border-border bg-background flex flex-col">
      <nav
        aria-label="Apps"
        data-slot="contextual-sidebar-nav"
        className={contextualSidebarStyles.nav}
      >
        <div data-slot="contextual-sidebar-group" className={contextualSidebarStyles.group}>
          <SidebarNavItem to="/apps" label="Browse" icon={Store} end />
          <SidebarNavItem
            to="/apps/review"
            label="Review"
            icon={ShieldQuestion}
            badge={reviewCount > 0 ? reviewCount : undefined}
            badgeTone="warning"
            badgeLabel="waiting for your OK"
          />
        </div>
        <div data-slot="contextual-sidebar-section" className={contextualSidebarStyles.section}>
          <div
            data-slot="contextual-sidebar-section-label"
            className={contextualSidebarStyles.sectionLabel}
          >
            Developer
          </div>
          <p
            data-slot="contextual-sidebar-section-description"
            className={contextualSidebarStyles.sectionDescription}
          >
            Advanced setup for developers.
          </p>
          <div data-slot="contextual-sidebar-group" className={contextualSidebarStyles.group}>
            <SidebarNavItem to="/apps/connections" label="Connections" icon={AppWindow} end />
            {developerTabs.map((tab) => (
              <SidebarNavItem
                key={tab.key}
                to={advancedTabHref(tab.key)}
                label={tab.label}
                icon={tab.icon}
                end
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
