import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, Validators, AbstractControl} from '@angular/forms';
import {Router} from '@angular/router';
import {replace, startsWith, includes, size} from 'lodash';

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
    url = replace(url, 'https://', '');
    url = replace(url, 'http://', '');
    url = replace(url, 'www.', '');

    this.router.navigate(['/', url]);
  }

  urlValidator(control: AbstractControl): any {
    let url = control.value;

    if (url === '' || url === null) {
      return null;
    }

    if (!startsWith(url, 'http://') && !startsWith(url, 'https://') && !startsWith(url, 'www.')) {
      if (includes(url, '.') && url[size(url) - 1] !== '.') {
        return null;
      }
    } else if (startsWith(url, 'http://')) {
      url = replace(url, 'http://', '');
      if (includes(url, '.') && url[size(url) - 1] !== '.') {
        return null;
      }
    } else if (startsWith(url, 'https://')) {
      url = replace(url, 'https://', '');
      if (includes(url, '.') && url[size(url) - 1] !== '.') {
        return null;
      }
    } else if (startsWith(url, 'www.')) {
      url = replace(url, 'www.', '');
      if (includes(url, '.') && url[size(url) - 1] !== '.') {
        return null;
      }
    }

    return {'url': true};
  }
}
