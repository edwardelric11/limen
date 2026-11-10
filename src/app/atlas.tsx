import { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import { byId, CONCEPTS, neighbors } from '@/data';
import { useTrail } from '@/lib/trail';
import { openConcept } from '@/ui/blocks';
import { BackButton, Button, floatShadow, Frost, StatusTag, T } from '@/ui/kit';
import { font, shape, useAppWidth, useTheme } from '@/ui/theme';

// Force-directed layout, computed once, sized for a portrait phone.
const W = 600, H = 860;
function layout() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nodes = CONCEPTS.map(c => ({ id: c.id, x: W / 2 + (rnd() - 0.5) * W * 0.7, y: H / 2 + (rnd() - 0.5) * H * 0.7, vx: 0, vy: 0, deg: neighbors(c.id).length }));
  const ix: Record<string, number> = {}; nodes.forEach((n, i) => (ix[n.id] = i));
  const seen = new Set<string>(); const edges: [number, number][] = [];
  CONCEPTS.forEach(c => c.rel.forEach(([to]) => { const k = [c.id, to].sort().join('|'); if (byId[to] && !seen.has(k)) { seen.add(k); edges.push([ix[c.id], ix[to]]); } }));
  for (let it = 0; it < 400; it++) {
    const a = 1 - it / 400;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const p = nodes[i], q = nodes[j]; let dx = p.x - q.x, dy = p.y - q.y; const d2 = dx * dx + dy * dy + 0.01; const f = 2600 / d2; const d = Math.sqrt(d2);
      dx /= d; dy /= d; p.vx += dx * f; p.vy += dy * f; q.vx -= dx * f; q.vy -= dy * f;
    }
    edges.forEach(([i, j]) => { const p = nodes[i], q = nodes[j]; const dx = q.x - p.x, dy = q.y - p.y; const d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - 90) * 0.02; p.vx += (dx / d) * f; p.vy += (dy / d) * f; q.vx -= (dx / d) * f; q.vy -= (dy / d) * f; });
    nodes.forEach(n => { n.vx += (W / 2 - n.x) * 0.006; n.vy += (H / 2 - n.y) * 0.004; n.x += Math.max(-12, Math.min(12, n.vx)) * a; n.y += Math.max(-12, Math.min(12, n.vy)) * a; n.vx *= 0.5; n.vy *= 0.5; });
  }
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  nodes.forEach(n => { n.x = 40 + ((n.x - x0) / (x1 - x0)) * (W - 80); n.y = 40 + ((n.y - y0) / (y1 - y0)) * (H - 80); });
  return { nodes, edges };
}

export default function Atlas() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const width = useAppWidth();
  const { has } = useTrail();
  const { nodes, edges } = useMemo(layout, []);
  const [sel, setSel] = useState<string | null>(null);
  const on = useMemo(() => (sel ? new Set([sel, ...neighbors(sel)]) : null), [sel]);
  const color = (id: string) => { const d = byId[id].d; return d.includes('psych') && d.includes('phil') ? c.both : d.includes('phil') ? c.phil : c.psych; };
  const top = insets.top + 66;
  const svgH = height - top - 60;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: top, paddingHorizontal: 20, gap: 8 }}>
        <T v="display" size={32} accessibilityRole="header">Atlas</T>
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {([['Psychology', c.psych], ['Philosophy', c.phil], ['Both', c.both]] as const).map(([l, col]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: col }} /><T v="caption" color={c.ink2}>{l}</T>
            </View>
          ))}
          <T v="caption">Choose an idea.</T>
        </View>
      </View>
      <Svg width={width} height={svgH} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onPress={() => setSel(null)}>
        {edges.map(([i, j]) => {
          const lit = on && on.has(nodes[i].id) && on.has(nodes[j].id);
          return <Line key={`${i}-${j}`} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} stroke={lit ? c.accent : c.ink3} strokeOpacity={lit ? 0.9 : on ? 0.06 : 0.22} strokeWidth={lit ? 1.6 : 1} />;
        })}
        {nodes.map(n => {
          const r = 5 + n.deg * 0.8; const show = on ? on.has(n.id) : n.deg >= 6;
          return (
            <G key={n.id} opacity={on && !on.has(n.id) ? 0.2 : 1} onPress={() => setSel(n.id)}>
              <Circle cx={n.x} cy={n.y} r={r + 12} fill="transparent" />
              <Circle cx={n.x} cy={n.y} r={r} fill={color(n.id)} stroke={has(n.id) ? c.ink : c.bg} strokeWidth={2} />
              {show ? (['halo', 'ink'] as const).map(k => (
                <SvgText key={k} x={n.x} y={n.y - r - 6} fontSize={sel === n.id ? 17 : 14} fontFamily={sel === n.id ? font.bold : font.medium} fill={c.ink}
                  stroke={k === 'halo' ? c.bg : undefined} strokeWidth={k === 'halo' ? 4 : 0} strokeLinejoin="round" textAnchor="middle">{byId[n.id].t}</SvgText>
              )) : null}
            </G>
          );
        })}
      </Svg>

      {sel ? (
        <View style={[{ position: 'absolute', left: 12, right: 12, bottom: Math.max(insets.bottom, 12) + 4 }, floatShadow, { borderRadius: shape.xl }]}>
          <Frost radius={shape.xl} style={{ padding: 20, gap: 9 }}>
            <StatusTag st={byId[sel].st} />
            <T v="title" size={24}>{byId[sel].t}</T>
            <T v="dek" size={16} numberOfLines={3}>{byId[sel].dek}</T>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4 }}>
              <Button label="Open" onPress={() => openConcept(sel)} />
              <T v="caption">{neighbors(sel).length} connections</T>
            </View>
          </Frost>
        </View>
      ) : null}
      <BackButton />
    </View>
  );
}
