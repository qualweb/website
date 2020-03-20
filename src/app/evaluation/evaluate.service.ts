import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EvaluateService {

  constructor(private readonly http: HttpClient) { }

  url(url: string): Observable<any> {
    return this.http.get<any>('/api/' + encodeURIComponent(url))
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
