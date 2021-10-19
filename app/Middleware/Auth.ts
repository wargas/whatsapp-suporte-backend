import { GuardsList } from '@ioc:Adonis/Addons/Auth'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'

import Env from '@ioc:Adonis/Core/Env'
import jwt from 'jsonwebtoken'
import User from 'App/Models/User'

/**
 * Auth middleware is meant to restrict un-authenticated access to a given route
 * or a group of routes.
 *
 * You must register this middleware inside `start/kernel.ts` file under the list
 * of named middleware.
 */
export default class AuthMiddleware {
  /**
  * The URL to redirect to when request is Unauthorized
  */
  protected redirectTo = '/login'

  /**
   * Authenticates the current HTTP request against a custom set of defined
   * guards.
   *
   * The authentication loop stops as soon as the user is authenticated using any
   * of the mentioned guards and that guard will be used by the rest of the code
   * during the current request.
   */
  protected async authenticate(auth: HttpContextContract['auth'], guards: (keyof GuardsList)[]) {
    /**
     * Hold reference to the guard last attempted within the for loop. We pass
     * the reference of the guard to the "AuthenticationException", so that
     * it can decide the correct response behavior based upon the guard
     * driver
     */
    let guardLastAttempted: string | undefined

    for (let guard of guards) {
      guardLastAttempted = guard

      if (await auth.use(guard).check()) {
        /**
         * Instruct auth to use the given guard as the default guard for
         * the rest of the request, since the user authenticated
         * succeeded here
         */
        auth.defaultGuard = guard
        return true
      }
    }

    /**
     * Unable to authenticate using any guard
     */
    throw new AuthenticationException(
      'Unauthorized access',
      'E_UNAUTHORIZED_ACCESS',
      guardLastAttempted,
      this.redirectTo,
    )
  }

  /**
   * Handle request
   */
  public async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {

    const authorization = request.header('Authorization') || ''

    const token = authorization.split(' ')[1]

    if (!token) {
      response.status(401).json({ error: 'UNAUTHORIZED' })
      return;
    }
    try {
      const id = await jwt.verify(token, Env.get('APP_KEY'))

      const user = await new User()
      user.id = Number(id)
      
      if(!user) {
        response.status(401).json({ error: 'UNAUTHORIZED' })
        return;
      }
      await auth.login(user)

      await next()
    } catch (error) {
      response.status(401).json({ error: 'UNAUTHORIZED' })
      return;
    }

  }
}
