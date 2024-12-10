import { MongoClient } from 'mongodb'

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = { getCollection }

var dbConn = null

async function getCollection(collectionName) {
	try {
		const db = await _connect()
		const collection = await db.collection(collectionName)
		return collection
	} catch (err) {
		logger.error('Failed to get Mongo collection', err)
		throw err
	}
}

async function _connect() {
	if (dbConn) return dbConn
    
	try {
		// console.log('config.dbURL',config.dbURL);
		// console.log('config.dbName',config.dbName);
		const client = await MongoClient.connect(config.dbURL)
		dbConn = client.db(config.dbName)
		logger.info('Connect successfully to DB')
		// console.log('Connect successfully to DB')
		// console.log('dbConn', dbConn)
		return dbConn


	} catch (err) {
		logger.error('Cannot Connect to DB', err)
		throw err
	}
}