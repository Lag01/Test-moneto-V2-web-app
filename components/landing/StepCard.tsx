interface Props {
  number: number;
  title: string;
  description: string;
  imageSrc?: string;
  children?: React.ReactNode;
}

export default function StepCard({ number, title, description, imageSrc, children }: Props) {
  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700">
      {/* Numéro de l'étape */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">{number}</span>
      </div>

      {/* Contenu */}
      <div className="mt-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {title}
        </h3>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Image ou contenu personnalisé */}
        {imageSrc ? (
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
            <img src={imageSrc} alt={title} className="max-w-full h-auto" />
          </div>
        ) : children ? (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
