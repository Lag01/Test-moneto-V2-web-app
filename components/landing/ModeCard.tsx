interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  badge?: string;
  bgColor: string;
}

export default function ModeCard({ icon, title, description, features, badge, bgColor }: Props) {
  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:scale-105">
      {/* Badge optionnel */}
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
            {badge}
          </span>
        </div>
      )}

      {/* Icône avec couleur unie */}
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
        {icon}
      </div>

      {/* Titre */}
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6 text-center leading-relaxed">
        {description}
      </p>

      {/* Liste des fonctionnalités */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm md:text-base text-slate-700 dark:text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Badge gratuit */}
      <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
        <span className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm rounded-full">
          100% GRATUIT
        </span>
      </div>
    </div>
  );
}
