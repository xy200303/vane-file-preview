/**
 * 代码预览主题配置
 * 包含所有 50 个 Prism 主题的导入和映射
 */

// 预导入所有 50 个 Prism 主题（静态导入，避免动态导入问题）

import {
  vs,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import a11yDark from "react-syntax-highlighter/dist/esm/styles/prism/a11y-dark";
import atomDark from "react-syntax-highlighter/dist/esm/styles/prism/atom-dark";
import base16AteliersulphurpoolLight from "react-syntax-highlighter/dist/esm/styles/prism/base16-ateliersulphurpool.light";
import cb from "react-syntax-highlighter/dist/esm/styles/prism/cb";
import coldarkCold from "react-syntax-highlighter/dist/esm/styles/prism/coldark-cold";
import coldarkDark from "react-syntax-highlighter/dist/esm/styles/prism/coldark-dark";
import coy from "react-syntax-highlighter/dist/esm/styles/prism/coy";
import coyWithoutShadows from "react-syntax-highlighter/dist/esm/styles/prism/coy-without-shadows";
import darcula from "react-syntax-highlighter/dist/esm/styles/prism/darcula";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/dark";
import dracula from "react-syntax-highlighter/dist/esm/styles/prism/dracula";
import duotoneDark from "react-syntax-highlighter/dist/esm/styles/prism/duotone-dark";
import duotoneEarth from "react-syntax-highlighter/dist/esm/styles/prism/duotone-earth";
import duotoneForest from "react-syntax-highlighter/dist/esm/styles/prism/duotone-forest";
import duotoneLight from "react-syntax-highlighter/dist/esm/styles/prism/duotone-light";
import duotoneSea from "react-syntax-highlighter/dist/esm/styles/prism/duotone-sea";
import duotoneSpace from "react-syntax-highlighter/dist/esm/styles/prism/duotone-space";
import funky from "react-syntax-highlighter/dist/esm/styles/prism/funky";
import ghcolors from "react-syntax-highlighter/dist/esm/styles/prism/ghcolors";
import gruvboxDark from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-dark";
import gruvboxLight from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-light";
import holiTheme from "react-syntax-highlighter/dist/esm/styles/prism/holi-theme";
import hopscotch from "react-syntax-highlighter/dist/esm/styles/prism/hopscotch";
import lucario from "react-syntax-highlighter/dist/esm/styles/prism/lucario";
import materialDark from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";
import materialLight from "react-syntax-highlighter/dist/esm/styles/prism/material-light";
import materialOceanic from "react-syntax-highlighter/dist/esm/styles/prism/material-oceanic";
import nightOwl from "react-syntax-highlighter/dist/esm/styles/prism/night-owl";
import nord from "react-syntax-highlighter/dist/esm/styles/prism/nord";
import okaidia from "react-syntax-highlighter/dist/esm/styles/prism/okaidia";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import pojoaque from "react-syntax-highlighter/dist/esm/styles/prism/pojoaque";
import prismStyle from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import shadesOfPurple from "react-syntax-highlighter/dist/esm/styles/prism/shades-of-purple";
import solarizedDarkAtom from "react-syntax-highlighter/dist/esm/styles/prism/solarized-dark-atom";
import solarizedlight from "react-syntax-highlighter/dist/esm/styles/prism/solarizedlight";
import synthwave84 from "react-syntax-highlighter/dist/esm/styles/prism/synthwave84";
import tomorrow from "react-syntax-highlighter/dist/esm/styles/prism/tomorrow";
import twilight from "react-syntax-highlighter/dist/esm/styles/prism/twilight";
import xonokai from "react-syntax-highlighter/dist/esm/styles/prism/xonokai";
import zTouch from "react-syntax-highlighter/dist/esm/styles/prism/z-touch";

// 主题映射表（静态映射，避免动态导入）
// 完整的 50 个 Prism 主题！
export const THEME_MAP: Record<string, any> = {
  // 经典主题
  vs: vs,
  vscDarkPlus: vscDarkPlus,
  prism: prismStyle,

  // 暗色主题
  a11yDark: a11yDark,
  atomDark: atomDark,
  coldarkDark: coldarkDark,
  darcula: darcula,
  dark: dark,
  dracula: dracula,
  duotoneDark: duotoneDark,
  gruvboxDark: gruvboxDark,
  lucario: lucario,
  materialDark: materialDark,
  materialOceanic: materialOceanic,
  nightOwl: nightOwl,
  nord: nord,
  okaidia: okaidia,
  oneDark: oneDark,
  pojoaque: pojoaque,
  shadesOfPurple: shadesOfPurple,
  solarizedDarkAtom: solarizedDarkAtom,
  synthwave84: synthwave84,
  twilight: twilight,
  xonokai: xonokai,

  // 亮色主题
  base16AteliersulphurpoolLight: base16AteliersulphurpoolLight,
  cb: cb,
  coldarkCold: coldarkCold,
  coy: coy,
  coyWithoutShadows: coyWithoutShadows,
  duotoneLight: duotoneLight,
  ghcolors: ghcolors,
  gruvboxLight: gruvboxLight,
  holiTheme: holiTheme,
  materialLight: materialLight,
  oneLight: oneLight,
  solarizedlight: solarizedlight,
  tomorrow: tomorrow,

  // 特色主题
  duotoneEarth: duotoneEarth,
  duotoneForest: duotoneForest,
  duotoneSea: duotoneSea,
  duotoneSpace: duotoneSpace,
  funky: funky,
  hopscotch: hopscotch,
  zTouch: zTouch,
};

// 可用主题列表（按类别分组）
export const AVAILABLE_THEMES = [
  // === 经典主题 ===
  { value: "vs", label: "🌟 VS Light", category: "classic" },
  { value: "vscDarkPlus", label: "🌟 VS Dark Plus", category: "classic" },
  { value: "prism", label: "🌟 Prism", category: "classic" },

  // === 流行暗色主题 ===
  { value: "dracula", label: "🧛 Dracula", category: "dark" },
  { value: "oneDark", label: "⚫ One Dark", category: "dark" },
  { value: "atomDark", label: "⚫ Atom Dark", category: "dark" },
  { value: "materialDark", label: "⚫ Material Dark", category: "dark" },
  { value: "materialOceanic", label: "🌊 Material Oceanic", category: "dark" },
  { value: "nightOwl", label: "🦉 Night Owl", category: "dark" },
  { value: "nord", label: "❄️ Nord", category: "dark" },
  { value: "gruvboxDark", label: "⚫ Gruvbox Dark", category: "dark" },
  { value: "okaidia", label: "⚫ Okaidia", category: "dark" },
  { value: "darcula", label: "⚫ Darcula", category: "dark" },
  { value: "dark", label: "⚫ Dark", category: "dark" },
  { value: "coldarkDark", label: "⚫ Coldark Dark", category: "dark" },

  // === 流行亮色主题 ===
  { value: "oneLight", label: "⚪ One Light", category: "light" },
  { value: "materialLight", label: "⚪ Material Light", category: "light" },
  { value: "gruvboxLight", label: "⚪ Gruvbox Light", category: "light" },
  { value: "solarizedlight", label: "☀️ Solarized Light", category: "light" },
  { value: "tomorrow", label: "⚪ Tomorrow", category: "light" },
  { value: "coy", label: "⚪ Coy", category: "light" },
  {
    value: "coyWithoutShadows",
    label: "⚪ Coy (No Shadows)",
    category: "light",
  },
  { value: "coldarkCold", label: "⚪ Coldark Cold", category: "light" },
  { value: "ghcolors", label: "⚪ GitHub Colors", category: "light" },
  { value: "cb", label: "⚪ CB", category: "light" },
  {
    value: "base16AteliersulphurpoolLight",
    label: "⚪ Base16 Atelier",
    category: "light",
  },

  // === 特色主题 ===
  { value: "synthwave84", label: "🌈 Synthwave '84", category: "special" },
  {
    value: "shadesOfPurple",
    label: "💜 Shades of Purple",
    category: "special",
  },
  { value: "lucario", label: "🎮 Lucario", category: "special" },
  { value: "holiTheme", label: "🎨 Holi", category: "special" },
  { value: "duotoneDark", label: "🎭 Duotone Dark", category: "special" },
  { value: "duotoneLight", label: "🎭 Duotone Light", category: "special" },
  { value: "duotoneEarth", label: "🌍 Duotone Earth", category: "special" },
  { value: "duotoneForest", label: "🌲 Duotone Forest", category: "special" },
  { value: "duotoneSea", label: "🌊 Duotone Sea", category: "special" },
  { value: "duotoneSpace", label: "🚀 Duotone Space", category: "special" },
  { value: "funky", label: "🎸 Funky", category: "special" },
  { value: "hopscotch", label: "🎯 Hopscotch", category: "special" },
  { value: "zTouch", label: "✨ Z-Touch", category: "special" },

  // === 辅助功能主题 ===
  { value: "a11yDark", label: "♿ A11y Dark", category: "a11y" },

  // === 其他主题 ===
  { value: "twilight", label: "🌆 Twilight", category: "other" },
  { value: "xonokai", label: "🎨 Xonokai", category: "other" },
  { value: "pojoaque", label: "🎨 Pojoaque", category: "other" },
  {
    value: "solarizedDarkAtom",
    label: "🌙 Solarized Dark Atom",
    category: "other",
  },
];

/**
 * 获取主题对象
 */
export function getTheme(themeName: string): any {
  return THEME_MAP[themeName] || vs;
}
