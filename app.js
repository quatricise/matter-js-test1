
let canvasContainer = document.querySelector('#canvas-container')
let canvasContainer2 = document.querySelector('#canvas-container2')
let addRectangleBtn = document.querySelector('#add-rectangle')
addRectangleBtn.onclick = function(){
    let rect = Bodies.rectangle(Math.round(Math.random()*cw), 50, 50, 50)
    Composite.add(engine.world, [rect])
}
const PI = Math.PI
let lastTimestamp = Date.now()

let pressedW = false
let pressedA = false
let pressedS = false
let pressedD = false
// let canvasFg =  document.querySelector('#canvas-fg');
// let fctx = canvasFg.getContext('2d')
// let contexts = []
// contexts.push(fctx)

// let canvases = []
// canvases.push(canvasFg)
// canvases.forEach(canvas => {
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
// })

let cw = window.innerWidth
let ch = window.innerHeight

let groundLevel = 200

window.onresize = () => {
    // canvasFg.width = window.innerWidth
    // canvasFg.height = window.innerHeight
    cw = window.innerWidth
    ch = window.innerHeight
  
  
}

// module aliases
let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    Body = Matter.Body,
    MouseConstraint = Matter.MouseConstraint;

// create an engine
let engine = Engine.create({
    gravity: {
        x: 0,
        y: 0,
    }
});

let engine2 = Engine.create({
    gravity: {
        x: 0,
        y: 0,
    }
});
// create a renderer
let render = Render.create({
    element: canvasContainer,
    engine: engine,
    options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: 'transparent',
    }
});
let render2 = Render.create({
    element: canvasContainer2,
    engine: engine2,
    options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: 'blue',
    }
});

let mouse = Mouse.create(render.canvas)
let mouseConstraint = MouseConstraint.create(engine,{
    mouse: mouse,
    constraint: {
        render: {visible: false}
    }
})
render.mouse = mouse

let objects = [];
let ballProperties = {
    x: 200,
    y: ch/2,
    rad: 25,
    mass: 1000,
    friction: 0.01,
}
let ball = Bodies.circle(ballProperties.x, ballProperties.y, ballProperties.rad,{ mass: ballProperties.mass, friction: ballProperties.friction})
let sling = Matter.Constraint.create({
    pointA: {x: ballProperties.x, y: ballProperties.y},
    bodyB: ball,
    stiffness: 0.05,
})

let oldBalls = []



let firing = false;
Matter.Events.on(mouseConstraint, 'enddrag',function(e) {
    if(e.body === ball) firing = true
})
Matter.Events.on(engine,'afterUpdate', function() {
    if(firing && Math.abs(ball.position.x - ballProperties.x) < 20 && Math.abs(ball.position.y - ballProperties.y) < 20) {
        oldBalls.push(ball)
        ball = Bodies.circle(ballProperties.x,ballProperties.y,ballProperties.rad)
        Composite.add(engine.world,ball)
        sling.bodyB = ball
        firing = false
    }
})

let ground = Bodies.rectangle(cw/2, ch - groundLevel/2, cw, groundLevel, { 
    isStatic: true, 
    friction: 0.01, 
    render: {
        fillStyle: 'blue'
    }
});

let wallL = Bodies.rectangle(-50, ch/2, 100, ch, {
    isStatic: true, 
})
let wallR = Bodies.rectangle(cw + 50, ch/2, 100, ch, {
    isStatic: true, 
})

let stack = Composites.stack(cw - 400,0,4,4,10,10, function(x,y) {
    let sides = Math.round(Math.random()*6 + 3)
    return Bodies.polygon(x,y,sides,25)
})




class Ship {
    constructor() {
        this.body = Bodies.circle(cw/2,ch/2,25,{
            render: {
                fillStyle: 'red'
            }
        })
    }
    steer() {
        if(pressedA) {
            Body.rotate(this.body, -1 * PI/180)
        }
        if(pressedD) {
            Body.rotate(this.body, 1 * PI/180)
        }
    }
    accelerate(dt) {
        //simple bad code to test this
        if(pressedW) {
            this.body.position.y -= 10 * dt
        }
        if(pressedS) {
            this.body.position.y += 10 * dt
        }
    }
    update(dt) {
        this.steer()
        this.accelerate(dt)
    }
}

let ship = new Ship()

objects.push(stack)

// setup some stack constraints

function createConstraintsForStack(stack) {
    let stackConstraints = [];
    for (let i = 0; i < stack.bodies.length - 1; i++) {
        stackConstraints.push(Matter.Constraint.create({
            bodyA: stack.bodies[i],
            bodyB: stack.bodies[i+1],
            stiffness: 0.05,
            damping: 0.1,
            length: 100,
            render: {
                visible: false
            },
        }))
        
    }
    return stackConstraints
}

let stackConstraints = createConstraintsForStack(stack)

stackConstraints.forEach(constr=> {
    Composite.add(engine.world, constr)
})

let stack2 = Composites.stack(cw - 400,0,4,4,10,10, function(x,y){
    
    let sides = Math.round(Math.random()*6 + 3)
    return Bodies.polygon(x,y,sides,25)
})
objects.push(stack2)
let stackConstraints2 = createConstraintsForStack(stack2)
stackConstraints2.forEach(constr=> {
    Composite.add(engine2.world, constr)
})

Composite.add(engine.world, [ stack, ball, sling, wallL, wallR, mouseConstraint, ship.body ]);


Composite.add(engine2.world,[stack2])

// run the renderer
Render.run(render);
Render.run(render2);

// // create runner
// let runner = Runner.create();
// let runner2 = Runner.create();

// // run the engine
// Runner.run(runner, engine);
// Runner.run(runner2, engine2);
// Runner.stop(runner)

function draw() {
    //set delta-time
    var now = Date.now()
    var dt = (now - lastTimestamp) / 1000
    lastTimestamp = now
    //update
    Engine.update(engine, dt)
    Engine.update(engine2, dt)
    ship.update(dt)

    requestAnimationFrame(draw)
}

draw()

document.addEventListener('keydown', (e)=> {
    if(e.code == 'KeyW') {
        pressedW = true
    }
    if(e.code == 'KeyA') {
        pressedA = true
    }
    if(e.code == 'KeyS') {
        pressedS = true
    }
    if(e.code == 'KeyD') {
        pressedD = true
    }
})
document.addEventListener('keyup', (e)=> {
    if(e.code == 'KeyW') {
        pressedW = false
    }
    if(e.code == 'KeyA') {
        pressedA = false
    }
    if(e.code == 'KeyS') {
        pressedS = false
    }
    if(e.code == 'KeyD') {
        pressedD = false
    }
})