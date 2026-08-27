import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, trend, trendValue, icon: Icon, color }) {
  const colorClasses = {
    primary: 'border-t-primary text-primary bg-blue-50',
    danger: 'border-t-danger text-danger bg-red-50',
    success: 'border-t-success text-success bg-green-50',
    warning: 'border-t-warning text-warning bg-yellow-50',
  };

  const iconColors = {
    primary: 'text-blue-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 border-t-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{title}</p>
          <h3 className="text-4xl font-bold mt-3 text-gray-800">{value}</h3>
          <div className="flex items-center gap-2 mt-3">
            {trend === 'up' ? (
              <TrendingUp size={16} className="text-red-500" />
            ) : (
              <TrendingDown size={16} className="text-green-500" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {trendValue}
            </span>
            <span className="text-xs text-gray-400">vs. semaine précédente</span>
          </div>
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon size={28} className={iconColors[color]} />
        </div>
      </div>
    </div>
  );
}