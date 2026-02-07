export const getInstagramAuthUrl = () => {
    const appId = import.meta.env.VITE_INSTAGRAM_APP_ID;
    const redirectUri = encodeURIComponent('https://n8n.polmarkai.pro/webhook/instagram-auth');
    const scope = 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights';

    return `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
};
