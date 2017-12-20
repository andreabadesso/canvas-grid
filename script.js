let grid, currentBox
let editing = false
let editGrid = []
let elements = []
let canvas = document.querySelector('canvas')
let wrapper = document.querySelector('.wrapper')
let context = canvas.getContext('2d')
let body = document.querySelector('body')

let height = wrapper.offsetHeight
let width = wrapper.offsetWidth

let itemSize = width / 4 
let gridYSize = Math.ceil(height / itemSize)

wrapper.style.height = (gridYSize * itemSize) + 'px'

canvas.height = gridYSize * itemSize
canvas.width = width
canvas.addEventListener('mousedown', (event) => {
    let all = _.flatten(elements)
    let clicked = getClickedObj(all, event)

    if (clicked.length > 0) {
        let existing = _.first(clicked)
        console.log('clicked existing => ', existing)

        handleExistingBox(existing)
    } else {
        let empty = getClickedObj(grid, event)
        console.log('clicked empty => ', _.first(empty))

        handleEmptyBox(_.first(empty))
    }
}, false)

function setEditMode() {
    editing = true
    drawGrid()
}

function getNewButton() {
    console.log(currentBox)
}

function handleEmptyBox(empty) {
    if (editing) {
        if (editGrid.length > 0 && editGrid.indexOf(empty) < 0) {
            return false
        }
    }

    if (!currentBox) {
        currentBox = [empty]
        elements.push(currentBox)
    } else {
        currentBox.push(empty)
    }

    editGrid = getNeighbors(empty)
    console.log(editGrid)

    drawGrid()
}

function handleExistingBox(existing) {
    if (currentBox) {
        let idx = currentBox.indexOf(existing)

        if (idx > -1) {
            currentBox.splice(idx, 1)
        }
    }

    if (currentBox.length > 0) {
        editGrid = getNeighbors(currentBox[currentBox.length-1])
    } else {
        editGrid = []
    }

    drawGrid()
}

function getClickedObj(stack, event) {
    let x, y

    if (event.pageX || event.pageY) { 
      x = event.pageX;
      y = event.pageY;
    } else { 
      x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return stack.filter((element) => {
        let coords = _.map(getCoords(element), x => x*itemSize)

        if (x >= coords[0] && x <= coords[0] + itemSize) {
            if (y >= coords[1] && y <= coords[1] + itemSize) {
                return true
            }
        }

        return false
    })
}

function getNeighbors(item) {
    let x = item % 4
    let y = Math.floor(item / 4)

    let top = ((4 * y) + x) - 4
    let bottom = ((4 * y) + x) + 4
    let left = (4 * y) + (x - 1)
    let right = (4 * y) + (x + 1)

    let all = _.flatten(elements)

    // Checking for boundaries
    if (getCoords(item)[1] !== getCoords(left)[1]) left = false
    if (getCoords(item)[1] !== getCoords(right)[1]) right = false
    if (getCoords(item)[0] !== getCoords(top)[0]) top = false

    // Check for existing blocks
    if (all.indexOf(top) > -1) top = false
    if (all.indexOf(bottom) > -1) bottom = false
    if (all.indexOf(right) > -1) right = false
    if (all.indexOf(left) > -1) left = false
    
    let neighbors = []

    if (top) neighbors.push(top)
    if (bottom) neighbors.push(bottom)
    if (left) neighbors.push(left)
    if (right) neighbors.push(right)

    return neighbors
}

function getCoords(point) {
    let x = point % 4
    let y = Math.floor(point / 4)

    return [x, y]
}

function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height)

    let all = _.flatten(elements)
    let grid = []

    for (let y = 0; y <= gridYSize; y++) {
        for (let x = 0; x <= 3; x++) {
            grid.push((4 * y) + x)
        }
    }

    let remaining = _.difference(grid, all)

    context.strokeStyle = '#FF0000'
    
    function drawRemaining() {
        remaining.forEach((item) => {
            let x = item % 4 * itemSize
            let y = Math.floor(item / 4) * itemSize

            context.strokeRect(x + 8, y + 8, itemSize - 16, itemSize - 16)
        })
    }

    if (editing) {
        if (editGrid.length > 0) {
            editGrid.forEach((item) => {
                let coords = getCoords(item)
                let x = coords[0] * itemSize
                let y = coords[1] * itemSize
                console.log(x, y)
                context.strokeRect(x + 8, y + 8, itemSize - 16, itemSize - 16)
            })
        } else {
            drawRemaining()
        }
    }

    elements.forEach((button) => {
        button.forEach((item) => {
            let x = (item % 4) * itemSize
            let y = Math.floor(item / 4) * itemSize
            let parents = hasParents(button, item)

            let width = itemSize
            let height = itemSize

            if (!parents.bottom) {
                height -= 8
            }

            if (!parents.top) {
                height -= 8
            }

            if (!parents.right) {
                width -= 8
            }

            if (!parents.left) {
                width -= 8
                x += 8
            }

            if (!parents.top) {
                y += 8
            }

            context.fillRect(x, y, width, height);
        })
    })

    return grid
}

function hasParents(grid, element) {
    let x = element % 4
    let y = Math.floor(element / 4)

    let hasRight = false
    let hasTop = false

    let parentX = (4 * y) + (x + 1)
    let parentXLeft = (4 * y) + (x - 1)
    let parentY = element - 4
    let parentYBottom = element + 4

    hasRight = grid.indexOf(parentX) > -1
    hasLeft = grid.indexOf(parentXLeft) > -1
    hasTop = grid.indexOf(parentY) > -1
    hasBottom = grid.indexOf(parentYBottom) > -1

    return {
        top: hasTop,
        right: hasRight,
        left: hasLeft,
        bottom: hasBottom
    }
}

grid = drawGrid()
