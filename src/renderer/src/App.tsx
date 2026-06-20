import { MainMenu } from './components/MainMenu'
import { CharacterCreation } from './components/creation/CharacterCreation'
import { GameView } from './components/GameView'
import { useGame } from './state/useGame'

export function App() {
  const game = useGame()

  if (game.phase === 'menu') {
    return (
      <MainMenu
        hasSave={game.hasSave}
        onNewGame={game.startCreation}
        onContinue={game.continueGame}
      />
    )
  }

  if (game.phase === 'creation') {
    return <CharacterCreation onComplete={game.startNewGame} onCancel={game.quitToMenu} />
  }

  if (game.character) {
    return (
      <GameView
        character={game.character}
        messages={game.messages}
        enemies={game.enemies}
        party={game.party}
        combat={game.combat}
        pendingRoll={game.pendingRoll}
        xp={game.xp}
        level={game.level}
        levelUp={game.levelUp}
        busy={game.busy}
        error={game.error}
        onSend={game.sendAction}
        onDismissLevelUp={game.dismissLevelUp}
        onQuit={game.quitToMenu}
      />
    )
  }

  return <></>
}
