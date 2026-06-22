'use client';

import { LineChart, Line, YAxis } from 'recharts';

// chart fluctuation
export default function Sparkline({ data, width = 80, height = 28, color = '#06C2B2' }) {
  return (
    <LineChart width={width} height={height} data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Line type="monotone" dataKey="p" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
    </LineChart>
  );
}