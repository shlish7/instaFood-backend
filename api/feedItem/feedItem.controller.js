import { logger } from '../../services/logger.service.js'
import { feedItemService } from './feedItem.service.js'

export async function getfeedItems(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt ? String(req.query.txt) : '',
        };
        const feedItems = await feedItemService.query(filterBy);
        res.json(feedItems);
    } catch (err) {
        logger.error('Failed to get feedItems', err);
        res.status(400).send({ err: 'Failed to get feedItems' });
    }
}

export async function getfeedItemById(req, res) {
	try {
		const feedItemId = req.params.id
		const feedItem = await feedItemService.getById(feedItemId)
		res.json(feedItem)
	} catch (err) {
		logger.error('Failed to get feedItem', err)
		res.status(400).send({ err: 'Failed to get feedItem' })
	}
}

export async function addfeedItem(req, res) {
	const { loggedinUser, body: feedItem } = req
	feedItem.owner = loggedinUser

	try {
		const addedfeedItem = await feedItemService.add(feedItem)
		res.json(addedfeedItem)
	} catch (err) {
		logger.error('Failed to add feedItem', err)
		res.status(400).send({ err: 'Failed to add feedItem' })
	}
}

export async function updatefeedItem(req, res) {
	const { loggedinUser, body: feedItem } = req
    const { _id: userId, isAdmin } = loggedinUser

    // if(!isAdmin && feedItem.owner._id !== userId) {
    //     res.status(403).send('Not your feedItem...')
    //     return
    // }

	try {
		const updatedfeedItem = await feedItemService.update(feedItem)
		res.json(updatedfeedItem)
	} catch (err) {
		logger.error('Failed to update feedItem', err)
		res.status(400).send({ err: 'Failed to update feedItem' })
	}
}

export async function removefeedItem(req, res) {
	try {
		const feedItemId = req.params.id
		const removedId = await feedItemService.remove(feedItemId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove feedItem', err)
		res.status(400).send({ err: 'Failed to remove feedItem' })
	}
}
