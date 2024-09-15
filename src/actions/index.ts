import { createBlog, editBlog } from './blog';
import { createTeam } from './teams';
import { editProfile } from './profile';
// import { getAllEventsForUser } from './events';
export const server = {
  createBlog,
  editBlog,
  editProfile,
  createTeam,
  // getAllEventsForUser,
};
