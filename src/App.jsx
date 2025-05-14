import { useState } from 'react'

const App = () => {
  const [cellCount, setCellCount] = useState(4)
  const [maze, setMaze] = useState(null)
  const mazeDictionary = {
    0: 'bg-gray-800', // Empty cell
    1: 'bg-black', // Wall
    2: 'bg-red-400', // Wall-Joints
  }

  const CreateGrid = (size) => {
    // The lenght of the matrix = cell count + the wall in betweens
    const length = size * 2 - 1
    const grid = []

    // Pushes the 'length' amount of new arrays into the grid
    for (let i = 0; i < length; i++) {
      grid.push(new Array())
    }

    // For each row (array) in the grid
    // we push the corresponding values for empty cells or walls
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

  const mapRow = (row, rowIndex) => {
    // Returns a div that contains all elements of each column
    // inside of the current row, and assigns styles accordingly
    return (
      <div
        key={`row-${rowIndex}`}
        className="grid"
        style={{ gridTemplateColumns: StyleGridFractions(row.length) }}
      >
        {row.map((column, columnIndex) => (
          <div
            key={`row-${row}_col-${columnIndex}`}
            className={mazeDictionary[column]}
          ></div>
        ))}
      </div>
    )
  }

  const MapMaze = (maze) => {
    // Returns a div that wraps another div containing all rows
    // of the maze matrix (each row, already mapped and styled)
    return (
      <div className={`size-11/12 border-8 border-red-400`}>
        <div
          className="grid size-full"
          style={{ gridTemplateRows: StyleGridFractions(maze.length) }}
        >
          {maze.map((row, rowIndex) => mapRow(row, rowIndex))}
        </div>
      </div>
    )
  }

  const ChangeGridSize = (e) => {
    setCellCount(e.target.value)
    if (maze) setMaze(null)
  }

  const GenMaze = (grid) => {
    // Creating a copy of the grid to mutate over it
    const mutableGrid = grid.map((row) => [...row])

    // Get random pos for first unvisited cell
    const [x, y] = [
      Math.floor(Math.random() * (cellCount - 1)),
      Math.floor(Math.random() * (cellCount - 1)),
    ]

    // Create matrix of cellCount length for marking visited cells
    const visited = []
    for (let i = 0; i < cellCount; i++) {
      visited.push(new Array())
      while (visited[i].length < cellCount) visited[i].push(false)
    }

    // Function that generates a maze using backtracking (DFS)
    const GenMazeDFS = (x, y, visited, mutableGrid) => {
      // We always get an unvisited position here
      visited[x][y] = true

      // Return true when all cells are visited (to stop new function calls and end the recursive function)
      if (visited.every((row) => row.every((column) => column === true)))
        return true

      // Creation of a list of coordinates that correspond to neighboring cells of the current cell
      let neighbors = GetNeighborsAndFilter(x, y, visited)

      // Flag to indicate if the current call has been backtracked
      let backtrack = false

      // Declartion of the positions of the new Cell (to update them later when backtracking)
      let [newX, newY] = [-1, -1]

      do {
        // If we have backtracked, we remove the coordinates of the neighbor from which we backtracked
        if (backtrack) neighbors = RemoveNeighbor(neighbors, newX, newY)

        // If there are no more neighbors we return false to backtrack
        if (neighbors.length === 0)
          return false

          // Assign random positions to the new cell (based on the current neighbors)
        ;[newX, newY] = RndNeighbor(neighbors)

        // Get the correponding position of the wall to remove
        let [wallX, wallY] = GetWallPos(x, y, newX, newY)

        // Removing the wall
        mutableGrid[wallX][wallY] = 0

        // We flag backtrack to true, so that if it backtracks, we can update variables accordingly
        backtrack = true
      } while (!GenMazeDFS(newX, newY, visited, mutableGrid)) // Runs until all cells are visited

      // Setting the maze so that react can render it
      setMaze(mutableGrid)
      return true
    }

    // Helper functions
    const IsInsideBounds = (coord, maxLength) =>
      !(coord[0] > maxLength) &&
      !(coord[1] > maxLength) &&
      !(coord[0] < 0) &&
      !(coord[1] < 0)

    const GetNeighborsAndFilter = (x, y, visited) => {
      let neighbors = [
        [x - 1, y],
        [x, y + 1],
        [x + 1, y],
        [x, y - 1],
      ]
      neighbors = neighbors.filter((coord) =>
        IsInsideBounds(coord, visited.length - 1),
      )
      neighbors = neighbors.filter(
        (coord) => visited[coord[0]][coord[1]] === false,
      )
      return neighbors
    }

    const RemoveNeighbor = (neighbors, newX, newY) => {
      return neighbors.filter(
        (coord) => JSON.stringify(coord) !== JSON.stringify([newX, newY]),
      )
    }

    const RndNeighbor = (neighbors) => {
      const rndIndex = Math.floor(Math.random() * (neighbors.length - 1))
      return neighbors[rndIndex]
    }

    const GetWallPos = (x, y, newX, newY) => {
      let wallX = x * 2 + (newX - x)
      let wallY = y * 2 + (newY - y)
      return [wallX, wallY]
    }

    // Calling the DFS maze generation function
    GenMazeDFS(x, y, visited, mutableGrid)
  }

  const grid = CreateGrid(cellCount)

  return (
    <>
      <div className="h-screen bg-gray-700">
        <h1 className="bg-gray-800 p-10 text-center text-5xl font-bold text-white">
          Micromouse Simulator
        </h1>
        <div className="flex justify-center gap-5">
          <input
            className="mt-10 flex border-4 border-blue-300 bg-gray-800 p-1.5 text-center text-3xl font-bold text-white outline-4 outline-black"
            type="number"
            value={cellCount}
            onChange={(e) =>
              e.target.value <= 16 && e.target.value >= 2
                ? ChangeGridSize(e)
                : null
            }
          ></input>
          <button
            className="mt-10 flex border-4 border-blue-300 bg-gray-800 p-3 text-center text-2xl font-bold text-white outline-4 outline-black"
            onClick={() => (!maze ? GenMaze(grid) : setMaze(null))}
          >
            {!maze ? 'Create Maze' : 'Reset'}
          </button>
        </div>
        <div className="m-auto mt-10 size-150 border-8">
          <div className="flex size-full items-center justify-center border-8 border-blue-300">
            {!maze ? MapMaze(grid) : MapMaze(maze)}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
