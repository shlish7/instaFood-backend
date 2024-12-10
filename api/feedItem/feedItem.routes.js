import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getfeedItems, getfeedItemById, addfeedItem, updatefeedItem, removefeedItem } from './feedItem.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getfeedItems)
router.get('/:id', log, getfeedItemById)
router.post('/', log, requireAuth, addfeedItem)
router.put('/:id', requireAuth, updatefeedItem)
router.delete('/:id', requireAuth, removefeedItem)


export const feedItemRoutes = router