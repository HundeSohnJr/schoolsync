import {
  Calculator, Grid3x3, Brain, Coins, Clock, Hash,
  BookOpen, Tag, ArrowLeftRight, Layers, MessageCircle, History, TrendingUp,
  PenTool, Scissors,
} from 'lucide-react';

/**
 * Single source of truth for all SchoolSync modules.
 *
 * - key:   progress-tracking key (used in AppContext / localStorage)
 * - label: human-readable name
 * - path:  route path (with leading slash)
 * - icon:  lucide-react icon component
 * - group: navigation group name
 * - color: dashboard color theme for this group
 */
export const MODULE_REGISTRY = [
  // Mathe
  { key: 'schriftlich',      label: 'Schriftlich Rechnen',   path: '/schriftlich-rechnen', icon: Calculator,      group: 'Mathe',           color: 'blue' },
  { key: 'einmaleins',       label: '1x1 Training',          path: '/einmaleins',          icon: Grid3x3,         group: 'Mathe',           color: 'blue' },
  { key: 'kopfrechnen',      label: 'Kopfrechnen',           path: '/kopfrechnen',         icon: Brain,           group: 'Mathe',           color: 'blue' },
  { key: 'geld-rechnen',     label: 'Geld rechnen',          path: '/geld-rechnen',        icon: Coins,           group: 'Mathe',           color: 'blue' },
  { key: 'uhrzeit',          label: 'Uhrzeit',               path: '/uhrzeit',             icon: Clock,           group: 'Mathe',           color: 'blue' },
  { key: 'zahlenraum',       label: 'Zahlenraum bis 1000',   path: '/zahlenraum',          icon: Hash,            group: 'Mathe',           color: 'blue' },
  // Grammatik
  { key: 'wortarten',        label: 'Wortarten',             path: '/wortarten',           icon: BookOpen,        group: 'Grammatik',       color: 'purple' },
  { key: 'der-die-das',      label: 'der/die/das',           path: '/der-die-das',         icon: Tag,             group: 'Grammatik',       color: 'purple' },
  { key: 'einzahl-mehrzahl', label: 'Einzahl & Mehrzahl',    path: '/einzahl-mehrzahl',    icon: ArrowLeftRight,  group: 'Grammatik',       color: 'purple' },
  { key: 'satzglieder',      label: 'Satzglieder',           path: '/satzglieder',         icon: Layers,          group: 'Grammatik',       color: 'purple' },
  { key: 'satzarten',        label: 'Satzarten . ? !',       path: '/satzarten',           icon: MessageCircle,   group: 'Grammatik',       color: 'purple' },
  { key: 'zeitformen',       label: 'Zeitformen',            path: '/zeitformen',          icon: History,         group: 'Grammatik',       color: 'purple' },
  { key: 'steigerung',       label: 'Steigerung',            path: '/steigerung',          icon: TrendingUp,      group: 'Grammatik',       color: 'purple' },
  // Rechtschreibung
  { key: 'rechtschreibung',  label: 'Rechtschreibung',       path: '/rechtschreibung',     icon: PenTool,         group: 'Rechtschreibung', color: 'green' },
  { key: 'silbentrennung',   label: 'Silbentrennung',        path: '/silbentrennung',      icon: Scissors,        group: 'Rechtschreibung', color: 'green' },
  { key: 'gross-klein',      label: 'Groß/Klein',            path: '/gross-klein',         icon: PenTool,         group: 'Rechtschreibung', color: 'green' },
];

/** All module keys for progress tracking */
export const MODULE_KEYS = MODULE_REGISTRY.map((m) => m.key);

/**
 * Navigation groups for the sidebar (same structure Layout.jsx used to define locally).
 * Each group: { label, items: [{ path, label, icon }] }
 */
export const NAV_GROUPS = (() => {
  const groupOrder = [];
  const groupMap = {};
  for (const mod of MODULE_REGISTRY) {
    if (!groupMap[mod.group]) {
      groupMap[mod.group] = { label: mod.group, items: [] };
      groupOrder.push(groupMap[mod.group]);
    }
    groupMap[mod.group].items.push({ path: mod.path, label: mod.label, icon: mod.icon });
  }
  return groupOrder;
})();

/**
 * Dashboard sections — groups with color information and module details.
 * Each section: { label, color, modules: [{ key, path, label, icon }] }
 */
export const DASHBOARD_SECTIONS = (() => {
  const groupOrder = [];
  const groupMap = {};
  for (const mod of MODULE_REGISTRY) {
    if (!groupMap[mod.group]) {
      groupMap[mod.group] = { label: mod.group, color: mod.color, modules: [] };
      groupOrder.push(groupMap[mod.group]);
    }
    groupMap[mod.group].modules.push({ key: mod.key, path: mod.path, label: mod.label, icon: mod.icon });
  }
  return groupOrder;
})();
