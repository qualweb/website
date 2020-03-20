import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
//import { Apollo } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';
//import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class EvaluateService {

  constructor(private readonly http: HttpClient) { }

  url(url: string): Observable<any> {
    /*return this.apollo.mutate({
      mutation: gql `mutation {
        evaluateUrl(uri: "${url}") {
          json
        }
      }`
    }).pipe(
      map(res => {
        return JSON.parse(res['data']['evaluateUrl']['json']);
      }),
      catchError(err => {
        console.log(err);
        return of(null);
      })
    );*/
    return this.http.get<any>('http://194.117.20.202:3000/' + encodeURIComponent(url))
      .pipe(
        map(res => {
          return res;
        }),
        catchError(err => {
          console.log(err);
          return of(null);
        })
      );
  }
}
