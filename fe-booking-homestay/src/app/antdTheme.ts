import { theme as antdTheme } from "antd";

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

/**
 * Ánh xạ giữa token của Ant Design và biến CSS Tailwind/OKLCH
 */
export const baseTokens = {
  colorPrimary: "var(--primary)",
  colorBgBase: "var(--background)",
  colorTextBase: "var(--foreground)",
  colorBorder: "var(--border)",
  colorBgContainer: "var(--card)",
  colorError: "var(--destructive)",
  colorLink: "var(--primary)",
  fontFamily: "var(--font-sans)",
  borderRadius: 8,
  boxShadow:
    "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
};

/**
 * Custom config cho từng component AntD
 */
export const componentOverrides = {
  Button: {
    borderRadius: 8,
    controlHeight: 38,
    colorPrimaryHover: "var(--accent)",
    colorBgContainerDisabled: "var(--muted)",
  },
  Input: {
    colorBgContainer: "var(--input)",
    borderRadius: 8,
    colorTextPlaceholder: "var(--muted-foreground)",
  },
  Card: {
    colorBgContainer: "var(--card)",
    colorBorderSecondary: "var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  Modal: {
    colorBgElevated: "var(--popover)",
    borderRadiusLG: 12,
  },
  Dropdown: {
    colorBgElevated: "var(--popover)",
  },
  Table: {
    colorBgContainer: "var(--card)",
    colorBorderSecondary: "var(--border)",
  },
};

/**
 * Hai theme: Light và Dark
 */
export const lightTheme = {
  algorithm: defaultAlgorithm,
  token: baseTokens,
  components: componentOverrides,
};

export const darkTheme = {
  algorithm: darkAlgorithm,
  token: baseTokens,
  components: componentOverrides,
};
