import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding auth headers - API key is already in query params
  // The PRH API uses api_key query parameter, not Basic Auth

  console.log('Interceptor: Request intercepted', req.url);

  return next(req);
};