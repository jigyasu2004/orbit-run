import assert from 'node:assert/strict';
import {createCars,stepCar,botInput,resolveCars,trackLength,recover,nearest,ROAD_HALF,positionOf} from '../app/race/simulation.ts';
const cars=createCars();for(const c of cars)c.bot=true;
for(let i=0;i<60*180;i++){for(let j=0;j<4;j++)stepCar(cars[j],botInput(cars[j],j),1/60,i/60);resolveCars(cars);if(cars.every(c=>c.finished))break}
console.log(cars.map(c=>({name:c.name,laps:c.progress/trackLength,finish:c.finishTime})));
assert(cars.every(c=>c.finished),'All bots must finish 3 laps');
const player=createCars()[0];for(let i=0;i<60;i++)stepCar(player,{throttle:1,steer:0,brake:false},1/60,i/60);assert(player.speed>10,'Throttle accelerates');for(let i=0;i<90;i++)stepCar(player,{throttle:0,steer:0,brake:true},1/60,i/60);assert(player.speed<.5,'Brake stops car');
const oldProgress=player.progress;player.x+=100;recover(player);assert(nearest(player.x,player.z).distance<1,'Recover places player on track');assert.equal(player.progress,oldProgress,'Recovery cannot add laps');
const reverse=createCars()[0];reverse.speed=-6;for(let i=0;i<60;i++)stepCar(reverse,{throttle:-.2,steer:0,brake:false},1/60,i/60);assert(reverse.progress< -8,'Reverse travel subtracts lap progress');
const collision=createCars();collision[1].x=collision[0].x;collision[1].z=collision[0].z;resolveCars(collision);assert(Math.hypot(collision[0].x-collision[1].x,collision[0].z-collision[1].z)>1,'Overlapping cars separate');assert(positionOf(cars[0],cars)>=1);
console.log('PASS: bots complete 3 laps, acceleration, braking, reverse lap tracking, recovery, and car separation.');
