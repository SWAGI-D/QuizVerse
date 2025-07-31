// import React, { useState } from 'react';
// import NewPostForm from './NewForm'; // ✅ import the component

// type PostType = 'all' | 'discussion' | 'question' | 'poll';

// const dummyPosts = [
//   {
//     id: '1',
//     title: 'Icebreaker ideas?',
//     content: 'Any suggestions for fun warm-up activities before a quiz starts?',
//     type: 'question',
//     createdBy: 'Alice',
//     createdAt: '2025-07-01',
//   },
//   {
//     id: '2',
//     title: 'Weekly poll: Which theme do you prefer?',
//     content: 'Vote below!',
//     type: 'poll',
//     createdBy: 'Bob',
//     createdAt: '2025-07-02',
//   },
// ];

// const HostForum: React.FC = () => {
//   const [filter, setFilter] = useState<PostType>('all');
//   const [showNewPostForm, setShowNewPostForm] = useState(false);

//   const filteredPosts =
//     filter === 'all' ? dummyPosts : dummyPosts.filter((post) => post.type === filter);

//   const handleNewPostSubmit = (post: {
//     title: string;
//     content: string;
//     type: PostType;
//   }) => {
//     console.log('🆕 New post submitted:', post);
//     // Later: send to Firestore
//     setShowNewPostForm(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 px-6 py-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">🗨️ Host Forum</h1>
//           <button
//             className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow"
//             onClick={() => setShowNewPostForm(true)}
//           >
//             + New Post
//           </button>
//         </div>

//         <div className="flex space-x-3 mb-4">
//           {(['all', 'discussion', 'question', 'poll'] as PostType[]).map((type) => (
//             <button
//               key={type}
//               onClick={() => setFilter(type)}
//               className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 filter === type
//                   ? 'bg-pink-500 text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </button>
//           ))}
//         </div>

//         <div className="space-y-4">
//           {filteredPosts.map((post) => (
//             <div
//               key={post.id}
//               className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
//             >
//               <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
//               <p className="text-gray-600">{post.content}</p>
//               <div className="text-sm text-gray-500 mt-2">
//                 Posted by {post.createdBy} on {post.createdAt}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {showNewPostForm && (
//         <NewPostForm
//           onSubmit={handleNewPostSubmit}
//           onCancel={() => setShowNewPostForm(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default HostForum;// src/components/HostForum.tsx
// src/components/HostForum.tsx
// src/components/HostForum.tsx


// src/components/HostForum.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPostForm, { NewPost } from './NewForm';
import { Link } from 'react-router-dom';

type PostType = 'discussion';

interface ForumPostRaw {
  id: string;
  title: string;
  content: string;
  type: PostType;
  createdBy: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  type: PostType;
  createdBy: string;
  createdAt: Date;
}

const HostForum: React.FC = () => {
  const navigate = useNavigate();
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);

  // Fetch only discussion posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get<ForumPostRaw[]>(
        'http://localhost:5000/forum/posts'
      );
      const loaded = res.data
        .map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt._seconds * 1000),
        }))
        .filter((p) => p.type === 'discussion');
      setPosts(loaded);
    } catch (err) {
      console.error('❌ Failed to fetch discussion posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPostSubmit = async (post: NewPost) => {
    const host = JSON.parse(localStorage.getItem('hostInfo') || '{}');
    const createdBy = host.name || 'Unknown';
    try {
      await axios.post('http://localhost:5000/forum/posts', {
        title: post.title,
        content: post.content,
        type: 'discussion',
        createdBy,
      });
      setShowNewPostForm(false);
      fetchPosts();
    } catch (err) {
      console.error('❌ Failed to create discussion post', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & New Post Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-pink-400">🗨️ Discussions</h1>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl shadow-md"
            onClick={() => setShowNewPostForm(true)}
          >
            ➕ New Discussion
          </button>
        </div>

        {/* Discussion Cards */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="block bg-white/10 p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-pink-300">
                {post.title}
              </h2>
              <p className="text-white mt-2">{post.content}</p>
              <div className="text-sm text-gray-300 mt-3">
                Posted by {post.createdBy} on{' '}
                {post.createdAt.toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>

        {/* New Discussion Modal */}
        {showNewPostForm && (
          <NewPostForm
            onSubmit={handleNewPostSubmit}
            onCancel={() => setShowNewPostForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default HostForum;
