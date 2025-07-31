// import React, { useState } from 'react';

// const dummyPost = {
//   id: '1',
//   title: 'Icebreaker ideas?',
//   content: 'Any suggestions for fun warm-up activities before a quiz starts?',
//   type: 'question',
//   createdBy: 'Alice',
//   createdAt: '2025-07-01',
// };

// const dummyComments = [
//   {
//     id: 'c1',
//     text: 'Try a quick quiz on pop culture!',
//     commentedBy: 'Bob',
//     createdAt: '2025-07-01',
//   },
//   {
//     id: 'c2',
//     text: 'I use a fun GIF guessing game!',
//     commentedBy: 'Charlie',
//     createdAt: '2025-07-02',
//   },
// ];

// const PostDetail: React.FC = () => {
//   const [commentText, setCommentText] = useState('');
//   const [comments, setComments] = useState(dummyComments);

//   const handleAddComment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!commentText.trim()) return;

//     const newComment = {
//       id: Date.now().toString(),
//       text: commentText,
//       commentedBy: 'You',
//       createdAt: new Date().toISOString().split('T')[0],
//     };

//     setComments((prev) => [...prev, newComment]);
//     setCommentText('');
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 px-6 py-8">
//       <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold text-gray-800">{dummyPost.title}</h2>
//         <p className="text-gray-700 mt-2">{dummyPost.content}</p>
//         <div className="text-sm text-gray-500 mt-2">
//           Posted by {dummyPost.createdBy} on {dummyPost.createdAt}
//         </div>

//         <div className="mt-8">
//           <h3 className="text-xl font-semibold mb-4">💬 Comments</h3>
//           <div className="space-y-4">
//             {comments.map((c) => (
//               <div key={c.id} className="border border-gray-200 p-3 rounded bg-gray-50">
//                 <p className="text-gray-800">{c.text}</p>
//                 <div className="text-xs text-gray-500 mt-1">
//                   {c.commentedBy} • {c.createdAt}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <form onSubmit={handleAddComment} className="mt-6">
//             <textarea
//               placeholder="Write a comment..."
//               className="w-full border border-gray-300 rounded p-2 h-20 resize-none"
//               value={commentText}
//               onChange={(e) => setCommentText(e.target.value)}
//             />
//             <div className="text-right mt-2">
//               <button
//                 type="submit"
//                 className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
//               >
//                 Add Comment
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PostDetail;// src/components/PostDetail.tsx// src/components/PostDetail.tsximport React, { useEffect, useState } from 'react';
// src/components/PostDetail.tsx
// src/components/PostDetail.tsx// src/components/PostDetail.tsx

// src/components/PostDetail.tsx

// src/components/PostDetail.tsx


// src/components/PostDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ForumPostRaw {
  id: string;
  title: string;
  content?: string;
  type: 'discussion' | 'question' | 'poll';
  tags?: string[];             // for questions
  options?: string[];         // for polls
  createdBy: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface ForumPost {
  id: string;
  title: string;
  content?: string;
  type: 'discussion' | 'question' | 'poll';
  tags?: string[];
  options?: string[];
  createdBy: string;
  createdAt: Date;
}

interface CommentRaw {
  id: string;
  content: string;
  createdBy: string;
  createdAt: { _seconds: number; _nanoseconds: number };
}

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

const PostDetail: React.FC = () => {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // fetch post details
  const fetchPost = async () => {
    try {
      const res = await axios.get<ForumPostRaw>(`http://localhost:5000/forum/posts/${postId}`);
      const raw = res.data;
      setPost({
        ...raw,
        createdAt: new Date(raw.createdAt._seconds * 1000),
      });
    } catch (err) {
      console.error('Failed to fetch post', err);
    }
  };

  // fetch comments
  const fetchComments = async () => {
    try {
      const res = await axios.get<CommentRaw[]>(`http://localhost:5000/forum/posts/${postId}/comments`);
      const loaded = res.data.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt._seconds * 1000),
      }));
      setComments(loaded);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    };
    load();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const user = JSON.parse(localStorage.getItem('hostInfo') || '{}');
    const createdBy = user.name || 'Guest';

    try {
      await axios.post(`http://localhost:5000/forum/posts/${postId}/comments`, {
        content: newComment,
        createdBy,
      });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-white">
        <p>Post not found.</p>
        <button
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          className="text-sm text-gray-300 hover:text-white"
          onClick={() => navigate(-1)}
        >
          ← Back to Forum
        </button>

        {/* Post Details */}
        <div className="bg-white/10 p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-pink-300 mb-2">{post.title}</h1>
          <div className="text-sm text-gray-400 mb-4">
            Posted by {post.createdBy} on {post.createdAt.toLocaleDateString()}
            {' • '}Type: {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </div>

          {/* Type-specific display */}
          {post.type === 'discussion' && (
            <p className="text-white leading-relaxed">{post.content}</p>
          )}

          {post.type === 'question' && (
            <>
              <p className="text-white leading-relaxed mb-4">{post.content}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="space-x-2">
                  <strong className="text-gray-300">Tags:</strong>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-pink-500 text-white px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {post.type === 'poll' && (
            <>
              <p className="text-white leading-relaxed mb-4"><strong>Poll:</strong> {post.content}</p>
              {post.options && (
                <ul className="list-disc list-inside space-y-2">
                  {post.options.map((opt, idx) => (
                    <li key={idx} className="text-white">
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-pink-400">Comments</h2>

          {/* Comment List */}
          {comments.length ? (
            comments.map((c) => (
              <div key={c.id} className="bg-white/10 p-4 rounded-lg">
                <div className="text-sm text-gray-300">
                  {c.createdBy} on {c.createdAt.toLocaleDateString()}
                </div>
                <p className="mt-1 text-white">{c.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          )}

          {/* New Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none"
              rows={4}
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg shadow-md disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;



