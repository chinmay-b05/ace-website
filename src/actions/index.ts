import { commentBlog, createBlog, editBlog, likeBlog } from './blog';
import { createTeam } from './teams';
import { editProfile } from './profile';
import { uploadToGallery } from './adminGalleryUpload';
import { changeRole, getAllUsers, removeUser } from './manageUsers';

export const server = {
  createBlog,
  editBlog,
  editProfile,
  likeBlog,
  commentBlog,
  createTeam,
  uploadToGallery,
  getAllUsers,
  removeUser,
  changeRole,
};
