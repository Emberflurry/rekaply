// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabase';

interface Post {
  id: string;
  caption: string;
  media_url: string;
  created_at: string;
  user_id: string;
}


export default function Dashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);

    useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (!data.user) router.push('/');
        else setUser(data.user);
    });

    loadPosts();
    fetchComments();
    }, [router]);


  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setPosts(data);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

    if (uploadError) {
    console.error('Upload error:', uploadError.message);
    alert('Upload failed: ' + uploadError.message);
    return;
    }

    const media_url = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      caption,
      media_url,
    });
    

    if (!error) {
      setCaption('');
      setFile(null);
      loadPosts();
    }
  };
  
  
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [newComment, setNewComment] = useState('');
const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});

const fetchComments = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (!error && data) {
    const grouped = data.reduce((acc, comment) => {
      const postId = comment.post_id;
      acc[postId] = acc[postId] || [];
      acc[postId].push(comment);
      return acc;
    }, {} as Record<string, any[]>);
    setCommentsByPost(grouped);
  }
};

const postComment = async (postId: string) => {
  const content = commentInputs[postId]?.trim();
  if (!content || !user) return;

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    content,
    user_id: user.id,
  });

  if (!error) {
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    fetchComments();
  }
};


const handleLike = async (type: 'post' | 'comment', id: string) => {
  if (!user) return;

  const { error } = await supabase.from('likes').insert({
    user_id: user.id,
    ...(type === 'post' ? { post_id: id } : { comment_id: id }),
  });

  if (error) {
    console.warn('Like error:', error);
    if (error.code === '23505') {
      alert('You already liked this.');
    } else {
      alert('Like failed: ' + (error.message || 'Unknown error'));
    }
  } else {
    fetchComments();
    loadPosts();
  }
};





return (
  <div className="min-h-screen bg-gray-50">
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-10">
      <h1 className="text-xl font-bold text-blue-600">rekaply</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.email || user?.phone}</span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/');
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>

    <main className="max-w-xl mx-auto p-4">
      <div className="mb-6 border p-4 rounded bg-white shadow">
        {file && (
          <div className="mb-4">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-h-60 rounded shadow"
            />
          </div>
        )}

        <textarea
          placeholder="ReCap(tion) du Jour(s)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-3 mb-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="inline-block bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 mb-2">
          Choose File
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        {file && <p className="text-sm text-gray-600 mb-2">Selected: {file.name}</p>}

        <button
          onClick={handleUpload}
          disabled={!caption || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded bg-white shadow">
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
            <p className="mb-2">{post.caption}</p>
            {post.media_url && (
              <img
                src={post.media_url}
                alt="post media"
                className="max-h-60 object-cover rounded"
              />
            )}

            <button
  onClick={() => handleLike('post', post.id)}
  className="mt-1 text-sm text-red-500 hover:underline"
>
  ❤️ Like post
</button>

            
            <div className="mt-2">
  <div className="space-y-1 text-sm text-gray-700">
    {(commentsByPost[post.id] || []).map((comment) => (
      <div key={comment.id} className="border-t pt-2">
        <p>{comment.content}</p>
        {/* TODO: Add likes and replies here */}
            <button
      onClick={() => handleLike('comment', comment.id)}
      className="text-xs text-pink-500 hover:underline mt-1"
    >
      ❤️ Like comment
    </button>

      </div>
    ))}
  </div>

  <div className="flex mt-2 gap-2">
    <input
      type="text"
      placeholder="Write a comment..."
      value={commentInputs[post.id] || ''}
  onChange={(e) =>
    setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
  }
      className="flex-1 p-1 border rounded text-sm"
    />
    <button
      onClick={() => postComment(post.id)}
      className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
    >
      Send
    </button>
  </div>
</div>



          </div>
        ))}
      </div>
    </main>
  </div>
);
}
