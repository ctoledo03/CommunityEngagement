import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import CommunityPost from './CommunityPost';

const GET_COMMUNITY_POSTS = gql`
  query CommunityPosts {
    communityPosts {
      id
      author
      title
      content
      category
      createdAt
      updatedAt
    }
  }
`;

const ADD_COMMUNITY_POST = gql`
  mutation AddCommunityPost($title: String!, $content: String!, $category: String!) {
    addCommunityPost(title: $title, content: $content, category: $category) {
      id
      title
      content
      category
      createdAt
    }
  }
`;

const EDIT_COMMUNITY_POST = gql`
  mutation EditCommunityPost($id: ID!, $title: String, $content: String, $category: String) {
    editCommunityPost(id: $id, title: $title, content: $content, category: $category)
  }
`;

const DELETE_COMMUNITY_POST = gql`
  mutation DeleteCommunityPost($id: ID!) {
    deleteCommunityPost(id: $id)
  }
`;

const CommunityPostList = ({ me }) => {
  const { loading, error, data, refetch } = useQuery(GET_COMMUNITY_POSTS);
  const [addPost] = useMutation(ADD_COMMUNITY_POST, { onCompleted: () => refetch() });
  const [editPost] = useMutation(EDIT_COMMUNITY_POST, { 
    onCompleted: () => refetch(),
    onError: (error) => {
      alert("You can only edit your own posts!");
    }
  });
  const [deletePost] = useMutation(DELETE_COMMUNITY_POST, { 
    onCompleted: () => refetch(),
    onError: (error) => {
      alert("You can only delete your own posts!");
    }
  });

  const [form, setForm] = useState({ title: '', content: '', category: 'news' });
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        console.log('Submitting edit:', {
          id: editingId,
          ...form
        });
        await editPost({
          variables: {
            id: editingId,
            title: form.title,
            content: form.content,
            category: form.category
          }
        });
        setEditingId(null);
      } else {
        await addPost({
          variables: form
        });
      }
      setForm({ title: '', content: '', category: 'news' });
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({ title: post.title, content: post.content, category: post.category });
  };

  const handleDelete = async (id) => {
    await deletePost({ variables: { id } });
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-white">Error loading posts.</p>;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">Community Posts</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Content"
          required
          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="news">News</option>
          <option value="discussion">Discussion</option>
        </select>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
        >
          {editingId ? "Update" : "Post"}
        </button>
      </form>

      {/* List of Posts */}
      <div className="space-y-4">
        {data.communityPosts.map((post) => (
          <CommunityPost
            key={post.id}
            post={post}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUser={me.id}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityPostList; 