import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, Validators, AbstractControl} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-url-input',
  templateUrl: './url-input.component.html',
  styleUrls: ['./url-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UrlInputComponent implements OnInit {

  urlForm: FormControl;

  constructor(private router: Router) {
    this.urlForm = new FormControl('', [
      Validators.required,
      this.urlValidator.bind(this)
    ]);
  }

  ngOnInit(): void {
  }

  submit(e): void {
    e.preventDefault();

    let url = this.urlForm.value;
    url = url.replace('https://', '');
    url = url.replace('http://', '');
    url = url.replace('www.', '');

    this.router.navigate(['/', url]);
  }

  urlValidator(control: AbstractControl): any {
    let url = control.value;

    if (url === '' || url === null) {
      return null;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('www.')) {
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
    }

    return {'url': true};
  }
}
