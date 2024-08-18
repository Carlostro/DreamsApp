import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CodigoMesaGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const code = next.paramMap.get('code');
    console.log('Código recibido:', code); // Log para verificar el código recibido
    if (this.isValidCode(code)) {
      console.log('Código válido'); // Log para código válido
      this.saveCode(code); // Guardar el código en localStorage
      return true;
    } else {
      console.log('Código inválido, redirigiendo a /rss'); // Log para código inválido
      this.router.navigate(['/rss']);
      return false;
    }
  }

  private isValidCode(code: string | null): boolean {
    if (!code) {
      return false;
    }
    const codeNumber = Number(code);
    console.log('Validando código:', code, 'Convertido a número:', codeNumber); // Log para validación
    return !isNaN(codeNumber) && codeNumber >= 1000 && codeNumber <= 9999;
  }
  private saveCode(code: string | null): void {
    if (code) {
      localStorage.setItem('codigoMesaGuardado', code);
      console.log('Código guardado en localStorage:', code); // Log para guardar el código
    }
  }
}
