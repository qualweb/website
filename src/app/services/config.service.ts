import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {split} from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  PROTOCOL: string;
  HOST: string;
  PORT: number;
  PATH: string;

  URI: string;

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink
  ) {
    this.PROTOCOL = 'http://';
    this.HOST = split(location.host, ':')[0];

    if (this.HOST === 'localhost') {
      this.PORT = 4000;
      this.PATH = '/graphql';
    } else {
      if (this.PROTOCOL === 'http://') {
        this.PORT = 80;
      } else {
        this.PORT = 443;
      }

      this.PATH = '/server/graphql';
    }

    this.URI = `${this.PROTOCOL}${this.HOST}:${this.PORT}${this.PATH}`;
    console.log(this.URI);
  }

  server(): void {
    this.apollo.create({
      link: this.httpLink.create({uri: this.URI}),
      cache: new InMemoryCache()
    });
  }
}
