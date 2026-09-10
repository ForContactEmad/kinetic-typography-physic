const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;

const engine = Engine.create();
const container = document.getElementById('canvas-container');

const render = Render.create({
  element: container,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: '#0d0e15'
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

let boundaries = [];
function createBoundaries() {
  Composite.remove(engine.world, boundaries);
  const thickness = 100;
  const w = window.innerWidth;
  const h = window.innerHeight;

  boundaries = [
    Bodies.rectangle(w / 2, h + thickness / 2, w, thickness, { isStatic: true }),
    Bodies.rectangle(-thickness / 2, h / 2, thickness, h, { isStatic: true }),
    Bodies.rectangle(w + thickness / 2, h / 2, thickness, h, { isStatic: true })
  ];

  Composite.add(engine.world, boundaries);
}
createBoundaries();

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: { visible: true, strokeStyle: '#6366f1' }
  }
});
Composite.add(engine.world, mouseConstraint);
render.mouse = mouse;

let letterBodies = [];

function spawnText(text) {
  letterBodies.forEach(body => Composite.remove(engine.world, body));
  letterBodies = [];

  const cleanText = text.trim().toUpperCase() || 'KINETIC';
  const fontSize = Math.min(window.innerWidth / (cleanText.length * 0.9), 80);
  const letterSpacing = fontSize * 0.8;
  const startX = (window.innerWidth - (cleanText.length * letterSpacing)) / 2 + (letterSpacing / 2);
  const startY = 150;

  cleanText.split('').forEach((char, index) => {
    if (char === ' ') return;

    const x = startX + (index * letterSpacing);
    const y = startY + (Math.random() * 20 - 10);

    const letterCanvas = document.createElement('canvas');
    letterCanvas.width = fontSize * 1.3;
    letterCanvas.height = fontSize * 1.3;
    const ctx = letterCanvas.getContext('2d');

    ctx.fillStyle = '#6366f1';
    ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, letterCanvas.width / 2, letterCanvas.height / 2);

    const letterBody = Bodies.rectangle(x, y, fontSize * 0.7, fontSize * 0.9, {
      restitution: 0.8,
      friction: 0.1,
      density: 0.01,
      render: {
        sprite: {
          texture: letterCanvas.toDataURL(),
          xScale: 1,
          yScale: 1
        }
      }
    });

    letterBodies.push(letterBody);
  });

  Composite.add(engine.world, letterBodies);
}

document.getElementById('spawnBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value;
  spawnText(text);
});

document.getElementById('explodeBtn').addEventListener('click', () => {
  letterBodies.forEach(body => {
    const forceMagnitude = 0.05 * body.mass;
    Body.applyForce(body, body.position, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: -Math.random() * forceMagnitude * 2
    });
  });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value;
  spawnText(text);
});

window.addEventListener('resize', () => {
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
  createBoundaries();
});

spawnText('MATTER');
