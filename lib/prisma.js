import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000,
		keepAlive: true,
		keepAliveInitialDelayMillis: 10000,
	});
	const adapter = new PrismaPg(pool);
	prisma = new PrismaClient({ adapter });
} else {
	if (!global.prisma) {
		const pool = new pg.Pool({
			connectionString: process.env.DATABASE_URL,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000,
			keepAlive: true,
			keepAliveInitialDelayMillis: 10000,
		});
		const adapter = new PrismaPg(pool);
		global.prisma = new PrismaClient({ adapter });
	}
	prisma = global.prisma;
}

export default prisma;
