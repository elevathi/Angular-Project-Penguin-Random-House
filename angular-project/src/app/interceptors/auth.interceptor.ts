import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Basic Auth za PRH API
  const username = 'testuser';
  const password = 'testpassword';
  const basicAuth = btoa(`${username}:${password}`);

  // JWT token (če obstaja)
  const jwtToken = localStorage.getItem('jwt_token');

  const clonedRequest = req.clone({
    setHeaders: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json',
      ...(jwtToken ? { 'X-JWT-Token': jwtToken } : {})
    }
  });

  console.log('Interceptor: Request intercepted', clonedRequest.url);
  
  return next(clonedRequest);
};