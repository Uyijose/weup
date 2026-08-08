import { useCommentsStore } from "../stores/commentsStore";

export async function getComments(
  postId: string,
  videoPartId?: string
) {
  return useCommentsStore
    .getState()
    .fetchComments(
      postId,
      videoPartId
    );
}