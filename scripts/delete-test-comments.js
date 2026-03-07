const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Finding test comments...');

    // Find comments containing the word "test" case-insensitive
    const testComments = await prisma.postComment.findMany({
        where: {
            content: {
                contains: 'test',
            }
        }
    });

    console.log(`Found ${testComments.length} test comments.`);

    if (testComments.length > 0) {
        const ids = testComments.map(c => c.id);
        const result = await prisma.postComment.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
        console.log(`Deleted ${result.count} test comments.`);
    } else {
        // maybe delete all comments just in case? Or look for specific ones
        console.log('No comments found with "test" in content.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
