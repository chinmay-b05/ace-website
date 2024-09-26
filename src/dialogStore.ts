import { atom, map } from 'nanostores';

export type TeamDetails = {
  teamId: number;
  teamName: string;
  isConfirmed: boolean;
  teamLeader: boolean;
  createdAt: string; // Assuming it's stored as a string timestamp, change to `Date` if needed
  event: {
    eventId: number;
    eventName: string;
    eventFrom: string; // Assuming the date is stored as a string, change to `Date` if needed
    eventTo: string; // Change to `Date` if needed
    eventDescription: string;
    eventVenue: string;
    maxTeamSize: number;
  };
  members: Array<{
    userId: string; // Adjust to the correct type if `userId` is a different type (e.g., number)
    userName: string;
  }>;
};

export interface Event {
  id: number;
  name: string;
  image: string;
  deadline?: string | null;
  fromDate: string;
  toDate: string;
  description: string;
  venue: string;
  minTeamSize: number;
  maxTeamSize: number;
  maxTeams?: number | null;
  state: 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'COMPLETED';
  category: 'WORKSHOP' | 'HACKATHON' | 'COMPETITION' | 'SPECIAL';
  amount: number;
  createdAt: string;
}

export const isDialogOpen = atom(false);
export const isCreatingTeam = atom(false);
export const isJoiningTeam = atom(false);

export const dialogOpen = () => {
  isDialogOpen.set(true);
};

export const dialogClose = () => {
  isDialogOpen.set(false);
};

export const setIsCreatingTeam = (state: boolean) => {
  isCreatingTeam.set(state);
};

export const setIsJoiningTeam = (state: boolean) => {
  isJoiningTeam.set(state);
};

export const teamData = atom<TeamDetails | null>(null);
export const publishedEvents = atom<Event[]>([]);
export const completedEvents = atom<Event[]>([]);

export const setTeamData = (data: TeamDetails | null) => {
  const $teamData = teamData;
  console.log('Setting team data', data);

  $teamData.set(data);
};
