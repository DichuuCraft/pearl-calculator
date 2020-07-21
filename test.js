'use strict';

const pearl = require('./pearl');
const { Vec3, Pearl } = pearl;

const w = new pearl.World();
let laun = w.createTntLauncher(
    new Pearl(new Vec3(8.5, 5.5, -87.5), new Vec3(0, -0.03, 0)), 
    new Vec3(8.5, 5, -85.9), 
    new Vec3(6.698021043924987, 5, -85.49000000953674)
);

console.log(laun.getInitialVelocity(1, 1));
// [0.2527618522456264d, 0.7276212347868034d, -0.967150836666516d]

var t = w.createPearlTrajectory(new Vec3(8.5, 5.5, -87.5), new Vec3(0.427071, 0.423162, -1.210505));

for (let i = 1; i <= 94; i++){
    console.log(`t = ${i}: `, t.getPosition(i));
}