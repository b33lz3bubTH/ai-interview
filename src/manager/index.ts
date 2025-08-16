import { EventEmitter } from "events";
import { EventPayloads } from "../events/eventsPayload";

type Handler<T> = (payload: T) => void | Promise<void>;

export class EventManager {
  private emitter = new EventEmitter();

  public on<K extends keyof EventPayloads>(event: K, handler: Handler<EventPayloads[K]>) {
    this.emitter.on(event, handler);
  }

  public async emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]) {
    this.emitter.emit(event, payload);
  }
}
