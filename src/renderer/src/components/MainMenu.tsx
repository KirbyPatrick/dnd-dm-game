interface Props {
  hasSave: boolean
  onNewGame: () => void
  onContinue: () => void
}

export function MainMenu({ hasSave, onNewGame, onContinue }: Props) {
  return (
    <div className="menu">
      <h1 className="title">Dungeon Master</h1>
      <p className="subtitle">A solo adventure narrated by Claude</p>
      <div className="menu-buttons">
        <button className="btn primary" onClick={onNewGame}>
          New Adventure
        </button>
        <button className="btn" disabled={!hasSave} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}
