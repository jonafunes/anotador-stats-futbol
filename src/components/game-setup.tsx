"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import GameInProgress from "./game-in-progress"

type Player = {
  name: string
  goals: number
  assists: number
}

type Team = {
  players: Player[]
}

export default function GameSetup() {
  const [gameStarted, setGameStarted] = useState(false)
  const [team1, setTeam1] = useState<Team>({ players: [] })
  const [team2, setTeam2] = useState<Team>({ players: [] })
  const [newPlayerName, setNewPlayerName] = useState("")
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1")
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)

  const handleStartGame = () => {
    if (team1.players.length > 0 && team2.players.length > 0) {
      setGameStarted(true)
    } else {
      alert("Por favor, ingrese al menos un jugador por equipo.")
    }
  }

  const addPlayer = () => {
    if (newPlayerName) {
      const newPlayer: Player = { name: newPlayerName, goals: 0, assists: 0 }
      if (currentTeam === "team1") {
        setTeam1({ ...team1, players: [...team1.players, newPlayer] })
      } else {
        setTeam2({ ...team2, players: [...team2.players, newPlayer] })
      }
      setNewPlayerName("")
      setIsAddPlayerModalOpen(false)
    }
  }

  if (gameStarted) {
    return <GameInProgress team1={team1} team2={team2} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {["team1", "team2"].map((team, index) => (
          <Card key={team}>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Equipo {index + 1}</h2>
              <Dialog open={isAddPlayerModalOpen} onOpenChange={setIsAddPlayerModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mb-4" onClick={() => setCurrentTeam(team as "team1" | "team2")}>
                    Agregar Jugador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Jugador</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Label htmlFor="playerName">Nombre del Jugador</Label>
                    <Input
                      id="playerName"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Ingrese el nombre del jugador"
                    />
                    <Button onClick={addPlayer} className="w-full">
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="space-y-2">
                {(team === "team1" ? team1.players : team2.players).map((player, playerIndex) => (
                  <div key={playerIndex} className="bg-secondary p-2 rounded-md">
                    {player.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={handleStartGame} className="w-full">
        Iniciar Partido
      </Button>
    </div>
  )
}

