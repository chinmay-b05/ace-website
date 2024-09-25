import { actions } from 'astro:actions';
import { signIn } from 'auth-astro/client';
import { useState, useTransition } from 'react';

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
  const [error, setError] = useState<string | undefined | null>(null);
  const [commentList, setCommentList] = useState(comments);

  const [isPending, startTransition] = useTransition();

  const submitAction = async (formData: FormData) => {
    startTransition(async () => {
      if (!user) {
        signIn('google');
        return;
      }
      const { data, error } = await actions.commentBlog(formData);
      if (error !== undefined) {
        setError(error.message);
      }

      if (data) {
        setCommentList((list) => [
          {
            userId: user!.id,
            userImage: user!.image,
            userName: user!.name,
            createdAt: data.comment.createdAt,
            content: data.comment.content,
          },
          ...list,
        ]);
      }
    });
  };

  return (
    <div>
      <form action={submitAction}>
        <input type="text" name="blogId" value={blogId} hidden />
        <p className="mb-2">Post a comment</p>
        <div className="flex">
          <textarea name="content" className="w-full" required />
          <button className="" disabled={isPending}>
            Post
          </button>
        </div>
        {error && <p className="text-red-600">Failed: {error}</p>}
      </form>

      {commentList.map((comment) => (
        <div className="w-full items-start justify-center gap-4" key={comment.createdAt}>
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
