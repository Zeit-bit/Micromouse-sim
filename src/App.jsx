import { useState } from 'react'

const App = () => {
  const [cellCount, setCellCount] = useState(4)
  // 0 = Empty cell
  // 1 = Wall
  // 2 = Wall-Joints
  const mazeDictionary = {
    0: 'bg-gray-800',
    1: 'bg-black',
    2: 'bg-red-400',
  }

  const CreateGrid = (size) => {
    // The lenght of the matriz = cell count + the wall in betweens
    const length = size * 2 - 1
    const grid = []

    // Pushes the 'length' amount of new arrays into the grid
    for (let i = 0; i < length; i++) {
      grid.push(new Array())
    }

    // for each row (array) in the grid
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
    console.log(style)
    return style
  }

  const mapColumn = (row, rowIndex) => {
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
    return (
      <div className={`size-11/12 border-8 border-red-400`}>
        <div
          className="grid size-full"
          style={{ gridTemplateRows: StyleGridFractions(maze.length) }}
        >
          {maze.map((row, rowIndex) => mapColumn(row, rowIndex))}
        </div>
      </div>
    )
  }

  let maze = CreateGrid(cellCount)

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
            {MapMaze(maze)}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
