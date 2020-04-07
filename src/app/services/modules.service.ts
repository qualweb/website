import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {
  private modulesToRun = new BehaviorSubject<{}>({
    act: true,
    html: true,
    css: true,
    bp: true
  });
  modules = this.modulesToRun.asObservable();

  setModulesToRun(modules: {}): void {
    this.modulesToRun.next(modules);
  }
}
