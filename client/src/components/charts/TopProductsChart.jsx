import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-elevated border border-cafe-bg-secondary">
        <p className="text-xs text-cafe-text-muted">{label}</p>
        <p className="text-sm font-semibold text-cafe-text">Qty: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function TopProductsChart({ data = [] }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-cafe-text mb-4 font-display">Top Selling Products</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9B8E87' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9B8E87' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quantity" fill="#D9A299" radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
