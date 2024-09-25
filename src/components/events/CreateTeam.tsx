import { actions } from 'astro:actions';
import React, { /*useActionState,*/ useEffect, useState, type FunctionComponent } from 'react';
import { experimental_withState as withState } from '@astrojs/react/actions';
import { toast } from 'sonner';

interface CreateTeamProps {
  id: string;
  eventId: number;
  onTeamCreate: () => void;
  onGoBack: () => void;
}

const CreateTeam: FunctionComponent<CreateTeamProps> = ({ eventId, onTeamCreate, onGoBack, id }) => {
  console.log('User id', id);

  const [teamName, setTeamName] = useState('');
  // const [state, createTeam, isPending] = useActionState(withState(actions.createTeam), {
  //   data: { success: false },
  //   error: undefined,
  // });

  // useEffect(() => {
  //   if (state.data?.success) {
  //     console.log('Team created successfully');
  //   }
  // }, [state.data?.success]);

  //   const createTeam = api.team.createTeam.useMutation();

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast.error('Please enter a team name');
      return;
    }

    const response = await fetch('/api/createTeam', {
      method: 'POST',
      body: JSON.stringify({
        eventId: eventId,
        teamName: teamName,
        userId: id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error', response);

      toast.error('Error', errorData);
      console.log('Failed to join team');
    } else {
      onTeamCreate();
      const res = await response.json();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Team created successfully');
      }
    }
  };

  // const handleCreateTeam = async () => {
  //   const formData = new FormData();
  //   formData.append('teamName', teamName);
  //   formData.append('id', id);
  //   formData.append('eventId', eventId.toString());

  //   const result = await createTeam(formData);
  //   if (state.data?.success) {
  //     console.log('LESGOOOOOOOO');
  //   }
  // };

  return (
    <div className="mt-4">
      <input
        placeholder="Enter Team Name"
        id="teamName"
        className="teamName card-attributes text-black"
        value={teamName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamName(e.target.value)}
      />
      <div className="flex justify-between">
        <button onClick={onGoBack} className="card-button mt-4 text-xs" style={{ padding: '0.1rem 0.5rem' }}>
          Go Back
        </button>
        <button className="card-button mt-4 text-xs" style={{ padding: '0.1rem 0.5rem' }} onClick={handleCreateTeam}>
          Create
        </button>
      </div>
    </div>
  );
};

export default CreateTeam;
