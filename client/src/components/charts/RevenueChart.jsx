import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-elevated border border-cafe-bg-secondary">
        <p className="text-xs text-cafe-text-muted">{label}</p>
        <p className="text-sm font-semibold text-cafe-text">₹{payload[0].value?.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [], title = 'Revenue', xKey = 'day' }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-cafe-text mb-4 font-display">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9A299" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D9A299" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9B8E87' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9B8E87' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#D9A299" strokeWidth={2.5} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
