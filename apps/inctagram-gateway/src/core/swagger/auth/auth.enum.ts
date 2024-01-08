export enum AuthSwagger {
  login = 'Try login user to the system',
  registration = 'Registration in the system. Email with confirmation code will be send to passed email address',
  me = 'Returns information about current user',
  confirm = 'Confirm registration',
  resending = 'Resend confirmation registration email',
  rT = 'Generate new pair of access and refresh tokens',
  logout = 'In cookie client must send correct refresh token that will be revoked',
  passRecovery = 'Password recovery via email confirmation. Email should be sent with recovery code inside',
  newPass = 'Confirm password recovery',
  jwtOk = 'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)',
}
