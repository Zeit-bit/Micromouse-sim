import { useState } from 'react'

const App = () => {
  const [cellCount, setCellCount] = useState(4)

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

  const GenMaze = () => {
    // Get random pos for first unvisited cell
    const [x, y] = [
      Math.floor(Math.random() * (cellCount - 1)),
      Math.floor(Math.random() * (cellCount - 1)),
    ]

    // Log initial coordinates
    console.log('Initial-Coords', [x, y])

    // Create matrix of cellCount length for marking visited cells
    const visited = []
    for (let i = 0; i < cellCount; i++) {
      visited.push(new Array())
      while (visited[i].length < cellCount) visited[i].push(false)
    }

    // Function to validate that neighbors' coordinates are inside the bounds of the matrix
    const InsideBounds = (coord, maxLength) =>
      !(coord[0] > maxLength) &&
      !(coord[1] > maxLength) &&
      !(coord[0] < 0) &&
      !(coord[1] < 0)

    /*
    GenMazeDFS-PseudoCode

    GenMazeDFS = (x,y,visited,grid) => {
      visited[x][y] === true
      if (all visited) return true

      neighbors = GetNeighborsAndFilter(x,y,visited)

      let backtrack = false
      let [newX, newY] = [-1, -1]

      do {
        if (backtrack) neighbors = removeNeighbor(newX, newY)
        if (cellNeighbors === 0) return false
        [newX, newY] = rndNeighborCell(neighbors)
        [wallX, wallY] = GetWallPos(x,y,newX,newY)
        grid[wallX][wallY] === 0

      } while !GenMazeDFS(mewX, newY, visited, grid) {

      return true
    }
    */
  }

  const grid = CreateGrid(cellCount)

  return (
    <>
      <div className="h-screen bg-gray-700">
        <h1 className="bg-gray-800 p-10 text-center text-5xl font-bold text-white">
          Micromouse Simulator
        </h1>
        <input
          className="m-auto mt-10 flex border-4 border-blue-300 bg-gray-800 p-1.5 text-center text-3xl font-bold text-white outline-4 outline-black"
          type="number"
          value={cellCount}
          onChange={(e) =>
            e.target.value <= 16 && e.target.value >= 2
              ? setCellCount(e.target.value)
              : null
          }
        ></input>
        <div className="m-auto mt-10 size-150 border-8">
          <div className="flex size-full items-center justify-center border-8 border-blue-300">
            {MapMaze(grid)}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
