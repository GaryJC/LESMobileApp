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
    this.handlers.forEach((h) => {
      h(arg);
    });
  }
}

let events = {};

const on = (name, handler) => {
  let event = events[name];
  if (event == null) {
    event = events[name] = new JSEventObj(name);
  }
  event.registerHandler(handler);
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
  console.log("event: ", event);
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
};

export default JSEvent;
