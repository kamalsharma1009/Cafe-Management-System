import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';

const COLORS = ['#D9A299', '#DCC5B2', '#F0E4D3', '#c88e85', '#b07a72', '#9B8E87'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-elevated border border-cafe-bg-secondary">
        <p className="text-xs text-cafe-text-muted">{payload[0].name}</p>
        <p className="text-sm font-semibold text-cafe-text">₹{parseFloat(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function CategorySalesChart({ data = [] }) {
  const filteredData = data.filter((d) => d.total > 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-cafe-text mb-4 font-display">Sales by Category</h3>
      <div className="h-64 flex items-center">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="total"
                nameKey="name"
              >
                {filteredData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-cafe-text-muted text-center w-full">No sales data</p>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {filteredData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs text-cafe-text-muted">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
