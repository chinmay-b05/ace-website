import { commentBlog, createBlog, editBlog, likeBlog } from './blog';
import { editProfile } from './profile';

export const server = {
  createBlog,
  editBlog,
  editProfile,
  likeBlog,
  commentBlog
};
