/** Hex values mirror the CSS tokens in index.css; SVG attributes can't resolve Tailwind classes. */
export const CHART = {
  lime: '#1f8a5b',
  sun: '#c4a035',
  peach: '#c47a3a',
  coral: '#b54741',
  ink: '#15253d',
  bar: '#c5d0d6',
  grid: '#c5d0d6',
  axis: '#5e6d7a',
} as const

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.axis, fontSize: 11 },
} as const
