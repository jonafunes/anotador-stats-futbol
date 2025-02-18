"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import jsPDF from "jspdf"

type Player = {
  name: string
  goals: number
  assists: number
}

type Team = {
  players: Player[]
}

type Goal = {
  team: "team1" | "team2"
  scorer: string
  assister: string
  time: number
}

type GameInProgressProps = {
  team1: Team
  team2: Team
}

export default function GameInProgress({ team1: initialTeam1, team2: initialTeam2 }: GameInProgressProps) {
  const [team1, setTeam1] = useState(initialTeam1)
  const [team2, setTeam2] = useState(initialTeam2)
  const [goals, setGoals] = useState<Goal[]>([])
  const [scoringTeam, setScoringTeam] = useState<"team1" | "team2" | "">("")
  const [scorer, setScorer] = useState<string>("")
  const [assister, setAssister] = useState<string>("")
  const [time, setTime] = useState<number>(0)
  const [goalTime, setGoalTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isGameOver, setIsGameOver] = useState<boolean>(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && !isGameOver) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (!isRunning && !isGameOver) {
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isGameOver])

  const handleGoalScored = () => {
    if (scoringTeam && scorer) {
      const newGoal: Goal = {
        team: scoringTeam,
        scorer,
        assister,
        time: goalTime,
      }
      setGoals([...goals, newGoal])
      updatePlayerStats(scoringTeam, scorer, assister)
      setIsGoalModalOpen(false)
      resetGoalForm()
    }
  }

  const resetGoalForm = () => {
    setScoringTeam("")
    setScorer("")
    setAssister("")
  }

  const updatePlayerStats = (team: "team1" | "team2", scorerName: string, assisterName: string) => {
    const updateTeam = (currentTeam: Team): Team => {
      return {
        ...currentTeam,
        players: currentTeam.players.map((player) => {
          if (player.name === scorerName) {
            return { ...player, goals: player.goals + 1 }
          }
          if (player.name === assisterName) {
            return { ...player, assists: player.assists + 1 }
          }
          return player
        }),
      }
    }

    if (team === "team1") {
      setTeam1(updateTeam(team1))
    } else {
      setTeam2(updateTeam(team2))
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleEndGame = () => {
    setIsRunning(false)
    setIsGameOver(true)
  }

  const handleNewGoal = () => {
    setGoalTime(time)
    setIsGoalModalOpen(true)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    let yPos = 20

    // Título
    doc.setFontSize(20)
    doc.text("Resumen del Partido", 105, yPos, { align: "center" })
    yPos += 10

    // Resultado final
    doc.setFontSize(16)
    const team1Goals = goals.filter((g) => g.team === "team1").length
    const team2Goals = goals.filter((g) => g.team === "team2").length
    doc.text(`Resultado Final: Equipo 1 ${team1Goals} - ${team2Goals} Equipo 2`, 105, yPos, { align: "center" })
    yPos += 10

    // Goles
    doc.setFontSize(14)
    doc.text("Goles:", 20, yPos)
    yPos += 10
    goals.forEach((goal, index) => {
      doc.setFontSize(12)
      const goalText = `${index + 1}. ${goal.scorer} (${goal.team === "team1" ? "Equipo 1" : "Equipo 2"}) - Tiempo: ${formatTime(goal.time)}`
      doc.text(goalText, 30, yPos)
      if (goal.assister && goal.assister !== "Sin asistencia") {
        yPos += 5
        doc.text(`   Asistencia: ${goal.assister}`, 30, yPos)
      }
      yPos += 10
    })

    // Estadísticas de jugadores
    yPos += 10
    doc.setFontSize(14)
    doc.text("Estadísticas de Jugadores:", 20, yPos)
    yPos += 10

    const addTeamStats = (team: Team, teamName: string) => {
      doc.setFontSize(12)
      doc.text(teamName, 30, yPos)
      yPos += 5
      team.players.forEach((player) => {
        const playerStats = `${player.name}: ${player.goals} goles, ${player.assists} asistencias`
        doc.text(playerStats, 40, yPos)
        yPos += 5
      })
      yPos += 5
    }

    addTeamStats(team1, "Equipo 1")
    addTeamStats(team2, "Equipo 2")

    // Guardar el PDF
    doc.save("resumen-partido.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="text-center text-2xl font-bold">
        Team A {goals.filter((g) => g.team === "team1").length} - {goals.filter((g) => g.team === "team2").length}{" "}
        Team B
      </div>
      <div className="text-center text-xl">Tiempo: {formatTime(time)}</div>
      {!isGameOver && (
        <Button onClick={handleStartStop} className="w-full">
          {isRunning ? "Pausar" : time === 0 ? "Comenzar partido" : "Reanudar"}
        </Button>
      )}
      {!isGameOver && (
        <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={!isRunning} onClick={handleNewGoal}>
              Nuevo Gol
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Gol</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team">Equipo que anotó</Label>
                <Select onValueChange={(value: "team1" | "team2") => setScoringTeam(value)}>
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Seleccione el equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team1">Equipo 1</SelectItem>
                    <SelectItem value="team2">Equipo 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scoringTeam && (
                <>
                  <div>
                    <Label htmlFor="scorer">Jugador que anotó</Label>
                    <Select onValueChange={setScorer}>
                      <SelectTrigger id="scorer">
                        <SelectValue placeholder="Seleccione el jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        {(scoringTeam === "team1" ? team1.players : team2.players).map((player) => (
                          <SelectItem key={player.name} value={player.name}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assister">Jugador que asistió (opcional)</Label>
                    <Select onValueChange={setAssister}>
                      <SelectTrigger id="assister">
                        <SelectValue placeholder="Seleccione el jugador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sin asistencia">Sin asistencia</SelectItem>
                        {(scoringTeam === "team1" ? team1.players : team2.players).map((player) => (
                          <SelectItem key={player.name} value={player.name}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button onClick={handleGoalScored} className="w-full">
                Confirmar Gol
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {!isGameOver && (
        <Button onClick={handleEndGame} className="w-full bg-red-500 hover:bg-red-600">
          Finalizar Partido
        </Button>
      )}
      {isGameOver && (
        <Button onClick={exportToPDF} className="w-full bg-green-500 hover:bg-green-600">
          Exportar Resumen a PDF
        </Button>
      )}
      <div>
        <h2 className="text-xl font-bold mb-2">Resumen del Partido</h2>
        <ul className="space-y-2">
          {goals.map((goal, index) => (
            <li key={index} className="bg-secondary p-2 rounded-md">
              Gol de {goal.scorer} ({goal.team === "team1" ? "Equipo 1" : "Equipo 2"}) - Tiempo: {formatTime(goal.time)}
              {goal.assister && goal.assister !== "Sin asistencia" && ` - Asistencia de ${goal.assister}`}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[team1, team2].map((team, index) => (
          <Card key={index}>
            <CardContent>
              <h3 className="text-lg font-bold mb-2">Equipo {index + 1}</h3>
              <ul className="space-y-2">
                {team.players.map((player) => (
                  <li key={player.name} className="bg-secondary p-2 rounded-md">
                    {player.name}: {player.goals} goles, {player.assists} asistencias
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

