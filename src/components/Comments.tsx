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
    <div className="w-full mt-8 p-4 mr-auto text-gray-300 rounded-lg shadow-lg">
      <form action={submitAction} className="mb-6">
        <input type="text" name="blogId" value={blogId} hidden />

        <p className="mb-2 font-semibold text-lg text-gray-400">Post a comment</p>

        <textarea
          name="content"
          className="w-full p-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200"
          rows={4}
          placeholder="Write your comment here..."
          required
        />

        <button
          type="submit"
          className={`w-full mt-4 p-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-semibold transition duration-150 ease-in-out ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          disabled={isPending}
        >
          Post
        </button>

        {error && <p className="text-red-600 mt-2">Failed: {error}</p>}
      </form>

      <div className="space-y-6">
        {commentList.map((comment) => (
          <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg shadow-md" key={comment.createdAt}>
            <a href={`profile/${comment.userId}`} className="shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img alt={comment.userName} src={comment.userImage ?? ''} className="object-cover w-full h-full" />
              </div>
            </a>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <a href={`/profile/${comment.userId}`} className="text-lg font-semibold hover:text-indigo-400">
                  {comment.userName}
                </a>
                <time className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(comment.createdAt))}
                </time>
              </div>
              <p className="mt-2 text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
