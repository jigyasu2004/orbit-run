export const TRACK_POINTS=480, ROAD_HALF=8.5, TOTAL_LAPS=3;
export type Point={x:number,z:number,s:number,tx:number,tz:number};
export const track:Point[]=[];
let distance=0;
for(let i=0;i<=TRACK_POINTS;i++){const a=i/TRACK_POINTS*Math.PI*2;const x=70*Math.cos(a)+12*Math.cos(2*a),z=52*Math.sin(a)+8*Math.sin(3*a);const dx=-70*Math.sin(a)-24*Math.sin(2*a),dz=52*Math.cos(a)+24*Math.cos(3*a);const len=Math.hypot(dx,dz);if(i)distance+=Math.hypot(x-track[i-1].x,z-track[i-1].z);track.push({x,z,s:distance,tx:dx/len,tz:dz/len})}
export const trackLength=distance;
export function pointAt(s:number,lane=0){s=((s%trackLength)+trackLength)%trackLength;let lo=0,hi=TRACK_POINTS;while(lo+1<hi){const m=(lo+hi)>>1;if(track[m].s<=s)lo=m;else hi=m}const a=track[lo],b=track[lo+1],f=(s-a.s)/(b.s-a.s);const tx=a.tx+(b.tx-a.tx)*f,tz=a.tz+(b.tz-a.tz)*f,n=Math.hypot(tx,tz);return {x:a.x+(b.x-a.x)*f+tz/n*lane,z:a.z+(b.z-a.z)*f-tx/n*lane,tx:tx/n,tz:tz/n,s}}
export function nearest(x:number,z:number){let best=Infinity,index=0;for(let i=0;i<TRACK_POINTS;i++){const d=(x-track[i].x)**2+(z-track[i].z)**2;if(d<best){best=d;index=i}}const p=track[index];return {index,s:p.s,lateral:(x-p.x)*p.tz-(z-p.z)*p.tx,distance:Math.sqrt(best),point:p}}
export type Car={name:string,color:number,x:number,z:number,heading:number,speed:number,steer:number,progress:number,lastS:number,lane:number,bot:boolean,finished:boolean,finishTime:number,offroad:boolean};
export function createCars():Car[]{return ['YOU','NOVA','APEX','DUST'].map((name,i)=>{const progress=-8-Math.floor(i/2)*6;const lane=i%2?2.3:-2.3,p=pointAt(progress,lane);return {name,color:[0xf36a32,0x43caca,0xf1d35a,0xa28adb][i],x:p.x,z:p.z,heading:Math.atan2(p.tx,p.tz),speed:0,steer:0,progress,lastS:p.s,lane,bot:i>0,finished:false,finishTime:0,offroad:false}})}
export function angleDiff(a:number,b:number){return Math.atan2(Math.sin(a-b),Math.cos(a-b))}
export type Input={throttle:number,steer:number,brake:boolean};
export function stepCar(car:Car,input:Input,dt:number,elapsed:number){
 if(car.finished)return;
 const previous=nearest(car.x,car.z);car.offroad=Math.abs(previous.lateral)>ROAD_HALF-1;
 const accel=input.throttle>=0?input.throttle*13:input.throttle*22;
 car.speed+=accel*dt;car.speed-=car.speed*(input.brake?2.4:car.offroad?.85:.09)*dt;
 if(!input.throttle)car.speed-=Math.sign(car.speed)*Math.min(Math.abs(car.speed),1.8*dt);
 car.speed=Math.max(-7,Math.min(car.bot?29:34,car.speed));
 car.steer+=(input.steer-car.steer)*Math.min(1,dt*8);
 const turn=car.steer*(.32+Math.min(Math.abs(car.speed),24)*.042)*Math.sign(car.speed);
 car.heading+=turn*dt;
 car.x+=Math.sin(car.heading)*car.speed*dt;car.z+=Math.cos(car.heading)*car.speed*dt;
 let n=nearest(car.x,car.z);
 if(Math.abs(n.lateral)>ROAD_HALF+1.1){const side=Math.sign(n.lateral);car.x=n.point.x+n.point.tz*side*(ROAD_HALF+1.05);car.z=n.point.z-n.point.tx*side*(ROAD_HALF+1.05);car.speed*=.83;const tangent=Math.atan2(n.point.tx,n.point.tz);car.heading+=angleDiff(tangent,car.heading)*.12;n=nearest(car.x,car.z)}
 let delta=n.s-car.lastS;if(delta>trackLength/2)delta-=trackLength;if(delta< -trackLength/2)delta+=trackLength;
 // Bound progress to physical travel. Reverse driving subtracts distance.
 if(Math.abs(delta)<8)car.progress+=delta;car.lastS=n.s;
 if(car.progress>=TOTAL_LAPS*trackLength){car.finished=true;car.finishTime=elapsed;car.speed=0}
}
export function botInput(car:Car,index:number):Input{const n=nearest(car.x,car.z);const look=pointAt(n.s+9+Math.abs(car.speed)*.4,car.lane);const target=Math.atan2(look.x-car.x,look.z-car.z);const error=angleDiff(target,car.heading);const ahead=pointAt(n.s+28);const bend=Math.abs(angleDiff(Math.atan2(ahead.tx,ahead.tz),Math.atan2(n.point.tx,n.point.tz)));const desired=25.5-index*.8-Math.min(9,bend*13);return {throttle:car.speed<desired?1:0,steer:Math.max(-1,Math.min(1,error*2.4)),brake:car.speed>desired+3}}
export function resolveCars(cars:Car[]){for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j];if(a.finished||b.finished)continue;let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<2.5){if(d<.001){dx=1;dz=0;d=1}const push=(2.5-d)/2;dx/=d;dz/=d;a.x-=dx*push;a.z-=dz*push;b.x+=dx*push;b.z+=dz*push;const va=a.speed,vb=b.speed;a.speed=va*.94+vb*.03;b.speed=vb*.94+va*.03}}}
export function recover(car:Car){const p=pointAt(car.progress,0);car.x=p.x;car.z=p.z;car.heading=Math.atan2(p.tx,p.tz);car.speed=0;car.steer=0;car.lastS=p.s}
export function positionOf(car:Car,cars:Car[]){return [...cars].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:b.progress-a.progress).indexOf(car)+1}
