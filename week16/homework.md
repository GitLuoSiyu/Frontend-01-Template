```javascript
export class TimeLine {
  constructor() {
    this.animations = [];
    this.id = null;
    this.state = 'init';
  }

  tick() {
    let t = Date.now() - this.startTime;
    let animations = this.animations.filter(v => !v.finished)
    for(let animation of animations) {
      console.log('tick')
      let {
        object,
        property,
        start,
        end,
        duration,
        delay,
        template,
        timingFunction,
        addTime,
      } = animation;
      
      let progression = timingFunction((t - delay - addTime) / duration)
      if (t > duration + delay + addTime) {
        t = duration + delay;
        progression = 1;
        animation.finished = true;
        // continue;
      }
      //？？
      const val = animation.valueFromProgression(progression)
      object[property] = template(val)
      // object[property] = template(timingFunction(start, end)(t - delay))
    }
    if (animations.length) {
      this.id = requestAnimationFrame(() => this.tick())
    }
  }
  start() {
    if (this.state !== 'init') {
      return;
    }
    this.state = 'playing';
    this.startTime = Date.now();
    this.tick();
  }
  reStart() {
    if (this.state !== 'playing') {
      this.pause();
    }
    
    this.animations = [];
    this.id = null;
    this.state = 'init';
    this.startTime = Date.now();
    this.pauseTime = null;
    this.tick();
  }
  pause() {
    if (this.state !== 'playing') {
      return;
    }
    this.state = 'paused';
    if (this.id !== null) {
      cancelAnimationFrame(this.id)
      this.pauseTime = Date.now();
    }
  }
  resume() {
    if (this.state !== 'paused') {
      return;
    }
    this.state = 'playing';
    this.startTime += Date.now() - this.pauseTime;
    console.log(this.startTime)
    this.tick();
  }
  // 行为不一致。
  // 点击暂停之后加入新的动画与运行中的动画加入新的动画
  add(animation, addTime) {
    animation.finished = false;
    if (this.state === 'playing') {
      animation.addTime = addTime !== void 0 ? addTime : Date.now() - this.startTime;
    } else if(this.state === 'init'){
      animation.addTime = addTime !== void 0 ? addTime : 0;
    } else {
      // animation.addTime = addTime !== void 0 ? addTime : Date.now() - this.startTime;
    }
    
    this.animations.push(animation)
  }
}

export class Animation {
  constructor({object, property, template, start, end, duration, delay, timingFunction}) {
    this.object = object;
    this.property = property;
    this.template = template;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.delay = delay || 0;
    // this.timingFunction = timingFunction || ((start, end) => {
    //   return (t) => start + (t / duration)* (end - start)
    // });
    this.timingFunction = timingFunction;
  }

  valueFromProgression(progression) {
    return this.start + progression * (this.end - this.start)
  }
}

export class ColorAnimation {
  constructor({object, property, template, start, end, duration, delay, timingFunction}) {
    this.object = object;
    this.property = property;
    this.template = template || (v => `rgba(${v.r},${v.g},${v.b},${v.a || 1})`);
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.delay = delay || 0;
    this.timingFunction = timingFunction;
  }

  valueFromProgression(progression) {
    return ({
      r: this.start.r + progression * (this.end.r - this.start.r),
      g: this.start.g + progression * (this.end.g - this.start.g),
      b: this.start.b + progression * (this.end.b - this.start.b),
      a: this.start.a + progression * (this.end.a - this.start.a),
    })
  }
}

```