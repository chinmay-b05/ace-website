import { useState, type FunctionComponent } from 'react';
import { toast } from 'sonner';

interface JoinTeamProps {
  eventId: number;
  onJoinTeam: () => void;
  onGoBack: () => void;
  id: string;
}

const JoinTeam: FunctionComponent<JoinTeamProps> = ({ eventId, onGoBack, onJoinTeam, id }) => {
  const [teamId, setTeamId] = useState<string | null>(null);

  //   const joinTeam = api.team.jointeam.useMutation();

  const handleJoinTeam = async () => {
    if (teamId) {
      toast.loading('Joining Team..');
      const response = await fetch('/api/joinTeam', {
        method: 'POST',
        body: JSON.stringify({
          eventId: eventId,
          teamId: parseInt(teamId),
          userId: id,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error', response);

        toast.error('Error', errorData);
        console.log('Failed to join team');
      } else {
        onJoinTeam();
        const res = await response.json();
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(res.message);
        }
      }
    } else {
      toast.error('Please enter a team ID');
    }
  };
  return (
    <div className="mt-4">
      <input
        placeholder="Enter Team ID"
        className="card-attributes"
        value={teamId ?? ''}
        onChange={(e) => setTeamId(e.target.value)}
      />
      <div className="flex justify-between">
        <button onClick={onGoBack} className="card-button mt-4 text-xs" style={{ padding: '0.1rem 0.5rem' }}>
          Go Back
        </button>
        <button className="card-button mt-4 text-xs" style={{ padding: '0.1rem 0.5rem' }} onClick={handleJoinTeam}>
          Join
        </button>
      </div>
    </div>
  );
};

export default JoinTeam;
