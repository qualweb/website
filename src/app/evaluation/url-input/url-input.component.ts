import {
  Component,
  HostListener,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ModulesService } from '../../services/modules.service';

@Component({
  selector: 'app-url-input',
  templateUrl: './url-input.component.html',
  styleUrls: ['./url-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UrlInputComponent implements OnInit {
  urlForm: FormControl;
  showDropdown = false;
  executeACT = true;
  executeWCAG = false;
  /*executeHTML = false;
  executeCSS = false;
  executeBP = false;*/
  noCheckboxSelected = false;

  constructor(private router: Router, private data: ModulesService) {
    this.urlForm = new FormControl('', [
      Validators.required,
      this.urlValidator.bind(this),
    ]);
  }

  ngOnInit(): void {}

  updateCheckboxStatus(): void {
    this.noCheckboxSelected = !(this.executeACT || this.executeWCAG);
  }
  submit(e: Event): void {
    e.preventDefault();
    this.data.setModulesToRun({
      act: this.executeACT,
      wcag: this.executeWCAG,
      /*html: this.executeHTML,
      css: this.executeCSS,
      bp: this.executeBP*/
    });

    /*let url = this.urlForm.value;
    url = url.replace('https://', '');
    url = url.replace('http://', '');
    url = url.replace('www.', '');*/

    this.router.navigate(['/', encodeURIComponent(this.urlForm.value)]);
  }

  urlValidator(control: AbstractControl): any {
    const url = control.value;

    if (url === '' || url === null) {
      return null;
    }

    /*if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('www.')) {
      if (url.includes('.') && url[url.length - 1] !== '.') {
        return null;
      }
    } else if (url.startsWith('http://')) {
      url = url.replace('http://', '');
      if (url.includes('.') && url[url.length - 1] !== '.') {
        return null;
      }
    } else if (url.startsWith('https://')) {
      url = url.replace('https://', '');
      if (url.includes('.') && url[url.length - 1] !== '.') {
        return null;
      }
    } else if (url.startsWith('www.')) {
      url = url.replace('www.', '');
      if (url.includes('.') && url[url.length - 1] !== '.') {
        return null;
      }
    }*/

    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.includes('.') && url[url.length - 1] !== '.') {
        return null;
      }
    }

    return { url: true };
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // to close dropdownContent by clicking outside of it
  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: any) {
    if (
      !(
        targetElement.id.startsWith('dropdownIcon') ||
        targetElement.id === 'dropdownButton' ||
        targetElement.id === 'dropdownContent' ||
        targetElement.classList.contains('mat-checkbox-layout') ||
        targetElement.classList.contains('mat-checkbox-label') ||
        targetElement.classList.contains('mat-checkbox') ||
        targetElement.classList.contains('mat-checkbox-layout') ||
        targetElement.classList.contains('mat-checkbox-inner-container')
      )
    ) {
      if (this.showDropdown) {
        this.showDropdown = false;
      }
    }
  }
}
