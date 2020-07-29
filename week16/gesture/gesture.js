function enableGesture(ele) {
  let contexts = Object.create(null);
  let MOUSE_SYMBOL = Symbol('mouse')

  if (document.ontouchstart !== null) {
    ele.addEventListener('mousedown', (e) => {
      contexts[MOUSE_SYMBOL] = Object.create(null)
      start(e, contexts[MOUSE_SYMBOL])
      let mousemove = e => {
        move(e, contexts[MOUSE_SYMBOL])
      }
      let mouseend = e => {
        end(e, contexts[MOUSE_SYMBOL])
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseend)
        delete contexts[MOUSE_SYMBOL];
      }
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseend)
    })
  }

  ele.addEventListener('touchstart', e => {
    for (let touch of e.changedTouches) {
      contexts[touch.identifier] = Object.create(null)
      start(touch, contexts[touch.identifier])
    }
  })
  ele.addEventListener('touchmovet', e => {
    for (let touch of e.changedTouches) {
      move(touch, contexts[touch.identifier])
    }
  })
  ele.addEventListener('touchsend', e => {
    for (let touch of e.changedTouches) {
      end(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })
  ele.addEventListener('touchcancel', e => {
    for (let touch of e.changedTouches) {
      cancel(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })

  // tap
  // pan -start end
  // flick
  // press -start end

  let start = (e, context) => {
    context.startX = e.clientX;
    context.startY = e.clientY;
    context.moves = [];
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    context.timeoutHandler = setTimeout(() => {
      if (context.isTap) {
        return;
      }
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      ele.dispatchEvent(new CustomEvent('pressstart'))
    }, 500)
    const event = new CustomEvent('start');
    Object.assign(event, {
      startX: context.startX,
      startY: context.startY,
      clientX: e.clientX,
      clientY: e.clientY,
    })
    ele.dispatchEvent(event)
  }

  let move = (e, context) => {
    let dx = e.clientX - context.startX;
    let dy = e.clientY - context.startY;
    if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
      if (context.isPress) {
        ele.dispatchEvent(new CustomEvent('presscancel'))
      }
      context.isTap = false;
      context.isPan = true;
      context.isPress = true;
      ele.dispatchEvent(new CustomEvent('panstart'))
    }

    if (context.isPan) {
      context.moves.push({
        dx,
        dy,
        t: Date.now(),
      })
      context.moves = context.moves.filter(record => Date.now() - record.t < 300)
      const event = new CustomEvent('pan');
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
      })
      ele.dispatchEvent(event)
    }
    // console.log('move', context)
  }

  let end = (e, context) => {
    if (context.isPress) {
      ele.dispatchEvent(new CustomEvent('pressend'))
    }
    if (context.isPan) {
      // console.log(context.moves)
      let dx = e.clientX - context.startX;
      let dy = e.clientY - context.startY;
      const record = context.moves[0]
      const speed = Math.sqrt((record.dx - dx) ** 2 + (record.dy - dy) ** 2) / (Date.now() - record.t);
      const isFlick = speed > 2.5;
      if (isFlick) {
        const event = new CustomEvent('flick')
        Object.assign(event, {
          startX: context.startX,
          startY: context.startY,
          clientX: e.clientX,
          clientY: e.clientY,
          isFlick,
          speed,
        })
        ele.dispatchEvent(event)
      }
      const event = new CustomEvent('panend')
      Object.assign(event, {
        startX: context.startX,
        startY: context.startY,
        clientX: e.clientX,
        clientY: e.clientY,
        isFlick,
        speed,
      })
      ele.dispatchEvent(event)
    }
    if (context.isTap) {
      ele.dispatchEvent(new CustomEvent('tap'))
    }
    clearTimeout(context.timeoutHandler)
    console.log('end', context)
  }

  let cancel = (e, context) => {
    clearTimeout(context.timeoutHandler)
    console.log('cancel')
  }
}