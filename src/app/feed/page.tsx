import { db } from '@/lib/db'
import { SocialLayout } from '@/components/social/social-layout'

// 1. Force dynamic rendering — this ensures the page is not statically 
// generated and always runs on the server for every request.
export const dynamic = 'force-dynamic'

// 2. Disable caching — setting revalidate to 0 tells Next.js 
// to re-fetch data on every single request.
export const revalidate = 0

async function getPosts() {
    // 3. Ensuring Prisma query runs on every request
    // Since this is a server component, we query the DB directly.
    return await db.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: true,
            comments: {
                include: {
                    author: true
                }
            }
        }
    })
}

export default async function FeedPage() {
    const posts = await getPosts()

    // This page can now pass the fresh 'posts' to the client components.
    // Note: For this to work with your existing Zustand store, 
    // you'll need to hydrate the store with this data on the client.

    return (
        <div className="h-screen w-screen overflow-hidden bg-white dark:bg-slate-900">
            <SocialLayout initialPosts={posts} />
        </div>
    )
}
