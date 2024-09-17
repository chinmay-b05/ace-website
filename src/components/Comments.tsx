import { actions } from 'astro:actions';
import { experimental_withState } from '@astrojs/react/actions';
import { useActionState } from 'react';

type Props = {
  blogId: string;
  comments: {
    userId: string;
    userImage: string | null;
    userName: string;
    createdAt: string;
    content: string;
  }[];
  user: {
    id: string;
    image: string | null;
    name: string;
  } | null;
};

export default function Comments({ blogId, comments, user }: Props) {
  const [state, action, pending] = useActionState(experimental_withState(actions.commentBlog), {
    data: { comment: { content: '', createdAt: '' } },
    error: undefined,
  });


  if (state.data?.comment.content && user) {
    comments.unshift({
      userId: user.id,
      userImage: user.image,
      userName: user.name,
      createdAt: state.data.comment.createdAt,
      content: state.data.comment.content,
    });
  }

  return (
    <div>
      <form action={action}>
        <input type="text" name="blogId" value={blogId} hidden />
        <p className="mb-2">Post a comment</p>
        <div className="flex">
          <textarea name="content" className="w-full" />
          <button className="" disabled={pending}>
            Post
          </button>
        </div>
        {state.error && <p>Failed: {state.error.message}</p>}
      </form>

      {comments.map((comment) => (
        <div className="w-full items-start justify-center gap-4">
          <a href={`profile/${comment.userId}`}>
            <div className="w-10 rounded-full">
              <img alt={comment.userName} src={comment.userImage ?? ''} />
            </div>
          </a>
          <div className="">
            <a href={`/profile/${comment.userId}`}>{comment.userName}</a>
            <time className="text-xs">
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'short',
                timeStyle: 'short',
              }).format(new Date(comment.createdAt))}
            </time>
          </div>
          <div className="">{comment.content}</div>
        </div>
      ))}
    </div>
  );
}
