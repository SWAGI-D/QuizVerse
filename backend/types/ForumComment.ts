// types/ForumComment.ts

export interface ForumComment {
  id?: string; // Firestore doc ID
  postId: string; // Refers to the post this comment belongs to
  text: string;
  commentedBy: string;
}
