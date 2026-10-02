/** Hex values mirror the CSS tokens in index.css; SVG attributes can't resolve Tailwind classes. */
export const CHART = {
  lime: '#9bcf53',
  sun: '#edeb6b',
  peach: '#f6b36b',
  coral: '#e0584b',
  ink: '#141414',
  bar: '#ebebe8',
  grid: '#ebebe8',
  axis: '#85857f',
} as const

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.axis, fontSize: 11 },
} as const
