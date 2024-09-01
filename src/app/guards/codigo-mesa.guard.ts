import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TimestampService } from '../services/timestamp.service';

@Injectable({
  providedIn: 'root'
})
export class CodigoMesaGuard implements CanActivate {

  constructor(private router: Router, private timestampService: TimestampService) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const code = next.paramMap.get('code');
    console.log('Código recibido:', code); // Log para verificar el código recibido
    if (this.isValidCode(code)) {
      console.log('Código válido'); // Log para código válido
      this.saveCode(code); // Guardar el código en localStorage
      this.saveTimestamp(); // Guardar el timestamp en localStorage
      return true;
    } else {
      console.log('Código inválido, redirigiendo a /rss'); // Log para código inválido
      this.router.navigate(['/:timestamp/:code/rss']);
      return false;
    }
  }

  private isValidCode(code: string | null): boolean {
    if (!code) {
      return false;
    }
    const codeNumber = Number(code);
    console.log('Validando código:', code, 'Convertido a número:', codeNumber); // Log para validación
    return !isNaN(codeNumber) && codeNumber >= 11 && codeNumber <= 99;
  }

  private saveCode(code: string | null): void {
    if (code) {
      localStorage.setItem('codigoMesaGuardado', code);
    }
  }

  public removeCode(): void {
    localStorage.removeItem('codigoMesaGuardado');
    localStorage.removeItem('timestampGuardado');
    console.log('Código y timestamp eliminados de localStorage');

  }

  private saveTimestamp(): void {
    const originalTimestamp = Date.now().toString(); // Timestamp actual en milisegundos
    console.log('Original Timestamp:', originalTimestamp); // Verificar el valor original

    const randomString = this.timestampService.getOriginalRandomString();
    console.log('Random String:', randomString); // Verificar el valor de randomString

    // Combina el timestamp con la cadena aleatoria
    const complexTimestamp = btoa(originalTimestamp + randomString);
    localStorage.setItem('timestampGuardado', complexTimestamp);
    console.log('Complex Timestamp (Encoded):', complexTimestamp); // Verificar el valor guardado

    // Decodifica para verificar que se guardó correctamente
    const decodedString = atob(complexTimestamp);
    console.log('Decoded String:', decodedString); // Verificar la cadena decodificada

    // Extrae el timestamp original usando la cadena aleatoria
    const decodedTimestamp = decodedString.split(randomString)[0];
    console.log('Decoded Timestamp (Before Conversion):', decodedTimestamp); // Verificar el timestamp extraído

    // Intenta convertir el timestamp decodificado en un número y luego a Date
    const date = new Date(parseInt(decodedTimestamp, 10));
    console.log('Fecha decodificada:', date); // Log para ver la fecha de manera legible

    // Verifica si la fecha es válida
    if (isNaN(date.getTime())) {
        console.error('Invalid Date detected');
    }
}




}
