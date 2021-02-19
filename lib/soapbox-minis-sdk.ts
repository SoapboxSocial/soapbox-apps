import mitt from "mitt";

const emitter = mitt();

if (typeof window !== "undefined") {
  (window as any).mitt = emitter;
}

enum EVENT_NAMES {
  MEMBERS = "members",
  ROOM = "room",
  USER = "user",
}

enum WEBKIT_MESSAGE_HANDLERS {
  MEMBERS = "members",
  ROOM = "room",
  USER = "user",
}

export type User = {
  display_name: string;
  id: number;
  image: string;
  username: string;
};

export type Room = {
  id: number;
  name: string;
};

function postMessage(key: WEBKIT_MESSAGE_HANDLERS, payload: any) {
  (window as any).webkit.messageHandlers[key].postMessage(payload);
}

type GetUserEvent = {
  sequence: number;
  data: User;
};

export async function getUser() {
  return new Promise<User>((resolve, reject) => {
    const sequence = Date.now();

    postMessage(WEBKIT_MESSAGE_HANDLERS.USER, { sequence });

    const handler = (event: GetUserEvent) => {
      if (event.sequence === sequence) {
        resolve(event.data);
      }

      emitter.off(EVENT_NAMES.USER, handler);
    };

    emitter.on(EVENT_NAMES.USER, handler);
  });
}

type GetMembersEvent = {
  sequence: number;
  data: User[];
};

export async function getMembers() {
  return new Promise<User[]>((resolve, reject) => {
    const sequence = Date.now();

    postMessage(WEBKIT_MESSAGE_HANDLERS.MEMBERS, { sequence });

    const handler = (event: GetMembersEvent) => {
      if (event.sequence === sequence) {
        resolve(event.data);
      }

      emitter.off(EVENT_NAMES.MEMBERS, handler);
    };

    emitter.on(EVENT_NAMES.MEMBERS, handler);
  });
}

type GetRoomEvent = {
  sequence: number;
  data: Room;
};

export async function getRoom() {
  return new Promise<Room>((resolve, reject) => {
    const sequence = Date.now();

    postMessage(WEBKIT_MESSAGE_HANDLERS.ROOM, { sequence });

    const handler = (event: GetRoomEvent) => {
      if (event.sequence === sequence) {
        resolve(event.data);
      }

      emitter.off(EVENT_NAMES.ROOM, handler);
    };

    emitter.on(EVENT_NAMES.ROOM, handler);
  });
}
