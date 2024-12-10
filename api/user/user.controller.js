import {userService} from './user.service.js'
import {logger} from '../../services/logger.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(400).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            fullname: req.query?.fullname || '',
            username: req.query?.username || '',
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(400).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(400).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(400).send({ err: 'Failed to update user' })
    }
}

export async function addUser(req, res) {
    try {

        const {fullname, imgUrl, password, username, following, followers} = req.body
        const userToSave = {fullname, imgUrl, password, username, following: [] , followers : []}

        const saveduser = await userService.save(userToSave)

        res.send(saveduser)
    } catch (err) {
        logger.error('Could not add user', err)
        res.status(400).send('Could not add user')

    }

}

