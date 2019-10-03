import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

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
    url = _.replace(url, 'https://', '');
    url = _.replace(url, 'http://', '');
    url = _.replace(url, 'www.', '');

    this.router.navigate(['/', url]);
  }

  urlValidator(control: AbstractControl): any {
    let url = control.value;

    if (url === '' || url === null) {
      return null;
    }

    if (!_.startsWith(url, 'http://') && !_.startsWith(url, 'https://') && !_.startsWith(url, 'www.')) {
      if (_.includes(url, '.') && url[_.size(url) - 1] !== '.') {
        return null;
      }
    } else if (_.startsWith(url, 'http://')) {
      url = _.replace(url, 'http://', '');
      if (_.includes(url, '.') && url[_.size(url) - 1] !== '.') {
        return null;
      }
    } else if (_.startsWith(url, 'https://')) {
      url = _.replace(url, 'https://', '');
      if (_.includes(url, '.') && url[_.size(url) - 1] !== '.') {
        return null;
      }
    } else if (_.startsWith(url, 'www.')) {
      url = _.replace(url, 'www.', '');
      if (_.includes(url, '.') && url[_.size(url) - 1] !== '.') {
        return null;
      }
    }

    return { 'url': true };
  }
}
