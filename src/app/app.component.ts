import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly inactivityRedirectUrl = 'https://www.instagram.com/dreamsalzira';

  private readonly enforceInactivityRedirect = () => {
    const redirectedByInactivity = sessionStorage.getItem('inactivityRedirect') === '1';
    const redirectedBySessionClosed = sessionStorage.getItem('sessionClosedRedirect') === '1';
    const redirectedByInactivityPersistent = localStorage.getItem('inactivityRedirect') === '1';
    const redirectedBySessionClosedPersistent = localStorage.getItem('sessionClosedRedirect') === '1';

    if (
      !redirectedByInactivity &&
      !redirectedBySessionClosed &&
      !redirectedByInactivityPersistent &&
      !redirectedBySessionClosedPersistent
    ) {
      return;
    }

    const path = window.location.pathname.toLowerCase();
    const isEntryPath = path.includes('/loading') || path === '/' || path === '';

    if (isEntryPath) {
      return;
    }

    window.location.replace(this.inactivityRedirectUrl);
  };

  constructor() {}

  ngOnInit(): void {
    this.enforceInactivityRedirect();
    window.addEventListener('popstate', this.enforceInactivityRedirect);
    window.addEventListener('pageshow', this.enforceInactivityRedirect);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.enforceInactivityRedirect);
    window.removeEventListener('pageshow', this.enforceInactivityRedirect);
  }
}
