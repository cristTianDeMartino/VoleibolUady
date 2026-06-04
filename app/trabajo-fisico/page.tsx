import WorkoutTabs from '@/components/WorkoutTabs'

export default function TrabajoFisicoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-7 bg-accent-green rounded-full" />
          <h1 className="text-3xl font-black text-primary-blue">Programa Físico</h1>
        </div>
        <p className="text-gray-500 text-sm ml-3">
          Biblioteca de ejercicios para entrenamiento técnico en duela y desarrollo físico en gimnasio.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-primary-blue text-white rounded-xl p-4 text-center">
          <p className="text-3xl font-black">6</p>
          <p className="text-xs opacity-80 mt-0.5">Ejercicios en Duela</p>
        </div>
        <div className="bg-accent-green text-primary-blue rounded-xl p-4 text-center">
          <p className="text-3xl font-black">7</p>
          <p className="text-xs opacity-80 mt-0.5">Ejercicios de Gimnasio</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-primary-blue">13</p>
          <p className="text-xs text-gray-400 mt-0.5">Total de Ejercicios</p>
        </div>
      </div>

      {/* Tabs component */}
      <WorkoutTabs />
    </div>
  )
}
