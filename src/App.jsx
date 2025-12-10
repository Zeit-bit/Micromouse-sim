import { useState } from 'react'

const App = () => {
  const [cellCount, setCellCount] = useState(4)
  const [maze, setMaze] = useState(null)
  const [mouseCell, setMouseCell] = useState(null) // {row, col}
  const [goalCell, setGoalCell] = useState(null) // {row, col}
  const [mode, setMode] = useState('idle') // 'idle' | 'setMouse' | 'setGoal' | 'solving'
  const [isGenerating, setIsGenerating] = useState(false)

  const mazeDictionary = {
    0: 'bg-gray-900', // Empty cell
    1: 'bg-white', // Wall
    2: 'bg-white', // Wall-Joints
    3: 'bg-gray-900', // Removed wall
    4: 'bg-gray-700', // Visited Cell
    5: 'bg-gray-800', // Visited Deadend
  }

  const CreateGrid = (size) => {
    const length = size * 2 - 1
    const grid = []

    for (let i = 0; i < length; i++) {
      grid.push(new Array())
    }

    grid.forEach((row, index) => {
      for (let i = 0; i < length; i++) {
        if (index % 2 === 0) row.push(i % 2 === 0 ? 0 : 1)
        else row.push(i % 2 === 0 ? 1 : 2)
      }
    })

    return grid
  }

  const StyleGridFractions = (matrixLength) => {
    let style = ''
    for (let i = 0; i < matrixLength; i++) {
      style += i % 2 === 0 ? '2fr' : '0.3fr'
      style += i !== matrixLength - 1 ? ' ' : ''
    }
    return style
  }

  const handleCellClick = (rowIndex, columnIndex, value) => {
    if (!maze) return
    if (mode !== 'setMouse' && mode !== 'setGoal') return

    if (rowIndex % 2 !== 0 || columnIndex % 2 !== 0) return
    if (![0, 4, 5].includes(value)) return

    const cellRow = rowIndex / 2
    const cellCol = columnIndex / 2

    if (mode === 'setMouse') {
      setMouseCell({ row: cellRow, col: cellCol })
    } else if (mode === 'setGoal') {
      setGoalCell({ row: cellRow, col: cellCol })
    }
  }

  const mapRow = (row, rowIndex) => {
    return (
      <div
        key={`row-${rowIndex}`}
        className="grid"
        style={{ gridTemplateColumns: StyleGridFractions(row.length) }}
      >
        {row.map((column, columnIndex) => {
          let cellClass = mazeDictionary[column]

          if (rowIndex % 2 === 0 && columnIndex % 2 === 0) {
            const cellRow = rowIndex / 2
            const cellCol = columnIndex / 2

            if (mouseCell && mouseCell.row === cellRow && mouseCell.col === cellCol) {
              cellClass = 'bg-green-400'
            } else if (goalCell && goalCell.row === cellRow && goalCell.col === cellCol) {
              cellClass = 'bg-red-500'
            }
          }

          return (
            <div
              key={`row-${rowIndex}_col-${columnIndex}`}
              className={`${cellClass} transition-colors duration-75`}
              onClick={() => handleCellClick(rowIndex, columnIndex, column)}
            ></div>
          )
        })}
      </div>
    )
  }

  const MapMatrix = (mazeToMap) => {
    return (
      <div className={`size-11/12 border-8 border-red-400`}>
        <div
          className="grid size-full"
          style={{ gridTemplateRows: StyleGridFractions(mazeToMap.length) }}
        >
          {mazeToMap.map((row, rowIndex) => mapRow(row, rowIndex))}
        </div>
      </div>
    )
  }

  const ChangeGridSize = (e) => {
    setCellCount(Number(e.target.value))
    if (maze) setMaze(null)
    setMouseCell(null)
    setGoalCell(null)
    setMode('idle')
  }

  const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const GenMaze = (grid) => {
    setIsGenerating(true)

    const mutableGrid = grid.map((row) => [...row])

    setMouseCell(null)
    setGoalCell(null)
    setMode('idle')

    const [row, col] = [
      Math.floor(Math.random() * cellCount),
      Math.floor(Math.random() * cellCount),
    ]

    const visited = []
    for (let i = 0; i < cellCount; i++) {
      visited.push(new Array())
      while (visited[i].length < cellCount) visited[i].push(false)
    }

    const IsInsideBounds = (coord, maxLength) =>
      !(coord[0] > maxLength) &&
      !(coord[1] > maxLength) &&
      !(coord[0] < 0) &&
      !(coord[1] < 0)

    const GetNeighbors = (row, col) => {
      let neighbors = [
        [row - 1, col],
        [row, col + 1],
        [row + 1, col],
        [row, col - 1],
      ]

      return neighbors.filter((coord) =>
        IsInsideBounds(coord, visited.length - 1),
      )
    }

    const ValidateNeighbors = (neighbors, visited) => {
      return neighbors.filter((coord) => visited[coord[0]][coord[1]] === false)
    }

    const RndNeighbor = (neighbors) => {
      const rndIndex = Math.floor(Math.random() * neighbors.length)
      return neighbors[rndIndex]
    }

    const GetWallPos = (row, col, newRow, newCol) => {
      let wallX = row * 2 + (newRow - row)
      let wallY = col * 2 + (newCol - col)
      return [wallX, wallY]
    }

    const GenMazeDFS = async (row, col, visited, mutableGrid) => {
      visited[row][col] = true

      if (visited.every((row) => row.every((col) => col === true))) return true

      let neighbors = ValidateNeighbors(GetNeighbors(row, col), visited)

      let backtrack = false
      let [newRow, newCol] = [-1, -1]

      do {
        if (backtrack) neighbors = ValidateNeighbors(neighbors, visited)

        if (neighbors.length === 0) return false

          ;[newRow, newCol] = RndNeighbor(neighbors)
        let [wallX, wallY] = GetWallPos(row, col, newRow, newCol)

        mutableGrid[wallX][wallY] = 3
        mutableGrid[row * 2][col * 2] = 4
        mutableGrid[newRow * 2][newCol * 2] = 5
        setMaze([...mutableGrid])
        await Sleep(20)

        backtrack = true
      } while (!(await GenMazeDFS(newRow, newCol, visited, mutableGrid)))
      return true
    }

    GenMazeDFS(row, col, visited, mutableGrid).then(() => {
      console.log('MazeGen Finished')
      setIsGenerating(false)
      setMode('idle')
    })
  }

  const SolveMaze = async () => {
    if (!maze || !mouseCell || !goalCell) {
      console.warn('Need maze, mouse, and goal to solve.')
      return
    }

    setMode('solving')

    const h = cellCount
    const w = cellCount

    const distances = Array.from({ length: h }, () => Array(w).fill(null))

    const inBounds = (r, c) => r >= 0 && r < h && c >= 0 && c < w

    const isBlocked = (r1, c1, r2, c2) => {
      const wallRow = r1 * 2 + (r2 - r1)
      const wallCol = c1 * 2 + (c2 - c1)
      const wallVal = maze[wallRow][wallCol]
      return wallVal !== 3
    }

    const dirs = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ]

    const queue = []
    queue.push([goalCell.row, goalCell.col])
    distances[goalCell.row][goalCell.col] = 0

    while (queue.length > 0) {
      const [r, c] = queue.shift()
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (!inBounds(nr, nc)) continue
        if (distances[nr][nc] !== null) continue
        if (isBlocked(r, c, nr, nc)) continue
        distances[nr][nc] = distances[r][c] + 1
        queue.push([nr, nc])
      }
    }

    if (distances[mouseCell.row][mouseCell.col] === null) {
      console.warn('No path from mouse to goal.')
      setMode('idle')
      return
    }

    const path = []
    let cr = mouseCell.row
    let cc = mouseCell.col
    path.push([cr, cc])

    while (distances[cr][cc] !== 0) {
      let next = null
      for (const [dr, dc] of dirs) {
        const nr = cr + dr
        const nc = cc + dc
        if (!inBounds(nr, nc)) continue
        if (distances[nr][nc] === null) continue
        if (distances[nr][nc] === distances[cr][cc] - 1 && !isBlocked(cr, cc, nr, nc)) {
          next = [nr, nc]
          break
        }
      }
      if (!next) break
        ;[cr, cc] = next
      path.push(next)
    }

    for (const [r, c] of path) {
      setMouseCell({ row: r, col: c })
      await Sleep(120)
    }

    setMode('idle')
  }

  const grid = CreateGrid(cellCount)

  const mainButtonLabel = maze
    ? 'Reset'
    : !isGenerating && "Create Maze"


  return (
    <>
      {/* Header */}
      <div className="h-screen bg-gray-700">
        <h1 className="bg-gray-800 p-10 text-center text-5xl font-bold text-white">
          Micromouse Simulator
        </h1>

        {/* Maze-Gen Panel Control */}
        <div className="flex justify-center gap-5">
          <input
            className="mt-10 flex border-4 border-blue-300 bg-gray-800 p-1.5 text-center text-3xl font-bold text-white outline-4 outline-black disabled:opacity-50"
            type="number"
            value={cellCount}
            onChange={(e) =>
              e.target.value <= 16 && e.target.value >= 2
                ? ChangeGridSize(e)
                : null
            }
            disabled={isGenerating || mode === 'solving'}
          />
          <button
            className="mt-10 flex border-4 border-blue-300 bg-gray-800 p-3 text-center text-2xl font-bold text-white outline-4 outline-black disabled:opacity-50"
            onClick={() => {
              if (isGenerating || mode === 'solving') return
              if (maze) {
                setMaze(null)
                setMouseCell(null)
                setGoalCell(null)
                setMode('idle')
              } else {
                GenMaze(grid)
              }
            }}
            disabled={isGenerating || mode === 'solving'}
          >
            {mainButtonLabel}
          </button>
        </div>

        {/* Maze Control Panel */}
        {maze && (
          <div className="mt-4 flex justify-center gap-4">
            <button
              className={`border-4 px-4 py-2 text-xl font-bold text-white outline-4 outline-black disabled:opacity-50 ${mode === 'setMouse'
                ? 'border-green-300 bg-green-700'
                : 'border-blue-300 bg-gray-800'
                }`}
              onClick={() => {
                if (isGenerating || mode === 'solving') return
                setMode((prev) => (prev === 'setMouse' ? 'idle' : 'setMouse'))
              }}
              disabled={isGenerating || mode === 'solving'}
            >
              Set Mouse
            </button>
            <button
              className={`border-4 px-4 py-2 text-xl font-bold text-white outline-4 outline-black disabled:opacity-50 ${mode === 'setGoal'
                ? 'border-red-300 bg-red-700'
                : 'border-blue-300 bg-gray-800'
                }`}
              onClick={() => {
                if (isGenerating || mode === 'solving') return
                setMode((prev) => (prev === 'setGoal' ? 'idle' : 'setGoal'))
              }}
              disabled={isGenerating || mode === 'solving'}
            >
              Set Goal
            </button>
            <button
              className="border-4 border-blue-300 bg-gray-800 px-4 py-2 text-xl font-bold text-white outline-4 outline-black disabled:opacity-50"
              onClick={SolveMaze}
              disabled={
                mode === 'solving' || isGenerating || !mouseCell || !goalCell
              }
            >
              Solve
            </button>
          </div>
        )}

        {/* Maze Display */}
        <div className="m-auto mt-10 size-150 border-8">
          <div className="flex size-full items-center justify-center border-8 border-blue-300">
            {MapMatrix(maze ? maze : grid)}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
