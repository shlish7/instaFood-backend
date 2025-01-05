import {dbService} from '../../services/db.service.js'
import {logger} from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
	save, // Create (Signup)
	getById, // Read (Profile page)
	update, // Update (Edit profile)
	remove, // Delete (remove user)
	query, // List (of users)
	getByUsername, // Used for Login
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago


            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }


        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
	try {
		const collection = await dbService.getCollection('user')
		const user = await collection.findOne({ username })
		return user
	} catch (err) {
		logger.error(`while finding user by username: ${username}`, err)
		throw err
	}
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    console.log('user update service',user);
    try {
        const userToSave = {following: user.following, followers: user.followers, password: user.password}
        console.log('user to save', userToSave)
        console.log('user._id',user._id);
        const criteria = { _id: ObjectId.createFromHexString(user._id) }
        console.log('criteria',criteria);
        const collection = await dbService.getCollection('user')
        const result = await collection.updateOne(criteria, { $set: userToSave })
        console.log('result',result);
        return user
    } catch (err) {
        console.log(`cannot update user ${user._id}`, err);
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}


async function save(user) {
	try {
		// peek only updatable fields!
		const userToAdd = {
			username: user.username,
			password: user.password,
			fullname: user.fullname,
			imgUrl: user.imgUrl,
            following: user.following,
            followers: user.followers
		}
		const collection = await dbService.getCollection('user')
		await collection.insertOne(userToAdd)
		return userToAdd
	} catch (err) {
		logger.error('cannot add user', err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const criteria = {}
	if (filterBy.fullname || filterBy.username) {
		const txtCriteria = { $regex: filterBy.fullname, $options: 'i' }
		criteria.$or = [
			{
				username: txtCriteria,
			},
			{
				fullname: txtCriteria,
			},
		]
	}
	if (filterBy.minBalance) {
		criteria.score = { $gte: filterBy.minBalance }
	}
	return criteria
}