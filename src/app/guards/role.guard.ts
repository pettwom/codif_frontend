import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Obtener los roles permitidos desde los datos de la ruta
  const allowedRoles = route.data['rolesPermitidos'] as string[];

  // Obtener el token
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Decodificar el payload del token
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Obtener el tipo de usuario del token
    const userRole = payload.usuario.tipo_usuario;

    // Verificar si el tipo_usuario está en la lista de roles permitidos
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Si no hay un rol permitido, redirigir a home
    router.navigate(['/admin']);
    return false;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    router.navigate(['/login']);
    return false;
  }
};
