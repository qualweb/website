import {BREAKPOINT} from '@angular/flex-layout';

const DROPDOWN_BREAKPOINTS = [{
  alias: 'xs.dropdown',
  suffix: 'XsDropdown',
  mediaQuery: 'screen and (min-width: 500px)',
  overlapping: false,
  priority: 1001 // Needed if overriding the default print breakpoint
}];

export const CustomBreakPointsProvider = {
  provide: BREAKPOINT,
  useValue: DROPDOWN_BREAKPOINTS,
  multi: true
};
