class JSEventObj {
  constructor(name) {
    this.name = name;
    this.handlers = [];
  }

  registerHandler(handler) {
    if (handler == null) return;
    if (this.handlers[handler] == null) {
      this.handlers.push(handler);
      console.log(`register handler event [${this.name}]`);
    }
  }

  unregisterHandler(handler) {
    const idx = this.handlers.indexOf(handler);
    if (idx >= 0) {
      this.handlers.splice(idx, 1);
      console.log(`unregister handler event [${this.name}]`);
    }
  }

  emit(arg) {
    for (let index = 0; index < this.handlers.length; index++) {
      const h = this.handlers[index];
      try {
        h(arg);
      } catch (e) {
        console.error(`call event[${this.name}] handler[${h}] error`, e);
      }
    }
    // this.handlers.forEach((h) => {
    //   try {
    //     h(arg);
    //   } catch (e) {
    //     console.error(`call event[${this.name}] handler[${h}] error`, e);
    //   }
    // });
  }
}

let events = {};

/**
 * 
 * @param {string} name Event Name
 * @param {()=>void} handler 
 * @returns {()=>void} unsubscribe
 */
const on = (name, handler) => {
  let event = events[name];
  if (event == null) {
    event = events[name] = new JSEventObj(name);
  }
  event.registerHandler(handler);

  return () => {
    remove(name, handler);
  }
};

const remove = (name, handler) => {
  let event = events[name];
  if (event != null) {
    event.unregisterHandler(handler);
    return true;
  }
  return false;
};

const emit = (name, args) => {
  let event = events[name];
  console.log(`emit event [${name}]`);
  if (event != null) {
    event.emit(args);
    return true;
  }
  return false;
};

const JSEvent = {
  on: on,
  remove: remove,
  emit: emit,
  reset: () => (events = {}),
};

export default JSEvent;
