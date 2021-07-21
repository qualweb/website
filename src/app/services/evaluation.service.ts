import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigService
  ) {}

  evaluate(params: any): Observable<any> {
    return this.http
      .post<any>(this.config.getServer('/app/url/'), params, {
        observe: 'response',
      })
      .pipe(
        map((res) => {
          const response = res.body;
          
          if (
            !res.status.toString().startsWith('20') ||
            !response ||
            response.status !== 1
          ) {
            throw new Error();
          }

          return response.report;
        }),
        catchError((err) => {
          console.log(err);
          return of(null);
        })
      );
  }
}
