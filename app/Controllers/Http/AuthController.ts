import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import jwt from 'jsonwebtoken'
export default class AuthController {

    async login({request}: HttpContextContract) {
        const {email, password } = request.all()

        const user = await User.findBy('email', email)

        if(!user) {
            return { error: 'USER_NOT_FOUND' }
        }

        if(!await Hash.verify(user.password, password)) {
            return { error: 'PASSWORD_INCORRECT' }
        }
        
        try {
            const token = jwt.sign(String(user.id), Env.get('APP_KEY'))
            
            return {token}
        } catch (error) {   
            return { error: 'TOKEN_ERROR'}
        }
    }

    async currentUser({ auth }: HttpContextContract) {
        return auth.user;
    }
}
