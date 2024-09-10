import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimestampService {
  private originalRandomString: string = '';

  constructor() { }

  // Comprobar si localStorage está disponible
  isLocalStorageAvailable(): boolean {
    try {
      const testKey = 'test';
      localStorage.setItem(testKey, 'testValue');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('LocalStorage no está disponible o está restringido:', e);
      return false;
    }
  }

  // Calcular el tamaño en bytes de una cadena
  getSizeInBytes(str: string): number {
    return new Blob([str]).size;
  }

  // Obtener el timestamp guardado
  getSavedTimestamp(): string | null {
    const savedTimestamp = localStorage.getItem('timestampGuardado');
    console.log(`Timestamp obtenido: ${savedTimestamp}`);
    console.log(`Tamaño del timestamp obtenido en bytes: ${this.getSizeInBytes(savedTimestamp ?? '')}`);
    return savedTimestamp;
  }

  // Obtener el string aleatorio guardado
  getSavedRandomString(): string | null {
    const savedRandomString = localStorage.getItem('randomStringGuardado');
    console.log(`Random string obtenido: ${savedRandomString}`);
    console.log(`Tamaño del random string obtenido en bytes: ${this.getSizeInBytes(savedRandomString ?? '')}`);
    return savedRandomString;
  }

  // Generar un timestamp complejo codificado en Base64
  generateComplexTimestamp(): string {
    const date = new Date();
    this.originalRandomString = Math.random().toString(36).substring(2, 15);
    const combinedString = date.toISOString() + this.originalRandomString;
    const hash = btoa(combinedString).replace(/=/g, '');

    console.log(`Timestamp generado (Base64): ${hash}`);
    console.log(`Tamaño del timestamp generado en bytes: ${this.getSizeInBytes(hash)}`);

    return hash;
  }

  // Obtener el string aleatorio original
  getOriginalRandomString(): string {
    console.log(`Random string actual: ${this.originalRandomString}`);
    return this.originalRandomString;
  }

  // Guardar el timestamp y el string aleatorio en localStorage
  saveTimestamp(): void {
    if (!this.isLocalStorageAvailable()) {
      console.error('No se puede acceder a localStorage.');
      return;
    }

    const timestamp = this.generateComplexTimestamp();
    const randomString = this.getOriginalRandomString();

    console.log(`Guardando timestamp: ${timestamp}`);
    console.log(`Guardando random string: ${randomString}`);

    localStorage.setItem('timestampGuardado', timestamp);
    localStorage.setItem('randomStringGuardado', randomString);

    const savedTimestamp = localStorage.getItem('timestampGuardado');
    const savedRandomString = localStorage.getItem('randomStringGuardado');

    console.log(`Timestamp después de guardar: ${savedTimestamp}`);
    console.log(`Random string después de guardar: ${savedRandomString}`);
    console.log(`Tamaño total de localStorage en bytes: ${this.getLocalStorageSize()}`);
  }

  // Calcular el tamaño total de todos los datos en localStorage
  getLocalStorageSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          total += this.getSizeInBytes(key) + this.getSizeInBytes(value);
        }
      }
    }
    return total;
  }

  // Decodificar el timestamp guardado
  decodeTimestamp(encodedTimestamp: string, randomString: string): number {
    try {
      const decodedString = atob(encodedTimestamp);
      const decodedTimestamp = decodedString.split(randomString)[0];

      console.log(`Cadena decodificada: ${decodedString}`);
      console.log(`Timestamp decodificado: ${decodedTimestamp}`);

      return Date.parse(decodedTimestamp);
    } catch (error) {
      console.error('Error en la decodificación del timestamp:', error);
      return NaN;
    }
  }

  // Comparar el timestamp guardado con el actual
  compareTimestamps(savedTimestamp: string, randomString: string, expirationTime: number): boolean {
    const savedDate = new Date(this.decodeTimestamp(savedTimestamp, randomString));
    const currentDate = new Date();

    console.log(`Fecha guardada: ${savedDate}`);
    console.log(`Fecha actual: ${currentDate}`);

    if (savedDate.getMonth() !== currentDate.getMonth() || savedDate.getFullYear() !== currentDate.getFullYear()) {
      console.log('La sesión ha caducado por cambio de mes o año.');
      return false;
    }

    const timeDifference = currentDate.getTime() - savedDate.getTime();

    console.log(`Diferencia de tiempo: ${timeDifference} ms`);

    const isValid = timeDifference <= expirationTime;
    console.log(`¿El timestamp es válido?: ${isValid}`);

    return isValid;
  }
}
