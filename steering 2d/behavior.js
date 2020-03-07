import Vector from './Vector2D.js'
import Vehicle from './Vehicle.js';

let canvas;
let ctx;


window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    var raf;

    var v = new Vehicle(100,100,ctx)
    v.update()
    

    var ball = {
        vectorBall : new Vector(100,100),
        radius: 25,
        color: 'blue',
        draw: function () {
            ctx.beginPath();
            ctx.arc(this.vectorBall.x, this.vectorBall.y, this.radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    };

    
    document.addEventListener("mousemove",()=>{move(ball,event)})

    const move = (ball,event)=>{
        ball.vectorBall.x=event.x
        ball.vectorBall.y= event.y
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        v.seek(ball.vectorBall)
        ball.draw();
        v.update();
        v.draw()
        raf = window.requestAnimationFrame(draw);
    }

    canvas.addEventListener('mouseover', function (e) {
        raf = window.requestAnimationFrame(draw);
    });

    canvas.addEventListener("mouseout", function (e) {
        window.cancelAnimationFrame(raf);
    });

    ball.draw();
}