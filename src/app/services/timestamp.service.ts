import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimestampService {
  private originalRandomString: string = '';

  constructor() { }

  getSavedTimestamp(): string | null {
    return localStorage.getItem('timestampGuardado');
  }

  getSavedRandomString(): string | null {
    return localStorage.getItem('randomStringGuardado');
  }

  generateComplexTimestamp(): string {
    const date = new Date();
    this.originalRandomString = Math.random().toString(36).substring(2, 15);
    const combinedString = date.toISOString() + this.originalRandomString;
    const hash = btoa(combinedString).replace(/=/g, '');
    return hash;
  }

  getOriginalRandomString(): string {
    return this.originalRandomString;
  }

  // Guardar el timestamp y el random string en el localStorage
  saveTimestamp(): void {
    const timestamp = this.generateComplexTimestamp();
    const randomString = this.getOriginalRandomString();
    localStorage.setItem('timestampGuardado', timestamp);
    localStorage.setItem('randomStringGuardado', randomString);
  }

  // Decodificar el timestamp guardado
  decodeTimestamp(encodedTimestamp: string, randomString: string): number {
    const decodedString = atob(encodedTimestamp);
    const decodedTimestamp = decodedString.split(randomString)[0];
    return parseInt(decodedTimestamp, 10);
  }

  // Comparar el timestamp guardado con el actual
  compareTimestamps(savedTimestamp: string, randomString: string, expirationTime: number): boolean {
    const savedDate = new Date(this.decodeTimestamp(savedTimestamp, randomString));
    const currentDate = new Date();

    // Verifica si el mes o año son diferentes
    if (savedDate.getMonth() !== currentDate.getMonth() || savedDate.getFullYear() !== currentDate.getFullYear()) {
      return false; // La sesión ha caducado
    }

    // Verifica la diferencia de tiempo
    const timeDifference = currentDate.getTime() - savedDate.getTime();
    return timeDifference <= expirationTime;
  }
}

