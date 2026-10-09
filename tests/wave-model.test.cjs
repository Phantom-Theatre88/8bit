'use strict';
const assert=require('node:assert/strict'),m=require('../wave-model.js');
function near(a,b,t=1e-6){assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);}
near(m.sine(100,50,5),100*Math.SQRT2);near(m.sine(100,50,15),-100*Math.SQRT2);
near(m.period(50),20);near(m.period(60),1000/60);near(m.angle(50,5),90);
near(m.dimRms(0),100);near(m.dimRms(90),100/Math.SQRT2);near(m.dimRms(180),0);
for(const hz of [50,60])for(const alpha of [0,30,90,150,180]){
 let sum=0,n=100000;for(let i=0;i<n;i++)sum+=m.dimmed(hz,(i+.5)*m.period(hz)/n,alpha)**2;
 near(Math.sqrt(sum/n),m.dimRms(alpha),.004);
}
assert.equal(m.conducting(50,1,90),false);assert.equal(m.conducting(50,6,90),true);
assert.equal(m.conducting(50,11,90),false);assert.equal(m.conducting(50,16,90),true);
console.log('PASS: RMS, peaks, periods and phase-cut model for 50/60Hz');
