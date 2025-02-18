import GameSetup from "@/components/game-setup";
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Anotador de stats',
  description: 'Anotador de stats de futbol',
}
 

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Estadísticas de Fútbol</h1>
      <GameSetup />
    </main>
  )
}
