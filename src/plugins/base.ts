import { EventManager } from "../manager";

export abstract class BasePlugin {
  abstract name: string;
  abstract register(manager: EventManager): void;
}
