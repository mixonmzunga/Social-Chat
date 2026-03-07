const BASE_URL = 'http://localhost:3000/api';

async function testInteractions() {
    try {
        // 1. Fetch posts to get an ID
        console.log('Fetching posts...');
        const postsRes = await fetch(`${BASE_URL}/posts`);
        const posts = await postsRes.json();
        if (!posts.length) {
            console.log('No posts found. Create a post first.');
            return;
        }
        const postId = posts[0].id;
        const authorId = posts[0].author.userId;
        console.log(`Testing with Post ID: ${postId}`);

        // 2. Test View
        console.log('Testing View increment...');
        const viewRes = await fetch(`${BASE_URL}/posts/${postId}/view`, { method: 'PATCH' });
        console.log('View Response:', await viewRes.json());

        // 3. Test Like
        console.log('Testing Like...');
        const likeRes = await fetch(`${BASE_URL}/posts/${postId}/like`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'like' }),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Like Response:', await likeRes.json());

        // 4. Test Share
        console.log('Testing Share increment...');
        const shareRes = await fetch(`${BASE_URL}/posts/${postId}/share`, { method: 'PATCH' });
        console.log('Share Response:', await shareRes.json());

        // 5. Test Comment
        console.log('Testing Comment creation...');
        const commentRes = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content: 'Test comment from script', authorId }),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Comment Response:', await commentRes.json());

        // 6. Verify changes
        console.log('Verifying changes...');
        const verifyRes = await fetch(`${BASE_URL}/posts`);
        const updatedPosts = await verifyRes.json();
        const updatedPost = updatedPosts.find(p => p.id === postId);
        console.log('Updated Post Stats:', {
            views: updatedPost.views,
            likes: updatedPost.likes,
            shares: updatedPost.shares,
            commentCount: updatedPost.comments.length
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testInteractions();
