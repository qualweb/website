import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {
  private modulesToRun = new BehaviorSubject<{}>({
    act: true,
    wcag: true,
  });
  modules = this.modulesToRun.asObservable();

  setModulesToRun(modules: {}): void {
    this.modulesToRun.next(modules);
  }
}
