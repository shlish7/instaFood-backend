import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3

export const feedItemService = {
	remove,
	query,
	getById,
	add,
	update,
	addfeedItemMsg,
	removefeedItemMsg,
}

async function query(filterBy = {}) {
	const criteria = _buildCriteria(filterBy)
	
	try {
		const collection = await dbService.getCollection('feedItem')
		// var feedItemCursor = await collection.find(criteria, { sort })
        var feedItems = await collection.find(criteria).toArray()

		// const feedItems = feedItemCursor.toArray()
		return feedItems
	} catch (err) {
		logger.error('cannot find feedItems', err)
		throw err
	}
}

async function getById(feedItemId) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(feedItemId) }

		const collection = await dbService.getCollection('feedItem')
		const feedItem = await collection.findOne(criteria)
        
		feedItem.createdAt = feedItem._id.getTimestamp()
		return feedItem
	} catch (err) {
		logger.error(`while finding feedItem ${feedItemId}`, err)
		throw err
	}
}

async function remove(feedItemId) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const { _id: ownerId, isAdmin } = loggedinUser

	try {
        const criteria = { 
            _id: ObjectId.createFromHexString(feedItemId), 
        }
        if(!isAdmin) criteria['owner._id'] = ownerId
        
		const collection = await dbService.getCollection('feedItem')
		const res = await collection.deleteOne(criteria)

        if(res.deletedCount === 0) throw('Not your feedItem')
		return feedItemId
	} catch (err) {
		logger.error(`cannot remove feedItem ${feedItemId}`, err)
		throw err
	}
}

async function add(feedItemToAdd) {
	try {
		const collection = await dbService.getCollection('feedItem')
		await collection.insertOne(feedItemToAdd)

		return feedItemToAdd
	} catch (err) {
		logger.error('cannot insert feedItem', err)
		throw err
	}
}

async function update(feedItem) {
    // const feedItemToSave = { vendor: feedItem.vendor, speed: feedItem.speed }
    const feedItemToSave = { likes: feedItem.likes, comments: feedItem.comments}

console.log('feedItemToSave',feedItem);
    try {
        const criteria = { _id: ObjectId.createFromHexString(feedItem._id) }
		const collection = await dbService.getCollection('feedItem')
		await collection.updateOne(criteria, { $set: feedItemToSave })

		return feedItem
	} catch (err) {
		logger.error(`cannot update feedItem ${feedItem._id}`, err)
		throw err
	}
}

async function addfeedItemMsg(feedItemId, msg) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(feedItemId) }
        msg.id = makeId()
        
		const collection = await dbService.getCollection('feedItem')
		await collection.updateOne(criteria, { $push: { msgs: msg } })

		return msg
	} catch (err) {
		logger.error(`cannot add feedItem msg ${feedItemId}`, err)
		throw err
	}
}

async function removefeedItemMsg(feedItemId, msgId) {
	try {
        const criteria = { _id: ObjectId.createFromHexString(feedItemId) }

		const collection = await dbService.getCollection('feedItem')
		await collection.updateOne(criteria, { $pull: { msgs: { id: msgId }}})
        
		return msgId
	} catch (err) {
		logger.error(`cannot remove feedItem msg ${feedItemId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy = {}) {
    const criteria = {};
    if (filterBy.txt && typeof filterBy.txt === 'string') {
        criteria.textField = { $regex: filterBy.txt, $options: 'i' }; // Only set $regex if it's a string
    }
	
    return criteria;
}

function _buildSort(filterBy) {
    if(!filterBy.sortField) return {}
    return { [filterBy.sortField]: filterBy.sortDir }
}