/* Ideal sine-wave teaching model: volts RMS, milliseconds, degrees. */
(function(root){
  'use strict';
  const TAU=2*Math.PI;
  function sine(rms,hz,ms,offset=0){return Math.SQRT2*rms*Math.sin(TAU*hz*ms/1000+offset);}
  function period(hz){return 1000/hz;}
  function angle(hz,ms){return ((ms*hz*360/1000)%360+360)%360;}
  function conducting(hz,ms,alpha){const half=angle(hz,ms)%180;return alpha<180&&half+1e-8>=alpha;}
  function dimmed(hz,ms,alpha){return conducting(hz,ms,alpha)?sine(100,hz,ms):0;}
  function dimRms(alpha){const a=alpha*Math.PI/180;return 100*Math.sqrt(Math.max(0,(Math.PI-a+Math.sin(2*a)/2)/Math.PI));}
  const api={sine,period,angle,conducting,dimmed,dimRms};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.WaveModel=api;
})(typeof globalThis==='object'?globalThis:this);
