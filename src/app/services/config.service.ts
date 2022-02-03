import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private server: string;

  constructor() {
    const port = location.port;
    if (port !== '' && location.port !== '80') {
      this.server = 'http://localhost:3000';
    } else {
      this.server = '/api';
    }
  }

  getServer(service: string): string {
    return this.server + service;
  }
}
