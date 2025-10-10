interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}

export default function FeatureCard({ icon, title, description, color = 'emerald' }: Props) {
  const colorClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald}`}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
