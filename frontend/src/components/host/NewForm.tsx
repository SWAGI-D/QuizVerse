// import React, { useState } from 'react';

// type PostType = 'discussion' | 'question' | 'poll';

// interface NewPostFormProps {
//   onSubmit: (post: {
//     title: string;
//     content: string;
//     type: PostType;
//   }) => void;
//   onCancel: () => void;
// }

// const NewForm: React.FC<NewPostFormProps> = ({ onSubmit, onCancel }) => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [type, setType] = useState<PostType>('discussion');

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title || !content) return alert('Title and content required!');
//     onSubmit({ title, content, type });
//     setTitle('');
//     setContent('');
//     setType('discussion');
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg space-y-4"
//       >
//         <h2 className="text-2xl font-bold text-gray-800">📝 Create New Post</h2>

//         <input
//           type="text"
//           placeholder="Post title"
//           className="w-full border border-gray-300 p-2 rounded"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <textarea
//           placeholder="What's on your mind?"
//           className="w-full border border-gray-300 p-2 rounded h-28"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />

//         <div className="space-x-4">
//           {(['discussion', 'question', 'poll'] as PostType[]).map((t) => (
//             <label key={t} className="inline-flex items-center">
//               <input
//                 type="radio"
//                 name="type"
//                 value={t}
//                 checked={type === t}
//                 onChange={() => setType(t)}
//                 className="mr-1"
//               />
//               {t.charAt(0).toUpperCase() + t.slice(1)}
//             </label>
//           ))}
//         </div>

//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
//           >
//             Post
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default NewForm;// src/components/NewPostForm.tsx


// src/components/NewPostForm.tsx
import React, { useState } from 'react';

// Only Discussion posts now
export interface DiscussionPost {
  type: 'discussion';
  title: string;
  content: string;
}
export type NewPost = DiscussionPost;

interface NewPostFormProps {
  onSubmit: (post: NewPost) => void;
  onCancel: () => void;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert('Both title and content are required.');
    }
    onSubmit({ type: 'discussion', title, content });
    setTitle('');
    setContent('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md w-full max-w-lg p-6 rounded-xl shadow-lg space-y-4 text-white"
      >
        <h2 className="text-3xl font-bold text-pink-400">📝 New Discussion</h2>

        <input
          type="text"
          placeholder="Discussion Title"
          className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="What's on your mind?"
          className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-300 p-3 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/20 text-white px-4 py-2 rounded hover:bg-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Post Discussion
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPostForm;

