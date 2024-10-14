import { commentBlog, createBlog, editBlog, likeBlog } from './blog';
import { createTeam } from './teams';
import { editProfile, updateProfilePic } from './profile';
import { uploadToGallery } from './adminGalleryUpload';
import { changeRole, removeUser } from './manageUsers';
import { createEvent } from './events';

export const server = {
  createBlog,
  editBlog,
  editProfile,
  likeBlog,
  commentBlog,
  createTeam,
  uploadToGallery,
  removeUser,
  changeRole,
  createEvent,
  updateProfilePic
};
