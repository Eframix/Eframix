import * as http from 'http';

declare module 'http' {
  export interface IncomingMessage {
    params: { [key: string]: string };
    body: {[key: string]: any};
  }
}