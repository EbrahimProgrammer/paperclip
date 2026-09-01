// @vitest-environment jsdom

import { act, useEffect, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BreadcrumbProvider, useBreadcrumbs } from "../context/BreadcrumbContext";
import { BreadcrumbBar } from "./BreadcrumbBar";

vi.mock("@/lib/router", () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>{children}</a>
  ),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({
    collapsed: false,
    isMobile: false,
    toggleCollapsed: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock("../context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompanyId: "company-1", selectedCompany: { issuePrefix: "TES" } }),
}));

vi.mock("../context/PanelContext", () => ({
  usePanel: () => ({ panelVisible: true, togglePanelVisible: vi.fn() }),
}));

vi.mock("@/plugins/slots", () => ({
  usePluginSlots: () => ({ slots: [] }),
  PluginSlotOutlet: () => null,
}));

vi.mock("@/plugins/launchers", () => ({
  usePluginLaunchers: () => ({ launchers: [] }),
  PluginLauncherOutlet: () => null,
}));

function TaskBreadcrumbs({
  onOpen,
  panelControl,
  taskDetailLayout = false,
  identifier = "PAP-16679",
}: {
  onOpen?: () => void;
  panelControl?: { open: boolean; onToggle: () => void };
  taskDetailLayout?: boolean;
  identifier?: string;
}) {
  const {
    setBreadcrumbs,
    setBreadcrumbToolbar,
    setBreadcrumbPanelControl,
  } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Tasks", href: "/issues" },
      {
        label: "Hire your first engineer and create a hiring plan",
        identifier,
        leading: "status",
      },
    ]);
    setBreadcrumbToolbar(
      onOpen ? (
        <button type="button" aria-label="Show task side panel" onClick={onOpen}>
          Show panel
        </button>
      ) : null,
    );
    setBreadcrumbPanelControl(panelControl ?? null);
    return () => {
      setBreadcrumbToolbar(null);
      setBreadcrumbPanelControl(null);
    };
  }, [
    identifier,
    onOpen,
    panelControl,
    setBreadcrumbPanelControl,
    setBreadcrumbToolbar,
    setBreadcrumbs,
  ]);

  return <BreadcrumbBar taskDetailLayout={taskDetailLayout} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("BreadcrumbBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders a page toolbar in the same persistent row as the task breadcrumb", async () => {
    const onOpen = vi.fn();
    await act(async () => {
      root.render(
        <BreadcrumbProvider>
          <TaskBreadcrumbs onOpen={onOpen} />
        </BreadcrumbProvider>,
      );
    });

    const launcher = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show task side panel"]',
    );
    expect(launcher).not.toBeNull();
    expect(launcher?.closest(".h-12")?.textContent).toContain("PAP-16679");

    act(() => launcher?.click());
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("appends the task identifier to the task title in the task-detail header", async () => {
    await act(async () => {
      root.render(
        <BreadcrumbProvider>
          <TaskBreadcrumbs taskDetailLayout identifier="TES-1" />
        </BreadcrumbProvider>,
      );
    });

    const identifier = container.querySelector('[data-slot="task-title-identifier"]');
    expect(identifier).toBeTruthy();
    expect(identifier?.className).not.toContain("absolute");

    const title = Array.from(container.querySelectorAll("span"))
      .find((element) => element.textContent === "Hire your first engineer and create a hiring plan");
    expect(title?.className).toContain("truncate");
    expect(title?.nextElementSibling).toBe(identifier);
    expect(identifier?.textContent).toBe("TES-1");
  });

  it("routes the single task-detail panel button through a page override", async () => {
    const onToggle = vi.fn();
    const panelControl = { open: false, onToggle };
    await act(async () => {
      root.render(
        <BreadcrumbProvider>
          <TaskBreadcrumbs taskDetailLayout panelControl={panelControl} />
        </BreadcrumbProvider>,
      );
    });

    const launcher = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show properties"]',
    );
    expect(launcher).not.toBeNull();
    expect(container.querySelector('button[aria-label="Hide properties"]')).toBeNull();

    act(() => launcher?.click());
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("uses the same compact rounded hover surface for both sidebar controls", async () => {
    await act(async () => {
      root.render(
        <BreadcrumbProvider>
          <TaskBreadcrumbs taskDetailLayout />
        </BreadcrumbProvider>,
      );
    });

    const leftControl = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Collapse sidebar"]',
    );
    const rightControl = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Hide properties"]',
    );

    expect(leftControl?.className).toContain("size-9");
    expect(rightControl?.className).toContain("size-9");
    expect(rightControl?.className).not.toContain("rounded-none");
    expect(rightControl?.className).not.toContain("h-full");
  });
});
