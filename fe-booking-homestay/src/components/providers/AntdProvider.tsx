"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import { useEffect, useState } from "react";

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Base token mapping từ CSS variables
  const baseTokens = {
    // Colors
    colorPrimary: "var(--color-primary)",
    colorPrimaryHover: "var(--color-primary-foreground)",
    colorPrimaryActive: "var(--color-primary-foreground)",
    colorBgBase: "var(--color-background)",
    colorBgContainer: "var(--color-card)",
    colorBgElevated: "var(--color-card)",
    colorBgLayout: "var(--color-background)",
    colorBgSpotlight: "var(--color-accent)",
    colorTextBase: "var(--color-foreground)",
    colorText: "var(--color-foreground)",
    colorTextSecondary: "var(--color-muted-foreground)",
    colorTextPlaceholder: "var(--color-muted)",
    colorBorder: "var(--color-border)",
    colorBorderSecondary: "var(--color-muted)",
    colorSplit: "var(--color-border)",

    // Shadows
    boxShadow: "var(--shadow)",
    boxShadowSecondary: "var(--shadow-sm)",
    boxShadowTertiary: "var(--shadow-md)",

    // Font
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,

    // Border radius
    borderRadius: 16,
    borderRadiusSM: 12,
    borderRadiusLG: 20,
    borderRadiusXL: 24,

    // Status colors
    colorError: "var(--destructive)",
    colorWarning: "var(--accent)",
    colorSuccess: "var(--secondary)",
    colorInfo: "var(--primary)",

    // Charts (tuỳ component)
    colorInfoBg: "var(--chart-1)",
    colorWarningBg: "var(--chart-2)",
    colorErrorBg: "var(--chart-3)",
    colorSuccessBg: "var(--chart-4)",

    // Sidebar / layout
    colorSidebar: "var(--color-sidebar)",
    colorSidebarForeground: "var(--color-sidebar-foreground)",
  };

  // Component-specific tokens
  const componentsTokens = {
    Button: {
      borderRadius: 16,
      fontFamily: "var(--font-sans)",
      colorPrimary: "var(--color-primary)",
      colorPrimaryHover: "var(--color-primary-foreground)",
      colorPrimaryActive: "var(--color-primary-foreground)",
      controlHeight: 40,
      paddingInline: 16,
    },
    Input: {
      borderRadius: 16,
      colorBgContainer: "var(--color-card)",
      colorBorder: "var(--color-border)",
      colorTextPlaceholder: "var(--color-muted)",
      colorHoverBorder: "var(--color-primary-foreground)",
      colorFocusBorder: "var(--color-primary)",
      colorDisabledBg: "var(--muted)",
      colorDisabledText: "var(--muted-foreground)",
    },
    Card: {
      borderRadius: 16,
      colorBgContainer: "var(--color-card)",
      boxShadow: "var(--shadow-sm)",
      fontFamily: "var(--font-sans)",
      colorText: "var(--color-foreground)",
    },
    Popover: {
      colorBgContainer: "var(--color-popover)",
      colorText: "var(--color-popover-foreground)",
      boxShadow: "var(--shadow-md)",
      borderRadius: 10,
    },
    Layout: {
      colorBgLayout: "var(--color-background)",
    },
    Menu: {
      colorItemBg: "var(--color-card)",
      colorItemText: "var(--color-foreground)",
      colorItemTextHover: "var(--color-primary-foreground)",
      colorItemBgHover: "var(--color-accent)",
      colorItemBgSelected: "var(--color-primary)",
      colorItemTextSelected: "var(--color-primary-foreground)",
    },
    Tabs: {
      colorText: "var(--color-foreground)",
      colorTextHover: "var(--color-primary-foreground)",
      colorTextActive: "var(--color-primary-foreground)",
      colorFillSecondary: "var(--color-muted)",
    },
    Checkbox: {
      colorPrimary: "var(--color-primary)",
      colorBgContainer: "var(--color-card)",
    },
    Radio: {
      colorPrimary: "var(--color-primary)",
    },
    Select: {
      colorPrimary: "var(--color-primary)",
      borderRadius: 16,
    },
    Tooltip: {
      colorBg: "var(--color-card)",
      colorText: "var(--color-foreground)",
      boxShadow: "var(--shadow-md)",
    },
    Modal: {
      colorBgContainer: "var(--color-card)",
      colorText: "var(--color-foreground)",
      borderRadius: 16,
      boxShadow: "var(--shadow-xl)",
    },
    DatePicker: {
      colorBgContainer: "var(--color-card)",
      colorText: "var(--color-foreground)",
      borderRadius: 16,
      colorPrimary: "var(--color-primary)",
    },
    Pagination: {
      colorText: "var(--color-foreground)",
      colorTextHover: "var(--color-primary-foreground)",
      colorPrimary: "var(--color-primary)",
    },
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          ...baseTokens,
          ...componentsTokens,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
