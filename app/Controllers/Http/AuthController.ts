import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {

    async login({request, auth}: HttpContextContract) {
        const {email, password } = request.all()

        return await auth.use('api').attempt(email, password)
    }

    async currentUser({ auth }: HttpContextContract) {
        return auth.user;
    }
}
