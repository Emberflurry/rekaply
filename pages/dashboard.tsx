// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabase';

interface Post {
  id: string;
  caption: string;
  media_url: string;
  created_at: string;
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
  }, []);

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

  return (
    <div className="max-w-xl mx-auto p-4">
    <div className="mb-6 border p-4 rounded">
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
          <div key={post.id} className="border p-4 rounded">
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
            <p className="mb-2">{post.caption}</p>
            {post.media_url && (
              <img src={post.media_url} alt="post media" className="max-h-60 object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
