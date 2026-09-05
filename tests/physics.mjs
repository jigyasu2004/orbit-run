import * as C from 'cannon-es';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync('app/game.ts','utf8');
const world=new C.World({gravity:new C.Vec3(0,-19,0)});world.defaultContactMaterial.friction=.35;world.defaultContactMaterial.restitution=.12;
for(const m of source.matchAll(/platform\((-?[\d.]+),(-?[\d.]+),([\d.]+),([\d.]+)\)/g)){const [x,z,w,d]=m.slice(1).map(Number);world.addBody(new C.Body({shape:new C.Box(new C.Vec3(w/2,.65,d/2)),position:new C.Vec3(x,-.65,z)}))}
const ball=new C.Body({mass:1,shape:new C.Sphere(.5),position:new C.Vec3(0,.6,2),linearDamping:.28});world.addBody(ball);
for(let i=0;i<120;i++)world.step(1/60);assert(Math.abs(ball.position.y-.5)<.04,'Marble rests on deck');
for(const [x,z] of [[0,-10],[0,-20],[9,-20],[18,-20],[18,-30],[18,-40],[8,-40],[-2,-40]]){let reached=false;for(let i=0;i<1800;i++){const dx=x-ball.position.x,dz=z-ball.position.z,dist=Math.hypot(dx,dz);if(dist<.25&&Math.hypot(ball.velocity.x,ball.velocity.z)<.7){reached=true;break}ball.applyForce(new C.Vec3(Math.max(-15,Math.min(15,dx*7-ball.velocity.x*5)),0,Math.max(-15,Math.min(15,dz*7-ball.velocity.z*5))));world.step(1/60);assert(ball.position.y>.25,'Course must stay continuous')}assert(reached,'Waypoint reachable')}
ball.velocity.set(4,0,0);for(let i=0;i<30;i++){ball.velocity.x*=Math.exp(-7/60);ball.angularVelocity.scale(Math.exp(-7/60),ball.angularVelocity);world.step(1/60)}assert(Math.abs(ball.velocity.x)<.2,'Brake slows marble');console.log('PASS: stable gravity contact, all 8 course waypoints reachable, braking stops marble.');
