import React, { useEffect, useState } from 'react';
import './DialogBox.css';
import CreateTeam from './events/CreateTeam';
import { useStore } from '@nanostores/react';
import { isCreatingTeam, isJoiningTeam, setIsCreatingTeam, setIsJoiningTeam } from '../dialogStore';
import JoinTeam from './events/JoinTeam';
import CopyBtn from './CopyBtn';
import { toast } from 'sonner';

interface DialogBoxProps {
  eventId: number;
  email: string | null | undefined;
  id: string | null | undefined;
  name: string | null | undefined;
}

interface TeamDetails {
  teamId: number;
  teamName: string;
  isConfirmed: boolean;
  teamLeader: boolean;
  createdAt: string;
  event: {
    eventId: number;
    eventName: string;
    eventFrom: string;
    eventTo: string;
    eventDescription: string;
    eventVenue: string;
    maxTeamSize: number;
  };
  members: Array<{
    userId: string;
    userName: string;
  }>;
}

const EventDialogBox = ({ email, id, name, eventId }: DialogBoxProps) => {
  const $isCreatingTeam = useStore(isCreatingTeam);
  const $isJoiningTeam = useStore(isJoiningTeam);
  // const $teamData = useStore(teamData);
  const [teamData, setTeamData] = useState<TeamDetails | null>(null);

  const fetchTeamData = async () => {
    try {
      console.log('Bruj');

      const response = await fetch('/api/userInATeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: id,
          eventId: eventId,
        }),
      });
      console.log('Heyooooooooooooooo');

      if (!response.ok) {
        toast.error('Failed to fetch team data');
      }
      const result: TeamDetails = await response.json();
      setTeamData(result);
    } catch (err) {
      toast.error(String(err));
    }
  };

  useEffect(() => {
    if (teamData) {
      console.log('Team data', teamData);
    }
  }, [teamData]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/userInATeam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: id,
            eventId: eventId,
          }),
        });
        console.log('Heyooooooooooooooo');
        if (!response.ok) {
          console.log('Reach !response.ok');

          toast.error('Failed to fetch team data');
          throw new Error('Failed to fetch team data');
        }

        console.log(response);

        const result: TeamDetails = await response.json();
        console.log('Result', result);

        setTeamData(result);
      } catch (err) {
        toast.error(String(err));
        console.log('Error', err);
      }
    };
    fetchTeamData();
  }, []);

  const handleRemoveFromTeam = async (userId: string): Promise<void> => {
    try {
      const response = await fetch('/api/removeFromTeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: teamData?.teamId,
          userId: userId,
        }),
      });
      if (!response.ok) {
        toast.error('Failed to remove user from team');
      }
      void fetchTeamData();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleLeaveTeam = async (): Promise<void> => {
    if (teamData?.teamId) {
      try {
        const response = await fetch('/api/leaveTeam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: teamData.teamId,
            userId: id,
          }),
        });
        if (!response.ok) {
          toast.error('Failed to leave team');
        }
        setTeamData(null);
      } catch (err) {
        toast.error(String(err));
      }
    } else {
      toast.error('Team ID not found');
    }
  };

  const handleConfirmTeam = async (): Promise<void> => {
    try {
      const response = await fetch('/api/confirmTeam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: teamData?.teamId,
          userId: id,
        }),
      });
      if (!response.ok) {
        toast.error('Failed to confirm team');
      }
      void fetchTeamData();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="dialog-container w-full h-full">
      {!teamData && (
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-bold"> Create | Join Team</h1>

          {!$isCreatingTeam && !$isJoiningTeam && (
            <div className="flex flex-col gap-4">
              <button
                className="card-button mx-auto w-[40%]"
                onClick={() => {
                  console.log('Clicked man');

                  setIsCreatingTeam(true);
                }}
              >
                Create Team
              </button>
              <button
                className="card-button mx-auto w-[40%]"
                onClick={() => {
                  setIsJoiningTeam(true);
                }}
              >
                Join Team
              </button>
            </div>
          )}

          {$isCreatingTeam && (
            <CreateTeam
              eventId={eventId}
              id={id!}
              onTeamCreate={() => {
                setIsCreatingTeam(false);
              }}
              onGoBack={() => setIsCreatingTeam(false)}
            />
          )}

          {$isJoiningTeam && !$isCreatingTeam && (
            <JoinTeam
              id={id!}
              eventId={eventId}
              onGoBack={() => setIsJoiningTeam(false)}
              onJoinTeam={() => {
                void fetchTeamData();
                setIsJoiningTeam(false);
              }}
            />
          )}
        </div>
      )}

      {teamData && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-2xl capitalize">{teamData?.teamName}</p>

            {!teamData?.isConfirmed && (
              <div className="flex flex-col gap-2">
                <p className="text-xs">Share team id to join</p>
                <div className="flex gap-2">
                  <input
                    className=" card-attributes flex-1 rounded-lg p-1.5 text-xs text-black"
                    type="text"
                    value={teamData.teamId?.toString()}
                    disabled
                  />
                  <CopyBtn value={teamData.teamId?.toString()} />
                </div>
              </div>
            )}
          </div>
          {console.log(teamData)}

          {teamData && (
            <div className="text-sm text-gray-300 mb-6">(Max {JSON.stringify(teamData.event.maxTeamSize)} members)</div>
          )}

          <div>
            {teamData?.members?.map((member) => (
              <div key={member.userId} className="flex items-center gap-2">
                <p className="capitalize w-[60%] truncate">{member.userName}</p>
                {!teamData.isConfirmed && teamData.teamLeader && member.userId != id && (
                  <button onClick={() => handleRemoveFromTeam(member.userId)} className="z-30">
                    <p className="rounded-full border px-2 py-1 text-xs text-white hover:bg-red-600 ">Remove</p>
                  </button>
                )}

                {!teamData.isConfirmed && !teamData.teamLeader && member.userId === id && (
                  <button onClick={() => handleLeaveTeam()} className="z-30">
                    <p className="rounded-lg border px-1 text-xs text-white hover:bg-red-600">Leave Team</p>
                  </button>
                )}
              </div>
            ))}
          </div>
          {!teamData.isConfirmed && teamData.teamLeader && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-red-700 font-bold mt-2">
                <span className="font-bold">Warning: </span>Proceed to confirm only when all the team members have
                joined. You won&apos;t be able to add or delete more members after.
              </p>
              {!teamData.isConfirmed && (
                <button className="card-button " onClick={() => handleConfirmTeam()}>
                  Confirm Team
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventDialogBox;
