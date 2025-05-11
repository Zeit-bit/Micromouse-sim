const App = () => {
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

  const mapColumn = (row, index) => {
    return row.map((column, cIndex) =>
      index % 2 === 0 ? (
        <div
          key={`row-${row}_col-${cIndex}`}
          className={`h-12 ${(cIndex % 2 === 0 ? 'w-12 ' : 'w-2 ') + mazeDictionary[column]}`}
        ></div>
      ) : (
        <div
          key={`row-${row}_col-${cIndex}`}
          className={`h-2 ${(cIndex % 2 === 0 ? 'w-12 ' : 'w-2 ') + mazeDictionary[column]}`}
        ></div>
      ),
    )
  }

  const MapMaze = (maze) => {
    return (
      <div className={`border-8 border-red-400`}>
        {maze.map((row, index) => (
          <div className="flex" key={`row-${index}`}>
            {mapColumn(row, index)}
          </div>
        ))}
      </div>
    )
  }

  const cellCount = 5
  let maze = CreateGrid(cellCount)

  return (
    <div className="m-auto mt-10 size-92 border-8">
      <div className="flex size-full items-center justify-center border-8 border-blue-300">
        {MapMaze(maze)}
      </div>
    </div>
  )
}

export default App
