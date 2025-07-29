// src/components/PlayerLobby.tsx
import React, { FC, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Define player structure
interface Player {
  id: string
  name: string
  avatar: string
  gameCode: string
}

// Define the shape of your game document
interface GameDoc {
  quizId: string
  questionIndex: number
  showScoreboard: boolean
  gameEnded: boolean
}

const PlayerLobby: FC = () => {
  const { gameCode } = useParams<Record<string, string>>()
  const [player, setPlayer] = useState<Player | null>(null)
  const [quizTitle, setQuizTitle] = useState<string>('')
  const navigate = useNavigate()

  // helper to make a quick random ID
  const generateId = () => Math.random().toString(36).substr(2, 9)

  useEffect(() => {
    if (!gameCode) return

    // Try to load from localStorage
    const raw = localStorage.getItem('playerInfo')
    let stored: Player | null = null
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (
          typeof parsed.id === 'string' &&
          typeof parsed.name === 'string' &&
          typeof parsed.avatar === 'string' &&
          typeof parsed.gameCode === 'string'
        ) {
          stored = parsed as Player
        }
      } catch {}
    }

    // If they've already joined this exact game, just reuse
    const existingId = sessionStorage.getItem('playerId')
    if (
      stored &&
      existingId &&
      stored.id === existingId &&
      stored.gameCode === gameCode
    ) {
      setPlayer(stored)
      return
    }

    // Otherwise, register or recover an existing player
    ;(async () => {
      // Pick name+avatar from stored if any, default fallback
      const name = stored?.name ?? 'Anonymous'
      const avatar = stored?.avatar ?? '🙂'

      try {
        const resp = await fetch('http://localhost:5000/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, gameCode, avatar }),
        })

        if (resp.status === 409) {
          // Conflict: name already taken → fetch the list and pick ours
          const listRes = await fetch(
            `http://localhost:5000/players/${gameCode}`
          )
          if (listRes.ok) {
            const all: Player[] = await listRes.json()
            const me = all.find(
              p => p.name === name && p.avatar === avatar
            )
            if (me) {
              sessionStorage.setItem('playerId', me.id)
              localStorage.setItem('playerInfo', JSON.stringify(me))
              setPlayer(me)
            } else {
              console.warn(
                '409 returned but no matching player found in list'
              )
            }
          }
          return
        }

        if (!resp.ok) {
          console.error('Failed to join game', await resp.text())
          return
        }

        // New registration succeeded
        const playerDoc = (await resp.json()) as Player
        sessionStorage.setItem('playerId', playerDoc.id)
        localStorage.setItem('playerInfo', JSON.stringify(playerDoc))
        setPlayer(playerDoc)
      } catch (err) {
        console.error('❌ Failed to join game', err)
      }
    })()
  }, [gameCode])

  // 2) Fetch the quiz title by first loading the GameDoc to get quizId
  useEffect(() => {
    if (!gameCode) return

    const fetchQuizTitle = async () => {
      try {
        const gameRes = await fetch(`http://localhost:5000/games/${gameCode}`)
        if (!gameRes.ok) throw new Error(`Game ${gameCode} not found`)
        const gameData = (await gameRes.json()) as GameDoc

        const quizRes = await fetch(
          `http://localhost:5000/quizzes/${gameData.quizId}`
        )
        if (!quizRes.ok)
          throw new Error(`Quiz ${gameData.quizId} not found`)
        const quizData = (await quizRes.json()) as { title?: string }

        setQuizTitle(quizData.title ?? '')
      } catch (err) {
        console.error('❌ Failed to fetch quiz title:', err)
      }
    }

    fetchQuizTitle()
  }, [gameCode])

  // 3) Poll the game state every 3s; once questionIndex >= 0, navigate
  useEffect(() => {
    if (!gameCode) return

    const iv = setInterval(async () => {
      const res = await fetch(`http://localhost:5000/games/${gameCode}`)
      const data = (await res.json()) as GameDoc
      console.log('📡 Polled game state:', data)

      if (data.questionIndex !== undefined && data.questionIndex >= 0) {
        clearInterval(iv)
        navigate(`/player-game/${gameCode}`)
      }
    }, 3000)

    return () => clearInterval(iv)
  }, [gameCode, navigate])

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Starry background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)]
                   bg-[length:20px_20px] opacity-20 pointer-events-none z-0"
      />
      <div
        className="absolute left-[-150px] bottom-[10%] w-[700px] h-[500px]
                   bg-gradient-to-br from-pink-600/30 to-purple-700/40
                   blur-[100px] rounded-[60%] z-0"
      />

      {/* Lobby card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-white/10">
        <h1 className="text-3xl font-bold mb-4 text-pink-400">
          🚀 Waiting Lobby
        </h1>

        {/* Game code */}
        <p className="text-sm text-gray-300 mb-2">Game Code:</p>
        <div className="text-2xl font-bold bg-white text-black px-4 py-2 inline-block rounded-lg mb-6">
          {gameCode}
        </div>

        {/* Quiz title */}
        {quizTitle && (
          <>
            <p className="text-sm text-gray-300 mb-1">Quiz Title:</p>
            <div className="text-lg font-semibold mb-4 text-white">
              {quizTitle}
            </div>
          </>
        )}

        {/* Player info */}
        {player && (
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-1">
              You joined as:
            </p>
            {player.avatar.startsWith('http') ? (
              <img
                src={player.avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full mx-auto"
              />
            ) : (
              <div className="text-5xl">{player.avatar}</div>
            )}
            <p className="mt-2 font-bold text-lg">{player.name}</p>
          </div>
        )}

        {/* Waiting indicator */}
        <div className="mt-6 animate-pulse text-gray-300 text-sm">
          ⏳ Waiting for host to start the game…
        </div>
      </div>
    </div>
  )
}

export default PlayerLobby
